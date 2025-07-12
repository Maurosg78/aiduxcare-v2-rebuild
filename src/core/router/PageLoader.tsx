import React from "react";

// Componente de loading para las rutas lazy
export const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-gray-600">Cargando...</span>
  </div>
); 