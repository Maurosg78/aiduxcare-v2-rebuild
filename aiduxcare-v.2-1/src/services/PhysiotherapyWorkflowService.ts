import { PhysiotherapyInsight } from "@/types"; // Asegúrate de que esta ruta sea correcta según tu estructura de carpetas

interface GenerateBlindSpotQuestionsResponse {
  id: string;
  question?: string;
  rationale?: string;
  expected_insights?: string;
  priority: "high" | "medium" | "low";
}

interface GenerateDiagnosticTestsResponse {
  id: string;
  name?: string;
  procedure?: string;
  clinical_relevance?: string;
  priority: "high" | "medium" | "low";
}

interface GenerateActionChecklistResponse {
  id: string;
  type: string;
  action: string;
  rationale: string;
  documentation: string;
  priority: "high" | "medium" | "low";
}

export class PhysiotherapyWorkflowService {
  async generateBlindSpotQuestions(transcription: string, clinicalFacts?: Record<string, unknown>): Promise<PhysiotherapyInsight[]> {
    const response = await fetch("https://api.example.com/generateBlindSpotQuestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcription, clinicalFacts }),
    });

    if (!response.ok) {
      throw new Error("Error al generar preguntas de puntos ciegos");
    }

    const data: GenerateBlindSpotQuestionsResponse[] = await response.json();
    return data.map(q => ({
      id: q.id,
      type: "question",
      title: q.question ?? "",
      description: q.rationale ?? "",
      rationale: q.expected_insights ?? "",
      priority: q.priority,
    }));
  }

  async generateDiagnosticTests(transcription: string, clinicalFacts?: Record<string, unknown>): Promise<PhysiotherapyInsight[]> {
    const response = await fetch("https://api.example.com/generateDiagnosticTests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcription, clinicalFacts }),
    });

    if (!response.ok) {
      throw new Error("Error al generar pruebas diagnósticas");
    }

    const data: GenerateDiagnosticTestsResponse[] = await response.json();
    return data.map(test => ({
      id: test.id,
      type: "test",
      title: test.name ?? "",
      description: test.procedure ?? "",
      rationale: test.clinical_relevance ?? "",
      priority: test.priority,
    }));
  }

  async generateActionChecklist(transcription: string, clinicalFacts?: Record<string, unknown>, warnings?: PhysiotherapyInsight[], suggestions?: PhysiotherapyInsight[]): Promise<PhysiotherapyInsight[]> {
    const response = await fetch("https://api.example.com/generateActionChecklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcription, clinicalFacts, warnings, suggestions }),
    });

    if (!response.ok) {
      throw new Error("Error al generar checklist de acciones");
    }

    const data: GenerateActionChecklistResponse[] = await response.json();
    return data.map(item => ({
      id: item.id,
      type: item.type,
      title: item.action,
      description: item.rationale,
      rationale: item.documentation,
      priority: item.priority,
    }));
  }
}