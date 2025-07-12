import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactRefresh from "eslint-plugin-react-refresh";
import sonarjs from "eslint-plugin-sonarjs";
import { configs as tsConfigs } from "typescript-eslint";

export default [
  // 1. Archivos y carpetas a ignorar globalmente
  {
    ignores: [
      "dist/", "generated/", "lib/", "build/", "coverage/",
      "node_modules/", ".git/", "public/",
      "*.config.js", "*.config.ts",
      "**/*.d.ts",
      ".firebaserc*", ".gcloudignore*", "*.md", "*.patch", ".env*",
    ],
  },

  // 2. Configuración base para todos los archivos TypeScript
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-refresh": reactRefresh,
      sonarjs,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Reglas base de typescript-eslint y sonarjs
      ...tsConfigs.recommended.rules,
      ...sonarjs.configs.recommended.rules,
      
      // --- Personalización de reglas ---
      "quotes": ["warn", "double"],
      "semi": ["warn", "always"],
      
      // Usar la versión de typescript-eslint para variables no usadas y desactivar la de sonar
      "@typescript-eslint/no-unused-vars": ["warn", { 
        argsIgnorePattern: "^_", 
        varsIgnorePattern: "^_", 
        caughtErrorsIgnorePattern: "^_" 
      }],
      "sonarjs/no-unused-vars": "off",

      "@typescript-eslint/no-explicit-any": "warn",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      
      // --- Relajar reglas de SonarJS que pueden ser muy ruidosas ---
      "sonarjs/cognitive-complexity": ["warn", 35], // Umbral más permisivo
      "sonarjs/no-duplicate-string": ["warn", { threshold: 5 }], // Ignorar duplicados cortos
      "sonarjs/no-nested-ternary": "off",
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/no-small-switch": "off", // Permitir switch pequeños
      "sonarjs/no-ignored-exceptions": "warn", // Advertir en lugar de error por ahora
    },
  },

  // 3. Anulaciones para archivos de prueba y mocks
  {
    files: [
      "src/**/__tests__/**/*.{ts,tsx}", 
      "src/**/__mocks__/**/*.{ts,tsx}",
      "src/**/*.test.{ts,tsx}", 
      "src/**/*.spec.{ts,tsx}", 
      "src/setupTests.ts"
    ],
    languageOptions: {
      globals: { ...globals.jest, ...globals.vitest },
    },
    rules: {
      // Desactivar reglas que no son útiles en el contexto de pruebas
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/pseudo-random": "off", // Math.random() es aceptable en mocks
      "@typescript-eslint/no-explicit-any": "off", // 'any' es más común y aceptable en mocks
    }
  },
  
   // 4. Anulaciones para archivos de Storybook
  {
    files: ["src/**/*.stories.{ts,tsx}"],
    rules: {
      "sonarjs/no-globals-shadowing": "off", // Permite usar nombres como 'Error' en stories
    }
  },

  // 5. Anulaciones para archivos de servicios
  {
    files: ["src/services/**/*.{ts,tsx}"],
    rules: {
      "sonarjs/pseudo-random": "off" // Permitir Math.random si no es para criptografía
    }
  }
];