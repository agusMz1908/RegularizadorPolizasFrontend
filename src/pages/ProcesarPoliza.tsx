import React, { useState } from 'react';
import { ArrowLeft, Eye, RefreshCw } from 'lucide-react';

import { FileUpload } from '../components/poliza/FileUpload';
import { PolizaForm } from '../components/poliza/PolizaForm';
import { PdfViewer } from '../components/poliza/PdfViewer';
import { ProcessingStates } from '../components/poliza/ProcessingStates';
import { NewPolizaModal } from '../components/poliza/NewPolizaModal';

import { ProcessingState } from '../types/processing';
import { PolizaFormData, Compania, Ramo } from '../types/poliza';
import { Cliente } from '../types/cliente';

interface ProcesarPolizaProps {
  cliente?: Cliente;
  compania?: Compania;
  ramo?: Ramo;
  onBack?: () => void;
}

const ProcesarPoliza: React.FC<ProcesarPolizaProps> = ({
  cliente = {
    id: 1,
    nombre: 'AVALA GENTA OMAR MANUEL',
    documento: 'CI 989.333-3',
    telefono: '2514 3055',
    email: '',
    direccion: 'AVELLANEDA 4639',
    activo: true,
  },
  compania = {
    id: 1,
    nombre: 'Banco de Seguros del Estado',
    codigo: 'BSE',
  },
  ramo = {
    id: 1,
    nombre: 'Automóviles',
    codigo: 'AUTO',
  },
  onBack,
}) => {
  // Estados
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentResult, setDocumentResult] = useState<any>(null);

  // Handlers
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setProcessingState('uploading');
    
    // Simular procesamiento
    setTimeout(() => {
      setProcessingState('processing');
      setTimeout(() => {
        // Mock result
        setDocumentResult({
          documentoId: `doc_${Date.now()}`,
          nombreArchivo: file.name,
          pdfViewerUrl: URL.createObjectURL(file),
          confianzaPromedio: 0.87,
          requiereVerificacion: false,
          camposExtraidos: {
            numeroPoliza: '2542343434-001',
            vigenciaDesde: '2025-07-01',
            vigenciaHasta: '2026-07-01',
            nombreAsegurado: cliente.nombre,
          }
        });
        setProcessingState('form-ready');
        setShowPdfViewer(true);
      }, 2000);
    }, 1000);
  };

  const handleFormSubmit = async (formData: PolizaFormData) => {
    setProcessingState('sending-velneo');
    
    // Simular envío a Velneo
    setTimeout(() => {
      setProcessingState('sent-success');
    }, 2000);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setShowPdfViewer(false);
    setDocumentResult(null);
    setProcessingState('idle');
  };

  const getSubtitle = () => {
    const parts = [
      `Cliente: ${cliente.nombre}`,
      `Compañía: ${compania.nombre}`,
      `Ramo: ${ramo.nombre}`,
    ];
    return parts.join(' | ');
  };

  const renderMainContent = () => {
    switch (processingState) {
      case 'idle':
        return (
          <div className="max-w-2xl mx-auto">
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        );

      case 'uploading':
      case 'processing':
      case 'sending-velneo':
      case 'sent-success':
      case 'error':
        return (
          <ProcessingStates
            state={processingState}
            onReset={handleReset}
            onContinue={handleBack}
          />
        );

      case 'form-ready':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario */}
            <div>
              <PolizaForm
                initialData={documentResult?.camposExtraidos || {}}
                ramoCode={ramo.codigo}
                confidence={documentResult?.confianzaPromedio}
                requiresVerification={documentResult?.requiereVerificacion}
                onSubmit={handleFormSubmit}
              />
            </div>

            {/* Visor PDF */}
            <div className={`${showPdfViewer ? 'block' : 'hidden lg:block'}`}>
              {documentResult?.pdfViewerUrl && (
                <PdfViewer
                  pdfUrl={documentResult.pdfViewerUrl}
                  fileName={documentResult.nombreArchivo}
                  height="600px"
                />
              )}
            </div>
          </div>
        );

      default:
        return <div>Estado desconocido</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Procesar Póliza</h1>
              <p className="text-sm text-gray-500">{getSubtitle()}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {processingState === 'form-ready' && (
              <>
                <button
                  onClick={() => setShowPdfViewer(!showPdfViewer)}
                  className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Eye className="w-4 h-4" />
                  <span>{showPdfViewer ? 'Ocultar' : 'Ver'} PDF</span>
                </button>

                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Nuevo Archivo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
};

export default ProcesarPoliza;