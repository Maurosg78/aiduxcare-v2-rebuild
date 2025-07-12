import { describe, it, expect, beforeEach, vi } from "vitest";
import AnalyticsService from "../analytics";

// Mock para la dependencia externa (ej. Vercel Analytics)
vi.mock("@vercel/analytics", () => ({
  track: vi.fn(),
}));

describe("AnalyticsService", () => {

  beforeEach(() => {
    // Reseteamos el estado interno del Singleton para asegurar tests aislados.
    // Usamos acceso por corchetes para modificar propiedades privadas sin usar 'any'.
    // Esta es una práctica aceptada para testing.
    AnalyticsService["userId"] = undefined;
    AnalyticsService["tenantId"] = undefined;
  });

  it("debe devolver siempre la misma instancia (patrón Singleton)", async () => {
    const instance1 = AnalyticsService;
    const instance2 = (await import("../analytics")).default;

    expect(instance1).toBe(instance2);
  });

  it("debe configurar correctamente el userId y tenantId con el método init", () => {
    const testUserId = "user-test-123";
    const testTenantId = "tenant-test-456";

    AnalyticsService.init({ userId: testUserId, tenantId: testTenantId });

    // Verificamos el estado interno accediendo a las propiedades privadas
    // mediante corchetes, evitando así el uso de 'any'.
    expect(AnalyticsService["userId"]).toBe(testUserId);
    expect(AnalyticsService["tenantId"]).toBe(testTenantId);
  });

  it("debe incluir el userId y tenantId en los datos del evento track", () => {
    const testUserId = "user-context-789";
    const testTenantId = "tenant-context-012";
    const eventName = "item_added_to_cart";
    const eventData = { itemId: "item-abc", price: 99.99 };

    AnalyticsService.init({ userId: testUserId, tenantId: testTenantId });
    const consoleSpy = vi.spyOn(console, "log");
    AnalyticsService.track(eventName, eventData);

    expect(consoleSpy).toHaveBeenCalledWith(
      `[Analytics] Tracked event: "${eventName}"`,
      expect.objectContaining({
        ...eventData,
        userId: testUserId,
        tenantId: testTenantId,
      })
    );

    consoleSpy.mockRestore();
  });

  it("debe llamar al método track con los datos correctos cuando se usa pageView", () => {
    const pageName = "HomePage";
    const pageData = { section: "featured" };

    const trackSpy = vi.spyOn(AnalyticsService, "track");
    AnalyticsService.pageView(pageName, pageData);

    expect(trackSpy).toHaveBeenCalledWith("page_view", {
      page: pageName,
      ...pageData,
    });

    trackSpy.mockRestore();
  });
});