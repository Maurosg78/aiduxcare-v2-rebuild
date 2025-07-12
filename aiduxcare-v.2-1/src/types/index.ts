// filepath: /aiduxcare-v.2/aiduxcare-v.2/src/types/index.ts

export interface PhysiotherapyInsight {
  id: string;
  type: "question" | "test" | "contraindication" | "red_flag" | "suggestion" | "warning";
  title: string;
  description: string;
  rationale: string;
  accepted?: boolean;
  rejected?: boolean;
  priority: "high" | "medium" | "low";
  severity?: string;
  recommendation?: string;
  action?: string;
  documentation?: string;
  question?: string;
  expected_insights?: string;
  name?: string;
  procedure?: string;
  clinical_relevance?: string;
}

export interface ClinicalFacts {
  [key: string]: unknown;
}

export interface Metadata {
  processingTime?: number;
  confidence?: number;
  model?: string;
}

export interface SOAPNote {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
}

export interface TriageResponse {
  redFlags: PhysiotherapyInsight[];
  warnings: PhysiotherapyInsight[];
  metadata: Metadata;
  clinicalFacts: ClinicalFacts;
}

export interface ExtractionResponse {
  clinicalFacts: ClinicalFacts;
  metadata: Metadata;
}

export interface FinalAnalysisResponse {
  soapNote: SOAPNote;
  suggestions: PhysiotherapyInsight[];
  metadata: Metadata;
}

export interface DiagnosticTest {
  id: string;
  name: string;
  procedure: string;
  clinical_relevance: string;
  priority: "high" | "medium" | "low";
}

export interface BlindSpotQuestion {
  id: string;
  question: string;
  rationale: string;
  expected_insights: string;
  priority: "high" | "medium" | "low";
}

export interface ActionChecklistItem {
  id: string;
  type: string;
  action: string;
  rationale: string;
  documentation: string;
  priority: "high" | "medium" | "low";
}