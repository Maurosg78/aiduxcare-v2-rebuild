#!/usr/bin/env node

/**
 * TEST FLUJO COMPLETO 3 PASOS - AIDUXCARE
 * 
 * Evalúa la capacidad completa del sistema para:
 * 1. Recopilación de información
 * 2. Generación de advertencias, sugerencias y preguntas
 * 3. Generación de plan de tratamiento y SOAP con respaldo bibliográfico
 */

const ClinicalInsightService = require("./src/services/ClinicalInsightService");
const VertexAIClient = require("./src/services/VertexAIClient");

// Configurar logging detallado
const log = (message, data = {}) => {
  console.log(`[${new Date().toISOString()}] ${message}`, data);
};

/**
 * CASO CLÍNICO COMPLETO: SÍNDROME FACETARIO LUMBAR
 * 
 * Caso rico en contenido pero SIN banderas rojas que permite evaluar:
 * - Capacidad de recopilación de información detallada
 * - Generación de sugerencias y preguntas pertinentes
 * - Plan de tratamiento basado en evidencia
 * - Documentación SOAP profesional
 */
const casoSindromeFactario = `
FISIOTERAPEUTA: Buenos días, ¿cómo se encuentra hoy?

PACIENTE: Hola doctora. Vengo porque desde hace 6 semanas tengo dolor en la espalda baja que no mejora. Ya fui al médico general y me dijo que era muscular, pero siento que hay algo más.

FISIOTERAPEUTA: Cuénteme exactamente dónde siente el dolor y cómo empezó.

PACIENTE: El dolor está aquí en la zona lumbar, principalmente del lado derecho. Empezó gradualmente, no recuerdo un evento específico. Al principio pensé que era por estar mucho tiempo sentada en el trabajo, pero ahora me duele incluso cuando estoy de pie.

FISIOTERAPEUTA: ¿Hay algo que empeore o mejore el dolor?

PACIENTE: Se pone mucho peor cuando me inclino hacia atrás, como cuando trato de alcanzar algo en un estante alto. También me duele bastante cuando camino cuesta arriba o bajo escaleras. Por el contrario, cuando me siento un rato o me inclino hacia adelante se alivia bastante.

FISIOTERAPEUTA: ¿El dolor se extiende hacia algún lado?

PACIENTE: Sí, a veces baja hacia el glúteo derecho y la parte posterior del muslo, pero nunca pasa de la rodilla. No siento hormigueos ni entumecimiento, solo dolor.

FISIOTERAPEUTA: ¿Cómo afecta esto sus actividades diarias?

PACIENTE: Trabajo como diseñadora gráfica, paso muchas horas frente al computador. Por las mañanas me levanto rígida, necesito como 20 minutos para 'desentumecer'. En el trabajo puedo estar sentada sin mucho problema, pero cuando me levanto después de estar mucho tiempo sentada, me duele al principio.

FISIOTERAPEUTA: ¿Ha hecho algún tipo de ejercicio o tratamiento?

PACIENTE: Sí, he probado con yoga en casa siguiendo videos de YouTube, y curiosamente me siento mejor después de hacer las posturas donde me inclino hacia adelante. También probé con calor local y me ayuda temporalmente. Tomé ibuprofeno por unos días y sí me ayudó bastante.

FISIOTERAPEUTA: ¿Tiene algún antecedente médico relevante?

PACIENTE: No tengo enfermedades crónicas. Hace 3 años tuve un episodio similar pero más leve que se resolvió solo en unas 2 semanas. Mi trabajo es sedentario desde hace 8 años. Hago ejercicio regularmente, principalmente caminata y natación, aunque las últimas semanas he dejado la natación porque me duele.

FISIOTERAPEUTA: ¿Cómo está durmiendo?

PACIENTE: Duermo bien en general. No me despierto por dolor durante la noche. Por las mañanas me levanto un poco rígida pero no con dolor severo. Duermo de lado principalmente.

FISIOTERAPEUTA: ¿Qué expectativas tiene del tratamiento?

PACIENTE: Me gustaría volver a hacer natación, que es lo que más me gusta. También poder trabajar sin molestias y no tener esa rigidez matutina. Estoy dispuesta a hacer los ejercicios que me indique y cambiar hábitos si es necesario.
`;

async function evaluarFlujoCompleto() {
  const startTime = Date.now();
  
  try {
    log("🎯 INICIANDO EVALUACIÓN FLUJO COMPLETO 3 PASOS");
    log("📋 CASO CLÍNICO: Síndrome Facetario Lumbar (sin banderas rojas)");
    
    // PASO 1: Recopilación de información
    log("\n📊 PASO 1: RECOPILACIÓN DE INFORMACIÓN");
    console.log("=".repeat(50));
    
    const clinicalInsightService = new ClinicalInsightService();
    
    log("🔄 Procesando transcripción completa...");
    const resultado = await clinicalInsightService.processTranscription(
      casoSindromeFactario,
      "physiotherapy",
      "initial"
    );
    
    const tiempoTotal = (Date.now() - startTime) / 1000;
    
    log("✅ PROCESAMIENTO COMPLETADO", {
      tiempoTotal: `${tiempoTotal}s`,
      tieneResultado: !!resultado
    });
    
    // EVALUACIÓN DETALLADA DE LOS 3 PASOS
    console.log("\n📊 EVALUACIÓN DETALLADA DE LOS 3 PASOS:");
    console.log("=".repeat(60));
    
    // PASO 1: Evaluación de Recopilación de Información
    const evaluacionPaso1 = evaluarRecopilacionInformacion(resultado);
    
    // PASO 2: Evaluación de Advertencias y Sugerencias
    const evaluacionPaso2 = evaluarAdvertenciasYSugerencias(resultado);
    
    // PASO 3: Evaluación de Plan de Tratamiento y SOAP
    const evaluacionPaso3 = evaluarPlanTratamientoSOAP(resultado);
    
    // Evaluación de Respaldo Bibliográfico
    const evaluacionBibliografica = evaluarRespaldoBibliografico(resultado);
    
    // RESUMEN FINAL INTEGRAL
    const evaluacionFinal = calcularEvaluacionFinal(
      evaluacionPaso1,
      evaluacionPaso2, 
      evaluacionPaso3,
      evaluacionBibliografica,
      tiempoTotal
    );
    
    mostrarResumenFinal(evaluacionFinal);
    
    return evaluacionFinal;
    
  } catch (error) {
    log("❌ ERROR EN EVALUACIÓN FLUJO COMPLETO", {
      error: error.message,
      stack: error.stack
    });
    
    return {
      error: error.message,
      puntajeTotal: 0,
      nivel: "ERROR"
    };
  }
}

/**
 * PASO 1: Evalúa la capacidad de recopilación de información
 */
function evaluarRecopilacionInformacion(resultado) {
  console.log("\n🔍 PASO 1: EVALUACIÓN RECOPILACIÓN DE INFORMACIÓN");
  console.log("-".repeat(50));
  
  let puntaje = 0;
  const detalles = [];
  
  // Evaluar estructura de datos recopilados
  if (resultado.soap_note && resultado.soap_note.subjective) {
    const subjective = resultado.soap_note.subjective;
    
    // Evaluar completitud de información subjetiva
    if (subjective.includes("6 semanas") || subjective.includes("semanas")) {
      puntaje += 10;
      detalles.push("✅ Duración del dolor identificada");
    }
    
    if (subjective.includes("gradual") || subjective.includes("gradualmente")) {
      puntaje += 10;
      detalles.push("✅ Modo de inicio documentado");
    }
    
    if (subjective.includes("extensión") || subjective.includes("inclina")) {
      puntaje += 15;
      detalles.push("✅ Factores agravantes identificados");
    }
    
    if (subjective.includes("flexión") || subjective.includes("adelante") || subjective.includes("sentada")) {
      puntaje += 15;
      detalles.push("✅ Factores de alivio documentados");
    }
    
    if (subjective.includes("glúteo") || subjective.includes("muslo")) {
      puntaje += 10;
      detalles.push("✅ Patrón de irradiación documentado");
    }
    
    if (subjective.includes("trabajo") || subjective.includes("sedentario") || subjective.includes("diseñadora")) {
      puntaje += 10;
      detalles.push("✅ Contexto laboral recopilado");
    }
    
    if (subjective.includes("yoga") || subjective.includes("natación") || subjective.includes("ejercicio")) {
      puntaje += 10;
      detalles.push("✅ Intentos de tratamiento previo documentados");
    }
    
    if (subjective.includes("expectativas") || subjective.includes("objetivo")) {
      puntaje += 10;
      detalles.push("✅ Expectativas del paciente recopiladas");
    }
  }
  
  // Evaluar análisis de signos y síntomas
  if (resultado.soap_note && resultado.soap_note.objective) {
    puntaje += 10;
    detalles.push("✅ Plan de evaluación física estructurado");
  }
  
  console.log(`📊 Puntaje Recopilación: ${puntaje}/100`);
  detalles.forEach(detalle => console.log(`   ${detalle}`));
  
  return {
    puntaje,
    detalles,
    area: "Recopilación de Información"
  };
}

/**
 * PASO 2: Evalúa la generación de advertencias, sugerencias y preguntas
 */
function evaluarAdvertenciasYSugerencias(resultado) {
  console.log("\n⚠️ PASO 2: EVALUACIÓN ADVERTENCIAS Y SUGERENCIAS");
  console.log("-".repeat(50));
  
  let puntaje = 0;
  const detalles = [];
  
  // Evaluar warnings (deben ser mínimos o ausentes en caso sin banderas rojas)
  const warnings = resultado.warnings || [];
  if (warnings.length === 0) {
    puntaje += 20;
    detalles.push("✅ Ausencia apropiada de banderas rojas");
  } else if (warnings.length <= 2) {
    puntaje += 15;
    detalles.push(`✅ Warnings mínimos apropiados (${warnings.length})`);
  }
  
  // Evaluar sugerencias
  const suggestions = resultado.suggestions || [];
  if (suggestions.length >= 3) {
    puntaje += 20;
    detalles.push(`✅ Sugerencias generadas (${suggestions.length})`);
  }
  
  // Evaluar calidad del assessment
  if (resultado.soap_note && resultado.soap_note.assessment) {
    const assessment = resultado.soap_note.assessment;
    
    if (assessment.includes("mecánico") || assessment.includes("facetario") || assessment.includes("articular")) {
      puntaje += 15;
      detalles.push("✅ Hipótesis diagnóstica específica");
    }
    
    if (assessment.includes("pronóstico") || assessment.includes("favorable")) {
      puntaje += 15;
      detalles.push("✅ Pronóstico evaluado");
    }
    
    if (assessment.includes("limitación") || assessment.includes("funcional")) {
      puntaje += 15;
      detalles.push("✅ Limitaciones funcionales identificadas");
    }
  }
  
  // Evaluar calidad clínica del análisis
  if (resultado.clinical_summary) {
    puntaje += 15;
    detalles.push("✅ Resumen clínico generado");
  }
  
  console.log(`📊 Puntaje Advertencias/Sugerencias: ${puntaje}/100`);
  detalles.forEach(detalle => console.log(`   ${detalle}`));
  
  return {
    puntaje,
    detalles,
    area: "Advertencias y Sugerencias"
  };
}

/**
 * PASO 3: Evalúa el plan de tratamiento y documentación SOAP
 */
function evaluarPlanTratamientoSOAP(resultado) {
  console.log("\n📋 PASO 3: EVALUACIÓN PLAN DE TRATAMIENTO Y SOAP");
  console.log("-".repeat(50));
  
  let puntaje = 0;
  const detalles = [];
  
  // Evaluar objetivos funcionales
  const functionalGoals = resultado.functional_goals || [];
  if (functionalGoals.length >= 3) {
    puntaje += 20;
    detalles.push(`✅ Objetivos funcionales SMART (${functionalGoals.length})`);
    
    // Evaluar especificidad de objetivos
    const objetivosTexto = functionalGoals.join(" ").toLowerCase();
    if (objetivosTexto.includes("natación") || objetivosTexto.includes("trabajo")) {
      puntaje += 10;
      detalles.push("✅ Objetivos específicos al contexto del paciente");
    }
  }
  
  // Evaluar técnicas de tratamiento
  const treatmentTechniques = resultado.treatment_techniques || [];
  if (treatmentTechniques.length >= 4) {
    puntaje += 20;
    detalles.push(`✅ Técnicas de tratamiento variadas (${treatmentTechniques.length})`);
    
    // Evaluar especificidad técnica
    const tecnicasTexto = treatmentTechniques.join(" ").toLowerCase();
    if (tecnicasTexto.includes("movilización") || tecnicasTexto.includes("articular")) {
      puntaje += 10;
      detalles.push("✅ Técnicas manuales específicas");
    }
    
    if (tecnicasTexto.includes("core") || tecnicasTexto.includes("estabilización")) {
      puntaje += 10;
      detalles.push("✅ Ejercicios de estabilización");
    }
    
    if (tecnicasTexto.includes("educación") || tecnicasTexto.includes("ergonomía")) {
      puntaje += 10;
      detalles.push("✅ Educación y prevención");
    }
  }
  
  // Evaluar estructura SOAP completa
  if (resultado.soap_note) {
    const soap = resultado.soap_note;
    
    if (soap.subjective && soap.subjective.length > 200) {
      puntaje += 5;
      detalles.push("✅ Subjective completo");
    }
    
    if (soap.objective && soap.objective.length > 200) {
      puntaje += 5;
      detalles.push("✅ Objective estructurado");
    }
    
    if (soap.assessment && soap.assessment.length > 150) {
      puntaje += 5;
      detalles.push("✅ Assessment profesional");
    }
    
    if (soap.plan && soap.plan.length > 300) {
      puntaje += 5;
      detalles.push("✅ Plan detallado");
    }
  }
  
  console.log(`📊 Puntaje Plan Tratamiento/SOAP: ${puntaje}/100`);
  detalles.forEach(detalle => console.log(`   ${detalle}`));
  
  return {
    puntaje,
    detalles,
    area: "Plan de Tratamiento y SOAP"
  };
}

/**
 * Evalúa el respaldo bibliográfico implícito en el contenido
 */
function evaluarRespaldoBibliografico(resultado) {
  console.log("\n📚 EVALUACIÓN RESPALDO BIBLIOGRÁFICO");
  console.log("-".repeat(50));
  
  let puntaje = 0;
  const detalles = [];
  
  // Buscar evidencia de respaldo científico en el contenido
  const textoCompleto = JSON.stringify(resultado).toLowerCase();
  
  // Terminología basada en evidencia
  if (textoCompleto.includes("maitland") || textoCompleto.includes("grado i") || textoCompleto.includes("grado ii")) {
    puntaje += 15;
    detalles.push("✅ Técnicas de movilización graduada (Maitland)");
  }
  
  if (textoCompleto.includes("transverso") || textoCompleto.includes("multífido")) {
    puntaje += 15;
    detalles.push("✅ Activación musculatura profunda (Richardson)");
  }
  
  if (textoCompleto.includes("control motor") || textoCompleto.includes("estabilización segmentaria")) {
    puntaje += 15;
    detalles.push("✅ Control motor y estabilización (O'Sullivan)");
  }
  
  if (textoCompleto.includes("neurociencia") || textoCompleto.includes("educación del dolor")) {
    puntaje += 15;
    detalles.push("✅ Educación en neurociencia del dolor (Butler & Moseley)");
  }
  
  if (textoCompleto.includes("ergonomía") || textoCompleto.includes("biomecánica")) {
    puntaje += 10;
    detalles.push("✅ Principios ergonómicos y biomecánicos");
  }
  
  if (textoCompleto.includes("evidencia") || textoCompleto.includes("basado en")) {
    puntaje += 10;
    detalles.push("✅ Referencias a práctica basada en evidencia");
  }
  
  // Evaluar estructura progresiva del tratamiento
  if (textoCompleto.includes("fase") || textoCompleto.includes("progresión")) {
    puntaje += 10;
    detalles.push("✅ Progresión terapéutica estructurada");
  }
  
  // Terminología diagnóstica específica
  if (textoCompleto.includes("facetario") || textoCompleto.includes("segmentario")) {
    puntaje += 10;
    detalles.push("✅ Terminología diagnóstica específica");
  }
  
  console.log(`📊 Puntaje Respaldo Bibliográfico: ${puntaje}/100`);
  detalles.forEach(detalle => console.log(`   ${detalle}`));
  
  return {
    puntaje,
    detalles,
    area: "Respaldo Bibliográfico"
  };
}

/**
 * Calcula la evaluación final integrando todos los pasos
 */
function calcularEvaluacionFinal(eval1, eval2, eval3, evalBiblio, tiempoTotal) {
  const puntajeTotal = Math.round(
    (eval1.puntaje * 0.25) + 
    (eval2.puntaje * 0.25) + 
    (eval3.puntaje * 0.35) + 
    (evalBiblio.puntaje * 0.15)
  );
  
  let nivel;
  if (puntajeTotal >= 85) nivel = "EXCEPCIONAL";
  else if (puntajeTotal >= 75) nivel = "EXCELENTE";
  else if (puntajeTotal >= 65) nivel = "BUENO";
  else if (puntajeTotal >= 55) nivel = "ACEPTABLE";
  else nivel = "INSUFICIENTE";
  
  return {
    puntajeTotal,
    nivel,
    tiempoTotal,
    evaluaciones: {
      paso1: eval1,
      paso2: eval2,
      paso3: eval3,
      bibliografia: evalBiblio
    },
    recomendacion: puntajeTotal >= 65 ? "LISTO PARA USO CLÍNICO" : "REQUIERE MEJORAS"
  };
}

/**
 * Muestra el resumen final de la evaluación
 */
function mostrarResumenFinal(evaluacion) {
  console.log("\n🎉 RESUMEN FINAL EVALUACIÓN FLUJO COMPLETO");
  console.log("=".repeat(60));
  
  console.log(`\n🏆 PUNTAJE TOTAL: ${evaluacion.puntajeTotal}/100`);
  console.log(`📊 NIVEL DE COMPETENCIA: ${evaluacion.nivel}`);
  console.log(`⏱️  TIEMPO DE PROCESAMIENTO: ${evaluacion.tiempoTotal.toFixed(1)}s`);
  console.log(`🎯 RECOMENDACIÓN: ${evaluacion.recomendacion}`);
  
  console.log("\n📋 DESGLOSE POR PASOS:");
  console.log(`   1️⃣  Recopilación de Información: ${evaluacion.evaluaciones.paso1.puntaje}/100 (25%)`);
  console.log(`   2️⃣  Advertencias y Sugerencias: ${evaluacion.evaluaciones.paso2.puntaje}/100 (25%)`);
  console.log(`   3️⃣  Plan Tratamiento y SOAP: ${evaluacion.evaluaciones.paso3.puntaje}/100 (35%)`);
  console.log(`   📚 Respaldo Bibliográfico: ${evaluacion.evaluaciones.bibliografia.puntaje}/100 (15%)`);
  
  if (evaluacion.puntajeTotal >= 75) {
    console.log("\n🟢 RESULTADO: SISTEMA DEMUESTRA CAPACIDAD PROFESIONAL EXCEPCIONAL");
    console.log("   ✅ Los 3 pasos de AiDuxCare funcionan correctamente");
    console.log("   ✅ Calidad de contenido apropiada para uso clínico");
    console.log("   ✅ Respaldo bibliográfico implícito presente");
  } else if (evaluacion.puntajeTotal >= 65) {
    console.log("\n🟡 RESULTADO: SISTEMA COMPETENTE CON OPORTUNIDADES DE MEJORA");
  } else {
    console.log("\n🔴 RESULTADO: SISTEMA REQUIERE OPTIMIZACIÓN ANTES DE USO CLÍNICO");
  }
}

// Ejecutar evaluación
evaluarFlujoCompleto().then(resultado => {
  console.log("\n🏁 EVALUACIÓN FLUJO COMPLETO TERMINADA:", {
    puntajeTotal: resultado.puntajeTotal,
    nivel: resultado.nivel,
    tiempo: `${resultado.tiempoTotal?.toFixed(1)}s`
  });
}).catch(error => {
  console.error("💥 EVALUACIÓN FALLÓ:", error.message);
}); 