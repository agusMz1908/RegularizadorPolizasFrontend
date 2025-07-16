import React, { useState } from 'react';
import { AzureDocumentProcessor } from './AzureDocumentProcessor';
import { EnhancedDocumentDisplay } from './EnhancedDocumentDisplay';
import type { AzureProcessResponse } from '../../types/azure-document';

interface AzureDocumentWorkflowProps {
  onComplete?: (result: any) => void;
}

export const AzureDocumentWorkflow: React.FC<AzureDocumentWorkflowProps> = ({
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'edit'>('upload');
  const [documentResult, setDocumentResult] = useState<AzureProcessResponse | null>(null);

  const handleDocumentProcessed = (result: AzureProcessResponse) => {
    console.log('📄 Documento procesado:', result);
    setDocumentResult(result);
    setCurrentStep('edit');
  };

  const handleBatchProcessed = (batchResult: any) => {
    console.log('📦 Lote procesado:', batchResult);
    // Para lotes, podrías manejar cada resultado individualmente
    // o mostrar una vista de resumen diferente
  };

  const handleBack = () => {
    setCurrentStep('upload');
    setDocumentResult(null);
  };

  const handleSendToVelneo = (data: any) => {
    console.log('🚀 Enviando a Velneo:', data);
    // Aquí implementarías la lógica para enviar a Velneo
    onComplete?.(data);
  };

  const handleSearchClient = (searchData: any) => {
    console.log('🔍 Buscar cliente:', searchData);
    // Aquí implementarías la búsqueda manual de clientes
  };

  const handleCreateClient = (clientData: any) => {
    console.log('👤 Crear cliente:', clientData);
    // Aquí implementarías la creación de nuevos clientes
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === 'upload' && (
        <AzureDocumentProcessor
          onDocumentProcessed={handleDocumentProcessed}
          onBatchProcessed={handleBatchProcessed}
          maxFiles={10}
          allowBatch={true}
        />
      )}

      {currentStep === 'edit' && documentResult && (
        <EnhancedDocumentDisplay
          documentResult={documentResult}
          onBack={handleBack}
          onSendToVelneo={handleSendToVelneo}
          onSearchClient={handleSearchClient}
          onCreateClient={handleCreateClient}
        />
      )}
    </div>
  );
};