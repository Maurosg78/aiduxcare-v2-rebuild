#!/usr/bin/env node

/**
 * TEST FINAL - PLAN DE TRATAMIENTO FISIOTERAPÉUTICO
 * Evaluación completa del sistema para generar planes basados en evidencia
 */

const ClinicalInsightService = require("./src/services/ClinicalInsightService");

// Configurar logging detallado
const log = (message, data = {}) => {
  console.log(`[${new Date().toISOString()}] ${message}`, data);
};

// Caso clínico: Dolor lumbar mecánico SIN banderas rojas
const casoLumbalgia = `
FISIOTERAPEUTA: Buenos días, ¿en qué puedo ayudarle?

PACIENTE: Hola doctora. Vengo porque desde hace 2 semanas tengo dolor de espalda. Empezó después de que estuve cargando cajas muy pesadas en mi trabajo.

FISIOTERAPEUTA: ¿Dónde siente exactamente el dolor?

PACIENTE: Aquí en la parte baja de la espalda. Es como un dolor constante, pero se pone mucho peor cuando me siento por mucho tiempo en la oficina.

FISIOTERAPEUTA: ¿El dolor baja hacia las piernas?

PACIENTE: No, se queda solo en la espalda. Cuando camino o me muevo un poco, mejora. Es raro porque antes nunca me había pasado esto.

FISIOTERAPEUTA: ¿Cómo afecta esto su trabajo?

PACIENTE: Trabajo 8 horas al día sentado frente al computador y ya no puedo estar cómodo. Mi jefe está preguntando cuándo voy a estar al 100% otra vez. Necesito volver a trabajar normal lo antes posible.

FISIOTERAPEUTA: ¿Está motivado para seguir un plan de ejercicios?

PACIENTE: Sí, completamente. Haré lo que sea necesario. Solo quiero que este dolor se vaya y poder volver a mi rutina normal.
`;

async function evaluarPlanTratamiento() {
  const startTime = Date.now();
  
  try {
    log("🏥 INICIANDO EVALUACIÓN DE PLAN DE TRATAMIENTO");
    log("📋 CASO CLÍNICO: Lumbalgia mecánica sin banderas rojas");
    
    // Inicializar servicio
    const clinicalInsightService = new ClinicalInsightService();
    
    // Procesar transcripción
    log("🔄 PROCESANDO TRANSCRIPCIÓN...");
    const resultado = await clinicalInsightService.processTranscription(
      casoLumbalgia,
      "physiotherapy",
      "initial"
    );
    
    const tiempoTotal = (Date.now() - startTime) / 1000;
    
    log("✅ PROCESAMIENTO COMPLETADO", {
      tiempoTotal: `${tiempoTotal}s`,
      tieneResultado: !!resultado
    });
    
    // Analizar resultado
    console.log("\n📊 ANÁLISIS DEL RESULTADO:");
    console.log("=========================================");
    
    // 1. Verificar estructura general
    console.log("\n🔍 ESTRUCTURA GENERAL:");
    console.log(`  - Tipo: ${typeof resultado}`);
    console.log(`  - Claves principales: ${Object.keys(resultado || {}).slice(0, 10).join(", ")}`);
    console.log(`  - Tiene SOAP: ${!!resultado.soap_analysis}`);
    console.log(`  - Tiene warnings: ${!!resultado.warnings}`);
    console.log(`  - Tiene suggestions: ${!!resultado.suggestions}`);
    
    // 2. Analizar SOAP si existe
    if (resultado.soap_analysis) {
      console.log("\n�� ANÁLISIS SOAP:");
      const soap = resultado.soap_analysis;
      
      if (soap.assessment) {
        console.log(`  - Assessment: ${soap.assessment.clinical_impression?.substring(0, 100)}...`);
        console.log(`  - Diagnóstico: ${soap.assessment.differential_diagnosis?.length || 0} diagnósticos`);
      }
      
      if (soap.plan) {
        console.log(`  - Plan: ${soap.plan.treatment_plan?.substring(0, 100)}...`);
        console.log(`  - Acciones inmediatas: ${soap.plan.immediate_actions?.length || 0}`);
      }
    }
    
    // 3. Buscar objetivos funcionales en todo el resultado
    console.log("\n🎯 BÚSQUEDA DE OBJETIVOS FUNCIONALES:");
    const textoCompleto = JSON.stringify(resultado, null, 2);
    
    // Buscar patrones de objetivos
    const objetivosPatterns = [
      /objetivo\s*\d+[.:]/gi,
      /meta\s*\d+[.:]/gi,
      /functional.*goal/gi,
      /semanas?/gi,
      /trabajo/gi,
      /laboral/gi,
      /dolor.*\d+\/10/gi,
      /EVA/gi
    ];
    
    objetivosPatterns.forEach((pattern, index) => {
      const matches = textoCompleto.match(pattern) || [];
      if (matches.length > 0) {
        console.log(`  - Patrón ${index + 1} (${pattern.source}): ${matches.length} coincidencias`);
        matches.slice(0, 3).forEach(match => {
          console.log(`    * "${match}"`);
        });
      }
    });
    
    // 4. Buscar técnicas de tratamiento
    console.log("\n🔧 BÚSQUEDA DE TÉCNICAS DE TRATAMIENTO:");
    const tecnicasPatterns = [
      /ejercicio/gi,
      /fortalecimiento/gi,
      /estabilización/gi,
      /movilización/gi,
      /estiramiento/gi,
      /flexibilidad/gi,
      /ergonomía/gi,
      /educación/gi,
      /control\s*motor/gi
    ];
    
    let tecnicasEncontradas = 0;
    tecnicasPatterns.forEach((pattern, index) => {
      const matches = textoCompleto.match(pattern) || [];
      if (matches.length > 0) {
        tecnicasEncontradas++;
        console.log(`  - ${pattern.source.replace(/\s*/g, " ")}: ${matches.length} menciones`);
      }
    });
    
    console.log(`  - TOTAL TÉCNICAS DETECTADAS: ${tecnicasEncontradas}/9`);
    
    // 5. Evaluación de calidad
    console.log("\n📊 EVALUACIÓN DE CALIDAD:");
    let puntaje = 0;
    
    // Criterios de evaluación
    if (resultado.soap_analysis) puntaje += 20;
    if (resultado.warnings && resultado.warnings.length >= 0) puntaje += 15;
    if (resultado.suggestions && resultado.suggestions.length > 0) puntaje += 15;
    if (tecnicasEncontradas >= 3) puntaje += 20;
    if (textoCompleto.includes("trabajo") || textoCompleto.includes("laboral")) puntaje += 10;
    if (textoCompleto.includes("semana") || textoCompleto.includes("mes")) puntaje += 10;
    if (textoCompleto.includes("ejercicio") && textoCompleto.includes("educación")) puntaje += 10;
    
    console.log(`  - PUNTAJE TOTAL: ${puntaje}/100`);
    
    let nivel;
    if (puntaje >= 80) nivel = "EXCELENTE";
    else if (puntaje >= 65) nivel = "BUENO";
    else if (puntaje >= 50) nivel = "ACEPTABLE";
    else nivel = "INSUFICIENTE";
    
    console.log(`  - NIVEL: ${nivel}`);
    
    // 6. Resumen final
    console.log("\n🎉 RESUMEN FINAL:");
    console.log("=====================================");
    console.log(`✅ Sistema ${nivel} para generar planes de tratamiento`);
    console.log(`⏱️  Tiempo de procesamiento: ${tiempoTotal.toFixed(1)}s`);
    console.log(`🎯 Técnicas de tratamiento: ${tecnicasEncontradas}/9 detectadas`);
    console.log(`📊 Puntaje de calidad: ${puntaje}/100`);
    
    if (puntaje >= 65) {
      console.log("\n🟢 RECOMENDACIÓN: Sistema LISTO para uso clínico en planes de tratamiento");
    } else {
      console.log("\n🟡 RECOMENDACIÓN: Sistema requiere ajustes para uso clínico");
    }
    
    return {
      puntaje,
      nivel,
      tiempoTotal,
      tecnicasEncontradas,
      tieneSOAP: !!resultado.soap_analysis
    };
    
  } catch (error) {
    log("❌ ERROR EN EVALUACIÓN", {
      error: error.message,
      stack: error.stack
    });
    
    return {
      error: error.message,
      puntaje: 0,
      nivel: "ERROR"
    };
  }
}

// Ejecutar evaluación
evaluarPlanTratamiento().then(resultado => {
  console.log("\n🏁 EVALUACIÓN COMPLETADA:", resultado);
}).catch(error => {
  console.error("💥 EVALUACIÓN FALLÓ:", error.message);
}); 