import { describe, it, expect, vi, beforeEach } from "vitest";
import { SuggestionIntegrationService } from "../../agent/SuggestionIntegrationService";
import type { AgentSuggestion } from "../../types/agent";
import supabase from "../../../core/auth/supabaseClient";
import { AuditLogger } from "../../../core/audit/AuditLogger";
import AnalyticsService from "../../../lib/analytics";
import { ERROR_MESSAGES, DB_TABLES, ANALYTICS_EVENTS, AUDIT_EVENTS, SUPABASE_ERRORS } from "../../../constants/strings";

// Mocks
vi.mock("../../../core/auth/supabaseClient", () => ({ default: { from: vi.fn() } }));
vi.mock("../../../lib/analytics", () => ({ default: { track: vi.fn() } }));
vi.mock("../../../core/audit/AuditLogger", () => ({ AuditLogger: { log: vi.fn() } }));

describe("SuggestionIntegrationService", () => {
  const visitId = "visit-123";
  const userId = "user-456";
  const patientId = "patient-789";
  const suggestion: AgentSuggestion = {
    id: "suggestion-789",
    type: "recommendation",
    field: "diagnosis",
    content: "Considerar evaluación de dolor abdominal",
    sourceBlockId: "block-123",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockInsert = vi.fn();
  const mockSingleVisit = vi.fn();
  const mockSingleField = vi.fn();
  const mockUpsert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockSingleVisit.mockResolvedValue({ data: { id: visitId, patient_id: patientId }, error: null });
    mockSingleField.mockResolvedValue({ data: null, error: { code: SUPABASE_ERRORS.NO_ROWS_FOUND } });
    mockInsert.mockResolvedValue({ error: null });
    mockUpsert.mockResolvedValue({ error: null });

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      const tables: Record<string, unknown> = {
        [DB_TABLES.INTEGRATED_SUGGESTIONS]: { insert: mockInsert },
        [DB_TABLES.VISITS]: { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: mockSingleVisit },
        [DB_TABLES.EMR_FIELDS]: { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: mockSingleField, upsert: mockUpsert },
      };
      return tables[table] || {};
    });
  });

  it("debe integrar una sugerencia correctamente", async () => {
    await SuggestionIntegrationService.integrateSuggestion(suggestion, visitId, userId);

    expect(supabase.from).toHaveBeenCalledWith(DB_TABLES.INTEGRATED_SUGGESTIONS);
    expect(mockInsert).toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith(DB_TABLES.EMR_FIELDS);
    expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ content: suggestion.content }));
    expect(AnalyticsService.track).toHaveBeenCalledWith(ANALYTICS_EVENTS.SUGGESTION_INTEGRATED, expect.any(Object));
    expect(AuditLogger.log).toHaveBeenCalledWith(AUDIT_EVENTS.SUGGESTION_INTEGRATED, expect.any(Object));
  });

  it("debe lanzar un error si la visita no existe", async () => {
    mockSingleVisit.mockResolvedValue({ data: null, error: { message: "Not found" } });
    await expect(SuggestionIntegrationService.integrateSuggestion(suggestion, visitId, userId))
      .rejects.toThrow(ERROR_MESSAGES.VISIT_NOT_FOUND(visitId));
  });

  it("debe lanzar un error si la inserción de registro falla", async () => {
    const dbError = { message: "Insert failed" };
    mockInsert.mockResolvedValue({ error: dbError });
    await expect(SuggestionIntegrationService.integrateSuggestion(suggestion, visitId, userId))
      .rejects.toThrow(ERROR_MESSAGES.SUGGESTION_INTEGRATION_FAILED(dbError.message));
  });
  
  it("debe rechazar sugerencias con contenido vacío", async () => {
    const emptySuggestion = { ...suggestion, content: " " };
    await expect(SuggestionIntegrationService.integrateSuggestion(emptySuggestion, visitId, userId))
      .rejects.toThrow(ERROR_MESSAGES.SUGGESTION_CONTENT_EMPTY);
  });
});
