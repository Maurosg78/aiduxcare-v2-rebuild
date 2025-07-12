import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { PhysiotherapyWorkflowService } from "@/services/PhysiotherapyWorkflowService";
import { 
  Mic, 
  MicOff, 
  Stethoscope, 
  FileText, 
  ClipboardCheck,
  Brain,
  AlertTriangle,
  Eye,
  HelpCircle,
  CheckCircle,
  Activity
} from "lucide-react";

// Interfaces para tipado fuerte
interface PhysiotherapyInsight {
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

interface ClinicalFacts {
  [key: string]: unknown;
}

interface Metadata {
  processingTime?: number;
  confidence?: number;
  model?: string;
}

interface SOAPNote {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
}

export default function PhysiotherapyWorkflowPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"assessment" | "testing" | "documentation">("assessment");
  const [physiotherapyService] = useState(() => new PhysiotherapyWorkflowService());
  const [session, setSession] = useState({
    transcription: "",
    redFlags: [] as PhysiotherapyInsight[],
    warnings: [] as PhysiotherapyInsight[],
    triageMetadata: null as Metadata | null,
    clinicalFacts: {} as ClinicalFacts,
    extractionMetadata: null as Metadata | null,
    suggestedTests: [] as PhysiotherapyInsight[],
    soapNote: null as SOAPNote | null,
    suggestions: [] as PhysiotherapyInsight[],
    analysisMetadata: null as Metadata | null,
    checklist: [] as PhysiotherapyInsight[],
    step1Complete: false,
    step2Complete: false,
    step3Complete: false,
    decisions: {} as Record<string, { accepted: boolean; timestamp: string }>,
    suggestedQuestions: [] as PhysiotherapyInsight[]
  });

  // Helper function to update insight status
  function updateInsightStatus(
    insights: PhysiotherapyInsight[],
    insightId: string,
    accepted: boolean
  ): PhysiotherapyInsight[] {
    return insights.map(insight =>
      insight.id === insightId
        ? { ...insight, accepted, rejected: !accepted }
        : insight
    );
  }

  const handleInsightDecision = (insightId: string, accepted: boolean) => {
    setSession(prev => {
      const newDecisions = {
        ...prev.decisions,
        [insightId]: {
          accepted,
          timestamp: new Date().toISOString()
        }
      };

      return {
        ...prev,
        decisions: newDecisions,
        suggestedQuestions: updateInsightStatus(prev.suggestedQuestions, insightId, accepted),
        suggestedTests: updateInsightStatus(prev.suggestedTests, insightId, accepted),
        checklist: updateInsightStatus(prev.checklist, insightId, accepted),
      };
    });

    console.log(`${accepted ? "✅ Aceptado" : "❌ Rechazado"}: ${insightId}`);
  };

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      console.log("🎤 Iniciando grabación...");
      
      setTimeout(() => {
        const newTranscription = "Paciente masculino de 28 años que consulta por dolor lumbar de 3 semanas de evolución. Refiere dolor nocturno que interrumpe el sueño y rigidez matutina de aproximadamente 1 hora. Antecedentes de psoriasis cutánea desde hace 5 años y episodio de uveítis hace 2 años. Padre con diagnóstico de espondilitis anquilosante.";
        setSession(prev => ({
          ...prev,
          transcription: newTranscription
        }));
        processStep1Triage(newTranscription);
      }, 3000);
      
    } catch (error) {
      console.error("❌ Error al iniciar grabación:", error);
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    console.log("⏹️ Grabación detenida");
  };

  const processStep1Triage = async (currentTranscription: string) => {
    if (!currentTranscription) return;
    try {
      setIsProcessing(true);
      console.log("🚩 PASO 1: Iniciando triaje de banderas rojas...");
      
      const triageResponse = await fetch("https://us-east1-aiduxcare-stt-20250706.cloudfunctions.net/clinicalBrain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcription: currentTranscription,
          step: "triage_only",
          specialty: "physiotherapy"
        })
      });

      if (triageResponse.ok) {
        const result = await triageResponse.json();
        
        setSession(prev => ({
          ...prev,
          redFlags: result.redFlags || [],
          warnings: result.warnings || [],
          triageMetadata: result.metadata,
          step1Complete: true
        }));

        await generateBlindSpotQuestions(currentTranscription, result.clinicalFacts);
      }
      
    } catch (error) {
      console.error("❌ Error en Paso 1 (Triaje):", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processStep2Extraction = async () => {
    try {
      setIsProcessing(true);
      console.log("🎯 PASO 2: Iniciando extracción de hechos clínicos...");
      
      const extractionResponse = await fetch("https://us-east1-aiduxcare-stt-20250706.cloudfunctions.net/clinicalBrain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcription: session.transcription,
          step: "extraction_only",
          specialty: "physiotherapy"
        })
      });

      if (extractionResponse.ok) {
        const result = await extractionResponse.json();
        
        setSession(prev => ({
          ...prev,
          clinicalFacts: result.clinicalFacts || {},
          extractionMetadata: result.metadata,
          step2Complete: true
        }));

        await generateDiagnosticTests(session.transcription, result.clinicalFacts);
        
        setActiveTab("testing");
      }
      
    } catch (error) {
      console.error("❌ Error en Paso 2 (Extracción):", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processStep3FinalAnalysis = async () => {
    try {
      setIsProcessing(true);
      console.log("📝 PASO 3: Iniciando análisis final y SOAP...");
      
      const finalResponse = await fetch("https://us-east1-aiduxcare-stt-20250706.cloudfunctions.net/clinicalBrain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcription: session.transcription,
          step: "final_analysis_only",
          specialty: "physiotherapy",
          redFlags: session.redFlags,
          clinicalFacts: session.clinicalFacts
        })
      });

      if (finalResponse.ok) {
        const result = await finalResponse.json();
        
        setSession(prev => ({
          ...prev,
          soapNote: result.soapNote,
          suggestions: result.suggestions || [],
          analysisMetadata: result.metadata,
          step3Complete: true
        }));

        await generateActionChecklist(session.transcription, session.clinicalFacts, session.warnings, result.suggestions);
        
        setActiveTab("documentation");
      }
      
    } catch (error) {
      console.error("❌ Error en Paso 3 (Análisis Final):", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateBlindSpotQuestions = async (transcription: string, clinicalFacts?: ClinicalFacts) => {
    try {
      const questions = await physiotherapyService.generateBlindSpotQuestions(transcription, clinicalFacts);
      setSession(prev => ({
        ...prev,
        suggestedQuestions: questions.map((q: { id: string; question?: string; rationale?: string; expected_insights?: string; priority: string }) => ({
          id: q.id,
          type: "question",
          title: q.question ?? "",
          description: q.rationale ?? "",
          rationale: q.expected_insights ?? "",
          priority: q.priority
        })) as PhysiotherapyInsight[]
      }));
    } catch (error) {
      console.error("❌ Error generando preguntas:", error);
    }
  };

  const generateDiagnosticTests = async (transcription: string, clinicalFacts?: ClinicalFacts) => {
    try {
      const tests = await physiotherapyService.generateDiagnosticTests(transcription, clinicalFacts);
      setSession(prev => ({
        ...prev,
        suggestedTests: tests.map((t: { id: string; name?: string; procedure?: string; clinical_relevance?: string; priority: string }) => ({
          id: t.id,
          type: "test",
          title: t.name ?? "",
          description: t.procedure ?? "",
          rationale: t.clinical_relevance ?? "",
          priority: t.priority
        })) as PhysiotherapyInsight[]
      }));
    } catch (error) {
      console.error("❌ Error generando pruebas:", error);
    }
  };

  const generateActionChecklist = async (transcription: string, clinicalFacts?: ClinicalFacts, warnings?: PhysiotherapyInsight[], suggestions?: PhysiotherapyInsight[]) => {
    try {
      const checklist = await physiotherapyService.generateActionChecklist(transcription, clinicalFacts, warnings, suggestions);
      setSession(prev => ({
        ...prev,
        checklist: checklist.map((item: { id: string; type: string; action: string; rationale: string; documentation: string; priority: string }) => ({
          id: item.id,
          type: item.type as "question" | "test" | "contraindication" | "red_flag" | "suggestion" | "warning",
          title: item.action,
          description: item.rationale,
          rationale: item.documentation,
          priority: item.priority as "high" | "medium" | "low"
        })) as PhysiotherapyInsight[]
      }));
    } catch (error) {
      console.error("❌ Error generando checklist:", error);
    }
  };

  const InsightCard: React.FC<{ insight: PhysiotherapyInsight, showDecisionButtons?: boolean }> = ({ insight, showDecisionButtons = true }) => {
    const getTypeIcon = () => {
      switch (insight.type) {
        case "question": return <HelpCircle className="h-4 w-4" />;
        case "test": return <Stethoscope className="h-4 w-4" />;
        case "red_flag": return <AlertTriangle className="h-4 w-4 text-red-500" />;
        case "contraindication": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
        case "suggestion": return <CheckCircle className="h-4 w-4 text-blue-500" />;
        default: return <Brain className="h-4 w-4" />;
      }
    };

    const getPriorityColor = () => {
      switch (insight.priority) {
        case "high": return "bg-red-100 text-red-800";
        case "medium": return "bg-yellow-100 text-yellow-800";
        case "low": return "bg-green-100 text-green-800";
        default: return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <Card className={`mb-3 ${insight.accepted ? "border-green-300 bg-green-50" : insight.rejected ? "border-red-300 bg-red-50" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getTypeIcon()}
                <h4 className="font-medium">{insight.title}</h4>
                <Badge className={getPriorityColor()}>{insight.priority}</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
              <p className="text-xs text-gray-500">{insight.rationale}</p>
            </div>
            
            {showDecisionButtons && !insight.accepted && !insight.rejected && (
              <div className="flex gap-2 ml-4">
                <Button size="sm" variant="outline" onClick={() => handleInsightDecision(insight.id, true)} className="text-xs">
                  ✓ Aceptar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleInsightDecision(insight.id, false)} className="text-xs">
                  ✗ Rechazar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const RedFlagsDisplay: React.FC<{ redFlags: PhysiotherapyInsight[]; warnings: PhysiotherapyInsight[] }> = ({ redFlags }) => (
    <div className="space-y-4">
      <h3 className="font-semibold text-red-600 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        🚩 Banderas Rojas Detectadas ({redFlags.length})
      </h3>
      
      {redFlags.length > 0 ? (
        <div className="space-y-3">
          {redFlags.map((flag, index) => (
            <Card key={index} className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="destructive" className="mt-1">
                    {flag.severity || "HIGH"}
                  </Badge>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800">{flag.title}</h4>
                    <p className="text-sm text-red-700 mt-1">{flag.description}</p>
                    {flag.recommendation && (
                      <p className="text-sm text-red-600 mt-2 italic">
                        💡 {flag.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-dashed rounded-lg p-6 text-center text-gray-500">
          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
          ✅ No se detectaron banderas rojas críticas
        </div>
      )}
    </div>
  );

  const ClinicalFactsDisplay: React.FC<{ clinicalFacts: ClinicalFacts }> = ({ clinicalFacts }) => (
    <div className="space-y-4">
      <h3 className="font-semibold text-blue-600 flex items-center gap-2">
        <Activity className="h-5 w-5" />
        🎯 Hechos Clínicos Extraídos
      </h3>
      
      {Object.keys(clinicalFacts).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(clinicalFacts).map(([category, data]) => (
            <Card key={category} className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-800 capitalize mb-2">
                  {category.replace(/_/g, " ")}
                </h4>
                <div className="text-sm text-blue-700">
                  {typeof data === "object" && data !== null ? (
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  ) : (
                    <p>{String(data)}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-dashed rounded-lg p-6 text-center text-gray-500">
          <Brain className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          Complete el Paso 1 para extraer hechos clínicos
        </div>
      )}
    </div>
  );

  const StepProgress: React.FC = () => (
    <div className="flex justify-center gap-4 mb-6">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
        session.step1Complete ? "bg-green-100 border-green-300 text-green-700" : "bg-gray-100 border-gray-300 text-gray-500"
      }`}>
        <div className={`w-3 h-3 rounded-full ${session.step1Complete ? "bg-green-500" : "bg-gray-400"}`} />
        Paso 1: Triaje
      </div>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
        session.step2Complete ? "bg-green-100 border-green-300 text-green-700" : "bg-gray-100 border-gray-300 text-gray-500"
      }`}>
        <div className={`w-3 h-3 rounded-full ${session.step2Complete ? "bg-green-500" : "bg-gray-400"}`} />
        Paso 2: Extracción
      </div>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
        session.step3Complete ? "bg-green-100 border-green-300 text-green-700" : "bg-gray-100 border-gray-300 text-gray-500"
      }`}>
        <div className={`w-3 h-3 rounded-full ${session.step3Complete ? "bg-green-500" : "bg-gray-400"}`} />
        Paso 3: SOAP
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🩺 Flujo Fisioterapia con IA</h1>
        <p className="text-gray-600">Flujo optimizado de 3 pasos con cerebro clínico integrado</p>
      </div>

      <StepProgress />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "assessment" | "testing" | "documentation")} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            1. Triaje + Recolección
            {session.step1Complete && <CheckCircle className="h-4 w-4 text-green-500" />}
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2" disabled={!session.step1Complete}>
            <Stethoscope className="h-4 w-4" />
            2. Hechos + Pruebas
            {session.step2Complete && <CheckCircle className="h-4 w-4 text-green-500" />}
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-2" disabled={!session.step2Complete}>
            <FileText className="h-4 w-4" />
            3. SOAP + Checklist
            {session.step3Complete && <CheckCircle className="h-4 w-4 text-green-500" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                🧠 Paso 1: Triaje de Banderas Rojas + Anamnesis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">🎤 Conversación con Paciente</h3>
                  
                  <div className="flex gap-4">
                    <Button
                      onClick={isRecording ? handleStopRecording : handleStartRecording}
                      disabled={isProcessing}
                      className={isRecording ? "bg-red-500 hover:bg-red-600" : ""}
                    >
                      {isRecording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                      {isRecording ? "Detener Grabación" : "Iniciar Grabación"}
                    </Button>

                    {session.step1Complete && !session.step2Complete && (
                      <Button
                        onClick={processStep2Extraction}
                        disabled={isProcessing}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Continuar al Paso 2
                      </Button>
                    )}
                  </div>

                  {isProcessing && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <Brain className="h-4 w-4 animate-pulse" />
                      Procesando con IA cerebro clínico...
                    </div>
                  )}

                  <div className="border rounded-lg p-4 min-h-[200px]">
                    <h4 className="font-medium mb-2">Transcripción:</h4>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {session.transcription || "La transcripción aparecerá aquí..."}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <RedFlagsDisplay redFlags={session.redFlags} warnings={session.warnings} />
                </div>
              </div>
              
              {session.step1Complete && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    🤔 Preguntas Sugeridas (Puntos Ciegos)
                  </h3>
                  
                  {session.suggestedQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {session.suggestedQuestions.map(question => (
                        <InsightCard key={question.id} insight={question} />
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-lg p-6 text-center text-gray-500">
                      Generando preguntas sugeridas...
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                🧠 Paso 2: Hechos Clínicos + Batería de Pruebas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <ClinicalFactsDisplay clinicalFacts={session.clinicalFacts} />
                
                {session.step2Complete && !session.step3Complete && (
                  <div className="flex justify-center">
                    <Button
                      onClick={processStep3FinalAnalysis}
                      disabled={isProcessing}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Continuar al Paso 3: SOAP
                    </Button>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold mb-4">🔬 Pruebas Diagnósticas Sugeridas</h3>
                  
                  {session.suggestedTests.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {session.suggestedTests.map(test => (
                        <InsightCard key={test.id} insight={test} />
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-lg p-6 text-center text-gray-500">
                      <Stethoscope className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      {session.step2Complete ? 
                        "Generando pruebas diagnósticas..." : 
                        "Complete el Paso 1 para ver las pruebas sugeridas"
                      }
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  📝 Nota SOAP Generada por IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                {session.soapNote ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-600">Subjetivo (S):</h4>
                      <p className="text-sm text-gray-700 p-3 bg-green-50 rounded border">
                        {session.soapNote.subjective}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-600">Objetivo (O):</h4>
                      <p className="text-sm text-gray-700 p-3 bg-blue-50 rounded border">
                        {session.soapNote.objective}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-600">Evaluación (A):</h4>
                      <p className="text-sm text-gray-700 p-3 bg-orange-50 rounded border">
                        {session.soapNote.assessment}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-600">Plan (P):</h4>
                      <p className="text-sm text-gray-700 p-3 bg-purple-50 rounded border">
                        {session.soapNote.plan}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-lg p-6 text-center text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    {session.step3Complete ? 
                      "Generando nota SOAP..." : 
                      "Complete el Paso 2 para generar la nota SOAP"
                    }
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  ✅ Sugerencias y Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                {session.suggestions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-blue-600 mb-3">💡 Sugerencias Clínicas</h4>
                    <div className="space-y-2">
                      {session.suggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm text-blue-800">{suggestion.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {session.checklist.length > 0 ? (
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3">📋 Checklist de Acciones</h4>
                    <div className="space-y-3">
                      {session.checklist.map(item => (
                        <InsightCard key={item.id} insight={item} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-lg p-6 text-center text-gray-500">
                    <ClipboardCheck className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    {session.step3Complete ? 
                      "Generando checklist de acciones..." : 
                      "El checklist se generará después del análisis final"
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {Object.keys(session.decisions).length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>📊 Resumen de Decisiones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-green-600">Aceptadas: </span>
                    {Object.values(session.decisions).filter(d => d.accepted).length}
                  </div>
                  <div>
                    <span className="font-medium text-red-600">Rechazadas: </span>
                    {Object.values(session.decisions).filter(d => !d.accepted).length}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}