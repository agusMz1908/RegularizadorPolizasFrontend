// src/App.tsx - CORREGIDO FINAL
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import LoginForm from '@/components/auth/LoginForm';
import MainLayout from '@/components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import WizardProgress from '@/components/wizard/WizardProgress';
import OperationSelector from './components/wizard/OperationSelector';
import ClientSelector from './components/wizard/ClientSelector';
import CompanySectionSelector from './components/wizard/CompanySectionSelector';
import DocumentScanner from './components/wizard/DocumentScanner';

import PolicyFormTabs from './components/wizard/PolicyFormTabs';

// ✅ TIPOS OFICIALES
import type { OperationType } from './components/wizard/OperationSelector';
import type { PolicyFormData } from './types/poliza';
import type { AzureProcessResponse } from './types/azureDocumentResult';
import type { ClientDto } from './types/cliente';
import type { CompanyDto, SeccionDto } from './types/masterData';

import { apiService } from './services/apiService';
import './App.css';

// Query Client con configuración optimizada
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 2,
    },
  },
});

// ✅ FUNCIÓN PARA PROCESAR DOCUMENTOS CON AZURE
const handleFileProcess = async (file: File): Promise<AzureProcessResponse> => {
  try {
    console.log('🚀 Procesando archivo con Azure:', file.name);
    const result = await apiService.processDocument(file);
    console.log('✅ Documento procesado exitosamente:', result);
    return result;
  } catch (error) {
    console.error('❌ Error procesando documento:', error);
    throw new Error(`Error al procesar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

// Componente principal de la aplicación
function AppContent() {
  const { isAuthenticated } = useAuth();
  
  // Estados para el sistema de navegación
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'wizard' | 'analytics' | 'billing' | 'history' | 'settings'>('dashboard');
  
  // Estados del wizard
  const [currentWizardStep, setCurrentWizardStep] = useState<'operation' | 'client' | 'company-section' | 'document-scan' | 'form'>('operation');
  const [selectedOperation, setSelectedOperation] = useState<OperationType | undefined>();
  const [selectedClient, setSelectedClient] = useState<ClientDto | undefined>();
  const [selectedCompany, setSelectedCompany] = useState<CompanyDto | undefined>();
  const [selectedSection, setSelectedSection] = useState<SeccionDto | undefined>();
  const [scannedDocument, setScannedDocument] = useState<AzureProcessResponse | undefined>();

  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  // ✅ NAVEGACIÓN DEL WIZARD - CORREGIDA
  const handleWizardBack = () => {
    switch (currentWizardStep) {
      case 'client':
        setCurrentWizardStep('operation');
        setSelectedOperation(undefined);
        break;
      case 'company-section':
        setCurrentWizardStep('client');
        setSelectedClient(undefined);
        break;
      case 'document-scan':
        setCurrentWizardStep('company-section');
        setSelectedCompany(undefined);
        setSelectedSection(undefined);
        break;
      case 'form':
        setCurrentWizardStep('document-scan');
        setScannedDocument(undefined);
        break;
      default:
        setCurrentWizardStep('operation');
        break;
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as typeof currentPage);
    
    if (page === 'wizard') {
      resetWizard();
    }
  };

  const resetWizard = () => {
    setCurrentWizardStep('operation');
    setSelectedOperation(undefined);
    setSelectedClient(undefined);
    setSelectedCompany(undefined);
    setSelectedSection(undefined);
    setScannedDocument(undefined);
  };

  const handleStartWizard = () => {
    setCurrentPage('wizard');
    resetWizard();
  };

  // ✅ HANDLERS DEL WIZARD - CORREGIDOS CON TIPOS
  const handleOperationSelect = (operation: OperationType) => {
    setSelectedOperation(operation);
    console.log('Operación seleccionada:', operation);
    setCurrentWizardStep('client');
  };

  const handleClientSelect = (client: ClientDto) => {
    setSelectedClient(client);
    console.log('Cliente seleccionado:', client);
    setCurrentWizardStep('company-section');
  };

  const handleCompanySectionSelect = (company: CompanyDto, section: SeccionDto) => {
    setSelectedCompany(company);
    setSelectedSection(section);
    console.log('Compañía seleccionada:', company);
    console.log('Sección seleccionada:', section);
    setCurrentWizardStep('document-scan');
  };

  const handleDocumentProcessed = (scannedData: AzureProcessResponse) => {
    setScannedDocument(scannedData);
    console.log('Documento escaneado:', scannedData);
    setCurrentWizardStep('form');
  };

  // ✅ HANDLER DE SUBMIT DEL FORMULARIO - MEJORADO
  const handleFormSubmit = async (formData: PolicyFormData) => {
    console.log('📋 Enviando datos del formulario completo:');
    console.log('- Formulario:', formData);
    console.log('- Cliente:', selectedClient);
    console.log('- Compañía:', selectedCompany);
    console.log('- Sección:', selectedSection);
    console.log('- Documento escaneado:', scannedDocument);
    
    try {
      // ✅ AQUÍ LLAMARÍAS A TU API REAL PARA ENVIAR A VELNEO
      /*
      const result = await apiService.sendToVelneo({
        formData,
        clientId: selectedClient?.id,
        companyId: selectedCompany?.id,
        sectionId: selectedSection?.id,
        scannedDocument
      });
      */
      
      // Simulación de éxito por ahora
      setModalContent(
        <div className="text-center space-y-4 p-6">
          <div className="p-4 bg-green-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-green-600">¡Póliza Creada Exitosamente!</h3>
          <p className="text-sm text-gray-600">
            La póliza se ha enviado correctamente a Velneo.
          </p>
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p><strong>Póliza:</strong> {formData.poliza || 'N/A'}</p>
            <p><strong>Cliente:</strong> {selectedClient?.clinom || 'N/A'}</p>
            <p><strong>Compañía:</strong> {selectedCompany?.comalias || 'N/A'}</p>
          </div>
        </div>
      );
      setShowModal(true);
      
      // Reiniciar wizard después de mostrar el éxito
      setTimeout(() => {
        setShowModal(false);
        resetWizard();
        setCurrentPage('dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error al enviar formulario:', error);
      setModalContent(
        <div className="text-center space-y-4 p-6">
          <div className="p-4 bg-red-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-600">Error al Crear Póliza</h3>
          <p className="text-sm text-gray-600">
            No se pudo enviar la póliza a Velneo. Por favor verifica los datos e intenta nuevamente.
          </p>
          <div className="text-xs text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
            <strong>Error:</strong> {error instanceof Error ? error.message : 'Error desconocido'}
          </div>
        </div>
      );
      setShowModal(true);
    }
  };

  // ✅ RENDERIZADO DEL CONTENIDO DEL WIZARD
  const renderWizardContent = () => {
    switch (currentWizardStep) {
      case 'operation':
        return (
          <div className="animate-in fade-in-0 duration-300">
            <OperationSelector 
              onSelect={handleOperationSelect} 
              selectedOperation={selectedOperation}
            />
          </div>
        );
      
      case 'client':
        return (
          <div className="animate-in slide-in-from-right duration-300">
            <ClientSelector 
              onSelect={handleClientSelect}
              onBack={handleWizardBack}
              selectedClient={selectedClient}
            />
          </div>
        );
      
      case 'company-section':
        return selectedClient ? (
          <div className="animate-in slide-in-from-right duration-300">
            <CompanySectionSelector
              clientId={selectedClient.id}
              onSelect={handleCompanySectionSelect}
              onBack={handleWizardBack}
              selectedCompany={selectedCompany}
              selectedSection={selectedSection}
            />
          </div>
        ) : (
          <div className="text-center p-8 animate-in fade-in-0 duration-300">
            <p className="text-red-600">Error: Cliente no seleccionado</p>
            <button 
              onClick={handleWizardBack} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Volver al paso anterior
            </button>
          </div>
        );
      
      case 'document-scan':
        return selectedCompany && selectedSection ? (
          <div className="animate-in slide-in-from-bottom duration-300">
            <DocumentScanner
              onFileProcess={handleFileProcess}
              onDocumentProcessed={handleDocumentProcessed}
              onBack={handleWizardBack}
              scannedDocument={scannedDocument}
            />
          </div>
        ) : (
          <div className="text-center p-8 animate-in fade-in-0 duration-300">
            <p className="text-red-600">Error: Compañía o sección no seleccionadas</p>
            <button 
              onClick={handleWizardBack} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Volver al paso anterior
            </button>
          </div>
        );
      
        case 'form':
          return selectedClient && selectedCompany && selectedSection ? (
            // Sin animación en el contenedor
            <PolicyFormTabs
              scannedData={scannedDocument}
              selectedClient={selectedClient}
              selectedCompany={selectedCompany}
              selectedSection={selectedSection}
              operationType={selectedOperation as 'EMISION' | 'RENOVACION' | 'CAMBIO'}
              onSubmit={handleFormSubmit}
              onBack={handleWizardBack}
            />
          ) : (
          <div className="text-center p-8 animate-in fade-in-0 duration-300">
            <p className="text-red-600">Error: Datos insuficientes para el formulario</p>
            <div className="mt-4 text-sm text-gray-600">
              <p>Cliente: {selectedClient ? '✅' : '❌'}</p>
              <p>Compañía: {selectedCompany ? '✅' : '❌'}</p>
              <p>Sección: {selectedSection ? '✅' : '❌'}</p>
              <p>Documento: {scannedDocument ? '✅ Escaneado' : '⚠️ Opcional'}</p>
            </div>
            <button 
              onClick={handleWizardBack} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Volver al paso anterior
            </button>
          </div>
        );

      default:
        return (
          <div className="text-center p-8 animate-in fade-in-0 duration-300">
            <p>Paso no implementado: {currentWizardStep}</p>
          </div>
        );
    }
  };

  // ✅ RENDERIZADO DEL CONTENIDO PRINCIPAL
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="animate-in fade-in-0 duration-600">
            <Dashboard onStartWizard={handleStartWizard} />
          </div>
        );

      case 'wizard':
        return (
          <div className="animate-in fade-in-0 duration-400">
            <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
              {/* Progress del Wizard */}
              <div className="animate-in slide-in-from-top-4 duration-500">
                <WizardProgress currentStep={currentWizardStep} />
              </div>
              
              {/* Contenido del Wizard */}
              <div className="animate-in fade-in-0 duration-400 delay-200">
                {renderWizardContent()}
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="animate-in fade-in-0 duration-600">
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-2xl font-bold">Analytics (En desarrollo)</h1>
              <p className="text-gray-600 mt-4">Esta sección estará disponible pronto.</p>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="animate-in fade-in-0 duration-600">
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-2xl font-bold">Facturación (En desarrollo)</h1>
              <p className="text-gray-600 mt-4">Esta sección estará disponible pronto.</p>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="animate-in fade-in-0 duration-600">
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-2xl font-bold">Historial (En desarrollo)</h1>
              <p className="text-gray-600 mt-4">Esta sección estará disponible pronto.</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="animate-in fade-in-0 duration-600">
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-2xl font-bold">Configuración (En desarrollo)</h1>
              <p className="text-gray-600 mt-4">Esta sección estará disponible pronto.</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="animate-in fade-in-0 duration-600">
            <Dashboard onStartWizard={handleStartWizard} />
          </div>
        );
    }
  };

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // ✅ RENDERIZADO PRINCIPAL - SIMPLIFICADO
  return (
    <ThemeProvider>
      <MainLayout onNavigate={handleNavigate} currentPage={currentPage}>
        {renderPageContent()}
        
        {/* Modal Simple para Mensajes */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in-0 duration-200">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in slide-in-from-bottom-4 duration-300">
              {modalContent}
              <div className="p-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </MainLayout>
    </ThemeProvider>
  );
}

// App principal con providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;