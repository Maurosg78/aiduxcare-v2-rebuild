/**
 * Servicio de Analytics profesional para registrar eventos de usuario.
 * Implementa el patrón Singleton para garantizar una única instancia en toda la aplicación.
 * Utiliza tipado estricto y genéricos para la seguridad de tipos.
 */

// En un caso real, importaríamos el servicio de analytics que usemos.
// import { track as vercelTrack } from "@vercel/analytics";

class AnalyticsService {
  private static instance: AnalyticsService;
  private userId: string | undefined;
  private tenantId: string | undefined;

  /**
   * El constructor privado previene la creación de instancias con 'new'.
   * Esto es clave para el patrón Singleton.
   */
  private constructor() {}

  /**
   * Obtiene la instancia única del servicio de analytics.
   * Si no existe, la crea.
   * @returns La instancia única de AnalyticsService.
   */
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Inicializa el servicio con el contexto del usuario y/o tenant.
   * @param options Opciones de inicialización con userId y tenantId.
   */
  public init(options?: { userId?: string; tenantId?: string }): void {
    this.userId = options?.userId;
    this.tenantId = options?.tenantId;
    console.log(`[Analytics] Service Initialized for user: ${this.userId}, tenant: ${this.tenantId}`);
  }

  /**
   * Registra un evento de analytics con datos asociados.
   * Utiliza genéricos para mantener la flexibilidad con seguridad de tipos.
   * @param eventName Nombre del evento a registrar.
   * @param eventData Datos asociados al evento.
   */
  public track<T extends Record<string, unknown>>(eventName: string, eventData: T): void {
    const dataWithContext = {
      ...eventData,
      userId: this.userId,
      tenantId: this.tenantId,
      timestamp: new Date().toISOString(),
    };
    
    console.log(`[Analytics] Tracked event: "${eventName}"`, dataWithContext);
    
    // Lógica real para enviar el evento a un servicio externo.
    // vercelTrack(eventName, dataWithContext);
  }

  /**
   * Registra una vista de página, un tipo específico de evento de tracking.
   * @param pageName Nombre de la página que se está viendo.
   * @param pageData Datos adicionales específicos de la página.
   */
  public pageView(pageName: string, pageData?: Record<string, unknown>): void {
    this.track("page_view", { page: pageName, ...pageData });
  }
}

// ¡Esta es la línea clave que soluciona el error!
// Exportamos la instancia única para que sea utilizada en toda la aplicación.
export default AnalyticsService.getInstance();