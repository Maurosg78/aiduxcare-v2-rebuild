import "@testing-library/jest-dom";
import { vi, beforeAll, afterEach } from "vitest";

// Configurar jest globalmente
global.jest = vi as unknown as typeof jest;

// Mock completo para las variables de entorno
vi.mock("./config/env", () => ({
  SUPABASE_URL: "https://mock-supabase-url.co",
  SUPABASE_ANON_KEY: "mock-anon-key",
  ENV_TYPE: "test",
  API_BASE_URL: "https://mock-api-base-url.co",
  OPENAI_API_KEY: "mock-openai-key",
  ANTHROPIC_API_KEY: "mock-anthropic-key",
  __esModule: true,
  default: {
    SUPABASE_URL: "https://mock-supabase-url.co",
    SUPABASE_ANON_KEY: "mock-anon-key",
    ENV_TYPE: "test",
    API_BASE_URL: "https://mock-api-base-url.co",
    OPENAI_API_KEY: "mock-openai-key",
    ANTHROPIC_API_KEY: "mock-anthropic-key",
  }
}));

// Funciones auxiliares para crear mocks de Supabase
function createSelectMock() {
  return {
    eq: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({ 
        data: { professional_id: "prof-mock-123" }, 
        error: null 
      })),
      order: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    })),
    order: vi.fn(() => ({
      limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  };
}

function createTableMock() {
  return {
    select: vi.fn(createSelectMock),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: {}, error: null }))
    })),
    insert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: {}, error: null }))
    }))
  };
}

// Definir un mock global de cliente Supabase para evitar duplicación
const mockSupabaseClient = {
  from: vi.fn((_table) => createTableMock()),
  auth: {
    getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: "user-mock-123" } } }, error: null })),
    getUser: vi.fn(() => Promise.resolve({ data: { user: { id: "user-mock-123" } }, error: null })),
    signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: { id: "user-mock-123" } }, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null }))
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://mock-public-url.co" } }))
    }))
  }
};

// Mock completo para @supabase/supabase-js
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockSupabaseClient)
}));

// Mock para el cliente de Supabase que se usa a través de supabaseClient
vi.mock("./core/auth/supabaseClient", () => {
  return {
    default: mockSupabaseClient,
    __esModule: true
  };
});

// Mock para formDataSourceSupabase que muchos tests podrían usar
vi.mock("./core/dataSources/formDataSourceSupabase", () => ({
  formDataSourceSupabase: {
    getFormsByVisitId: vi.fn().mockResolvedValue([{
      id: "form-mock-123",
      visit_id: "visit-mock-123",
      patient_id: "patient-mock-123",
      professional_id: "prof-mock-123",
      form_type: "SOAP",
      content: JSON.stringify({
        subjective: "Datos de prueba subjetivos",
        objective: "Datos de prueba objetivos",
        assessment: "Datos de prueba diagnóstico",
        plan: "Datos de prueba plan",
        notes: "Datos de prueba notas"
      }),
      status: "draft",
      created_at: "2023-01-01T00:00:00.000Z",
      updated_at: "2023-01-01T00:00:00.000Z"
    }]),
    getFormById: vi.fn().mockResolvedValue({
      id: "form-mock-123",
      visit_id: "visit-mock-123",
      patient_id: "patient-mock-123",
      professional_id: "prof-mock-123",
      form_type: "SOAP",
      content: JSON.stringify({
        subjective: "Datos de prueba subjetivos",
        objective: "Datos de prueba objetivos",
        assessment: "Datos de prueba diagnóstico",
        plan: "Datos de prueba plan",
        notes: "Datos de prueba notas"
      }),
      status: "draft",
      created_at: "2023-01-01T00:00:00.000Z",
      updated_at: "2023-01-01T00:00:00.000Z"
    }),
    updateForm: vi.fn().mockResolvedValue({ id: "form-mock-123" }),
    createForm: vi.fn().mockResolvedValue({ id: "new-form-mock-123" })
  }
}));

// Funciones auxiliares para filtrar mensajes de consola
function shouldFilterError(message: string): boolean {
  return message.includes("Warning: ReactDOM.render") || 
         message.includes("React.createFactory") ||
         message.includes("Warning: An update to") ||
         message.includes("Warning: Failed prop type") ||
         message.includes("Invalid prop") ||
         message.includes("supabaseUrl is required") ||
         message.includes("Cannot read properties of null") ||
         message.includes("createClient requires a valid supabase URL");
}

function shouldFilterWarn(message: string): boolean {
  return message.includes("Warning: useLayoutEffect") || 
         message.includes("Warning: React does not recognize") ||
         message.includes("Missing Supabase client") ||
         message.includes("Invalid Supabase configuration");
}

// Suprimir advertencias de consola durante las pruebas
beforeAll(() => {
  // Almacenar los métodos originales de console
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Sobrescribir console.error y console.warn para filtrar mensajes específicos
  console.error = (...args) => {
    // Filtrar mensajes específicos de React relacionados con testing
    if (typeof args[0] === "string" && shouldFilterError(args[0])) {
      return;
    }
    originalConsoleError(...args);
  };
  
  console.warn = (...args) => {
    // Filtrar advertencias específicas que no son relevantes para las pruebas
    if (typeof args[0] === "string" && shouldFilterWarn(args[0])) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

// Limpiar los mocks después de cada prueba
afterEach(() => {
  vi.clearAllMocks();
}); 

// Funciones auxiliares para crear mocks de Supabase alternativos
function createAlternativeSelectMock() {
  return {
    eq: vi.fn(() => ({
      order: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  };
}

function createAlternativeTableMock() {
  return {
    select: vi.fn(createAlternativeSelectMock),
    insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    update: vi.fn(() => Promise.resolve({ data: null, error: null })),
    delete: vi.fn(() => Promise.resolve({ data: null, error: null }))
  };
}

function createAlternativeAuthMock() {
  return {
    getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null }))
  };
}

// Función auxiliar para configurar mock de Supabase (no usada pero disponible para tests futuros)
const _setupSupabaseMock = (): void => {
  // Configuración básica del mock
  const mockSupabase = {
    from: vi.fn(createAlternativeTableMock),
    auth: createAlternativeAuthMock()
  };

  vi.doMock("@/core/auth/supabaseClient", () => ({
    default: mockSupabase
  }));
}; 