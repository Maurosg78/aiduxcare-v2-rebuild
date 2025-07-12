/**
 * GoogleCloudSTTService - Servicio de transcripción enterprise para AiDuxCare V.2
 * Pipeline profesional: Audio → Google Cloud Speech-to-Text → Transcripción
 * Reemplaza Web Speech API con solución de grado hospitalario
 */

export interface TranscriptionOptions {
  enableSpeakerDiarization?: boolean;
  language?: string;
  medicalContext?: boolean;
  sampleRate?: number;
}

export interface TranscriptionResponse {
  success: boolean;
  transcription?: string;
  confidence?: number;
  totalSpeakers?: number;
  segments?: Array<{
    speaker: number;
    text: string;
  }>;
  error?: string;
  processingTime?: number;
}

export class GoogleCloudSTTService {
  private readonly speechToTextEndpoint = "https://us-central1-aiduxcare-stt-20250706.cloudfunctions.net/transcribeAudio";
  
  constructor() {
    console.log("🎙️ GoogleCloudSTTService inicializado - Enterprise Speech-to-Text");
  }

  /**
   * Verifica si el servicio está disponible
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.speechToTextEndpoint}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });
      return response.ok;
    } catch (error) {
      console.warn("⚠️ Google Cloud STT no disponible:", error);
      return false;
    }
  }

  /**
   * Transcribe audio usando Google Cloud Speech-to-Text
   */
  async transcribeAudio(
    audioBlob: Blob, 
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResponse> {
    
    const defaultOptions: TranscriptionOptions = {
      enableSpeakerDiarization: true,
      language: "es-ES",
      medicalContext: true,
      sampleRate: 48000,
      ...options
    };

    console.log("🎤 Iniciando transcripción con Google Cloud STT:", {
      audioSize: audioBlob.size,
      audioType: audioBlob.type,
      options: defaultOptions
    });

    try {
      // Validar audio
      if (!audioBlob || audioBlob.size === 0) {
        return {
          success: false,
          error: "Audio blob inválido o vacío"
        };
      }

      // Convertir audio a Base64 para envío
      const audioBase64 = await this.blobToBase64(audioBlob);
      
      console.log("📡 Enviando audio a Google Cloud STT:", {
        base64Length: audioBase64.length,
        originalSize: audioBlob.size,
        encoding: audioBlob.type
      });

      const startTime = Date.now();

      // Preparar payload para la Cloud Function
      const payload = {
        audioData: audioBase64,
        mimeType: audioBlob.type,
        size: audioBlob.size,
        timestamp: Date.now(),
        options: defaultOptions
      };

      // Enviar a Google Cloud Speech-to-Text Function
      const response = await fetch(this.speechToTextEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });

      const processingTime = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Error de Google Cloud STT:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });

        return {
          success: false,
          error: `Error de transcripción (${response.status}): ${errorText}`,
          processingTime
        };
      }

      const result = await response.json();

      console.log("✅ Transcripción completada:", {
        success: result.success,
        transcriptionLength: result.transcription?.length || 0,
        confidence: result.confidence,
        totalSpeakers: result.totalSpeakers,
        segmentsCount: result.segments?.length || 0,
        processingTime
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Error desconocido en transcripción",
          processingTime
        };
      }

      return {
        success: true,
        transcription: result.transcription,
        confidence: result.confidence,
        totalSpeakers: result.totalSpeakers,
        segments: result.segments,
        processingTime
      };

    } catch (error) {
      console.error("❌ Error crítico en transcripción:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      
      return {
        success: false,
        error: `Error de red: ${errorMessage}`,
        processingTime: Date.now()
      };
    }
  }

  /**
   * Convierte Blob a Base64
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          // Remover el prefijo "data:audio/webm;base64," 
          const base64 = reader.result.split(",")[1] || reader.result;
          resolve(base64);
        } else {
          reject(new Error("Error convirtiendo audio a Base64"));
        }
      };
      reader.onerror = () => reject(new Error("Error leyendo archivo de audio"));
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Obtiene información del servicio
   */
  getServiceInfo(): string {
    return "GoogleCloudSTTService: Enterprise Speech-to-Text con Speaker Diarization";
  }
} 