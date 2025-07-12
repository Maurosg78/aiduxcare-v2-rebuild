/**
 * Archivo central para todas las cadenas de texto de la aplicación.
 * Previene la duplicación y facilita el mantenimiento y la internacionalización.
 */

export const ERROR_MESSAGES = {
  SUGGESTION_CONTENT_EMPTY: "La sugerencia no puede tener contenido vacío",
  SUGGESTION_FIELD_INVALID: "Campo inválido para la integración",
  SUGGESTION_INTEGRATION_FAILED: (error: string) => `Error al registrar la integración de la sugerencia: ${error}`,
  SUGGESTION_UPSERT_FAILED: (error: string) => `Error al integrar la sugerencia: ${error}`,
  VISIT_NOT_FOUND: (visitId: string) => `La visita ${visitId} no existe`,
  FIELD_FETCH_FAILED: (error: string) => `Error al obtener el campo: ${error}`,
  UNEXPECTED_INTEGRATION_ERROR: "Error al integrar sugerencia:",
  UNEXPECTED_SYSTEM_ERROR: "Error inesperado del sistema",
};

export const DB_TABLES = {
  INTEGRATED_SUGGESTIONS: "integrated_suggestions",
  VISITS: "visits",
  EMR_FIELDS: "emr_fields",
};

export const ANALYTICS_EVENTS = {
  SUGGESTION_INTEGRATED: "suggestions_integrated",
  SUGGESTION_INTEGRATION_ERROR: "suggestion_integration_error",
  PAGE_VIEW: "page_view",
};

export const AUDIT_EVENTS = {
  SUGGESTION_INTEGRATED: "suggestion.integrated",
};

export const SUPABASE_ERRORS = {
  NO_ROWS_FOUND: "PGRST116", // El código de error de Supabase cuando una consulta .single() no devuelve filas
};
