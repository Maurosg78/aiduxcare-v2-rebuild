/**
 * Manejo seguro de credenciales de prueba
 * Este archivo se encarga de validar y proporcionar credenciales de prueba
 * sin exponer contraseñas hardcodeadas
 */

export function getTestPassword(): string | null {
  return process.env.TEST_PASSWORD || 
         process.env.TEST_USER_PASSWORD || 
         process.env.VITE_TEST_USER_PASSWORD || 
         null;
}

export function getTestEmail(): string {
  return process.env.VITE_TEST_USER_EMAIL || "test@example.com";
}

export function getPatientTestPassword(): string | null {
  return process.env.TEST_PATIENT_PASSWORD || 
         process.env.TEST_USER_PASSWORD || 
         null;
} 