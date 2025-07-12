#!/usr/bin/env node

/**
 * TEST CASO COMPLEJO FISIOTERAPIA
 * 
 * Simulación de paciente compleja para probar optimización de prompts
 * específicos para fisioterapeutas y generación de EMR de calidad
 * 
 * @author Mauricio Sobarzo
 * @version 1.0 - Caso Complejo Fisioterapia
 */

const winston = require("winston");
const ClinicalInsightService = require("./src/services/ClinicalInsightService");

// Configurar logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

/**
 * TRANSCRIPCIÓN SIMULADA DE CASO COMPLEJO
 * 
 * Paciente: Mujer de 45 años, trabajadora de oficina
 * Problema: Dolor cervical crónico con irradiación, posible síndrome de túnel carpiano
 * Complejidad: Múltiples síntomas, antecedentes quirúrgicos, medicación, limitaciones funcionales
 */
const TRANSCRIPCION_CASO_COMPLEJO = `
TERAPEUTA: Buenos días María, cuénteme qué la trae por aquí.

PACIENTE: Hola doctor, llevo aproximadamente 8 meses con un dolor muy intenso en el cuello que me baja por el brazo derecho hasta los dedos. El dolor es como quemante, punzante, especialmente en las noches me despierto con hormigueos en los dedos índice y medio. También tengo mucha rigidez matutina que me dura como dos horas.

TERAPEUTA: ¿Ha tenido algún accidente o trauma?

PACIENTE: Sí, hace un año tuve un accidente automovilístico, fue un choque por detrás. No perdí el conocimiento pero sí quedé muy adolorida. Me hicieron radiografías en urgencias y dijeron que no había fractura, pero desde entonces empezaron los problemas.

TERAPEUTA: ¿Qué tratamientos ha recibido?

PACIENTE: He tomado mucho ibuprofeno, tramadol que me recetó el médico general, he ido a masajes, pero nada me alivia completamente. Hace tres meses me operaron de túnel carpiano en la mano derecha porque los hormigueos eran insoportables, pero el dolor del cuello sigue igual.

TERAPEUTA: Hábleme de su trabajo y actividades diarias.

PACIENTE: Trabajo 8 horas diarias en computadora, soy contadora. Paso todo el día sentada, con la cabeza hacia adelante mirando pantallas. En casa también uso mucho el celular. Me cuesta mucho girar la cabeza para manejar, no puedo cargar las bolsas del supermercado con el brazo derecho, y por las noches no puedo dormir del lado derecho porque me duele más.

TERAPEUTA: ¿Tiene otros problemas de salud?

PACIENTE: Sí, tengo fibromialgia diagnosticada hace 5 años, tomo pregabalina y duloxetina. También tengo hipotiroidismo y tomo levotiroxina. A veces tengo episodios de ansiedad relacionados con el dolor crónico.

TERAPEUTA: Vamos a hacer algunas pruebas. Flexione la cabeza hacia adelante... ¿le duele?

PACIENTE: Sí, mucho, y siento como electricidad que me baja por el brazo.

TERAPEUTA: Ahora levante el brazo derecho por encima de la cabeza... 

PACIENTE: No puedo completamente, me duele mucho y se me entumece la mano.

TERAPEUTA: Veo que tiene limitación en la rotación cervical hacia la derecha, aproximadamente 50% de pérdida. La prueba de Spurling es positiva bilateral, más intensa en lado derecho. Test de Phalen positivo residual post-cirugía. Observo postura cifótica cervical marcada, hombros protruidos, tensión muscular evidente en trapecios y escalenos.

PACIENTE: Doctor, también quería comentarle que a veces siento como si fuera a desmayarme cuando giro la cabeza muy rápido, y tengo episodios de mareos cuando me levanto. ¿Puede estar relacionado?

TERAPEUTA: Eso es importante, ¿ha tenido problemas de visión o náuseas?

PACIENTE: Sí, a veces visión borrosa y náuseas, especialmente en la mañana cuando me levanto. También he notado que se me olvidan las cosas más de lo normal.

TERAPEUTA: ¿Algún familiar ha tenido problemas similares?

PACIENTE: Mi madre tiene artritis reumatoide y mi hermana fibromialgia también. En mi familia hay antecedentes de enfermedades autoinmunes.

TERAPEUTA: María, basándome en su historia y exploración, veo un cuadro complejo que requiere un enfoque multidisciplinario. Tenemos evidencia de radiculopatía cervical, posible síndrome del opérculo torácico, y comorbilidades importantes que debemos considerar en el plan de tratamiento.
`;

/**
 * Ejecutar prueba de caso complejo
 */
async function ejecutarPruebaCasoComplejo() {
  logger.info("🩺 INICIANDO PRUEBA CASO COMPLEJO FISIOTERAPIA");
  
  const service = new ClinicalInsightService();
  
  try {
    logger.info("📋 DATOS DEL CASO:", {
      paciente: "Mujer 45 años",
      duracion_sintomas: "8 meses",
      problema_principal: "Dolor cervical con irradiación",
      complejidad: "Alta - múltiples comorbilidades",
      antecedentes: "Accidente automovilístico, cirugía túnel carpiano",
      medicacion: "Ibuprofeno, tramadol, pregabalina, duloxetina",
      comorbilidades: "Fibromialgia, hipotiroidismo, ansiedad",
      limitaciones_funcionales: "Trabajo, sueño, actividades diarias"
    });
    
    logger.info("🎯 INICIANDO ANÁLISIS CASCADA V2...");
    const startTime = Date.now();
    
    // Procesar transcripción con nuestro cerebro clínico
    const resultado = await service.processTranscription(
      TRANSCRIPCION_CASO_COMPLEJO,
      "physiotherapy",
      "initial"
    );
    
    const processingTime = Date.now() - startTime;
    
    logger.info("✅ ANÁLISIS COMPLETADO", {
      tiempo_procesamiento: `${processingTime}ms`,
      warnings_detectados: resultado.warnings?.length || 0,
      sugerencias_generadas: resultado.suggestions?.length || 0,
      calidad_soap: resultado.soap_quality?.overall || "N/A"
    });
    
    // Analizar calidad de respuestas para fisioterapeutas
    await analizarCalidadRespuesta(resultado);
    
    return resultado;
    
  } catch (error) {
    logger.error("❌ ERROR EN PRUEBA CASO COMPLEJO:", {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Analizar si las respuestas son específicas y útiles para fisioterapeutas
 */
async function analizarCalidadRespuesta(resultado) {
  logger.info("🔍 ANÁLISIS DE CALIDAD PARA FISIOTERAPEUTAS");
  
  // Verificar warnings específicos de fisioterapia
  const warningsEspecificos = resultado.warnings?.filter(w => 
    w.category === "red_flag" || 
    w.category === "contraindication" ||
    w.title.toLowerCase().includes("cervical") ||
    w.title.toLowerCase().includes("radiculopatía") ||
    w.title.toLowerCase().includes("vascular")
  );
  
  logger.info("⚠️ WARNINGS ESPECÍFICOS FISIOTERAPIA:", {
    total: warningsEspecificos?.length || 0,
    warnings: warningsEspecificos?.map(w => ({
      severity: w.severity,
      title: w.title,
      action: w.action
    })) || []
  });
  
  // Verificar sugerencias específicas de fisioterapia
  const sugerenciasFisioterapia = resultado.suggestions?.filter(s =>
    s.type === "assessment" ||
    s.type === "treatment" ||
    s.description.toLowerCase().includes("movilización") ||
    s.description.toLowerCase().includes("ejercicio") ||
    s.description.toLowerCase().includes("postura") ||
    s.description.toLowerCase().includes("ergonomía")
  );
  
  logger.info("💡 SUGERENCIAS FISIOTERAPIA:", {
    total: sugerenciasFisioterapia?.length || 0,
    tratamiento: sugerenciasFisioterapia?.filter(s => s.type === "treatment").length || 0,
    evaluacion: sugerenciasFisioterapia?.filter(s => s.type === "assessment").length || 0,
    educacion: sugerenciasFisioterapia?.filter(s => s.type === "education").length || 0,
    sugerencias: sugerenciasFisioterapia?.map(s => ({
      type: s.type,
      priority: s.priority,
      title: s.title
    })) || []
  });
  
  // Verificar calidad SOAP
  if (resultado.soap_quality) {
    logger.info("📊 CALIDAD SOAP EMR:", {
      subjective: `${resultado.soap_quality.subjective}%`,
      objective: `${resultado.soap_quality.objective}%`,
      assessment: `${resultado.soap_quality.assessment}%`,
      plan: `${resultado.soap_quality.plan}%`,
      overall: `${resultado.soap_quality.overall}%`,
      calidad_emr: resultado.soap_quality.overall >= 80 ? "EXCELENTE" : 
        resultado.soap_quality.overall >= 70 ? "BUENA" : 
          resultado.soap_quality.overall >= 60 ? "ACEPTABLE" : "NECESITA MEJORA"
    });
  }
  
  // Verificar contenido específico de fisioterapia
  const contenidoFisioterapia = {
    evaluacion_postural: JSON.stringify(resultado).toLowerCase().includes("postura"),
    pruebas_neurodinamicas: JSON.stringify(resultado).toLowerCase().includes("spurling") || 
                            JSON.stringify(resultado).toLowerCase().includes("phalen"),
    limitaciones_funcionales: JSON.stringify(resultado).toLowerCase().includes("funcional"),
    tratamiento_manual: JSON.stringify(resultado).toLowerCase().includes("manual") ||
                       JSON.stringify(resultado).toLowerCase().includes("movilización"),
    ejercicio_terapeutico: JSON.stringify(resultado).toLowerCase().includes("ejercicio"),
    ergonomia: JSON.stringify(resultado).toLowerCase().includes("ergonomía") ||
               JSON.stringify(resultado).toLowerCase().includes("trabajo")
  };
  
  logger.info("🎯 CONTENIDO ESPECÍFICO FISIOTERAPIA:", contenidoFisioterapia);
  
  const puntuacionEspecializacion = Object.values(contenidoFisioterapia).filter(Boolean).length;
  logger.info("⭐ PUNTUACIÓN ESPECIALIZACIÓN FISIOTERAPIA:", {
    puntuacion: `${puntuacionEspecializacion}/6`,
    porcentaje: `${Math.round((puntuacionEspecializacion/6) * 100)}%`,
    nivel: puntuacionEspecializacion >= 5 ? "EXCELENTE" :
      puntuacionEspecializacion >= 4 ? "BUENO" :
        puntuacionEspecializacion >= 3 ? "ACEPTABLE" : "NECESITA OPTIMIZACIÓN"
  });
}

/**
 * Función principal
 */
async function main() {
  try {
    logger.info("🚀 INICIANDO PRUEBA CASO COMPLEJO FISIOTERAPIA");
    
    const resultado = await ejecutarPruebaCasoComplejo();
    
    logger.info("🎉 PRUEBA COMPLETADA EXITOSAMENTE");
    logger.info("📋 PRÓXIMOS PASOS:", {
      "1": "Revisar warnings específicos para fisioterapeutas",
      "2": "Verificar sugerencias de tratamiento apropiadas",
      "3": "Optimizar prompts si puntuación < 80%",
      "4": "Implementar mejoras en PromptFactory si es necesario"
    });
    
    // Mostrar resumen final
    console.log("\n🎯 RESUMEN EJECUTIVO:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`⚠️  Warnings detectados: ${resultado.warnings?.length || 0}`);
    console.log(`💡 Sugerencias generadas: ${resultado.suggestions?.length || 0}`);
    console.log(`📊 Calidad SOAP: ${resultado.soap_quality?.overall || "N/A"}%`);
    console.log(`✅ Sistema optimizado para fisioterapeutas: ${resultado.warnings?.length > 0 && resultado.suggestions?.length > 0 ? "SÍ" : "NECESITA MEJORA"}`);
    
  } catch (error) {
    logger.error("💥 ERROR EN PRUEBA:", error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { ejecutarPruebaCasoComplejo, analizarCalidadRespuesta }; 