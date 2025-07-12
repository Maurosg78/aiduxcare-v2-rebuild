import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AudioPipelineService } from "@/services/AudioPipelineService";
import { GoogleCloudAudioService } from "@/services/GoogleCloudAudioService";

interface MockMediaRecorderEventHandler {
  (_: { data: Blob }): void;
}

// Mock de MediaRecorder
class MockMediaRecorder {
  private _ondataavailable: MockMediaRecorderEventHandler | null = null;
  private _onstop: (() => void) | null = null;
  private chunks: Blob[] = [];
  state: "inactive" | "recording" = "inactive";

  constructor(private _stream: MediaStream, private _options: MediaRecorderOptions) {}

  start() {
    this.state = "recording";
    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        if (this.state === "recording" && this._ondataavailable) {
          const chunk = new Blob(["x".repeat(8 * 1024)], { type: "audio/webm;codecs=opus" });
          this._ondataavailable({ data: chunk });
          this.chunks.push(chunk);
        }
      }, i * 1000);
    }
  }

  stop() {
    this.state = "inactive";
    if (this._onstop) this._onstop();
  }

  set onstart(_handler: () => void) {}
  set ondataavailable(handler: MockMediaRecorderEventHandler) { this._ondataavailable = handler; }
  set onstop(handler: () => void) { this._onstop = handler; }
  set onerror(_handler: (event: any) => void) {}
}

const mockGetUserMedia = vi.fn().mockResolvedValue({
  getTracks: () => [{ stop: () => {} }]
});

const mockSuccessResponse = {
  success: true,
  transcription: "Transcripción de prueba exitosa",
  warnings: [],
  suggestions: []
};

describe("AudioPipeline E2E Test", () => {
  let audioPipeline: AudioPipelineService;
  let failureCount = 0;
  const mockCallbacks = {
    onTranscriptionStart: vi.fn(),
    onTranscriptionResult: vi.fn(),
    onTranscriptionError: vi.fn(),
    onTranscriptionEnd: vi.fn(),
    onStatusUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    failureCount = 0;

    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: mockGetUserMedia },
      writable: true
    });

    (global as any).MediaRecorder = MockMediaRecorder;

    vi.spyOn(GoogleCloudAudioService.prototype, "analyzeClinicalTranscription")
      .mockImplementation(async () => {
        if (failureCount < 2) {
          failureCount++;
          throw new Error("Error de conexión simulado");
        }
        return mockSuccessResponse;
      });

    audioPipeline = new AudioPipelineService(mockCallbacks);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // NUEVO BLOQUE DE TEST SINCRONIZADO
  it("debe manejar una grabación completa con reintentos exitosos", async () => {
    // Iniciar grabación. El servicio ya fue instanciado con los mockCallbacks en beforeEach.
    await audioPipeline.startRecording();
  
    // Verificar que se solicitaron permisos de micrófono
    expect(mockGetUserMedia).toHaveBeenCalledWith({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 1,
      },
    });
  
    // Verificar la actualización de estado inicial a 'recording'
    expect(mockCallbacks.onStatusUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "recording" })
    );
  
    // Simular que la grabación está en progreso
    await new Promise(resolve => setTimeout(resolve, 5000));
  
    // Detener la grabación para iniciar el procesamiento
    await audioPipeline.stopRecording();
  
    // Verificar que el estado cambió a 'processing'
    expect(mockCallbacks.onStatusUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "processing" })
    );
  
    // Verificar que el sistema intentó procesar con Google Cloud 3 veces (2 fallos + 1 éxito)
    expect(GoogleCloudAudioService.prototype.analyzeClinicalTranscription).toHaveBeenCalledTimes(3);
  
    // Verificar la llamada de error (debería llamarse 2 veces)
    expect(mockCallbacks.onTranscriptionError).toHaveBeenCalledTimes(2);
    expect(mockCallbacks.onTranscriptionError).toHaveBeenCalledWith(expect.any(Error));
  
    // Verificar que la transcripción final exitosa fue recibida
    expect(mockCallbacks.onTranscriptionResult).toHaveBeenCalledTimes(1);
    expect(mockCallbacks.onTranscriptionResult).toHaveBeenCalledWith(mockSuccessResponse.transcription);
  
    // Verificar que el estado final es 'completed'
    expect(mockCallbacks.onStatusUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "completed", progress: 100 })
    );
  
    // Verificar que el ciclo de vida del callback finalizó
    expect(mockCallbacks.onTranscriptionEnd).toHaveBeenCalledTimes(1);
  
  }, 15000); // Timeout extendido para el test completo
});