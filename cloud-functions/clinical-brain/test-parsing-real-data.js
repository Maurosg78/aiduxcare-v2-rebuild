#!/usr/bin/env node

/**
 * TEST PARSING CON DATOS REALES
 * 
 * Usa el contenido REAL generado por el sistema para probar
 * la función de parsing mejorado
 */

const ClinicalInsightService = require('./src/services/ClinicalInsightService');

// Usar el contenido REAL exacto que genera el sistema
const realGeneratedContent = `\`\`\`json
{
  "soap_note": {
    "subjective": "Paciente femenina de 30 años de edad, diseñadora gráfica, acude a consulta por dolor en la espalda baja (zona lumbar), predominantemente en el lado derecho, con una duración de 6 semanas. El dolor inició de forma gradual, sin evento traumático específico, y ha sido persistente sin mejoría. Refiere que el dolor se agrava significativamente con la extensión lumbar (ej. inclinarse hacia atrás, alcanzar objetos en estantes altos), al caminar cuesta arriba y al bajar escaleras. Por el contrario, el dolor se alivia al sentarse por un tiempo o al inclinarse hacia adelante.",
    "objective": "A la exploración física se anticipan los siguientes hallazgos:\\n\\n**Observación:** Postura en sedestación y bipedestación con posible rectificación o aumento de la lordosis lumbar, o asimetría muscular en la región lumbar derecha.",
    "assessment": "Paciente con dolor lumbar mecánico crónico, predominantemente derecho, con irradiación a glúteo y muslo ipsilateral, compatible con un síndrome de Derangement Posterior según la clasificación de McKenzie (MDT).",
    "plan": "**Objetivos a Corto Plazo (2-3 semanas):**\\n*   Reducir el dolor lumbar a un nivel de 2/10 EVA o menos.\\n*   Disminuir la rigidez matutina en un 50%."
  },
  "clinical_summary": "Paciente con dolor lumbar mecánico crónico de 6 semanas de evolución, con clara preferencia direccional a la flexión lumbar y agravamiento con la extensión.",
  "functional_goals": [
    "Reducir el dolor lumbar a 0-2/10 EVA en reposo y durante actividades funcionales.",
    "Eliminar la rigidez matutina lumbar, permitiendo levantarse sin molestias en menos de 5 minutos.",
    "Retomar la natación (ej. 30 minutos, 3 veces por semana) sin experimentar dolor lumbar.",
    "Realizar las actividades laborales (diseño gráfico frente al computador) durante 8 horas sin molestias lumbares."
  ],
  "treatment_techniques": [
    "Educación en Neurociencia del Dolor (PNE)",
    "Movilizaciones Lumbares en Flexión",
    "Liberación Miofascial/Masaje Terapéutico (paravertebrales lumbares, glúteos)",
    "Ejercicios de Preferencia Direccional (Flexión Lumbar Repetida - McKenzie)",
    "Ejercicios de Estabilización del Core (Activación de Transversus Abdominis y Multífidus)",
    "Fortalecimiento de Musculatura Glútea",
    "Estiramientos de Flexores de Cadera e Isquiotibiales",
    "Reeducación Postural y Asesoramiento Ergonómico"
  ]
}
\`\`\``;

async function testParsingRealData() {
  console.log('🧪 INICIANDO TEST PARSING CON DATOS REALES');
  console.log('==================================================');
  
  // Inicializar el servicio
  const clinicalService = new ClinicalInsightService();
  
  console.log('\n📝 CONTENIDO REAL A PARSEAR:');
  console.log(`Longitud: ${realGeneratedContent.length}`);
  console.log(`Primeros 200 caracteres: ${realGeneratedContent.substring(0, 200)}`);
  console.log(`Últimos 100 caracteres: ${realGeneratedContent.substring(realGeneratedContent.length - 100)}`);
  
  console.log('\n🔍 INICIANDO PROCESO DE PARSING...');
  
  let resultado;
  
  // Probar la función de parsing CON LOGGING DETALLADO
  try {
    console.log('🔍 Llamando a processFinalAnalysisResult...');
    resultado = clinicalService.processFinalAnalysisResult(realGeneratedContent);
    console.log('✅ Función completada, analizando resultado...');
    
    // Logging detallado del resultado
    console.log('🎯 RESULTADO RAW:', JSON.stringify(resultado, null, 2));
    
  } catch (error) {
    console.error('❌ ERROR EN PARSING:', error);
    console.error('Stack trace:', error.stack);
    return;
  }
  
  console.log('\n✅ RESULTADO DEL PARSING:');
  console.log('========================================');
  
  // Mostrar estructura resultante
  console.log('\n📊 ESTRUCTURA RESULTANTE:');
  console.log(`- Warnings: ${resultado.warnings ? resultado.warnings.length : 'N/A'}`);
  console.log(`- Suggestions: ${resultado.suggestions ? resultado.suggestions.length : 'N/A'}`);
  console.log(`- Functional Goals: ${resultado.functional_goals ? resultado.functional_goals.length : 'N/A'}`);
  console.log(`- Treatment Techniques: ${resultado.treatment_techniques ? resultado.treatment_techniques.length : 'N/A'}`);
  console.log(`- SOAP Complete: ${!!(resultado.soap_note && resultado.soap_note.subjective && resultado.soap_note.objective)}`);
  console.log(`- Parsing Status: ${resultado.model_info ? resultado.model_info.parsing_status : 'N/A'}`);
  console.log(`- Content Length: ${resultado.model_info ? resultado.model_info.content_length : 'N/A'}`);
  console.log(`- SOAP Quality: ${resultado.soap_quality ? resultado.soap_quality.overall : 'N/A'}`);
  
  // Continuar con el resto del análisis...
  
  // Mostrar SOAP
  console.log('\n📋 CONTENIDO SOAP:');
  if (resultado.soap_note) {
    console.log(`   📝 Subjective: ${resultado.soap_note.subjective ? resultado.soap_note.subjective.substring(0, 100) + '...' : 'N/A'}`);
    console.log(`   👀 Objective: ${resultado.soap_note.objective ? resultado.soap_note.objective.substring(0, 100) + '...' : 'N/A'}`);
    console.log(`   🎯 Assessment: ${resultado.soap_note.assessment ? resultado.soap_note.assessment.substring(0, 100) + '...' : 'N/A'}`);
    console.log(`   📋 Plan: ${resultado.soap_note.plan ? resultado.soap_note.plan.substring(0, 100) + '...' : 'N/A'}`);
  }
  
  // Mostrar objetivos funcionales
  console.log('\n🎯 FUNCTIONAL GOALS:');
  if (resultado.functional_goals && resultado.functional_goals.length > 0) {
    resultado.functional_goals.forEach((goal, index) => {
      console.log(`   ${index + 1}. ${goal.substring(0, 100)}...`);
    });
  } else {
    console.log('   ❌ No se extrajeron objetivos funcionales');
  }
  
  // Mostrar técnicas de tratamiento
  console.log('\n🔧 TREATMENT TECHNIQUES:');
  if (resultado.treatment_techniques && resultado.treatment_techniques.length > 0) {
    resultado.treatment_techniques.forEach((technique, index) => {
      console.log(`   ${index + 1}. ${technique}`);
    });
  } else {
    console.log('   ❌ No se extrajeron técnicas de tratamiento');
  }
  
  // Mostrar sugerencias (si las hay)
  console.log('\n💡 SUGGESTIONS:');
  if (resultado.suggestions && resultado.suggestions.length > 0) {
    resultado.suggestions.forEach((suggestion, index) => {
      console.log(`   ${index + 1}. ${suggestion.substring(0, 100)}...`);
    });
  } else {
    console.log('   ❌ No hay sugerencias (apropiado para este caso)');
  }
  
  // Evaluación final
  console.log('\n🧪 EVALUACIÓN DEL PARSING:');
  console.log('========================================');
  
  const functionalGoalsExtracted = resultado.functional_goals ? resultado.functional_goals.length : 0;
  const treatmentTechniquesExtracted = resultado.treatment_techniques ? resultado.treatment_techniques.length : 0;
  const soapComplete = !!(resultado.soap_note && resultado.soap_note.subjective && resultado.soap_note.objective && resultado.soap_note.assessment && resultado.soap_note.plan);
  
  const score = (functionalGoalsExtracted > 0 ? 25 : 0) + 
                (treatmentTechniquesExtracted > 0 ? 25 : 0) + 
                (soapComplete ? 50 : 0);
  
  console.log(`Puntaje parsing: ${score}/100`);
  console.log(`Functional Goals extraídos: ${functionalGoalsExtracted}/4`);
  console.log(`Treatment Techniques extraídos: ${treatmentTechniquesExtracted}/8`);
  console.log(`SOAP completo: ${soapComplete ? 'Sí' : 'No'}`);
  
  if (score >= 95) {
    console.log('✅ PARSING EXCELENTE - COMPLETAMENTE FUNCIONAL');
  } else if (score >= 75) {
    console.log('✅ PARSING BUENO - LISTO PARA USO');
  } else if (score >= 50) {
    console.log('⚠️ PARSING PARCIAL - REQUIERE MEJORAS');
  } else {
    console.log('❌ PARSING DEFICIENTE - REQUIERE CORRECCIÓN CRÍTICA');
  }
  
  console.log('\n🎉 TEST PARSING CON DATOS REALES COMPLETADO');
}

// Ejecutar el test
testParsingRealData().catch(console.error); 