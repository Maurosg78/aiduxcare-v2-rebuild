#!/usr/bin/env node

/**
 * TEST MODELOS ESTABLES 2025 - VERIFICACIÓN COMPLETA
 * 
 * Prueba que los modelos gemini-2.5-flash y gemini-2.5-pro funcionen correctamente
 * según la estrategia 90/10 de AiDuxCare.
 */

const { VertexAI } = require('@google-cloud/vertexai');
const winston = require('winston');

// Configurar logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

// Configuración del proyecto
const projectId = 'aiduxcare-stt-20250706';
const location = 'us-east1';

// Inicializar Vertex AI
const vertexAI = new VertexAI({
  project: projectId,
  location: location
});

// Transcripción de prueba
const transcripcionPrueba = `
Paciente masculino de 28 años que consulta por dolor de espalda nocturno intenso que lo despierta por las noches. 
Refiere rigidez matutina de aproximadamente 1 hora de duración. El dolor ha empeorado en las últimas 3 semanas.
Antecedentes: psoriasis en placas desde hace 5 años, episodio de uveítis anterior hace 2 años.
Dolor que mejora con actividad física y empeora con reposo.
`;

/**
 * Prueba modelo gemini-2.5-flash
 */
async function probarGeminiFlash() {
  logger.info('🔍 PROBANDO GEMINI-2.5-FLASH');
  
  try {
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.2,
        topK: 32,
        topP: 0.9,
        maxOutputTokens: 1000,
        candidateCount: 1
      }
    });

    const prompt = `Actúa como un fisioterapeuta experto. Analiza esta transcripción y identifica las banderas rojas:

TRANSCRIPCIÓN:
${transcripcionPrueba}

RESPONDE EN JSON:
{
  "banderas_rojas": ["lista de banderas rojas detectadas"],
  "nivel_riesgo": "LOW|MEDIUM|HIGH",
  "modelo_usado": "gemini-2.5-flash"
}`;

    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const processingTime = (Date.now() - startTime) / 1000;

    const responseText = result.response.candidates[0].content.parts[0].text;
    
    logger.info('✅ GEMINI-2.5-FLASH FUNCIONANDO CORRECTAMENTE', {
      modelo: 'gemini-2.5-flash',
      tiempoProcesamiento: `${processingTime}s`,
      longitudRespuesta: responseText.length,
      respuestaCompleta: responseText
    });

    return {
      success: true,
      model: 'gemini-2.5-flash',
      processingTime: processingTime,
      response: responseText
    };

  } catch (error) {
    logger.error('❌ ERROR EN GEMINI-2.5-FLASH', {
      error: error.message,
      code: error.code,
      details: error.details
    });

    return {
      success: false,
      model: 'gemini-2.5-flash',
      error: error.message
    };
  }
}

/**
 * Prueba modelo gemini-2.5-pro
 */
async function probarGeminiPro() {
  logger.info('🔍 PROBANDO GEMINI-2.5-PRO');
  
  try {
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2000,
        candidateCount: 1
      }
    });

    const prompt = `Actúa como un fisioterapeuta experto realizando análisis completo de un caso complejo.

TRANSCRIPCIÓN:
${transcripcionPrueba}

ANÁLISIS REQUERIDO:
1. Identificar banderas rojas críticas
2. Evaluar riesgo de espondiloartropatía
3. Generar recomendaciones específicas

RESPONDE EN JSON:
{
  "banderas_rojas": ["lista detallada"],
  "sospecha_diagnostica": "evaluación clínica",
  "recomendaciones": ["lista de acciones"],
  "modelo_usado": "gemini-2.5-pro"
}`;

    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const processingTime = (Date.now() - startTime) / 1000;

    const responseText = result.response.candidates[0].content.parts[0].text;
    
    logger.info('✅ GEMINI-2.5-PRO FUNCIONANDO CORRECTAMENTE', {
      modelo: 'gemini-2.5-pro',
      tiempoProcesamiento: `${processingTime}s`,
      longitudRespuesta: responseText.length,
      respuestaCompleta: responseText
    });

    return {
      success: true,
      model: 'gemini-2.5-pro',
      processingTime: processingTime,
      response: responseText
    };

  } catch (error) {
    logger.error('❌ ERROR EN GEMINI-2.5-PRO', {
      error: error.message,
      code: error.code,
      details: error.details
    });

    return {
      success: false,
      model: 'gemini-2.5-pro',
      error: error.message
    };
  }
}

/**
 * Función principal de prueba
 */
async function ejecutarPruebas() {
  logger.info('🚀 INICIANDO PRUEBAS DE MODELOS ESTABLES 2025', {
    proyecto: projectId,
    region: location,
    estrategia: 'Verificación gemini-2.5-flash + gemini-2.5-pro'
  });

  const resultados = [];

  // Probar gemini-2.5-flash
  const flashResult = await probarGeminiFlash();
  resultados.push(flashResult);

  // Esperar 2 segundos
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Probar gemini-2.5-pro
  const proResult = await probarGeminiPro();
  resultados.push(proResult);

  // Resumen final
  const exitosos = resultados.filter(r => r.success).length;
  const fallidos = resultados.filter(r => !r.success).length;

  logger.info('📊 RESUMEN FINAL DE PRUEBAS', {
    modelosProbados: resultados.length,
    exitosos: exitosos,
    fallidos: fallidos,
    porcentajeExito: `${(exitosos/resultados.length)*100}%`,
    estado: exitosos === resultados.length ? 'TODOS LOS MODELOS FUNCIONANDO' : 'ALGUNOS MODELOS FALLARON'
  });

  // Mostrar resultados detallados
  resultados.forEach(resultado => {
    if (resultado.success) {
      logger.info(`✅ ${resultado.model}: FUNCIONANDO (${resultado.processingTime}s)`);
    } else {
      logger.error(`❌ ${resultado.model}: ERROR - ${resultado.error}`);
    }
  });

  if (exitosos === resultados.length) {
    logger.info('🎉 CORRECCIÓN EXITOSA: Los modelos estables 2025 están funcionando correctamente');
    logger.info('📈 PRÓXIMOS PASOS: Desplegar correcciones en producción');
  } else {
    logger.error('⚠️ ATENCIÓN: Algunos modelos aún presentan problemas');
  }

  return {
    success: exitosos === resultados.length,
    results: resultados,
    summary: {
      total: resultados.length,
      successful: exitosos,
      failed: fallidos
    }
  };
}

// Ejecutar las pruebas
if (require.main === module) {
  ejecutarPruebas()
    .then(resultado => {
      process.exit(resultado.success ? 0 : 1);
    })
    .catch(error => {
      logger.error('💥 ERROR CRÍTICO EN PRUEBAS:', error);
      process.exit(1);
    });
}

module.exports = { ejecutarPruebas }; 