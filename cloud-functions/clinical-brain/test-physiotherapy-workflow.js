#!/usr/bin/env node

/**
 * TEST FLUJO COMPLETO FISIOTERAPIA
 * 
 * Prueba el flujo de 3 pasos optimizado para fisioterapeutas:
 * 1. Preguntas de puntos ciegos para anamnesis
 * 2. Batería de pruebas diagnósticas
 * 3. Checklist de acciones clínicas
 * 
 * @author Mauricio Sobarzo
 * @version 1.0 - Test Flujo Fisioterapia
 */

const axios = require("axios");

// Configuración
const ENDPOINT = "https://us-east1-aiduxcare-stt-20250706.cloudfunctions.net/physiotherapyWorkflow";

/**
 * CASO CLÍNICO COMPLEJO - FISIOTERAPIA
 * 
 * Paciente: Hombre de 35 años, desarrollador de software
 * Queja principal: Dolor cervical con irradiación
 */
const CASO_CLINICO = `
Paciente masculino de 35 años, desarrollador de software, consulta por dolor cervical 
de 3 semanas de evolución. Refiere dolor que inicia en la nuca y se irradia hacia el 
hombro derecho y brazo, llegando hasta el codo. Describe el dolor como punzante y 
continuo, especialmente intenso en las mañanas. Trabaja 8-10 horas frente al computador 
sin pausas. No recuerda trauma específico, pero menciona que durmió mal hace un mes.

El dolor aumenta al mover el cuello hacia la derecha y al inclinarlo hacia atrás. 
Refiere cierta rigidez matutina que dura aproximadamente 20 minutos. Ocasionalmente 
siente hormigueos en los dedos índice y medio de la mano derecha, especialmente 
cuando mantiene el brazo en determinadas posiciones.

Ha tomado ibuprofeno 600mg cada 8 horas los últimos 5 días con alivio parcial. 
No ha recibido fisioterapia previamente. Niega dolor de cabeza, mareos, náuseas o 
alteraciones visuales. Tampoco refiere debilidad muscular significativa.

Antecedentes: Sedentario, no practica deportes. Refiere estrés laboral alto últimamente 
debido a proyectos con plazos ajustados. Duerme 5-6 horas por noche en promedio.
`;

/**
 * Función principal de prueba
 */
async function probarFlujoFisioterapia() {
  console.log("🚀 INICIANDO TEST FLUJO FISIOTERAPIA");
  console.log("=====================================");
  
  try {
    // ========================================
    // PASO 1: PREGUNTAS DE PUNTOS CIEGOS
    // ========================================
    console.log("\n📋 PASO 1: GENERANDO PREGUNTAS DE PUNTOS CIEGOS");
    console.log("------------------------------------------------");
    
    const startTime1 = Date.now();
    const questionsResponse = await axios.post(ENDPOINT, {
      transcription: CASO_CLINICO,
      step: "questions",
      clinicalFacts: {
        region: "cervical",
        duration: "3 semanas",
        pattern: "dolor con irradiación",
        occupation: "desarrollador software"
      }
    });
    
    const questionsTime = Date.now() - startTime1;
    console.log(`⏱️ Tiempo procesamiento: ${questionsTime}ms`);
    
    if (questionsResponse.data.success) {
      const questions = questionsResponse.data.result.questions || [];
      console.log(`✅ Preguntas generadas: ${questions.length}`);
      
      questions.forEach((q, index) => {
        console.log(`\n${index + 1}. [${q.priority.toUpperCase()}] ${q.question}`);
        console.log(`   Categoría: ${q.category}`);
        console.log(`   Fundamento: ${q.rationale}`);
        console.log(`   Buscando: ${q.expected_insights}`);
      });
    } else {
      console.error("❌ Error en generación de preguntas");
      return;
    }

    // ========================================
    // PASO 2: BATERÍA DE PRUEBAS DIAGNÓSTICAS
    // ========================================
    console.log("\n🔬 PASO 2: GENERANDO BATERÍA DE PRUEBAS DIAGNÓSTICAS");
    console.log("---------------------------------------------------");
    
    const startTime2 = Date.now();
    const testsResponse = await axios.post(ENDPOINT, {
      transcription: CASO_CLINICO,
      step: "tests",
      clinicalFacts: {
        region: "cervical",
        symptoms: ["dolor", "irradiación", "hormigueos"],
        suspected_diagnosis: "Cervicalgia con probable radiculopatía C6-C7"
      }
    });
    
    const testsTime = Date.now() - startTime2;
    console.log(`⏱️ Tiempo procesamiento: ${testsTime}ms`);
    
    if (testsResponse.data.success) {
      const tests = testsResponse.data.result.diagnostic_tests || [];
      console.log(`✅ Pruebas generadas: ${tests.length}`);
      
      tests.forEach((test, index) => {
        console.log(`\n${index + 1}. [${test.priority.toUpperCase()}] ${test.name}`);
        console.log(`   Categoría: ${test.category}`);
        console.log(`   Procedimiento: ${test.procedure}`);
        console.log(`   Positivo indica: ${test.positive_finding}`);
        console.log(`   Relevancia: ${test.clinical_relevance}`);
        if (test.contraindications) {
          console.log(`   ⚠️ Contraindicaciones: ${test.contraindications}`);
        }
      });
    } else {
      console.error("❌ Error en generación de pruebas");
      return;
    }

    // ========================================
    // PASO 3: CHECKLIST DE ACCIONES CLÍNICAS
    // ========================================
    console.log("\n✅ PASO 3: GENERANDO CHECKLIST DE ACCIONES CLÍNICAS");
    console.log("---------------------------------------------------");
    
    const startTime3 = Date.now();
    const checklistResponse = await axios.post(ENDPOINT, {
      transcription: CASO_CLINICO,
      step: "checklist",
      clinicalFacts: {
        region: "cervical",
        symptoms: ["dolor", "irradiación", "hormigueos"],
        occupation: "desarrollador software"
      },
      warnings: [
        {
          type: "neurological",
          description: "Hormigueos en distribución C6-C7",
          severity: "medium"
        }
      ],
      suggestions: [
        {
          type: "ergonomic",
          description: "Mejorar ergonomía del puesto de trabajo",
          priority: "high"
        }
      ]
    });
    
    const checklistTime = Date.now() - startTime3;
    console.log(`⏱️ Tiempo procesamiento: ${checklistTime}ms`);
    
    if (checklistResponse.data.success) {
      const checklist = checklistResponse.data.result.action_checklist || [];
      console.log(`✅ Acciones generadas: ${checklist.length}`);
      
      const groupedActions = {
        red_flag: [],
        contraindication: [],
        education: [],
        treatment: [],
        follow_up: []
      };
      
      checklist.forEach(action => {
        if (groupedActions[action.type]) {
          groupedActions[action.type].push(action);
        }
      });
      
      Object.keys(groupedActions).forEach(type => {
        const actions = groupedActions[type];
        if (actions.length > 0) {
          console.log(`\n🔹 ${type.toUpperCase().replace("_", " ")}`);
          actions.forEach((action, index) => {
            console.log(`   ${index + 1}. [${action.priority.toUpperCase()}] ${action.action}`);
            console.log(`      Fundamento: ${action.rationale}`);
            console.log(`      Momento: ${action.timeline}`);
            console.log(`      Documentar: ${action.documentation}`);
          });
        }
      });
    } else {
      console.error("❌ Error en generación de checklist");
      return;
    }

    // ========================================
    // RESUMEN FINAL
    // ========================================
    const totalTime = questionsTime + testsTime + checklistTime;
    console.log("\n🎉 FLUJO FISIOTERAPIA COMPLETADO EXITOSAMENTE");
    console.log("=============================================");
    console.log(`⏱️ Tiempo total: ${totalTime}ms`);
    console.log(`📋 Preguntas generadas: ${questionsResponse.data.result.questions?.length || 0}`);
    console.log(`🔬 Pruebas generadas: ${testsResponse.data.result.diagnostic_tests?.length || 0}`);
    console.log(`✅ Acciones generadas: ${checklistResponse.data.result.action_checklist?.length || 0}`);
    console.log("\n🎯 SISTEMA LISTO PARA FISIOTERAPEUTAS");
    console.log("   - Preguntas de puntos ciegos para anamnesis completa");
    console.log("   - Pruebas diagnósticas específicas y relevantes");
    console.log("   - Checklist de acciones con documentación");
    console.log("   - Flujo optimizado para toma de decisiones clínicas");
    
  } catch (error) {
    console.error("❌ ERROR EN FLUJO FISIOTERAPIA:", error.message);
    if (error.response) {
      console.error("Respuesta del servidor:", error.response.data);
    }
  }
}

// Ejecutar prueba
probarFlujoFisioterapia(); 