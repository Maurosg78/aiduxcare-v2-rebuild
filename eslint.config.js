import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  // Configuración global para todos los archivos
  {
    ignores: ["dist/", "node_modules/", "**/*.cjs", "**/*.js"],
  },
  
  // Configuración para archivos TypeScript y TSX
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...pluginReactConfig.rules,
      ...jsxA11y.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Regla obsoleta para React 17+
      "react/jsx-uses-react": "off", // Regla obsoleta para React 17+
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // Configuración para archivos de configuración CommonJS (scripts, etc.)
  {
    files: ["**/*.cjs", "**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-var-requires": "off",
      "no-undef": "off",
    }
  },
];