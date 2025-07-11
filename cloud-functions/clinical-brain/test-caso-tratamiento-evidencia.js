#!/usr/bin/env node

/**
 * EVALUACIÓN PLAN DE TRATAMIENTO BASADO EN EVIDENCIA
 * 
 * Caso clínico SIN banderas rojas que prueba la capacidad de AiDuxCare
 * para generar planes de tratamiento fisioterapéutico competentes.
 */

// Importar servicios
const ClinicalInsightService = require('./src/services/ClinicalInsightService');
const VertexAIClient = require('./src/services/VertexAIClient');

// Configurar logging simple
const log = (message, data = {}) => {
  console.log(`[${new Date().toISOString()}] ${message}`, data);
};

// Caso clínico: Dolor lumbar mecánico (sin banderas rojas)
const casoTratamientoEvidencia = `
FISIOTERAPEUTA: Buenos días, ¿en qué puedo ayudarle hoy?

PACIENTE: Hola doctora. Vengo porque desde hace 2 semanas tengo dolor de espalda que me está molestando bastante en el trabajo.

FISIOTERAPEUTA: ¿Puede describirme el dolor? ¿Dónde exactamente y cómo es?

PACIENTE: Es en la parte baja de la espalda, aquí en el centro. Es como un dolor sordo que se vuelve más intenso cuando me quedo mucho tiempo sentado en el trabajo o cuando me agacho para levantar algo. Por las mañanas al levantarme me siento un poco rígido, pero después de moverme unos 15-20 minutos se me pasa.

FISIOTERAPEUTA: ¿Hubo algo específico que lo desencadenó?

PACIENTE: Creo que sí. Hace como 3 semanas estuve ayudando a un amigo a mudarse, cargué varias cajas pesadas. Al principio no sentí nada, pero unos días después comenzó este dolor.

FISIOTERAPEUTA: ¿El dolor se extiende hacia las piernas o se queda solo en la espalda?

PACIENTE: Se queda en la espalda principalmente. A veces siento como una tensión que baja un poquito hacia los glúteos, pero no llega a las piernas ni siento hormigueos.

FISIOTERAPEUTA: ¿Qué posiciones o actividades lo empeoran o lo mejoran?

PACIENTE: Definitivamente empeora cuando estoy sentado mucho tiempo en la oficina, especialmente después del almuerzo. También cuando me agacho para recoger algo del suelo o cuando trato de cargar las bolsas del supermercado. Lo que me alivia es caminar, cuando salgo a dar una vuelta en el parque me siento mejor. Y por las noches, cuando me acuesto y me estiro, también mejora.

FISIOTERAPEUTA: ¿Ha tomado algún medicamento?

PACIENTE: Sí, he tomado ibuprofeno 400mg unas pocas veces cuando el dolor era más fuerte, y sí me ayuda. Pero prefiero no depender de medicamentos.

FISIOTERAPEUTA: ¿Hace ejercicio regularmente?

PACIENTE: Bueno, ahí está el problema. Antes iba al gimnasio 3 veces por semana, pero desde que cambié de trabajo hace 6 meses, paso mucho más tiempo sentado y he dejado de hacer ejercicio. Trabajo en sistemas, estoy frente a la computadora como 8-9 horas al día.

FISIOTERAPEUTA: ¿Ha tenido episodios similares antes?

PACIENTE: Hace como 2 años tuve algo parecido, pero más leve. En esa ocasión se me quitó solo después de unas semanas. Pero esta vez parece más persistente.

FISIOTERAPEUTA: Muy bien, ahora voy a examinarlo. ¿Puede ponerse de pie y caminar un poco?

PACIENTE: Sí, claro. (Camina sin dificultad, marcha normal)

FISIOTERAPEUTA: Ahora voy a revisar sus movimientos. Inclínese hacia adelante como si fuera a tocar los dedos de los pies.

PACIENTE: (Se inclina hacia adelante con limitación moderada, alcanza hasta media pantorrilla) Sí, aquí siento que se tensa y duele un poco.

FISIOTERAPEUTA: ¿Y hacia atrás? Inclínese hacia atrás suavemente.

PACIENTE: (Extensión limitada por dolor) Aquí también siento molestia, como que me aprieta.

FISIOTERAPEUTA: ¿Puede girarse hacia la derecha y hacia la izquierda?

PACIENTE: (Rotación levemente limitada bilateral) Sí, puedo, pero siento un poco de tirantez.

FISIOTERAPEUTA: Ahora voy a revisar la fuerza en sus piernas. Empuje mi mano con el pie... muy bien, fuerza normal. ¿Siente esto? (Prueba sensibilidad)

PACIENTE: Sí, siento normal.

FISIOTERAPEUTA: Voy a palpar la zona dolorosa. ¿Aquí?

PACIENTE: Sí, justo ahí está sensible. Y también aquí en los músculos de los lados.

FISIOTERAPEUTA: Sus reflejos están normales. Veo que tiene una postura un poco encorvada, probablemente por el trabajo en computadora. Sus músculos del core están débiles y los flexores de cadera acortados.

PACIENTE: ¿Qué me recomienda doctora? ¿Necesito estudios?

FISIOTERAPEUTA: Por los síntomas y el examen, esto parece un dolor lumbar mecánico relacionado con la sobrecarga, el sedentarismo y la mala postura. No veo necesidad de estudios por ahora. Creo que podemos ayudarle mucho con fisioterapia.

PACIENTE: ¿Cuánto tiempo tomará mejorar? ¿Y qué tipo de ejercicios necesito?

FISIOTERAPEUTA: Con un programa adecuado de ejercicios, corrección postural y cambios en sus hábitos, deberíamos ver mejoría en 2-4 semanas. Le voy a diseñar un programa específico.
`;

/**
 * Criterios de evaluación para plan de tratamiento basado en evidencia
 */
const criteriosEvaluacion = {
  objetivosFuncionales: {
    peso: 25,
    criterios: [
      'Objetivos SMART (específicos, medibles, alcanzables)',
      'Relacionados con actividades de vida diaria',
      'Tiempo de logro definido',
      'Funcionales (no solo reducción de dolor)'
    ]
  },
  planTratamiento: {
    peso: 30,
    criterios: [
      'Ejercicios de fortalecimiento core',
      'Ejercicios de flexibilidad/movilidad',
      'Corrección postural',
      'Educación en higiene postural',
      'Progresión gradual del programa'
    ]
  },
  evidenciaCientifica: {
    peso: 25,
    criterios: [
      'Menciona principios basados en evidencia',
      'Técnicas validadas para dolor lumbar mecánico',
      'Enfoque multimodal',
      'Consideraciones de adherencia'
    ]
  },
  seguimientoPrevencion: {
    peso: 20,
    criterios: [
      'Plan de seguimiento estructurado',
      'Estrategias de prevención',
      'Educación del paciente',
      'Modificaciones del entorno laboral'
    ]
  }
};

/**
 * Evalúa la calidad del plan de tratamiento generado
 * CORREGIDO: Mejor acceso a los datos del resultado
 */
function evaluarPlanTratamiento(resultado) {
  let puntajeTotal = 0;
  const evaluacionDetallada = {};

  console.log('🔍 ESTRUCTURA DEL RESULTADO RECIBIDO:', {
    tipo: typeof resultado,
    claves: Object.keys(resultado || {}),
    tieneSOAP: !!resultado.soap_note,
    tieneObjetivos: !!resultado.functional_goals,
    tieneTecnicas: !!resultado.treatment_techniques
  });

  // Acceder correctamente a los datos del resultado
  const soapNote = resultado.soap_note || {};
  const objetivos = resultado.functional_goals || soapNote.functional_goals || [];
  const tecnicas = resultado.treatment_techniques || soapNote.treatment_techniques || [];
  const planTratamiento = soapNote.plan || resultado.plan || '';
  const assessment = soapNote.assessment || resultado.assessment || '';
  
  // 1. Evaluar objetivos funcionales (25 puntos)
  let puntajeObjetivos = 0;
  evaluacionDetallada.objetivos = {
    criterios: 'Objetivos funcionales SMART y específicos',
    puntaje: 0,
    detalles: []
  };
  
  if (objetivos && Array.isArray(objetivos) && objetivos.length >= 3) {
    puntajeObjetivos += 8;
    evaluacionDetallada.objetivos.detalles.push('✅ Cantidad adecuada (3+)');
  }
  
  // Buscar objetivos en el texto del plan si no están en array
  const textoCompleto = `${planTratamiento} ${assessment} ${JSON.stringify(resultado)}`;
  
  if (textoCompleto.toLowerCase().includes('trabajo') || textoCompleto.toLowerCase().includes('laboral')) {
    puntajeObjetivos += 5;
    evaluacionDetallada.objetivos.detalles.push('✅ Incluye objetivos laborales');
  }
  
  if (textoCompleto.toLowerCase().includes('semana') || textoCompleto.toLowerCase().includes('mes')) {
    puntajeObjetivos += 5;
    evaluacionDetallada.objetivos.detalles.push('✅ Incluye tiempo específico');
  }
  
  if (textoCompleto.toLowerCase().includes('eva') || textoCompleto.toLowerCase().includes('dolor')) {
    puntajeObjetivos += 4;
    evaluacionDetallada.objetivos.detalles.push('✅ Incluye medición dolor');
  }
  
  if (textoCompleto.toLowerCase().includes('funcional')) {
    puntajeObjetivos += 3;
    evaluacionDetallada.objetivos.detalles.push('✅ Enfoque funcional');
  }
  
  evaluacionDetallada.objetivos.puntaje = Math.min(puntajeObjetivos, 25);
  puntajeTotal += evaluacionDetallada.objetivos.puntaje;

  // 2. Evaluar plan de tratamiento (30 puntos)
  let puntajePlan = 0;
  evaluacionDetallada.plan = {
    criterios: 'Técnicas de tratamiento específicas y basadas en evidencia',
    puntaje: 0,
    detalles: []
  };
  
  const tecnicasEsperadas = [
    'movilización', 'estabilización', 'fortalecimiento', 'flexibilidad', 
    'ergonomía', 'educación', 'ejercicio', 'control motor'
  ];
  
  tecnicasEsperadas.forEach(tecnica => {
    if (textoCompleto.toLowerCase().includes(tecnica)) {
      puntajePlan += 3;
      evaluacionDetallada.plan.detalles.push(`✅ Incluye ${tecnica}`);
    }
  });
  
  // Evaluar si hay técnicas específicas
  if (tecnicas && Array.isArray(tecnicas) && tecnicas.length >= 3) {
    puntajePlan += 6;
    evaluacionDetallada.plan.detalles.push('✅ Lista técnicas específicas');
  }
  
  evaluacionDetallada.plan.puntaje = Math.min(puntajePlan, 30);
  puntajeTotal += evaluacionDetallada.plan.puntaje;

  // 3. Evaluar evidencia científica (25 puntos)
  let puntajeEvidencia = 0;
  evaluacionDetallada.evidencia = {
    criterios: 'Referencias a evidencia científica y mejores prácticas',
    puntaje: 0,
    detalles: []
  };
  
  const evidenciaTerminos = [
    'evidencia', 'estudios', 'investigación', 'guías clínicas', 
    'recomendaciones', 'efectividad', 'protocolo'
  ];
  
  evidenciaTerminos.forEach(termino => {
    if (textoCompleto.toLowerCase().includes(termino)) {
      puntajeEvidencia += 3;
      evaluacionDetallada.evidencia.detalles.push(`✅ Menciona ${termino}`);
    }
  });
  
  // Bonificación por evaluación sistemática
  if (textoCompleto.toLowerCase().includes('evaluación') && textoCompleto.toLowerCase().includes('reevaluación')) {
    puntajeEvidencia += 4;
    evaluacionDetallada.evidencia.detalles.push('✅ Incluye reevaluación sistemática');
  }
  
  evaluacionDetallada.evidencia.puntaje = Math.min(puntajeEvidencia, 25);
  puntajeTotal += evaluacionDetallada.evidencia.puntaje;

  // 4. Evaluar seguimiento y prevención (20 puntos)
  let puntajeSeguimiento = 0;
  evaluacionDetallada.seguimiento = {
    criterios: 'Plan de seguimiento y estrategias de prevención',
    puntaje: 0,
    detalles: []
  };
  
  const seguimientoTerminos = [
    'seguimiento', 'control', 'progresión', 'prevención', 
    'mantenimiento', 'autocuidado', 'adherencia'
  ];
  
  seguimientoTerminos.forEach(termino => {
    if (textoCompleto.toLowerCase().includes(termino)) {
      puntajeSeguimiento += 2;
      evaluacionDetallada.seguimiento.detalles.push(`✅ Incluye ${termino}`);
    }
  });
  
  // Bonificación por educación del paciente
  if (textoCompleto.toLowerCase().includes('educación') || textoCompleto.toLowerCase().includes('enseñar')) {
    puntajeSeguimiento += 6;
    evaluacionDetallada.seguimiento.detalles.push('✅ Incluye educación del paciente');
  }
  
  evaluacionDetallada.seguimiento.puntaje = Math.min(puntajeSeguimiento, 20);
  puntajeTotal += evaluacionDetallada.seguimiento.puntaje;

  // Calcular nivel de competencia
  const porcentaje = (puntajeTotal / 100) * 100;
  let nivelCompetencia;
  
  if (porcentaje >= 85) {
    nivelCompetencia = 'EXCELENTE - Listo para uso clínico';
  } else if (porcentaje >= 70) {
    nivelCompetencia = 'BUENO - Competente para práctica clínica';
  } else if (porcentaje >= 60) {
    nivelCompetencia = 'ACEPTABLE - Requiere supervisión';
  } else {
    nivelCompetencia = 'INSUFICIENTE - Requiere mejoras significativas';
  }

  return {
    puntajeTotal,
    porcentaje,
    nivelCompetencia,
    evaluacionDetallada
  };
}

/**
 * Función principal de evaluación
 */
async function evaluarCapacidadTratamiento() {
  try {
    log('🎯 EVALUACIÓN PLAN DE TRATAMIENTO BASADO EN EVIDENCIA');
    
    // Inicializar servicios
    const vertexClient = new VertexAIClient();
    const clinicalService = new ClinicalInsightService(vertexClient);
    
    log('📊 PROCESANDO CASO LUMBAR MECÁNICO', {
      transcriptionLength: casoTratamientoEvidencia.length,
      tipoCase: 'Sin banderas rojas - Tratamiento basado en evidencia',
      modeloEsperado: 'gemini-2.5-flash (caso estándar)'
    });
    
    // Procesar transcripción
    const startTime = Date.now();
    const result = await clinicalService.processTranscription(casoTratamientoEvidencia, 'physiotherapy');
    const processingTime = (Date.now() - startTime) / 1000;
    
    log('✅ PROCESAMIENTO COMPLETADO', {
      processingTime: `${processingTime.toFixed(1)}s`,
      success: result.success,
      warningsCount: result.warnings?.length || 0,
      objectivesCount: result.functional_goals?.length || 0,
      techniquesCount: result.treatment_techniques?.length || 0
    });

    // Evaluar calidad del plan de tratamiento
    const evaluacion = evaluarPlanTratamiento(result);
    
    log('📋 EVALUACIÓN PLAN DE TRATAMIENTO', {
      puntajeTotal: `${evaluacion.puntajeTotal}/100`,
      porcentaje: `${evaluacion.porcentaje.toFixed(1)}%`,
      nivelCompetencia: evaluacion.nivelCompetencia,
      objetivosFuncionales: `${evaluacion.evaluacionDetallada.objetivos.puntaje}/25`,
      planTratamiento: `${evaluacion.evaluacionDetallada.plan.puntaje}/30`,
      evidenciaCientifica: `${evaluacion.evaluacionDetallada.evidencia.puntaje}/25`,
      seguimientoPrevencion: `${evaluacion.evaluacionDetallada.seguimiento.puntaje}/20`
    });

    // Acceder correctamente a los datos del resultado
    const soapNote = result.soap_note || {};
    const objetivos = soapNote.functional_goals || result.functional_goals || [];
    const tecnicas = soapNote.treatment_techniques || result.treatment_techniques || [];
    
    // Analizar objetivos funcionales
    if (objetivos.length > 0) {
      log('🎯 OBJETIVOS FUNCIONALES GENERADOS');
      objetivos.forEach((objetivo, i) => {
        console.log(`   ${i + 1}. ${objetivo}`);
      });
    }

    // Analizar técnicas de tratamiento
    if (tecnicas.length > 0) {
      log('🔧 TÉCNICAS DE TRATAMIENTO PROPUESTAS');
      tecnicas.forEach((tecnica, i) => {
        console.log(`   ${i + 1}. ${tecnica}`);
      });
    }

    // Evaluar calidad SOAP específica para tratamiento
    const soapNoteData = soapNote || {};
    log('📝 ANÁLISIS SOAP PARA TRATAMIENTO', {
      subjectiveCompletitud: soapNoteData.subjective?.length || 0,
      objectiveFindings: soapNoteData.objective?.length || 0,
      assessmentQuality: soapNoteData.assessment?.length || 0,
      planSpecificity: soapNoteData.plan?.length || 0,
      terminologiaEspecializada: (soapNoteData.assessment || '').toLowerCase().includes('mecánico')
    });

    // Evaluar ausencia de banderas rojas (correcto)
    const warnings = result.warnings || [];
    const banderasRojasDetectadas = warnings.filter(w => w.severity === 'HIGH' || w.severity === 'CRITICAL');
    
    log('🚩 EVALUACIÓN DETECCIÓN BANDERAS ROJAS', {
      warningsTotal: warnings.length,
      banderasRojasDetectadas: banderasRojasDetectadas.length,
      expectativa: '0 banderas rojas críticas (caso mecánico simple)',
      correctoNoDeteccion: banderasRojasDetectadas.length === 0 ? 'SÍ' : 'NO - Error'
    });

    // Evaluar enfoque terapéutico vs derivación
    const planText = JSON.stringify(soapNoteData.plan || '');
    const enfoqueCorrect = !planText.toLowerCase().includes('derivación urgente') && 
                          (planText.toLowerCase().includes('fisioterapia') || tecnicas.length > 0);
    
    log('🎯 EVALUACIÓN ENFOQUE TERAPÉUTICO', {
      derivacionInnecesaria: planText.toLowerCase().includes('derivación urgente') ? 'ERROR' : 'CORRECTO',
      enfoqueConservador: enfoqueCorrect ? 'CORRECTO' : 'ERROR',
      planTerapeuticoGenerado: tecnicas.length > 0 ? 'SÍ' : 'NO',
      objetivosFuncionalesGenerados: objetivos.length > 0 ? 'SÍ' : 'NO'
    });

    // Puntaje final compuesto
    const bonificaciones = {
      noFalsasAlarmas: banderasRojasDetectadas.length === 0 ? 5 : 0,
      enfoqueCorrect: enfoqueCorrect ? 5 : 0,
      processingTime: processingTime < 60 ? 5 : 0
    };

    const puntajeFinalAjustado = Math.min(100, evaluacion.puntajeTotal + Object.values(bonificaciones).reduce((a, b) => a + b, 0));

    log('🏆 EVALUACIÓN FINAL TRATAMIENTO', {
      puntajeBase: `${evaluacion.puntajeTotal}/100`,
      bonificaciones: Object.values(bonificaciones).reduce((a, b) => a + b, 0),
      puntajeFinal: `${puntajeFinalAjustado}/100`,
      competenciaClinica: evaluacion.nivelCompetencia,
      aptoPlanTratamiento: puntajeFinalAjustado >= 60 ? 'SÍ' : 'NO',
      evidenciaBasada: evaluacion.evaluacionDetallada.evidencia.puntaje >= 15 ? 'SÍ' : 'LIMITADA'
    });

    // Conclusión específica
    if (puntajeFinalAjustado >= 75) {
      log('🎉 EXCELENTE CAPACIDAD DE PLANIFICACIÓN TERAPÉUTICA');
      log('✅ Sistema genera planes de tratamiento competentes y basados en evidencia');
      log('🚀 Apto para uso clínico en casos estándar de fisioterapia');
    } else if (puntajeFinalAjustado >= 60) {
      log('✅ CAPACIDAD COMPETENTE DE PLANIFICACIÓN TERAPÉUTICA');
      log('🔧 Sistema genera planes adecuados con margen de mejora en evidencia');
    } else {
      log('⚠️ CAPACIDAD LIMITADA DE PLANIFICACIÓN TERAPÉUTICA');
      log('🔧 Requiere mejoras en generación de objetivos y técnicas específicas');
    }

    return {
      success: true,
      score: puntajeFinalAjustado,
      competencia: evaluacion.nivelCompetencia,
      details: {
        objetivos: objetivos.length,
        tecnicas: tecnicas.length,
        warnings: warnings.length,
        processingTime: processingTime,
        evaluacionDetallada: evaluacion.evaluacionDetallada
      }
    };

  } catch (error) {
    log('❌ ERROR EN EVALUACIÓN TRATAMIENTO', {
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
  evaluarCapacidadTratamiento()
    .then(resultado => {
      if (resultado.success && resultado.score >= 60) {
        console.log('\n🎯 EVALUACIÓN TRATAMIENTO EXITOSA - SISTEMA COMPETENTE PARA PLANIFICACIÓN TERAPÉUTICA');
        process.exit(0);
      } else {
        console.log('\n🚨 EVALUACIÓN TRATAMIENTO REQUIERE MEJORAS');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 ERROR CRÍTICO:', error.message);
      process.exit(1);
    });
}

module.exports = { evaluarCapacidadTratamiento }; 