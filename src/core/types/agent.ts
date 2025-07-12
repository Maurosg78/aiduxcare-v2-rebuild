// Tipos de sugerencias del agente clínico
export type SuggestionType = "recommendation" | "alert" | "warning" | "info";

export type SuggestionField = 
  "diagnosis" | 
  "treatment" | 
  "followup" | 
  "medication" | 
  "vitals" | 
  "symptoms" | 
  "history" | 
  "lab_results" | 
  "imaging" | 
  "notes";

export interface AgentSuggestion {
  id: string;
  type: SuggestionType;
  field: SuggestionField;
  content: string;
  sourceBlockId: string;
  createdAt: Date;
  updatedAt: Date;
}