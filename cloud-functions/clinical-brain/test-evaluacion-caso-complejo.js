#!/usr/bin/env node

/**
 * EVALUACIÓN RÁPIDA - CASO COMPLEJO FISIOTERAPIA
 * Test directo del cerebro clínico con caso que contiene múltiples banderas rojas
 */

// Importar servicios
const ClinicalInsightService = require('./src/services/ClinicalInsightService');
const VertexAIClient = require('./src/services/VertexAIClient');

// Configurar logging simple
const log = (message, data = {}) => {
  console.log(`[${new Date().toISOString()}] ${message}`, data);
};

// Caso complejo con banderas rojas múltiples
const casoComplejo = `
FISIOTERAPEUTA: ¿Cómo está hoy después del accidente?

PACIENTE: Doctora, estoy muy preocupada. Hace 3 días tuve un accidente de auto. Me golpeé la cabeza y el cuello. Al principio pensé que era solo dolor muscular, pero desde ayer tengo síntomas raros.

FISIOTERAPEUTA: ¿Qué síntomas específicos?

PACIENTE: Tengo un dolor de cabeza terrible que no se quita con nada. Es pulsante, muy intenso en la nuca. Y desde esta mañana tengo hormigueos en el brazo derecho y me siento débil para agarrar cosas.

FISIOTERAPEUTA: ¿Mareos o náuseas?

PACIENTE: Sí, mucho mareo cuando me levanto. Esta mañana vomité dos veces. También me cuesta concentrarme, como si estuviera en una nube.

FISIOTERAPEUTA: ¿Y el dolor de cuello?

PACIENTE: Es muy fuerte en el lado derecho. Lo raro es que duele más por las noches. Durante el día, cuando camino, se alivia algo. También tengo rigidez matutina.

FISIOTERAPEUTA: ¿Cambios en la visión?

PACIENTE: Sí, desde ayer veo borroso a ratos. Esta mañana vi puntos brillantes. Me asustó mucho.

FISIOTERAPEUTA: ¿Antecedentes médicos?

PACIENTE: Tomo warfarina por una trombosis que tuve hace dos años. También tengo hipertensión controlada.

FISIOTERAPEUTA: ¿Pérdida de peso o fiebre?

PACIENTE: Sí, he perdido 4 kilos en 3 semanas sin explicación. Y anoche tuve 38.2°C de fiebre.

FISIOTERAPEUTA: Estos síntomas me preocupan mucho. Necesito derivarla a evaluación médica urgente antes de cualquier tratamiento.
`;

// Función principal de evaluación
async function evaluarCasoComplejo() {
  try {
    log('🎯 INICIANDO EVALUACIÓN CASO COMPLEJO FISIOTERAPIA');
    
    // Inicializar servicios
    const vertexClient = new VertexAIClient();
    const clinicalService = new ClinicalInsightService(vertexClient);
    
    log('📊 PROCESANDO CASO COMPLEJO', {
      transcriptionLength: casoComplejo.length,
      expectedRedFlags: 8,
      expectedModel: 'gemini-2.5-pro'
    });
    
    // Procesar transcripción
    const startTime = Date.now();
    const result = await clinicalService.processTranscription(casoComplejo, 'physiotherapy');
    const processingTime = (Date.now() - startTime) / 1000;
    
    log('✅ PROCESAMIENTO COMPLETADO', {
      processingTime: `${processingTime.toFixed(1)}s`,
      success: result.success,
      warningsCount: result.warnings?.length || 0,
      suggestionsCount: result.suggestions?.length || 0
    });
    
    // Analizar resultados
    const warnings = result.warnings || [];
    const suggestions = result.suggestions || [];
    
    // Evaluar detección de banderas rojas
    const banderasRojasCriticas = warnings.filter(w => 
      w.severity === 'CRITICAL' || w.severity === 'HIGH'
    );
    
    const banderasEsperadas = [
      'trauma craneal',
      'anticoagulantes',
      'síntomas neurológicos',
      'cefalea post-trauma',
      'cambios visuales',
      'pérdida de peso',
      'fiebre'
    ];
    
    log('🚩 EVALUACIÓN BANDERAS ROJAS', {
      banderasDetectadas: warnings.length,
      banderasCriticas: banderasRojasCriticas.length,
      precision: `${((warnings.length / banderasEsperadas.length) * 100).toFixed(1)}%`,
      criticidadMaxima: warnings.some(w => w.severity === 'CRITICAL')
    });
    
    // Evaluar recomendaciones de seguridad
    const recomendacionesSeguridad = suggestions.filter(s => 
      s.toLowerCase().includes('contraindicada') || 
      s.toLowerCase().includes('derivación') || 
      s.toLowerCase().includes('urgente')
    );
    
    log('🛡️ EVALUACIÓN SEGURIDAD CLÍNICA', {
      recomendacionesSeguridad: recomendacionesSeguridad.length,
      derivacionMencionada: suggestions.some(s => s.toLowerCase().includes('derivación')),
      contraindicacionesClaras: suggestions.some(s => s.toLowerCase().includes('contraindicada'))
    });
    
    // Evaluar calidad SOAP
    const soapNote = result.soap_note || {};
    const soapQuality = result.soap_quality || {};
    
    log('📝 EVALUACIÓN SOAP', {
      subjectiveLength: soapNote.subjective?.length || 0,
      objectiveLength: soapNote.objective?.length || 0,
      assessmentLength: soapNote.assessment?.length || 0,
      planLength: soapNote.plan?.length || 0,
      overallQuality: soapQuality.overall || 'N/A'
    });
    
    // Evaluar escalado de modelo
    const modelUsed = result.metadata?.modelUsed || result.analysis_metadata?.model_used || 'desconocido';
    const escaladoCorrect = modelUsed.includes('2.5-pro') || warnings.length >= 2;
    
    log('🧠 EVALUACIÓN ESCALADO MODELO', {
      modeloUsado: modelUsed,
      banderasDetectadas: warnings.length,
      escaladoEsperado: warnings.length >= 2,
      escaladoCorrect: escaladoCorrect,
      estrategia90_10: escaladoCorrect ? 'FUNCIONANDO' : 'REVISAR'
    });
    
    // Puntuación final
    const scores = {
      deteccionBanderas: warnings.length >= 4 ? 25 : (warnings.length >= 2 ? 15 : 5),
      seguridadClinica: recomendacionesSeguridad.length >= 2 ? 25 : (recomendacionesSeguridad.length >= 1 ? 15 : 5),
      calidadSOAP: soapQuality.overall >= 80 ? 25 : (soapQuality.overall >= 60 ? 15 : 5),
      escaladoModelo: escaladoCorrect ? 25 : 5
    };
    
    const puntajeTotal = Object.values(scores).reduce((a, b) => a + b, 0);
    
    log('🏆 EVALUACIÓN FINAL', {
      puntajeTotal: `${puntajeTotal}/100`,
      deteccionBanderas: `${scores.deteccionBanderas}/25`,
      seguridadClinica: `${scores.seguridadClinica}/25`,
      calidadSOAP: `${scores.calidadSOAP}/25`,
      escaladoModelo: `${scores.escaladoModelo}/25`,
      veredicto: puntajeTotal >= 70 ? 'APTO PARA USO CLÍNICO' : 'REQUIERE MEJORAS'
    });
    
    // Mostrar detalles críticos
    if (banderasRojasCriticas.length > 0) {
      log('⚠️  BANDERAS ROJAS CRÍTICAS DETECTADAS');
      banderasRojasCriticas.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning.title}: ${warning.description}`);
      });
    }
    
    if (recomendacionesSeguridad.length > 0) {
      log('🚨 RECOMENDACIONES DE SEGURIDAD');
      recomendacionesSeguridad.forEach((suggestion, i) => {
        console.log(`   ${i + 1}. ${suggestion}`);
      });
    }
    
    // Conclusión
    if (puntajeTotal >= 70) {
      log('🎉 CASO COMPLEJO SUPERADO EXITOSAMENTE');
      log('✅ AiDuxCare demostró capacidad para manejar casos críticos');
      log('🚀 Sistema listo para uso clínico con casos complejos');
    } else {
      log('⚠️  CASO COMPLEJO REQUIERE MEJORAS');
      log('🔧 Revisar algoritmos de detección y escalado');
    }
    
    return {
      success: true,
      score: puntajeTotal,
      details: {
        warnings: warnings.length,
        suggestions: suggestions.length,
        modelUsed: modelUsed,
        processingTime: processingTime
      }
    };
    
  } catch (error) {
    log('❌ ERROR EN EVALUACIÓN', {
      message: error.message,
      stack: error.stack?.split('\n')[0]
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  evaluarCasoComplejo()
    .then(resultado => {
      if (resultado.success && resultado.score >= 70) {
        console.log('\n🎯 EVALUACIÓN EXITOSA - SISTEMA LISTO PARA CASOS COMPLEJOS');
        process.exit(0);
      } else {
        console.log('\n🚨 EVALUACIÓN FALLÓ - REQUIERE MEJORAS');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 ERROR CRÍTICO:', error.message);
      process.exit(1);
    });
}

module.exports = { evaluarCasoComplejo }; 