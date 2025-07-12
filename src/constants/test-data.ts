/**
 * Constantes utilizadas exclusivamente para el entorno de pruebas.
 * Previene la duplicación de "magic strings" y facilita el mantenimiento.
 */

export const COMMON_STRINGS = {
  USER_ID: "user-123",
  VISIT_ID: "visit-456",
  SESSION_ID: "session-789",
};

export const AUDIT_DATA = {
  EVENT_NAME: "test.event",
  USER_ID: "test-user",
  VISIT_ID: "test-visit",
  PATIENT_ID: "test-patient",
  SUGGESTION_ID: "test-suggestion",
  FIELD_NAME: "test-field",
  ERROR_MESSAGE: "Test error message",
};

export const testPatientData = {
  id: "test-patient-123",
  name: "Juan Pérez",
  email: "juan.perez@test.com",
  specialty: "Fisioterapia",
};
