/**
 * SERVICIO FLUJO FISIOTERAPIA
 * 
 * Conecta el frontend con el cerebro clínico para el flujo específico
 * de fisioterapia con 3 pasos: preguntas, pruebas y checklist
 * 
 * @author Mauricio Sobarzo
 * @version 1.0 - Flujo Fisioterapia Optimizado
 */

interface PhysiotherapyQuestion {
  id: string;
  priority: "high" | "medium" | "low";
  category: "pain_characteristics" | "functional_impact" | "red_flags" | "psychosocial" | "ergonomic";
  question: string;
  rationale: string;
  expected_insights: string;
}

interface DiagnosticTest {
  id: string;
  name: string;
  category: "neurological" | "orthopedic" | "functional" | "postural" | "provocative";
  priority: "high" | "medium" | "low";
  procedure: string;
  positive_finding: string;
  clinical_relevance: string;
  contraindications: string;
}

interface ActionItem {
  id: string;
  type: "red_flag" | "contraindication" | "education" | "treatment" | "follow_up";
  priority: "immediate" | "high" | "medium" | "low";
  action: string;
  rationale: string;
  timeline: string;
  documentation: string;
}

interface PhysiotherapyWorkflowResponse {
  success: boolean;
  step: string;
  result: {
    questions?: PhysiotherapyQuestion[];
    diagnostic_tests?: DiagnosticTest[];
    action_checklist?: ActionItem[];
  };
  timestamp: string;
}

export class PhysiotherapyWorkflowService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "https://us-east1-aiduxcare-stt-20250706.cloudfunctions.net/physiotherapyWorkflow";
  }

  /**
   * Genera preguntas de puntos ciegos para la anamnesis
   */
  async generateBlindSpotQuestions(
    transcription: string,
    clinicalFacts?: unknown
  ): Promise<PhysiotherapyQuestion[]> {
    try {
      const response = await this.callWorkflowEndpoint({
        transcription,
        step: "questions",
        clinicalFacts: clinicalFacts || {}
      });

      return response.result.questions || [];
    } catch (error) {
      console.error("❌ Error generando preguntas puntos ciegos:", error);
      return [];
    }
  }

  /**
   * Genera batería de pruebas diagnósticas específicas
   */
  async generateDiagnosticTests(
    transcription: string,
    clinicalFacts?: unknown,
    suspectedDiagnosis?: string
  ): Promise<DiagnosticTest[]> {
    try {
      const response = await this.callWorkflowEndpoint({
        transcription,
        step: "tests",
        clinicalFacts: clinicalFacts || {},
        suspectedDiagnosis
      });

      return response.result.diagnostic_tests || [];
    } catch (error) {
      console.error("❌ Error generando pruebas diagnósticas:", error);
      return [];
    }
  }

  /**
   * Genera checklist de acciones clínicas
   */
  async generateActionChecklist(
    transcription: string,
    clinicalFacts?: unknown,
    warnings?: unknown[],
    suggestions?: unknown[]
  ): Promise<ActionItem[]> {
    try {
      const response = await this.callWorkflowEndpoint({
        transcription,
        step: "checklist",
        clinicalFacts: clinicalFacts || {},
        warnings: warnings || [],
        suggestions: suggestions || []
      });

      return response.result.action_checklist || [];
    } catch (error) {
      console.error("❌ Error generando checklist acciones:", error);
      return [];
    }
  }

  /**
   * Llama al endpoint del flujo de fisioterapia
   */
  private async callWorkflowEndpoint(payload: unknown): Promise<PhysiotherapyWorkflowResponse> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Flujo completo de fisioterapia - procesa todos los pasos
   */
  async processCompleteWorkflow(transcription: string, clinicalFacts?: unknown) {
    try {
      console.log("🚀 Iniciando flujo completo de fisioterapia");

      // Paso 1: Generar preguntas de puntos ciegos
      const questions = await this.generateBlindSpotQuestions(transcription, clinicalFacts);
      console.log(`✅ Preguntas generadas: ${questions.length}`);

      // Paso 2: Generar pruebas diagnósticas
      const tests = await this.generateDiagnosticTests(transcription, clinicalFacts);
      console.log(`✅ Pruebas generadas: ${tests.length}`);

      // Paso 3: Generar checklist de acciones
      const checklist = await this.generateActionChecklist(transcription, clinicalFacts);
      console.log(`✅ Checklist generado: ${checklist.length} items`);

      return {
        success: true,
        questions,
        tests,
        checklist,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("❌ Error en flujo completo:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        questions: [],
        tests: [],
        checklist: []
      };
    }
  }
} 