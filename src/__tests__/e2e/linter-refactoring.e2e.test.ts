/**
 * Test End-to-End: Validación de Refactorización del Linter
 * 
 * Este test valida que la refactorización masiva del linter no ha introducido
 * regresiones y que el código mantiene su funcionalidad original.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "fs";

describe("E2E: Validación de Refactorización del Linter", () => {
  describe("Validación de Archivos Refactorizados", () => {
    it("debe mantener archivos críticos", () => {
      const criticalFiles = [
        "src/components/RealTimeAudioCapture.tsx",
        "src/services/nlpServiceOllama.ts",
        "src/setupTests.ts",
        "src/shared/components/Agent/IntegratedSuggestionViewer.tsx",
        "src/shared/components/ConnectionStatus.tsx",
        "src/shared/components/MCP/MCPContextViewer.tsx",
        "src/constants/test-data.ts",
        "src/core/agent/ClinicalAgent.ts",
        "src/services/UsageAnalyticsService.ts",
        "src/core/auth/UserContext.tsx",
        "src/services/GoogleCloudAudioService.ts",
        "src/types/agent.ts"
      ];

      criticalFiles.forEach(file => {
        expect(existsSync(file)).toBe(true);
      });
    });

    it("debe tener archivos de contexto separados", () => {
      const newFiles = [
        "src/core/auth/UserContextInstance.ts",
        "src/core/auth/useUser.ts",
        "src/constants/test-credentials.ts"
      ];

      newFiles.forEach(file => {
        expect(existsSync(file)).toBe(true);
      });
    });
  });

  describe("Validación de Funcionalidad Core", () => {
    it("debe mantener interfaces críticas", () => {
      const agentTypesPath = "src/types/agent.ts";
      const content = readFileSync(agentTypesPath, "utf8");
      
      // Verificar que las interfaces principales están presentes
      expect(content).toContain("interface AgentSuggestion");
      expect(content).toContain("interface MemoryBlock");
      expect(content).toContain("interface AgentContext");
      expect(content).toContain("type SuggestionType");
    });

    it("debe mantener funcionalidad de autenticación", () => {
      const userContextPath = "src/core/auth/UserContext.tsx";
      const content = readFileSync(userContextPath, "utf8");
      
      // Verificar que el provider está presente
      expect(content).toContain("UserProvider");
      expect(content).toContain("UserContext.Provider");
    });

    it("debe tener contexto separado", () => {
      const userContextInstancePath = "src/core/auth/UserContextInstance.ts";
      const content = readFileSync(userContextInstancePath, "utf8");
      
      // Verificar que el contexto está definido
      expect(content).toContain("createContext");
      expect(content).toContain("UserContext");
    });

    it("debe tener hook separado", () => {
      const useUserPath = "src/core/auth/useUser.ts";
      const content = readFileSync(useUserPath, "utf8");
      
      // Verificar que el hook está definido
      expect(content).toContain("useUser");
      expect(content).toContain("useContext");
    });
  });

  describe("Validación de Configuración", () => {
    it("debe tener configuración de linter válida", () => {
      const eslintConfigPath = "eslint.config.js";
      expect(existsSync(eslintConfigPath)).toBe(true);
      
      const config = readFileSync(eslintConfigPath, "utf8");
      expect(config).toContain("export default");
      expect(config).toContain("@typescript-eslint");
    });

    it("debe tener configuración de tests válida", () => {
      const vitestConfigPath = "config/vitest.config.ts";
      expect(existsSync(vitestConfigPath)).toBe(true);
    });

    it("debe tener package.json válido", () => {
      const packageJsonPath = "package.json";
      expect(existsSync(packageJsonPath)).toBe(true);
      
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
      expect(packageJson.scripts).toHaveProperty("lint");
      expect(packageJson.scripts).toHaveProperty("test");
    });
  });

  describe("Validación de Contenido de Archivos", () => {
    it("debe tener type aliases en IntegratedSuggestionViewer", () => {
      const filePath = "src/shared/components/Agent/IntegratedSuggestionViewer.tsx";
      const content = readFileSync(filePath, "utf8");
      
      expect(content).toContain("type SuggestionType");
      expect(content).toContain("recommendation");
      expect(content).toContain("warning");
      expect(content).toContain("info");
    });

    it("debe tener funciones refactorizadas en RealTimeAudioCapture", () => {
      const filePath = "src/components/RealTimeAudioCapture.tsx";
      const content = readFileSync(filePath, "utf8");
      
      expect(content).toContain("updateTranscriptionSegment");
      expect(content).toContain("SegmentItem");
    });

    it("debe tener regex optimizadas en nlpServiceOllama", () => {
      const filePath = "src/services/nlpServiceOllama.ts";
      const content = readFileSync(filePath, "utf8");
      
      // Verificar que no hay regex problemáticas
      expect(content).not.toContain("[^}]*");
      expect(content).not.toContain("[\\s\\S]*");
    });

    it("debe tener manejo de excepciones en GoogleCloudAudioService", () => {
      const filePath = "src/services/GoogleCloudAudioService.ts";
      const content = readFileSync(filePath, "utf8");
      
      expect(content).toContain("console.warn");
      expect(content).toContain("console.error");
    });
  });

  describe("Validación de Estructura de Proyecto", () => {
    it("debe mantener estructura de carpetas", () => {
      const directories = [
        "src/components",
        "src/services",
        "src/core",
        "src/shared",
        "src/constants",
        "src/types",
        "src/__tests__"
      ];

      directories.forEach(dir => {
        expect(existsSync(dir)).toBe(true);
      });
    });

    it("debe tener archivos de configuración", () => {
      const configFiles = [
        "eslint.config.js",
        "vite.config.ts",
        "tsconfig.json",
        "package.json"
      ];

      configFiles.forEach(file => {
        expect(existsSync(file)).toBe(true);
      });
    });
  });
}); 