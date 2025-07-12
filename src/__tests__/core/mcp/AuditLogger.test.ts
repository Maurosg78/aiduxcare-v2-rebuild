import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuditLogger } from "../../../core/audit/AuditLogger";
import supabase from "../../../core/auth/supabaseClient";
import { AUDIT_DATA } from "../../../constants/test-data";
import type { PostgrestFilterBuilder } from "@supabase/postgrest-js";

vi.mock("../../../core/auth/supabaseClient");

describe("AuditLogger", () => {
  const insertMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    const mockQueryBuilder = {
      insert: insertMock,
    };
    vi.mocked(supabase.from).mockReturnValue(
      mockQueryBuilder as unknown as PostgrestFilterBuilder<any, any, any, any, any>
    );
  });

  it("debe registrar un evento de auditoría correctamente", async () => {
    insertMock.mockResolvedValue({ error: null });
    const payload = {
      userId: AUDIT_DATA.USER_ID,
      patientId: AUDIT_DATA.PATIENT_ID,
    };

    await AuditLogger.log(AUDIT_DATA.EVENT_NAME, payload);

    expect(supabase.from).toHaveBeenCalledWith("audit_logs");
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: AUDIT_DATA.EVENT_NAME,
        payload: payload,
      })
    );
  });

  it("debe manejar errores de inserción de Supabase", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const dbError = { message: AUDIT_DATA.ERROR_MESSAGE };
    insertMock.mockResolvedValue({ error: dbError });

    await AuditLogger.log(AUDIT_DATA.EVENT_NAME, { userId: AUDIT_DATA.USER_ID });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error logging audit event:",
      dbError
    );
    consoleErrorSpy.mockRestore();
  });
});
