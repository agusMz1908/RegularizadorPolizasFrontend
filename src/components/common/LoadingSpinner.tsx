import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  submessage?: string;
  showProgress?: boolean;
}

export default function LoadingSpinner({ 
  message = "Cargando clientes...", 
  submessage = "Esto puede tardar unos momentos debido al volumen de datos",
  showProgress = true 
}: LoadingSpinnerProps) {
  return (
    <div className="min-h-64 flex flex-col items-center justify-center space-y-4 p-8">
      {/* Spinner */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin animation-delay-75"></div>
      </div>

      {/* Mensajes */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-900">
          {message}
        </h3>
        <p className="text-sm text-gray-600 max-w-md">
          {submessage}
        </p>
      </div>

      {/* Barra de progreso animada */}
      {showProgress && (
        <div className="w-64 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
        </div>
      )}

      {/* Info adicional */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>💾 Descargando datos desde Velneo...</p>
        <p>📊 Procesando información de clientes...</p>
      </div>
    </div>
  );
}