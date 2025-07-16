// ===================================
// ARCHIVO: src/pages/DocumentScanner.tsx - ACTUALIZADO
// ===================================

import React from 'react';
import { AzureDocumentWorkflow } from '../components/azure/AzureDocumentWorkflow';

const DocumentScanner: React.FC = () => {
  const handleComplete = (result: any) => {
    console.log('✅ Proceso de documento completado:', result);
    
    // Aquí puedes agregar lógica adicional cuando se complete el proceso
    // Por ejemplo:
    // - Mostrar notificación de éxito
    // - Redirigir a otra página
    // - Actualizar estado global
    // - Enviar analytics
    
    // Ejemplo de notificación
    if (result.clienteSeleccionado && result.numeroPoliza) {
      console.log(`🎉 Póliza ${result.numeroPoliza} lista para ${result.clienteSeleccionado.nombre}`);
    }
  };

  const handleError = (error: any) => {
    console.error('❌ Error en procesamiento:', error);
    
    // Aquí puedes manejar errores globales
    // Por ejemplo:
    // - Mostrar notificación de error
    // - Enviar error a sistema de logging
    // - Mostrar modal de ayuda
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la página */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Escanear Documentos
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Procesamiento automático de pólizas con Azure Document Intelligence
              </p>
            </div>
            
            {/* Indicadores de estado opcional */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Azure Conectado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Velneo Listo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Componente principal */}
      <AzureDocumentWorkflow 
        onComplete={handleComplete}
        //onError={handleError}
      />
    </div>
  );
};

export default DocumentScanner;