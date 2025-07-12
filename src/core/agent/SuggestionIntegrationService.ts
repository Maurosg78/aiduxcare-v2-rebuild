import type { AgentSuggestion } from "../types/agent";
import supabase from "../auth/supabaseClient";
import AnalyticsService from "../../lib/analytics";
import { AuditLogger } from "../audit/AuditLogger";
import { ERROR_MESSAGES, DB_TABLES, ANALYTICS_EVENTS, AUDIT_EVENTS, SUPABASE_ERRORS } from "../../constants/strings";

// --- Funciones Helper para reducir la complejidad ---

/**
 * Valida que la sugerencia tenga contenido y un campo válido.
 */
function validateSuggestion(suggestion: AgentSuggestion): void {
  if (!suggestion.content || suggestion.content.trim() === "") {
    throw new Error(ERROR_MESSAGES.SUGGESTION_CONTENT_EMPTY);
  }
  const validFields = ["diagnosis", "treatment", "followup", "medication", "vitals", "symptoms", "history", "lab_results", "imaging", "notes"];
  if (!validFields.includes(suggestion.field)) {
    throw new Error(ERROR_MESSAGES.SUGGESTION_FIELD_INVALID);
  }
}

/**
 * Verifica que la visita exista y devuelve sus datos.
 */
async function getVisitAndPatient(visitId: string): Promise<{ id: string; patient_id: string }> {
  const { data, error } = await supabase.from(DB_TABLES.VISITS).select("id, patient_id").eq("id", visitId).single();
  if (error || !data) {
    throw new Error(ERROR_MESSAGES.VISIT_NOT_FOUND(visitId));
  }
  return data;
}

/**
 * Registra la aceptación de la sugerencia en la base de datos.
 */
async function recordIntegration(suggestionId: string, visitId: string, userId: string): Promise<void> {
  const { error } = await supabase.from(DB_TABLES.INTEGRATED_SUGGESTIONS).insert({
    suggestion_id: suggestionId,
    visit_id: visitId,
    user_id: userId,
    integrated_at: new Date().toISOString()
  });
  if (error) {
    throw new Error(ERROR_MESSAGES.SUGGESTION_INTEGRATION_FAILED(error.message));
  }
}

/**
 * Concatena el contenido y actualiza/inserta el campo en el EMR.
 */
async function upsertEmrField(suggestion: AgentSuggestion, visitId: string): Promise<void> {
  const { data: fieldData, error: fieldError } = await supabase.from(DB_TABLES.EMR_FIELDS).select("content").eq("visit_id", visitId).eq("field_name", suggestion.field).single();

  if (fieldError && fieldError.code !== SUPABASE_ERRORS.NO_ROWS_FOUND) {
    throw new Error(ERROR_MESSAGES.FIELD_FETCH_FAILED(fieldError.message));
  }

  const newContent = fieldData?.content 
    ? `${fieldData.content}\n\n🔎 ${suggestion.content}` 
    : suggestion.content;

  const { error: upsertError } = await supabase.from(DB_TABLES.EMR_FIELDS).upsert({
    visit_id: visitId,
    field_name: suggestion.field,
    content: newContent,
    updated_at: new Date().toISOString()
  });

  if (upsertError) {
    throw new Error(ERROR_MESSAGES.SUGGESTION_UPSERT_FAILED(upsertError.message));
  }
}

// --- Clase de Servicio Principal ---

export class SuggestionIntegrationService {
  /**
   * Orquesta la integración de una sugerencia del agente IA en el EMR.
   */
  static async integrateSuggestion(suggestion: AgentSuggestion, visitId: string, userId: string): Promise<void> {
    try {
      validateSuggestion(suggestion);
      const { patient_id: patientId } = await getVisitAndPatient(visitId);
      
      await recordIntegration(suggestion.id, visitId, userId);
      await upsertEmrField(suggestion, visitId);

      // Registrar eventos de éxito
      AnalyticsService.track(ANALYTICS_EVENTS.SUGGESTION_INTEGRATED, {
        suggestion_id: suggestion.id,
        suggestion_type: suggestion.type,
        suggestion_field: suggestion.field
      });

      AuditLogger.log(AUDIT_EVENTS.SUGGESTION_INTEGRATED, {
        visitId, userId, patientId, suggestionId: suggestion.id, field: suggestion.field, acceptedAt: new Date().toISOString()
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Registrar eventos de error
      AnalyticsService.track(ANALYTICS_EVENTS.SUGGESTION_INTEGRATION_ERROR, {
        suggestion_id: suggestion.id,
        error_message: errorMessage
      });
      
      console.error(ERROR_MESSAGES.UNEXPECTED_INTEGRATION_ERROR, error);
      throw error; // Re-lanzar el error para que el llamador pueda manejarlo
    }
  }
}