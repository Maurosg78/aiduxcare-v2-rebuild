/**
 * Script para verificar que las variables de entorno necesarias para Firebase estén definidas.
 * Se ejecuta antes del build para evitar despliegues con configuraciones incompletas.
 */
import { config } from "dotenv";
import { resolve } from "path";
import * as fs from "fs";

// Cargar variables de entorno de .env.local si existe
const envLocalPath = resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  console.log(`📄 Cargando variables desde: ${envLocalPath}`);
  config({ path: envLocalPath });
} else {
  console.log("⚠️ No se encontró archivo .env.local, usando solo variables de sistema.");
}

function checkFirebaseEnvVars() {
  // Variables de entorno estándar requeridas por la configuración de Firebase en Vite
  const requiredVars = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ];

  const missingVars: string[] = [];

  // Verificar que cada variable requerida esté presente
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // Si faltan variables, mostrar un error detallado y terminar el proceso
  if (missingVars.length > 0) {
    console.error("\n❌ ERROR: Faltan variables de entorno de Firebase requeridas:");
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error("\nPara solucionar este error, asegúrate de que tu archivo .env.local contenga todas estas variables.");
    console.error("O configúralas en tu proveedor de hosting (Vercel, Netlify, etc.).");
    console.error("\nBuild cancelada. No se puede continuar sin la configuración completa de Firebase.\n");
    
    // Terminar el proceso con código de error para detener el pipeline de CI/CD
    process.exit(1);
  }

  // Si todas las variables están presentes, confirmar y mostrar valores no sensibles
  console.log("\n✅ Todas las variables de entorno de Firebase están configuradas correctamente.");
  console.log(`   VITE_FIREBASE_PROJECT_ID: ${process.env.VITE_FIREBASE_PROJECT_ID}`);
  console.log(`   VITE_FIREBASE_AUTH_DOMAIN: ${process.env.VITE_FIREBASE_AUTH_DOMAIN}`);
  console.log("\n");
}

// Ejecutar la verificación
checkFirebaseEnvVars();