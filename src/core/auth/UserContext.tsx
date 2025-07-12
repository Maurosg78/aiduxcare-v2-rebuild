import React from "react";
import { UserContext, initialUserContext } from "./UserContextInstance";

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  // En una implementación real, aquí añadiríamos la lógica
  // de autenticación con Supabase, pero para un build limpio
  // simplemente usamos el contexto inicial
  
  return (
    <UserContext.Provider value={initialUserContext}>
      {children}
    </UserContext.Provider>
  );
}; 