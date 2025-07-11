/**
 * EnterpriseAudioPipelineService - Pipeline completo enterprise para AiDuxCare V.2
 * Reemplaza Web Speech API con Google Cloud Speech-to-Text + Clinical Brain
 * Pipeline: Grabación → Google Cloud STT → Clinical Brain → Resultado SOAP
 */

import { GoogleCloudSTTService, TranscriptionResponse } from './GoogleCloudSTTService';
import { GoogleCloudAudioService, ClinicalAnalysisRequest, ClinicalAnalysisResponse } from './GoogleCloudAudioService';

export interface PipelineOptions {
  specialty?: 'physiotherapy' | 'psychology' | 'general';
  sessionType?: 'initial' | 'followup';
  enableRealTimeUpdates?: boolean;
}

export interface PipelineResult {
  success: boolean;
  transcription?: string;
  analysis?: ClinicalAnalysisResponse;
  processingTime?: number;
  error?: string;
  stages?: {
    recording: boolean;
    transcription: boolean;
    analysis: boolean;
  };
}

export class EnterpriseAudioPipelineService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;
  private stream: MediaStream | null = null;
  
  // Servicios enterprise
  private sttService: GoogleCloudSTTService;
  private clinicalService: GoogleCloudAudioService;
  
  // Callbacks
  private realtimeCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private progressCallback: ((stage: string, progress: number) => void) | null = null;
  
  constructor() {
    console.log('🏢 EnterpriseAudioPipelineService inicializado - Google Cloud STT + Clinical Brain');
    this.sttService = new GoogleCloudSTTService();
    this.clinicalService = new GoogleCloudAudioService();
  }

  /**
   * Verifica si todos los servicios enterprise están disponibles
   */
  async isServiceSupported(): Promise<boolean> {
    const hasMediaDevices = !!(
      navigator.mediaDevices && 
      'getUserMedia' in navigator.mediaDevices && 
      typeof MediaRecorder !== 'undefined'
    );
    
    const sttAvailable = await this.sttService.isServiceAvailable();
    
    console.log('🔍 Verificación de servicios enterprise:', {
      mediaDevices: hasMediaDevices,
      googleCloudSTT: sttAvailable
    });
    
    return hasMediaDevices && sttAvailable;
  }

  /**
   * MÉTODO PRINCIPAL: Iniciar grabación enterprise
   */
  async startRecording(
    realtimeCallback: (text: string, isFinal: boolean) => void,
    progressCallback?: (stage: string, progress: number) => void,
    options: PipelineOptions = {}
  ): Promise<void> {
    
    if (this.isRecording) {
      console.warn('⚠️ Ya se está grabando audio');
      return;
    }

    const defaultOptions: PipelineOptions = {
      specialty: 'physiotherapy',
      sessionType: 'initial',
      enableRealTimeUpdates: true,
      ...options
    };

    console.log('🎤 Iniciando pipeline enterprise:', defaultOptions);

    try {
      // Verificar servicios
      const serviceAvailable = await this.isServiceSupported();
      if (!serviceAvailable) {
        throw new Error('Servicios enterprise no disponibles. Verifique conexión a internet.');
      }

      // Solicitar permisos de micrófono con configuración enterprise
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        } 
      });

      console.log('✅ Permisos concedidos, configurando pipeline enterprise...');
      
      this.realtimeCallback = realtimeCallback;
      this.progressCallback = progressCallback;
      this.audioChunks = [];
      
      // Configurar MediaRecorder para calidad enterprise
      this.configureEnterpriseMediaRecorder();
      
      this.isRecording = true;
      
      // Feedback inmediato
      if (this.progressCallback) {
        this.progressCallback('recording', 0);
      }
      
      if (this.realtimeCallback) {
        this.realtimeCallback('🎙️ Grabando audio con calidad enterprise...', false);
      }

      console.log('🏢 Pipeline enterprise activo');

    } catch (error) {
      console.error('❌ Error en pipeline enterprise:', error);
      this.isRecording = false;
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Permisos de micrófono denegados. Por favor, permite el acceso al micrófono.');
        } else if (error.name === 'NotFoundError') {
          throw new Error('No se encontró micrófono. Verifica que tu dispositivo tenga un micrófono conectado.');
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error en pipeline enterprise: ${errorMessage}`);
    }
  }

  /**
   * MÉTODO PRINCIPAL: Detener grabación y procesar con pipeline enterprise
   */
  async stopRecording(options: PipelineOptions = {}): Promise<PipelineResult> {
    if (!this.isRecording) {
      console.warn('⚠️ No se está grabando audio');
      return {
        success: false,
        error: 'No hay grabación activa'
      };
    }

    console.log('🛑 Deteniendo grabación y procesando con pipeline enterprise...');
    
    const startTime = Date.now();
    const stages = {
      recording: false,
      transcription: false,
      analysis: false
    };

    try {
      // ETAPA 1: Finalizar grabación
      if (this.progressCallback) {
        this.progressCallback('finalizing', 25);
      }
      
      this.isRecording = false;
      
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
      
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }

      // Esperar a que termine la grabación
      await this.waitForRecordingComplete();
      stages.recording = true;

      // Combinar chunks de audio
      if (this.audioChunks.length === 0) {
        return {
          success: false,
          error: 'No se capturó audio. Verifica tu micrófono.',
          stages,
          processingTime: Date.now() - startTime
        };
      }

      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      console.log('✅ Audio capturado:', {
        size: audioBlob.size,
        type: audioBlob.type,
        chunks: this.audioChunks.length
      });

      // ETAPA 2: Transcripción con Google Cloud STT
      if (this.progressCallback) {
        this.progressCallback('transcription', 50);
      }
      
      if (this.realtimeCallback) {
        this.realtimeCallback('🌐 Transcribiendo con Google Cloud Speech-to-Text...', false);
      }

      const transcriptionResult: TranscriptionResponse = await this.sttService.transcribeAudio(audioBlob, {
        enableSpeakerDiarization: true,
        language: 'es-ES',
        medicalContext: true,
        sampleRate: 48000
      });

      if (!transcriptionResult.success || !transcriptionResult.transcription) {
        return {
          success: false,
          error: transcriptionResult.error || 'Error en transcripción',
          stages,
          processingTime: Date.now() - startTime
        };
      }

      stages.transcription = true;
      
      console.log('✅ Transcripción enterprise completada:', {
        length: transcriptionResult.transcription.length,
        confidence: transcriptionResult.confidence,
        speakers: transcriptionResult.totalSpeakers
      });

      // ETAPA 3: Análisis clínico con Clinical Brain
      if (this.progressCallback) {
        this.progressCallback('analysis', 75);
      }
      
      if (this.realtimeCallback) {
        this.realtimeCallback(`📋 Transcripción: ${transcriptionResult.transcription.substring(0, 200)}...`, false);
        this.realtimeCallback('🧠 Analizando con Cerebro Clínico...', false);
      }

      const analysisRequest: ClinicalAnalysisRequest = {
        transcription: transcriptionResult.transcription,
        specialty: options.specialty || 'physiotherapy',
        sessionType: options.sessionType || 'initial'
      };

      const analysisResult: ClinicalAnalysisResponse = await this.clinicalService.analyzeClinicalTranscription(analysisRequest);
      stages.analysis = true;

      // RESULTADO FINAL
      if (this.progressCallback) {
        this.progressCallback('complete', 100);
      }

      const processingTime = Date.now() - startTime;
      
      console.log('🎉 Pipeline enterprise completado exitosamente:', {
        transcriptionLength: transcriptionResult.transcription.length,
        analysisSuccess: analysisResult.success,
        totalTime: processingTime
      });

      if (this.realtimeCallback) {
        this.realtimeCallback(transcriptionResult.transcription, true);
      }

      return {
        success: true,
        transcription: transcriptionResult.transcription,
        analysis: analysisResult,
        processingTime,
        stages
      };

    } catch (error) {
      console.error('❌ Error en pipeline enterprise:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      return {
        success: false,
        error: `Error en pipeline enterprise: ${errorMessage}`,
        stages,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Obtener estado de grabación
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Información del servicio
   */
  getServiceInfo(): string {
    return 'EnterpriseAudioPipelineService: Google Cloud STT + Clinical Brain + Speaker Diarization';
  }

  /**
   * Limpiar recursos
   */
  cleanup(): void {
    if (this.isRecording) {
      this.stopRecording();
    }
    
    this.audioChunks = [];
    this.realtimeCallback = null;
    this.progressCallback = null;
    this.mediaRecorder = null;
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    console.log('🧹 Pipeline enterprise limpiado');
  }

  /**
   * Configurar MediaRecorder con calidad enterprise
   */
  private configureEnterpriseMediaRecorder(): void {
    if (!this.stream) return;

    // Formatos enterprise priorizados
    const enterpriseFormats = [
      'audio/wav',
      'audio/webm;codecs=opus',
      'audio/mp4',
      'audio/webm'
    ];

    let selectedFormat = 'audio/webm';
    
    for (const format of enterpriseFormats) {
      if (MediaRecorder.isTypeSupported(format)) {
        selectedFormat = format;
        break;
      }
    }

    console.log(`🎵 Formato enterprise seleccionado: ${selectedFormat}`);

    // Configuración enterprise
    const enterpriseOptions = {
      mimeType: selectedFormat,
      audioBitsPerSecond: selectedFormat.includes('wav') ? 128000 : 
                         selectedFormat.includes('opus') ? 64000 : 96000
    };

    try {
      this.mediaRecorder = new MediaRecorder(this.stream, enterpriseOptions);
      console.log('✅ MediaRecorder enterprise configurado:', enterpriseOptions);
    } catch (error) {
      console.warn('⚠️ Fallback a configuración básica:', error);
      this.mediaRecorder = new MediaRecorder(this.stream);
    }

    // Eventos de MediaRecorder
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0 && this.isRecording) {
        this.audioChunks.push(event.data);
        console.log(`📦 Chunk enterprise: ${event.data.size} bytes (total: ${this.audioChunks.length})`);
        
        // Progreso de grabación
        if (this.progressCallback) {
          const progress = Math.min((this.audioChunks.length * 2), 20); // Max 20% para grabación
          this.progressCallback('recording', progress);
        }
      }
    };

    this.mediaRecorder.onstop = () => {
      console.log('🛑 Grabación enterprise finalizada');
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('❌ Error en MediaRecorder enterprise:', event);
    };

    // Iniciar con chunks cada 1 segundo
    this.mediaRecorder.start(1000);
  }

  /**
   * Esperar a que termine la grabación
   */
  private async waitForRecordingComplete(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve();
        return;
      }

      if (this.mediaRecorder.state === 'inactive') {
        resolve();
        return;
      }

      this.mediaRecorder.onstop = () => {
        console.log('✅ Grabación completamente finalizada');
        resolve();
      };

      // Timeout de seguridad
      setTimeout(() => {
        console.log('⏰ Timeout de grabación - continuando');
        resolve();
      }, 3000);
    });
  }
} 