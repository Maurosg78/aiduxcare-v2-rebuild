#!/usr/bin/env node

/**
 * DEBUG ESTRUCTURA DEL RESULTADO
 * Script para entender la estructura exacta del resultado del sistema
 */

const ClinicalInsightService = require('./src/services/ClinicalInsightService');
const VertexAIClient = require('./src/services/VertexAIClient');

// Caso clínico simple
const casoSimple = `
FISIOTERAPEUTA: ¿Cómo está hoy?
PACIENTE: Tengo dolor de espalda desde hace 2 semanas. Empezó después de cargar cajas pesadas.
FISIOTERAPEUTA: ¿Dónde exactamente?
PACIENTE: En la parte baja, se pone peor cuando me siento mucho tiempo.
`;

async function debugEstructura() {
  try {
    console.log('🔍 DEBUGGING ESTRUCTURA DEL RESULTADO\n');
    
    // Inicializar servicios
    const vertexClient = new VertexAIClient();
    const clinicalService = new ClinicalInsightService(vertexClient);
    
    // Procesar transcripción
    const result = await clinicalService.processTranscription(casoSimple, 'physiotherapy');
    
    console.log('📊 ESTRUCTURA COMPLETA DEL RESULTADO:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n🎯 ACCESO A DATOS ESPECÍFICOS:');
    console.log('result.soap_note existe:', result.soap_note ? 'SÍ' : 'NO');
    console.log('result.functional_goals existe:', result.functional_goals ? 'SÍ' : 'NO');
    console.log('result.treatment_techniques existe:', result.treatment_techniques ? 'SÍ' : 'NO');
    
    if (result.soap_note) {
      console.log('result.soap_note.functional_goals existe:', result.soap_note.functional_goals ? 'SÍ' : 'NO');
      console.log('result.soap_note.treatment_techniques existe:', result.soap_note.treatment_techniques ? 'SÍ' : 'NO');
      
      if (result.soap_note.functional_goals) {
        console.log('Número de objetivos funcionales:', result.soap_note.functional_goals.length);
        console.log('Objetivos funcionales:');
        result.soap_note.functional_goals.forEach((objetivo, i) => {
          console.log(`  ${i + 1}. ${objetivo}`);
        });
      }
      
      if (result.soap_note.treatment_techniques) {
        console.log('Número de técnicas de tratamiento:', result.soap_note.treatment_techniques.length);
        console.log('Técnicas de tratamiento:');
        result.soap_note.treatment_techniques.forEach((tecnica, i) => {
          console.log(`  ${i + 1}. ${tecnica}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  debugEstructura();
}

module.exports = { debugEstructura }; 