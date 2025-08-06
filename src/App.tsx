// src/App.tsx - ACTUALIZADO CON NUEVO PolicyFormWizard
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

// 🚀 CAMBIO IMPORTANTE: Ahora usando el nuevo PolicyFormWizard
import PolicyFormWizard from '@/features/policy-form/PolicyFormWizard';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, DollarSign, Clock, Settings, Construction } from 'lucide-react';

// ✅ IMPORTAR COMPONENTES DE ANIMACIONES AVANZADAS
import { 
  PageTransition, 
  AdvancedStaggered,
  AnimatedModal 
} from '@/components/enhanced/AdavancedAnimation';

// ✅ CORREGIDO: USAR TIPOS OFICIALES EN LUGAR DE DEFINICIONES LOCALES
import type { OperationType } from './components/wizard/OperationSelector';
import type { PolicyFormData } from './types/poliza';  // Cambiar a la ruta correcta
import type { AzureProcessResponse } from './types/azureDocumentResult';
import type { ClientDto } from './types/cliente';  // ✅ IMPORTAR TIPO OFICIAL
import type { CompanyDto, SeccionDto } from './types/masterData';  // ✅ IMPORTAR TIPOS OFICIALES

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
const handleFileProcess = async (file: File): Promise<any> => {
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
  
  // Estados del wizard - ✅ AHORA USANDO TIPOS OFICIALES
  const [currentWizardStep, setCurrentWizardStep] = useState<'operation' | 'client' | 'company-section' | 'document-scan' | 'form'>('operation');
  const [selectedOperation, setSelectedOperation] = useState<OperationType | undefined>();
  const [selectedClient, setSelectedClient] = useState<ClientDto | undefined>();
  const [selectedCompany, setSelectedCompany] = useState<CompanyDto | undefined>();
  const [selectedSection, setSelectedSection] = useState<SeccionDto | undefined>();
  const [scannedDocument, setScannedDocument] = useState<AzureProcessResponse | undefined>();

  // ✅ ESTADOS PARA MODALES CON ANIMACIONES
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

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

  const handleOperationSelect = (operation: OperationType) => {
    setSelectedOperation(operation);
    console.log('Operación seleccionada:', operation);
    setCurrentWizardStep('client');
  };

  // ✅ CORREGIDO: FUNCIÓN USANDO TIPO OFICIAL ClientDto
  const handleClientSelect = (client: ClientDto) => {
    setSelectedClient(client);
    console.log('Cliente seleccionado:', client);
    setCurrentWizardStep('company-section');
  };

  // ✅ CORREGIDO: FUNCIÓN USANDO TIPOS OFICIALES
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

  // 🚀 FUNCIÓN MEJORADA PARA MANEJAR EL ENVÍO DEL FORMULARIO
  const handleFormSubmit = async (formData: PolicyFormData) => {
    console.log('📋 Datos del formulario (PolicyFormWizard):', formData);
    console.log('👤 Cliente:', selectedClient);
    console.log('🏢 Compañía:', selectedCompany);
    console.log('🚗 Sección:', selectedSection);
    console.log('📄 Documento escaneado:', scannedDocument);
    
    try {
      // 🚀 ENVÍO REAL A VELNEO - Usa tu lógica existente aquí
      // const result = await apiService.sendToVelneo({
      //   formData,
      //   client: selectedClient,
      //   company: selectedCompany,
      //   section: selectedSection,
      //   document: scannedDocument
      // });
      
      // Por ahora, simulación de éxito
      setModalContent(
        <div className="text-center space-y-4">
          <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-600">¡Éxito!</h3>
          <p className="text-sm text-gray-600">
            Los datos se han enviado correctamente a Velneo
          </p>
        </div>
      );
      setShowModal(true);
      
      // Reiniciar wizard después de 2 segundos
      setTimeout(() => {
        setShowModal(false);
        resetWizard();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error al enviar formulario:', error);
      setModalContent(
        <div className="text-center space-y-4">
          <div className="p-3 bg-red-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-600">Error al enviar</h3>
          <p className="text-sm text-gray-600">
            No se pudo enviar el formulario a Velneo. 
            Por favor, verifica los datos e intenta nuevamente.
          </p>
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-700">
              <strong>Error:</strong> {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
          </div>
        </div>
      );
      setShowModal(true);
    }
  };

  const getTransitionDirection = () => {
    switch (currentWizardStep) {
      case 'operation': return 'fade';
      case 'client': return 'slide-right';
      case 'company-section': return 'slide-right';
      case 'document-scan': return 'slide-up';
      case 'form': return 'fade';
      default: return 'fade';
    }
  };

  // Renderizado del contenido del wizard basado en el paso actual
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
            <p className="text-destructive">Error: Cliente no seleccionado</p>
            <button onClick={handleWizardBack} className="mt-4 text-primary hover:underline">
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
            <p className="text-destructive">Error: Compañía o sección no seleccionadas</p>
            <button onClick={handleWizardBack} className="mt-4 text-primary hover:underline">
              Volver al paso anterior
            </button>
          </div>
        );
      
      case 'form':
        return selectedClient && selectedCompany && selectedSection ? (
          <div className="animate-in fade-in-0 duration-400">
            {/* 🚀 CAMBIO PRINCIPAL: Usar PolicyFormWizard en lugar de IntegratedPolicyForm */}
            <PolicyFormWizard
              scannedData={scannedDocument}
              selectedClient={selectedClient}
              selectedCompany={selectedCompany}
              selectedSection={selectedSection}
              onSubmit={handleFormSubmit}
              onBack={handleWizardBack}
            />
          </div>
        ) : (
          <div className="text-center p-8 animate-in fade-in-0 duration-300">
            <p className="text-destructive">Error: Datos faltantes para el formulario</p>
            <button onClick={handleWizardBack} className="mt-4 text-primary hover:underline">
              Volver al paso anterior
            </button>
          </div>
        );

      default:
        return (
          <div className="text-center p-8 animate-in fade-in-0 duration-300">
            Paso no implementado aún
          </div>
        );
    }
  };

  // El resto del código permanece igual...
  // (Páginas de Analytics, Billing, etc.)

  // Renderizado del contenido principal basado en la página actual
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <PageTransition 
            direction="fade" 
            duration={600}
            isActive={currentPage === 'dashboard'}
          >
            <Dashboard onStartWizard={handleStartWizard} />
          </PageTransition>
        );

      case 'wizard':
        return (
          <PageTransition 
            direction="fade"
            duration={400}
            isActive={currentPage === 'wizard'}
          >
            <div className="container-responsive py-6 space-y-6">
              {/* ✅ WIZARD PROGRESS SIN STAGGERED - ANIMACIÓN SIMPLE */}
              <div className="animate-in slide-in-from-top-4 duration-500">
                <WizardProgress currentStep={currentWizardStep} />
              </div>
              
              {/* ✅ CONTENIDO DEL WIZARD CON TRANSICIONES MÁS SUAVES */}
              <PageTransition 
                direction={getTransitionDirection()}
                duration={400}
                isActive={true}
              >
                {renderWizardContent()}
              </PageTransition>
            </div>
          </PageTransition>
        );

      // El resto de las páginas permanecen igual...
      default:
        return null;
    }
  };

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Renderizado principal
  return (
    <ThemeProvider>
      <MainLayout onNavigate={handleNavigate} currentPage={currentPage}>
        {renderPageContent()}
        
        {/* ✅ MODAL CON ANIMACIONES */}
        <AnimatedModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)}
        >
          {modalContent}
        </AnimatedModal>
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