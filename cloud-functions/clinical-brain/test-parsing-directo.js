#!/usr/bin/env node

/**
 * TEST PARSING DIRECTO
 * Evita problemas de caching de Node.js
 */

// Limpiar caché
delete require.cache[require.resolve('./src/services/ClinicalInsightService')];

const ClinicalInsightService = require('./src/services/ClinicalInsightService');

const testContent = `\`\`\`json
{
  "soap_note": {
    "subjective": "Test subjective",
    "objective": "Test objective", 
    "assessment": "Test assessment",
    "plan": "Test plan"
  },
  "functional_goals": [
    "Goal 1",
    "Goal 2"
  ],
  "treatment_techniques": [
    "Technique 1",
    "Technique 2"
  ]
}
\`\`\``;

console.log('🧪 TEST PARSING DIRECTO');
console.log('======================');

const service = new ClinicalInsightService();
const result = service.processFinalAnalysisResult(testContent);

console.log('📊 RESULTADO:');
console.log('- Functional Goals:', result.functional_goals ? result.functional_goals.length : 'N/A');
console.log('- Treatment Techniques:', result.treatment_techniques ? result.treatment_techniques.length : 'N/A');
console.log('- SOAP Note Keys:', result.soap_note ? Object.keys(result.soap_note) : 'N/A');
console.log('- SOAP Quality:', result.soap_quality ? result.soap_quality.overall : 'N/A');

if (result.functional_goals && result.functional_goals.length > 0) {
  console.log('✅ PARSING FUNCIONANDO CORRECTAMENTE');
} else {
  console.log('❌ PARSING SIGUE FALLANDO');
  console.log('🔍 RESULTADO COMPLETO:', JSON.stringify(result, null, 2));
} 