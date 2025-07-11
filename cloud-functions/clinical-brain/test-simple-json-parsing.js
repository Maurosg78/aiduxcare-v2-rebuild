#!/usr/bin/env node

/**
 * TEST SIMPLE DE PARSING JSON MEJORADO
 */

const ClinicalInsightService = require('./src/services/ClinicalInsightService');

console.log('🧪 TEST SIMPLE DE PARSING JSON MEJORADO');

async function testJsonParsing() {
  try {
    console.log('🔧 Inicializando ClinicalInsightService...');
    const clinicalService = new ClinicalInsightService();
    
    // Test case simple
    const testInput = {
      text: '{\"functional_goals\": [\"objetivo 1\", \"objetivo 2\"], \"treatment_techniques\": [\"técnica 1\"]}'
    };
    
    console.log('\n🔍 Test básico de parsing:');
    console.log('Input:', testInput.text);
    
    const result = clinicalService.processFinalAnalysisResult(testInput);
    
    console.log('\n✅ Resultado:');
    console.log('  - Functional goals:', result.functional_goals?.length || 0);
    console.log('  - Treatment techniques:', result.treatment_techniques?.length || 0);
    console.log('  - SOAP note:', !!result.soap_note);
    console.log('  - Model info:', result.model_info?.model_used || 'N/A');
    
    if (result.functional_goals?.length > 0) {
      console.log('\n📋 Objetivos funcionales encontrados:');
      result.functional_goals.forEach((goal, i) => {
        console.log(`   ${i + 1}. ${goal}`);
      });
    }
    
    if (result.treatment_techniques?.length > 0) {
      console.log('\n🔧 Técnicas de tratamiento encontradas:');
      result.treatment_techniques.forEach((technique, i) => {
        console.log(`   ${i + 1}. ${technique}`);
      });
    }
    
    console.log('\n🎉 TEST COMPLETADO EXITOSAMENTE');
    
  } catch (error) {
    console.error('❌ Error en test:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar test
testJsonParsing(); 