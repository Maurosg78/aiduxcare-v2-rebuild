export type SuggestionType = "diagnostic" | "treatment" | "followup" | "contextual" | "recommendation" | "warning" | "info";

export interface AgentSuggestion {
  id: string;
  sourceBlockId: string;
  type: SuggestionType;
  content: string;
  field: string;
  createdAt: Date;
  updatedAt: Date;
  context_origin: {
    source_block: string;
    text: string;
  };
}

export interface MemoryBlock {
  id: string;
  type: "contextual" | "semantic" | "clinical" | "persistent";
  content: string;
  visit_id: string;
  patient_id?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  validated?: boolean;
}

export interface AgentContext {
  visitId: string;
  blocks: MemoryBlock[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
  };
} 