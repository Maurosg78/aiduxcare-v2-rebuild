#!/usr/bin/env node

/**
 * TEST DEBUG PARSING MEJORADO
 * 
 * Prueba específicamente el parsing del JSON para identificar el problema
 */

const ClinicalInsightService = require('./src/services/ClinicalInsightService');

// Simular una respuesta típica de Vertex AI
const simulatedResponse = `
\`\`\`json
{
  "soap_note": {
    "subjective": "Paciente femenina, diseñadora gráfica, refiere dolor lumbar bajo de 6 semanas de evolución, de inicio gradual y sin evento traumático específico.",
    "objective": "La evaluación objetiva se centrará en confirmar los hallazgos subjetivos y determinar la disfunción de movimiento específica.",
    "assessment": "Paciente femenina con un cuadro de dolor lumbar mecánico crónico derecho de 6 semanas de evolución.",
    "plan": "El plan de tratamiento se centrará en la reducción del dolor, la restauración de la función lumbar."
  },
  "functional_goals": [
    "Reducir la rigidez matutina de 20 minutos a menos de 5 minutos en 4 semanas.",
    "Retomar la natación 3 veces por semana durante 30 minutos sin dolor en 8 semanas.",
    "Realizar la jornada laboral completa (8 horas) como diseñadora gráfica sin molestias."
  ],
  "treatment_techniques": [
    "Terapia Manual: Movilizaciones lumbares (ej. deslizamientos posteroanteriores, técnicas de tejidos blandos).",
    "Ejercicio Terapéutico: Ejercicios de preferencia direccional (ej. flexión lumbar repetida).",
    "Educación al Paciente: Ergonomía postural, principios de la preferencia direccional."
  ],
  "warnings": [],
  "suggestions": [
    "Considerar evaluación McKenzie para confirmar preferencia direccional.",
    "Implementar pausas activas durante la jornada laboral."
  ]
}
\`\`\`
`;

async function testParsingMejorado() {
  console.log('🔧 INICIANDO TEST DEBUG PARSING MEJORADO');
  console.log('='.repeat(50));
  
  try {
    const clinicalService = new ClinicalInsightService();
    
    console.log('\n📝 CONTENIDO A PARSEAR:');
    console.log('Longitud:', simulatedResponse.length);
    console.log('Primeros 200 caracteres:', simulatedResponse.substring(0, 200));
    console.log('Últimos 100 caracteres:', simulatedResponse.substring(simulatedResponse.length - 100));
    
    console.log('\n🔍 INICIANDO PROCESO DE PARSING...');
    
    // Llamar directamente a la función de parsing
    const resultado = clinicalService.processFinalAnalysisResult(simulatedResponse);
    
    console.log('\n✅ RESULTADO DEL PARSING:');
    console.log('='.repeat(40));
    
    console.log('\n📊 ESTRUCTURA RESULTANTE:');
    console.log('- Warnings:', resultado.warnings?.length || 0);
    console.log('- Suggestions:', resultado.suggestions?.length || 0);
    console.log('- Functional Goals:', resultado.functional_goals?.length || 0);
    console.log('- Treatment Techniques:', resultado.treatment_techniques?.length || 0);
    console.log('- SOAP Complete:', !!(resultado.soap_note?.subjective && resultado.soap_note?.objective));
    console.log('- Parsing Status:', resultado.model_info?.parsing_status);
    console.log('- Content Length:', resultado.model_info?.content_length);
    
    console.log('\n📋 CONTENIDO SOAP:');
    if (resultado.soap_note) {
      console.log('- Subjective length:', resultado.soap_note.subjective?.length || 0);
      console.log('- Objective length:', resultado.soap_note.objective?.length || 0);
      console.log('- Assessment length:', resultado.soap_note.assessment?.length || 0);
      console.log('- Plan length:', resultado.soap_note.plan?.length || 0);
    }
    
    console.log('\n🎯 FUNCTIONAL GOALS:');
    if (resultado.functional_goals && resultado.functional_goals.length > 0) {
      resultado.functional_goals.forEach((goal, index) => {
        console.log(`   ${index + 1}. ${goal.substring(0, 80)}...`);
      });
    } else {
      console.log('   ❌ No se extrajeron objetivos funcionales');
    }
    
    console.log('\n🔧 TREATMENT TECHNIQUES:');
    if (resultado.treatment_techniques && resultado.treatment_techniques.length > 0) {
      resultado.treatment_techniques.forEach((technique, index) => {
        console.log(`   ${index + 1}. ${technique.substring(0, 80)}...`);
      });
    } else {
      console.log('   ❌ No se extrajeron técnicas de tratamiento');
    }
    
    console.log('\n💡 SUGGESTIONS:');
    if (resultado.suggestions && resultado.suggestions.length > 0) {
      resultado.suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion.substring(0, 80)}...`);
      });
    } else {
      console.log('   ❌ No se extrajeron sugerencias');
    }
    
    // Test específico del funcionamiento del evaluador
    console.log('\n🧪 TEST DEL EVALUADOR INTEGRADO:');
    console.log('='.repeat(40));
    
    const evaluacionSimulada = evaluarResultadoParseado(resultado);
    console.log('Puntaje simulado:', evaluacionSimulada.puntaje);
    console.log('Detalles:', evaluacionSimulada.detalles);
    
    console.log('\n✅ TEST COMPLETADO EXITOSAMENTE');
    
    return resultado;
    
  } catch (error) {
    console.error('❌ ERROR EN TEST DE PARSING:', error.message);
    console.error('Stack:', error.stack);
    return null;
  }
}

/**
 * Función de evaluación simplificada para testing
 */
function evaluarResultadoParseado(resultado) {
  let puntaje = 0;
  const detalles = [];
  
  // Evaluar estructura básica
  if (resultado.soap_note) {
    puntaje += 20;
    detalles.push('✅ Estructura SOAP presente');
  }
  
  if (resultado.functional_goals && resultado.functional_goals.length > 0) {
    puntaje += 25;
    detalles.push(`✅ Objetivos funcionales: ${resultado.functional_goals.length}`);
  }
  
  if (resultado.treatment_techniques && resultado.treatment_techniques.length > 0) {
    puntaje += 25;
    detalles.push(`✅ Técnicas de tratamiento: ${resultado.treatment_techniques.length}`);
  }
  
  if (resultado.suggestions && resultado.suggestions.length > 0) {
    puntaje += 15;
    detalles.push(`✅ Sugerencias: ${resultado.suggestions.length}`);
  }
  
  if (resultado.model_info && resultado.model_info.parsing_status === 'SUCCESS') {
    puntaje += 15;
    detalles.push('✅ Parsing exitoso');
  }
  
  return { puntaje, detalles };
}

// Ejecutar test
testParsingMejorado().then(resultado => {
  if (resultado) {
    console.log('\n🎉 TEST PARSING COMPLETADO');
  } else {
    console.log('\n💥 TEST PARSING FALLÓ');
  }
}).catch(error => {
  console.error('💥 ERROR GENERAL:', error.message);
}); 