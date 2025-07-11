const winston = require('winston');
const VertexAIClient = require('./VertexAIClient');
const KnowledgeBase = require('./KnowledgeBase');
const ModelSelector = require('./ModelSelector');
const PromptFactory = require('./PromptFactory'); // Added PromptFactory import

/**
 * ClinicalInsightService - Arquitectura de Cascada V2
 * 
 * Implementa un pipeline de análisis clínico en 3 estaciones:
 * 1. Triaje de Banderas Rojas (Gemini-Flash, <5s)
 * 2. Extracción de Hechos Clínicos (Gemini-Flash, estructurado)
 * 3. Análisis Final y SOAP (Gemini-Pro, contextualizado)
 * 
 * @author Mauricio Sobarzo
 * @version 2.0 - Cascade Architecture
 */
class ClinicalInsightService {
  constructor() {
    this.vertexClient = new VertexAIClient();
    this.knowledgeBase = new KnowledgeBase();
    this.modelSelector = new ModelSelector(this.vertexClient);
    this.promptFactory = new PromptFactory(); // Initialize PromptFactory
    
    // Configurar logger
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console()
      ]
    });
    
    this.logger.info('🏗️ ClinicalInsightService inicializado con arquitectura de cascada');
  }

  /**
   * Ejecuta triaje rápido de banderas rojas críticas
   * OPTIMIZADO PARA FISIOTERAPEUTAS - GENERA WARNINGS ESPECÍFICOS
   */
  async triageRedFlags(transcription, criticalRedFlags) {
    this.logger.info('🚩 ESTACIÓN 1: Iniciando triaje de banderas rojas', {
      transcriptionLength: transcription.length,
      model: 'gemini-2.5-flash'
    });

    try {
      // Usar prompt optimizado para fisioterapeutas
      const prompt = this.promptFactory.generateTriagePrompt(transcription);
      
      // Llamar con parámetros en el orden correcto: transcription, prompt, modelName
      const result = await this.vertexClient.processWithModel(transcription, prompt, 'gemini-2.5-flash');
      
      // Procesar respuesta con warnings específicos
      const processedResult = this.processTriageResult(result);
      
      this.logger.info('✅ ESTACIÓN 1: Triaje completado', {
        model: 'gemini-2.5-flash',
        processingTime: result.processingTime,
        warningsDetected: processedResult.redFlags.length,
        cost: result.metadata?.cost || 'N/A'
      });

      return processedResult;
    } catch (error) {
      this.logger.error('❌ ESTACIÓN 1: Error en triaje', {
        error: error.message,
        processingTime: 0,
        stack: error.stack
      });

      // Retornar objeto vacío en caso de error
      return {
        redFlags: [],
        warnings: [],
        metadata: {
          stage: 'triage',
          success: false,
          error: error.message
        }
      };
    }
  }

  /**
   * Extrae hechos clínicos estructurados de la transcripción
   * OPTIMIZADO PARA FISIOTERAPEUTAS - EXTRAE DATOS ESPECÍFICOS
   */
  async extractClinicalFacts(transcription) {
    this.logger.info('🎯 ESTACIÓN 2: Iniciando extracción de hechos clínicos', {
      transcriptionLength: transcription.length,
      model: 'gemini-2.5-flash'
    });

    try {
      const prompt = this.promptFactory.generateExtractionPrompt(transcription);
      
      // Llamar con parámetros en el orden correcto: transcription, prompt, modelName
      const result = await this.vertexClient.processWithModel(transcription, prompt, 'gemini-2.5-flash');
      
      // Procesar respuesta con hechos clínicos
      const processedResult = this.processExtractionResult(result);
      
      this.logger.info('✅ ESTACIÓN 2: Extracción completada', {
        model: 'gemini-2.5-flash',
        processingTime: result.processingTime,
        factsExtracted: Object.keys(processedResult.clinicalFacts || {}).length,
        hasSymptoms: !!processedResult.clinicalFacts?.symptoms,
        hasHistory: !!processedResult.clinicalFacts?.history,
        hasMedications: !!processedResult.clinicalFacts?.medications,
        cost: result.metadata?.cost || 'N/A'
      });

      return processedResult;
    } catch (error) {
      this.logger.error('❌ ESTACIÓN 2: Error en extracción', {
        error: error.message,
        processingTime: 0,
        stack: error.stack
      });

      // Retornar objeto vacío en caso de error
      return {
        clinicalFacts: {},
        metadata: {
          stage: 'extraction',
          success: false,
          error: error.message
        }
      };
    }
  }

  /**
   * Genera análisis final y nota SOAP
   * OPTIMIZADO PARA FISIOTERAPEUTAS - GENERA EMR DE CALIDAD
   * USA ESTRATEGIA 90/10: gemini-2.5-pro solo para casos complejos
   */
  async generateFinalAnalysis(transcription, redFlags, clinicalFacts) {
    // Determinar modelo según estrategia 90/10
    const modelToUse = redFlags.length >= 2 ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    
    this.logger.info('🎯 ESTACIÓN 3: Iniciando análisis final y SOAP', {
      transcriptionLength: transcription.length,
      redFlagsCount: redFlags.length,
      clinicalFactsKeys: Object.keys(clinicalFacts || {}).length,
      model: modelToUse,
      strategy: redFlags.length >= 2 ? 'Escalado a Pro por banderas rojas múltiples' : 'Modelo Flash estándar'
    });

    try {
      const prompt = this.promptFactory.generateSOAPPrompt(transcription, 'physiotherapy', { redFlags }, clinicalFacts);
      
      // Llamar con parámetros en el orden correcto: transcription, prompt, modelName
      const result = await this.vertexClient.processWithModel(transcription, prompt, modelToUse);
      
      // Procesar respuesta con análisis final
      const processedResult = this.processFinalAnalysisResult(result);
      
      this.logger.info('✅ ESTACIÓN 3: Análisis completado', {
        model: modelToUse,
        processingTime: result.processingTime,
        suggestionsGenerated: processedResult.suggestions?.length || 0,
        soapQuality: processedResult.soapQuality || 0,
        cost: result.metadata?.cost || 'N/A'
      });

      return processedResult;
    } catch (error) {
      this.logger.error('❌ ESTACIÓN 3: Error en análisis final', {
        error: error.message,
        processingTime: 0,
        stack: error.stack
      });

      // Retornar objeto vacío en caso de error
      return {
        suggestions: [],
        soapNote: null,
        soapQuality: 0,
        metadata: {
          stage: 'final_analysis',
          success: false,
          error: error.message
        }
      };
    }
  }

  /**
   * Procesa resultado del análisis final para extraer warnings y sugerencias
   * MEJORADO: Parsing robusto para respuestas largas y JSON complejos
   */
  processFinalAnalysisResult(result) {
    try {
      let rawText = '';
      
      // Extraer texto de diferentes formatos de respuesta
      if (typeof result === 'string') {
        rawText = result;
      } else if (result && result.text) {
        rawText = result.text;
      } else if (result && result.response) {
        rawText = JSON.stringify(result.response);
      } else {
        rawText = JSON.stringify(result);
      }
      
      this.logger.info('🔍 PROCESANDO RESULTADO PARA PARSING', {
        tipoOriginal: typeof result,
        longitudTexto: rawText.length,
        primerosCaracteres: rawText.substring(0, 100),
        ultimosCaracteres: rawText.substring(rawText.length - 100)
      });
      
      // Buscar y extraer JSON del texto
      let jsonData = null;
      
      // Método 1: Buscar JSON dentro de bloques de código markdown
      const jsonBlockMatch = rawText.match(/```json\s*([^\s]*?)\s*```/);
      if (jsonBlockMatch) {
        this.logger.info('📋 JSON BLOCK ENCONTRADO', {
          longitudJSON: jsonBlockMatch[1].length,
          primeras100: jsonBlockMatch[1].substring(0, 100)
        });
        try {
          jsonData = JSON.parse(jsonBlockMatch[1].trim());
          this.logger.info('✅ JSON EXTRAÍDO DE BLOQUE MARKDOWN', {
            tieneSOAP: !!jsonData.soap_note,
            tieneFunctionalGoals: !!jsonData.functional_goals,
            tieneTreatmentTechniques: !!jsonData.treatment_techniques,
            functionalGoalsLength: jsonData.functional_goals ? jsonData.functional_goals.length : 0,
            treatmentTechniquesLength: jsonData.treatment_techniques ? jsonData.treatment_techniques.length : 0
          });
        } catch (e) {
          this.logger.warn('⚠️ Error parsing JSON de bloque markdown:', {
            error: e.message,
            jsonPreview: jsonBlockMatch[1].substring(0, 200)
          });
        }
      }
      
      // Método 2: Buscar JSON entre llaves (más flexible)
      if (!jsonData) {
        const jsonMatch = rawText.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          this.logger.info('📋 JSON PATTERN ENCONTRADO', {
            longitudJSON: jsonMatch[0].length
          });
          try {
            jsonData = JSON.parse(jsonMatch[0]);
            this.logger.info('✅ JSON EXTRAÍDO POR PATRÓN DE LLAVES');
          } catch (e) {
            this.logger.warn('⚠️ Error parsing JSON por patrón:', e.message);
          }
        }
      }
      
      // Método 3: Intentar parsing directo
      if (!jsonData) {
        try {
          jsonData = JSON.parse(rawText);
          this.logger.info('✅ JSON PARSEADO DIRECTAMENTE');
        } catch (e) {
          this.logger.warn('⚠️ Error parsing directo:', e.message);
        }
      }
      
      // Si no se pudo parsear JSON, crear estructura de datos extrayendo información clave
      if (!jsonData) {
        this.logger.warn('⚠️ NO SE PUDO PARSEAR JSON, EXTRAYENDO DATOS MANUALMENTE');
        jsonData = this.extractDataFromText(rawText);
      } else {
        this.logger.info('🎯 JSON PARSEADO EXITOSAMENTE', {
          keysEncontradas: Object.keys(jsonData),
          functionalGoalsType: typeof jsonData.functional_goals,
          functionalGoalsLength: jsonData.functional_goals ? jsonData.functional_goals.length : 'N/A',
          treatmentTechniquesType: typeof jsonData.treatment_techniques,
          treatmentTechniquesLength: jsonData.treatment_techniques ? jsonData.treatment_techniques.length : 'N/A'
        });
      }
      
      // Procesar y estructurar el resultado final
      return this.structureFinalResult(jsonData, rawText);
      
    } catch (error) {
      this.logger.error('❌ ERROR EN PROCESAMIENTO DE RESULTADO:', {
        error: error.message,
        stack: error.stack
      });
      
      // Retornar estructura mínima en caso de error
      return {
        warnings: [],
        suggestions: [],
        soap_quality: { overall: 0 },
        soap_note: {
          subjective: 'Error en procesamiento',
          objective: 'Error en procesamiento', 
          assessment: 'Error en procesamiento',
          plan: 'Error en procesamiento'
        },
        functional_goals: [],
        treatment_techniques: [],
        model_info: {
          model_used: 'Error',
          parsing_status: 'FAILED',
          error: error.message
        }
      };
    }
  }
  
  /**
   * Extrae datos clave del texto cuando el JSON no se puede parsear
   */
  extractDataFromText(rawText) {
    const extracted = {
      soap_note: {},
      functional_goals: [],
      treatment_techniques: [],
      warnings: [],
      suggestions: []
    };
    
    // Extraer secciones SOAP
    const subjectiveMatch = rawText.match(/"subjective"\s*:\s*"([^"]*)"/s);
    if (subjectiveMatch) extracted.soap_note.subjective = subjectiveMatch[1];
    
    const objectiveMatch = rawText.match(/"objective"\s*:\s*"([^"]*)"/s);
    if (objectiveMatch) extracted.soap_note.objective = objectiveMatch[1];
    
    const assessmentMatch = rawText.match(/"assessment"\s*:\s*"([^"]*)"/s);
    if (assessmentMatch) extracted.soap_note.assessment = assessmentMatch[1];
    
    const planMatch = rawText.match(/"plan"\s*:\s*"([^"]*)"/s);
    if (planMatch) extracted.soap_note.plan = planMatch[1];
    
    // Extraer objetivos funcionales - REGEX SIMPLE
    const goalsText = rawText.match(/functional_goals.*?\[(.*?)\]/s);
    if (goalsText && goalsText[1]) {
      const goals = goalsText[1].match(/"[^\"]+"/g);
      if (goals) {
        extracted.functional_goals = goals.map(g => g.replace(/"/g, ''));
      }
    }
    
    // Extraer técnicas de tratamiento - REGEX SIMPLE
    const techniquesText = rawText.match(/treatment_techniques.*?\[(.*?)\]/s);
    if (techniquesText && techniquesText[1]) {
      const techniques = techniquesText[1].match(/"[^\"]+"/g);
      if (techniques) {
        extracted.treatment_techniques = techniques.map(t => t.replace(/"/g, ''));
      }
    }
    
    // Extraer warnings - MEJORADO
    const warningsMatch = rawText.match(/"warnings"\s*:\s*\[([^]]*)\]/s);
    if (warningsMatch) {
      const warningsText = warningsMatch[1];
      const warnings = warningsText.match(/"([^\"]*)"/g);
      if (warnings) {
        extracted.warnings = warnings.map(w => w.replace(/"/g, ''));
      }
    }
    
    // Extraer suggestions - MEJORADO
    const suggestionsMatch = rawText.match(/"suggestions"\s*:\s*\[([^]]*)\]/s);
    if (suggestionsMatch) {
      const suggestionsText = suggestionsMatch[1];
      const suggestions = suggestionsText.match(/"([^\"]*)"/g);
      if (suggestions) {
        extracted.suggestions = suggestions.map(s => s.replace(/"/g, ''));
      }
    }
    
    this.logger.info('📊 DATOS EXTRAÍDOS MANUALMENTE:', {
      objetivos: extracted.functional_goals.length,
      tecnicas: extracted.treatment_techniques.length,
      warnings: extracted.warnings.length,
      suggestions: extracted.suggestions.length,
      tieneSOAP: !!(extracted.soap_note.subjective && extracted.soap_note.objective)
    });
    
    return extracted;
  }
  
  /**
   * Estructura el resultado final para el análisis clínico
   * CORREGIDO: Devuelve estructura que coincide con las expectativas del sistema
   */
  structureFinalResult(jsonData, rawText) {
    const result = {
      warnings: [],
      suggestions: [],
      soap_note: {
        subjective: '',
        objective: '',
        assessment: '',
        plan: ''
      },
      functional_goals: [],
      treatment_techniques: [],
      soap_quality: { overall: 0 },
      model_info: {
        model_used: 'gemini-2.5-flash',
        parsing_status: 'SUCCESS',
        content_length: rawText.length,
        json_parsed: !!jsonData
      }
    };
    
    // Extraer datos del JSON parseado
    if (jsonData) {
      // SOAP Note
      if (jsonData.soap_note) {
        result.soap_note = {
          subjective: jsonData.soap_note.subjective || '',
          objective: jsonData.soap_note.objective || '',
          assessment: jsonData.soap_note.assessment || '',
          plan: jsonData.soap_note.plan || ''
        };
      }
      
      // Functional Goals
      if (jsonData.functional_goals && Array.isArray(jsonData.functional_goals)) {
        result.functional_goals = jsonData.functional_goals;
      }
      
      // Treatment Techniques
      if (jsonData.treatment_techniques && Array.isArray(jsonData.treatment_techniques)) {
        result.treatment_techniques = jsonData.treatment_techniques;
      }
      
      // Warnings y Suggestions
      if (jsonData.warnings && Array.isArray(jsonData.warnings)) {
        result.warnings = jsonData.warnings;
      }
      if (jsonData.suggestions && Array.isArray(jsonData.suggestions)) {
        result.suggestions = jsonData.suggestions;
      }
      
      // Clinical Summary
      if (jsonData.clinical_summary) {
        result.clinical_summary = jsonData.clinical_summary;
      }
    }
    
    // Calcular calidad SOAP
    const soapComplete = !!(result.soap_note.subjective && 
                            result.soap_note.objective && 
                            result.soap_note.assessment && 
                            result.soap_note.plan);
    
    result.soap_quality.overall = soapComplete ? 85 : 0;
    
    this.logger.info('🎯 RESULTADO FINAL ESTRUCTURADO:', {
      functionalGoals: result.functional_goals.length,
      treatmentTechniques: result.treatment_techniques.length,
      soapComplete: soapComplete,
      soapQuality: result.soap_quality.overall,
      warnings: result.warnings.length,
      suggestions: result.suggestions.length
    });
    
    return result;
  }
  
  /**
   * Evalúa la calidad del procesamiento
   */
  assessProcessingQuality(jsonData, rawText) {
    let score = 0;
    
    if (jsonData && typeof jsonData === 'object') score += 30;
    if (rawText.length > 1000) score += 20;
    if (rawText.includes('functional_goals')) score += 20;
    if (rawText.includes('treatment_techniques')) score += 20;
    if (rawText.includes('soap_note')) score += 10;
    
    return score;
  }
  
  /**
   * Evalúa la completitud del contenido
   */
  assessContentCompleteness(jsonData) {
    let completeness = 0;
    
    if (jsonData && jsonData.soap_note) {
      if (jsonData.soap_note.subjective) completeness += 25;
      if (jsonData.soap_note.objective) completeness += 25;
      if (jsonData.soap_note.assessment) completeness += 25;
      if (jsonData.soap_note.plan) completeness += 25;
    }
    
    return completeness;
  }

  /**
   * Limpia el texto JSON para parsing más robusto
   */
  _cleanJSONText(text) {
    if (!text) return '{}';
    
    // Eliminar bloques de código markdown si existen
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Eliminar texto antes del primer { y después del último }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace >= 0 && lastBrace >= 0 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    return cleaned.trim();
  }

  /**
   * Genera preguntas de puntos ciegos usando modelo eficiente
   * FLUJO FISIOTERAPEUTA: Paso 1 - Preguntas inteligentes
   */
  async generateBlindSpotQuestions(transcription, clinicalFacts) {
    this.logger.info('🔍 GENERANDO PREGUNTAS PUNTOS CIEGOS', {
      transcriptionLength: transcription.length,
      model: 'gemini-2.5-flash'
    });

    try {
      const prompt = this.promptFactory.generateBlindSpotQuestionsPrompt(transcription, clinicalFacts);
      
      const result = await this.vertexClient.processWithModel(transcription, prompt, 'gemini-2.5-flash');
      const processedResult = this.processJSONResponse(result.text, 'questions');
      
      this.logger.info('✅ PREGUNTAS PUNTOS CIEGOS GENERADAS', {
        model: 'gemini-2.5-flash',
        questionsCount: processedResult.questions?.length || 0,
        processingTime: result.processingTime
      });

      return processedResult;
    } catch (error) {
      this.logger.error('❌ ERROR GENERANDO PREGUNTAS PUNTOS CIEGOS', {
        error: error.message,
        stack: error.stack
      });

      return {
        questions: [],
        metadata: {
          stage: 'blind_spot_questions',
          success: false,
          error: error.message
        }
      };
    }
  }

  /**
   * Genera pruebas diagnósticas usando modelo eficiente
   * FLUJO FISIOTERAPEUTA: Paso 2 - Batería de pruebas
   */
  async generateDiagnosticTests(transcription, clinicalFacts, suspectedDiagnosis) {
    this.logger.info('🧪 GENERANDO PRUEBAS DIAGNÓSTICAS', {
      transcriptionLength: transcription.length,
      model: 'gemini-2.5-flash'
    });

    try {
      const prompt = this.promptFactory.generateDiagnosticTestsPrompt(transcription, clinicalFacts, suspectedDiagnosis);
      
      const result = await this.vertexClient.processWithModel(transcription, prompt, 'gemini-2.5-flash');
      const processedResult = this.processJSONResponse(result.text, 'tests');
      
      this.logger.info('✅ PRUEBAS DIAGNÓSTICAS GENERADAS', {
        model: 'gemini-2.5-flash',
        testsCount: processedResult.tests?.length || 0,
        processingTime: result.processingTime
      });

      return processedResult;
    } catch (error) {
      this.logger.error('❌ ERROR GENERANDO PRUEBAS DIAGNÓSTICAS', {
        error: error.message,
        stack: error.stack
      });

      return {
        tests: [],
        metadata: {
          stage: 'diagnostic_tests',
          success: false,
          error: error.message
        }
      };
    }
  }

  /**
   * Genera checklist de acciones usando modelo eficiente
   * FLUJO FISIOTERAPEUTA: Paso 3 - Checklist documentable
   */
  async generateActionChecklist(transcription, clinicalFacts, warnings, suggestions) {
    this.logger.info('📋 GENERANDO CHECKLIST DE ACCIONES', {
      transcriptionLength: transcription.length,
      model: 'gemini-2.5-flash'
    });

    try {
      const prompt = this.promptFactory.generateActionChecklistPrompt(transcription, clinicalFacts, warnings, suggestions);
      
      const result = await this.vertexClient.processWithModel(transcription, prompt, 'gemini-2.5-flash');
      const processedResult = this.processJSONResponse(result.text, 'checklist');
      
      this.logger.info('✅ CHECKLIST DE ACCIONES GENERADO', {
        model: 'gemini-2.5-flash',
        checklistCount: processedResult.checklist?.length || 0,
        processingTime: result.processingTime
      });

      return processedResult;
    } catch (error) {
      this.logger.error('❌ ERROR GENERANDO CHECKLIST DE ACCIONES', {
        error: error.message,
        stack: error.stack
      });

      return {
        checklist: [],
        metadata: {
          stage: 'action_checklist',
          success: false,
          error: error.message
        }
      };
    }
  }

  /**
   * Procesa respuesta JSON de la IA
   * UTILIDAD PARA PARSEAR RESPUESTAS ESTRUCTURADAS
   */
  processJSONResponse(rawText, expectedKey) {
    try {
      // Extraer JSON del texto
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        throw new Error('No se encontró JSON válido en la respuesta');
      }
      
      const parsed = JSON.parse(jsonMatch[1]);
      
      if (expectedKey && !parsed[expectedKey]) {
        throw new Error(`Clave esperada '${expectedKey}' no encontrada en respuesta`);
      }
      
      return parsed;
    } catch (error) {
      this.logger.error('❌ Error procesando respuesta JSON:', {
        error: error.message,
        rawText: rawText.substring(0, 200)
      });
      
      return { [expectedKey]: [] };
    }
  }

  /**
   * Procesa una transcripción clínica a través de la cascada de análisis
   * OPTIMIZADO PARA FISIOTERAPEUTAS - GENERA EMR DE CALIDAD
   */
  async processTranscription(transcription, specialty = 'physiotherapy', sessionType = 'initial') {
    const cascadeId = this.generateCascadeId();
    const startTime = Date.now();
    
    this.logger.info('🚀 INICIANDO CASCADA DE ANÁLISIS CLÍNICO', {
      cascadeId,
      specialty,
      sessionType,
      transcriptionLength: transcription.length
    });

    try {
      // ========================================
      // ESTACIÓN 1: TRIAJE DE BANDERAS ROJAS
      // ========================================
      const triageResult = await this.triageRedFlags(transcription);
      
      // ========================================
      // ESTACIÓN 2: EXTRACCIÓN DE HECHOS CLÍNICOS
      // ========================================
      const clinicalFacts = await this.extractClinicalFacts(transcription);
      
      // ========================================
      // ESTACIÓN 3: ANÁLISIS FINAL Y SOAP
      // ========================================
      const finalAnalysis = await this.generateFinalAnalysis(
        transcription, 
        triageResult.redFlags, 
        clinicalFacts
      );
      
      // ========================================
      // COMBINACIÓN DE RESULTADOS
      // ========================================
      const combinedResult = this.combineResults(triageResult, clinicalFacts, finalAnalysis);
      
      const totalTime = (Date.now() - startTime) / 1000;
      
      this.logger.info('🎉 CASCADA DE ANÁLISIS COMPLETADA EXITOSAMENTE', {
        cascadeId,
        totalTime,
        redFlagsDetected: triageResult.redFlags?.length || 0,
        warningsGenerated: combinedResult.warnings?.length || 0,
        suggestionsGenerated: combinedResult.suggestions?.length || 0,
        soapQuality: combinedResult.soap_quality?.overall || 'N/A',
        functionalGoals: combinedResult.functional_goals?.length || 0,
        treatmentTechniques: combinedResult.treatment_techniques?.length || 0,
        clinicalFactsExtracted: Object.keys(clinicalFacts || {}).length,
        estimatedSavings: '60-70%'
      });
      
      return combinedResult;
      
    } catch (error) {
      const totalTime = (Date.now() - startTime) / 1000;
      
      this.logger.error('💥 ERROR EN CASCADA DE ANÁLISIS', {
        cascadeId,
        error: error.message,
        stack: error.stack,
        totalTime,
        transcriptionLength: transcription.length
      });
      
      // Retornar respuesta de emergencia para fisioterapeutas
      return {
        warnings: [{
          severity: 'HIGH',
          category: 'system_error',
          title: 'Error en análisis automático',
          description: 'El sistema de análisis automático falló. Revisar transcripción manualmente.',
          action: 'Realizar análisis manual completo y verificar banderas rojas'
        }],
        suggestions: [{
          type: 'assessment',
          title: 'Análisis manual requerido',
          description: 'Completar evaluación fisioterapéutica manual debido a error del sistema',
          priority: 'HIGH',
          evidence: 'Fallo del sistema automático'
        }],
        soap_quality: {
          subjective: 50,
          objective: 40,
          assessment: 30,
          plan: 35,
          overall: 39,
          missing_data: ['Análisis automático fallido']
        },
        soap_note: {
          subjective: 'Información disponible en transcripción (revisar manualmente)',
          objective: 'Exploración física documentada (verificar manualmente)',
          assessment: 'Análisis clínico requiere revisión manual urgente',
          plan: 'Plan de tratamiento a definir manualmente'
        },
        functional_goals: [],
        treatment_techniques: [],
        analysis_metadata: {
          red_flags_detected: 0,
          risk_level: 'UNKNOWN',
          confidence: 0.0,
          clinical_facts_extracted: 0,
          processing_stages: 0,
          error: true
        }
      };
    }
  }

  /**
   * NUEVO FLUJO INTELIGENTE: ModelSelector + Análisis Adaptativo
   * 
   * @param {string} transcription - Transcripción clínica a analizar  
   * @param {Object} options - Opciones de procesamiento
   * @returns {Object} Análisis clínico completo con metadata de decisión
   */
  async processTranscriptionWithIntelligentModel(transcription, options = {}) {
    const startTime = Date.now();
    
    this.logger.info('🚀 INICIANDO ANÁLISIS CON MODELSELECTOR INTELIGENTE', {
      transcriptionLength: transcription.length,
      specialty: options.specialty || 'fisioterapia',
      sessionType: options.sessionType || 'initial'
    });

    try {
      // PASO 1: ModelSelector decide qué modelo usar (con triaje IA)
      const modelDecision = await this.modelSelector.selectModel(transcription);
      
      this.logger.info('🧠 DECISIÓN DE MODELO COMPLETADA', {
        selectedModel: modelDecision.selectedModel,
        reasoning: modelDecision.reasoning,
        redFlagsDetected: modelDecision.triageResult.redFlags.length,
        triageTime: modelDecision.processingTime
      });

      // PASO 2: Análisis completo con modelo seleccionado
      const analysisResult = await this._performCompleteAnalysis(
        transcription, 
        modelDecision.selectedModel,
        modelDecision.triageResult,
        options
      );

      const totalTime = (Date.now() - startTime) / 1000;

      // Ensamblar resultado final con metadata de ModelSelector
      const intelligentResult = {
        ...analysisResult,
        intelligent_model_metadata: {
          workflow_version: '3.0-intelligent-selector',
          total_processing_time: totalTime,
          model_decision: {
            selected_model: modelDecision.selectedModel,
            reasoning: modelDecision.reasoning,
            cost_optimization: modelDecision.costOptimization,
            triage_result: modelDecision.triageResult
          },
          performance_metrics: {
            triage_time: modelDecision.processingTime,
            analysis_time: totalTime - modelDecision.processingTime,
            total_time: totalTime
          },
          timestamp: new Date().toISOString()
        }
      };

      this.logger.info('🎉 ANÁLISIS INTELIGENTE COMPLETADO EXITOSAMENTE', {
        totalTime: totalTime,
        modelUsed: modelDecision.selectedModel,
        redFlagsDetected: modelDecision.triageResult.redFlags.length,
        costOptimization: modelDecision.costOptimization
      });

      return intelligentResult;

    } catch (error) {
      const totalTime = (Date.now() - startTime) / 1000;
      
      this.logger.error('💥 ERROR EN ANÁLISIS INTELIGENTE', {
        error: error.message,
        stack: error.stack,
        totalTime: totalTime,
        transcriptionLength: transcription.length
      });

      throw new Error(`Análisis inteligente falló: ${error.message}`);
    }
  }

  /**
   * Análisis completo adaptativo según modelo seleccionado
   */
  async _performCompleteAnalysis(transcription, selectedModel, triageResult, options) {
    const analysisStartTime = Date.now();
    
    this.logger.info('🔬 INICIANDO ANÁLISIS COMPLETO', {
      model: selectedModel,
      transcriptionLength: transcription.length,
      redFlagsFromTriage: triageResult.redFlags.length
    });

    // Construir prompt completo contextualizado
    const completePrompt = this._buildIntelligentAnalysisPrompt(
      transcription, 
      triageResult, 
      options
    );

    // Configurar parámetros según modelo seleccionado
    const modelConfig = selectedModel === 'gemini-2.5-pro' 
      ? { maxTokens: 3000, temperature: 0.2 }  // Máxima calidad para casos críticos
      : { maxTokens: 2000, temperature: 0.3 }; // Eficiente para casos estándar

    this.logger.info('📤 ENVIANDO ANÁLISIS COMPLETO AL MODELO', {
      model: selectedModel,
      promptLength: completePrompt.length,
      config: modelConfig
    });

    const response = await this.vertexClient.processWithModel(
      transcription,
      completePrompt,
      selectedModel,
      modelConfig
    );

    const analysisTime = (Date.now() - analysisStartTime) / 1000;

    this.logger.info('✅ ANÁLISIS COMPLETO FINALIZADO', {
      model: selectedModel,
      processingTime: analysisTime,
      responseLength: response.length
    });

    return this._parseCompleteAnalysisResponse(response);
  }

  /**
   * Prompt completo contextualizado para análisis inteligente
   * ACTUALIZADO PARA USAR PROMPTS ESTRUCTURADOS V2
   */
  _buildIntelligentAnalysisPrompt(transcription, triageResult, options) {
    return this.promptFactory.generateCompleteAnalysisPrompt(transcription, triageResult, options);
  }

  /**
   * Parser para respuesta de análisis completo
   */
  _parseCompleteAnalysisResponse(response) {
    try {
      // El VertexAIClient ya extrajo el texto limpio
      let cleanResponse = response;
      
      // Si aún tiene markdown, limpiarlo
      if (typeof response === 'string' && response.includes('```')) {
        cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      
      const parsed = JSON.parse(cleanResponse);
      
      this.logger.info('✅ PARSING ANÁLISIS COMPLETO EXITOSO', {
        warningsCount: parsed.warnings?.length || 0,
        suggestionsCount: parsed.suggestions?.length || 0,
        soapSections: Object.keys(parsed.soap_analysis || {}).length
      });
      
      return parsed;
      
    } catch (error) {
      this.logger.error('❌ ERROR PARSING ANÁLISIS COMPLETO', {
        error: error.message,
        response: typeof response === 'string' ? response.substring(0, 300) : 'No es string'
      });
      
      // Fallback básico
      return {
        warnings: [
          {
            level: "MEDIUM",
            title: "Error en procesamiento",
            description: "Hubo un error al procesar el análisis. Se requiere revisión manual.",
            immediate_action_required: false
          }
        ],
        suggestions: [
          {
            priority: "HIGH",
            category: "assessment",
            title: "Revisión manual requerida",
            description: "Se recomienda revisión manual del caso debido a error en procesamiento automático.",
            implementation_timeframe: "immediate"
          }
        ],
        soap_analysis: {
          subjective: { chief_complaint: "Error en procesamiento - requiere revisión manual" },
          objective: { observations: ["Error en análisis automático"] },
          assessment: { clinical_impression: "Análisis incompleto por error técnico" },
          plan: { immediate_actions: ["Revisión manual del caso"] }
        },
        clinical_summary: {
          key_findings: "Error en procesamiento automático",
          treatment_priority: "Revisión manual inmediata",
          expected_outcomes: "Pendiente revisión manual",
          safety_considerations: "Requiere evaluación profesional directa"
        }
      };
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS PARA CONSTRUCCIÓN DE PROMPTS
  // ========================================

  /**
   * Construye prompt específico para triaje rápido de banderas rojas
   * ACTUALIZADO PARA USAR PROMPTS ESTRUCTURADOS V2
   */
  _buildTriagePrompt(transcription, criticalRedFlags) {
    return this.promptFactory.generateTriagePrompt(transcription);
  }

  /**
   * Construye prompt para extracción estructurada de hechos clínicos
   * ACTUALIZADO PARA USAR PROMPTS ESTRUCTURADOS V2
   */
  _buildExtractionPrompt(transcription) {
    return this.promptFactory.generateExtractionPrompt(transcription);
  }

  /**
   * Construye super-prompt final contextualizado para análisis profundo
   * ACTUALIZADO PARA USAR PROMPTS ESTRUCTURADOS V2
   */
  _buildFinalAnalysisPrompt(transcription, redFlags, clinicalFacts) {
    return this.promptFactory.generateSOAPPrompt(transcription, redFlags, clinicalFacts);
  }

  /**
   * Prompt completo contextualizado para análisis inteligente
   * ACTUALIZADO PARA USAR PROMPTS ESTRUCTURADOS V2
   */
  _buildIntelligentAnalysisPrompt(transcription, triageResult, options) {
    return this.promptFactory.generateCompleteAnalysisPrompt(transcription, triageResult, options);
  }

  // ========================================
  // MÉTODOS PRIVADOS PARA PARSING DE RESPUESTAS
  // ========================================

  /**
   * Parsea respuesta de triaje a array de banderas rojas
   */
  _parseRedFlagsResponse(response) {
    try {
      if (!response || response.trim().toLowerCase() === 'ninguna') {
        return [];
      }
      
      return response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.toLowerCase().includes('ninguna'))
        .slice(0, 10); // Máximo 10 banderas rojas
        
    } catch (error) {
      this.logger.error('Error parseando banderas rojas:', error);
      return [];
    }
  }

  /**
   * Parsea respuesta de extracción a objeto JSON de hechos clínicos
   */
  _parseClinicalFactsResponse(response) {
    try {
      // Buscar JSON en la respuesta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      this.logger.warn('No se encontró JSON válido en respuesta de extracción');
      return {};
      
    } catch (error) {
      this.logger.error('Error parseando hechos clínicos:', error);
      return {};
    }
  }

  /**
   * Parsea respuesta de análisis final a objeto completo
   */
  _parseFinalAnalysisResponse(response) {
    try {
      // Buscar JSON en la respuesta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('No se encontró JSON válido en análisis final');
      
    } catch (error) {
      this.logger.error('Error parseando análisis final:', error);
      throw error;
    }
  }

  /**
   * Genera ID único para cada cascada de procesamiento
   */
  generateCascadeId() {
    return `cascade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Procesa resultado del triaje de banderas rojas
   */
  processTriageResult(rawText) {
    try {
      // Extraer JSON del texto
      const jsonMatch = rawText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (!jsonMatch) {
        throw new Error('No se encontró JSON válido en la respuesta');
      }
      
      const parsed = JSON.parse(jsonMatch[1]);
      
      return {
        redFlags: parsed.warnings || [],
        warnings: parsed.warnings || [],
        metadata: {
          stage: 'triage',
          success: true,
          rawResponse: rawText
        }
      };
    } catch (error) {
      return {
        redFlags: [],
        warnings: [],
        metadata: {
          stage: 'triage',
          success: false,
          error: error.message
        }
      };
    }
  }

  /**
   * Procesa resultado de extracción de hechos clínicos
   */
  processExtractionResult(rawText) {
    try {
      // Extraer JSON del texto
      const jsonMatch = rawText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (!jsonMatch) {
        throw new Error('No se encontró JSON válido en la respuesta');
      }
      
      const parsed = JSON.parse(jsonMatch[1]);
      
      return {
        clinicalFacts: parsed,
        metadata: {
          stage: 'extraction',
          success: true,
          rawResponse: rawText
        }
      };
    } catch (error) {
      return {
        clinicalFacts: {},
        metadata: {
          stage: 'extraction',
          success: false,
          error: error.message
        }
      };
    }
  }

  /**
   * Combina todos los resultados en respuesta final optimizada para fisioterapeutas
   */
  combineResults(triageResult, clinicalFacts, finalAnalysis) {
    // Combinar warnings del triaje y análisis final
    const allWarnings = [
      ...(triageResult.warnings || []),
      ...(finalAnalysis.warnings || [])
    ];
    
    // Remover duplicados de warnings
    const uniqueWarnings = allWarnings.filter((warning, index, self) =>
      index === self.findIndex(w => w.title === warning.title)
    );
    
    const combinedResult = {
      // Warnings específicos para fisioterapeutas
      warnings: uniqueWarnings,
      
      // Sugerencias de tratamiento específicas
      suggestions: finalAnalysis.suggestions || [],
      
      // Calidad SOAP para EMR
      soap_quality: finalAnalysis.soap_quality || {
        subjective: 70,
        objective: 65,
        assessment: 70,
        plan: 70,
        overall: 69
      },
      
      // Nota SOAP completa
      soap_note: finalAnalysis.soap_note || {},
      
      // Información adicional para fisioterapeutas
      functional_goals: finalAnalysis.functional_goals || [],
      treatment_techniques: finalAnalysis.treatment_techniques || [],
      
      // Metadatos del análisis
      analysis_metadata: {
        red_flags_detected: triageResult.redFlags?.length || 0,
        risk_level: triageResult.riskLevel || 'LOW',
        confidence: triageResult.confidence || 0.0,
        clinical_facts_extracted: Object.keys(clinicalFacts || {}).length,
        processing_stages: 3
      }
    };
    
    this.logger.info('🎉 COMBINACIÓN DE RESULTADOS COMPLETADA', {
      warnings_total: combinedResult.warnings.length,
      suggestions_total: combinedResult.suggestions.length,
      soap_quality: combinedResult.soap_quality.overall,
      functional_goals: combinedResult.functional_goals.length,
      treatment_techniques: combinedResult.treatment_techniques.length
    });
    
    return combinedResult;
  }
}

module.exports = ClinicalInsightService; 