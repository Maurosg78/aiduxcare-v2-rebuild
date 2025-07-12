import { User, Session } from "@supabase/supabase-js";

// Definición mínima necesaria para tipo de usuario y perfil
export interface UserProfile {
  id: string;
  role: string;
  full_name: string;
}

export type RoleType = "admin" | "professional" | "patient";

export interface UserContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: RoleType | null;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (requiredRoles: RoleType | RoleType[]) => boolean;
}

// Valores iniciales para el contexto
export const initialUserContext: UserContextType = {
  user: null,
  session: null,
  profile: null,
  role: null,
  isLoading: false,
  error: null,
  logout: async () => {},
  refreshProfile: async () => {},
  hasRole: () => false
}; 