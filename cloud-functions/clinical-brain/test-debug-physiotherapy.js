#!/usr/bin/env node

/**
 * DEBUG TEST FISIOTERAPIA
 * 
 * Test específico para debuggear por qué las respuestas JSON están vacías
 */

const ClinicalInsightService = require('./src/services/ClinicalInsightService');

async function debugPhysiotherapyWorkflow() {
  console.log('🔍 INICIANDO DEBUG FISIOTERAPIA');
  console.log('==============================');
  
  const clinicalService = new ClinicalInsightService();
  
  const transcription = "Paciente con dolor cervical de 2 semanas, aumenta con movimientos del cuello hacia la derecha, trabaja 8 horas frente al computador";
  const clinicalFacts = { region: "cervical", duration: "2 semanas" };
  
  try {
    console.log('\n📋 PASO 1: GENERANDO PREGUNTAS DE PUNTOS CIEGOS');
    console.log('Transcripción:', transcription);
    console.log('Clinical Facts:', clinicalFacts);
    
    const result = await clinicalService.generateBlindSpotQuestions(transcription, clinicalFacts);
    
    console.log('\n📊 RESULTADO COMPLETO:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n✅ Test completado');
    
  } catch (error) {
    console.error('❌ ERROR EN DEBUG:', error);
    console.error('Stack:', error.stack);
  }
}

debugPhysiotherapyWorkflow(); 