// src/App.tsx - ACTUALIZADO PARA USAR IntegratedPolicyForm CON UX MEJORADO
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

// 🚀 CAMBIO IMPORTANTE: PolicyMappingForm → IntegratedPolicyForm (nuestro formulario mejorado)
import IntegratedPolicyForm from './components/wizard/PolicyFormTabs';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, DollarSign, Clock, Settings, Construction } from 'lucide-react';

// ✅ IMPORTAR COMPONENTES DE ANIMACIONES AVANZADAS
import { 
  PageTransition, 
  AdvancedStaggered,
  AnimatedModal 
} from '@/components/enhanced/AdavancedAnimation';

import type { OperationType } from './components/wizard/OperationSelector';
import type { ClientDto } from './types/cliente';
import type { CompanyDto, SeccionDto } from './types/maestros';
import type { AzureProcessResponse } from './types/azureDocumentResult';
import type { PolicyFormData } from './types/policyForm'; // ← Cambiar import si es necesario
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
  
  // Estados del wizard
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

  // 🚀 FUNCIÓN MEJORADA PARA MANEJAR EL ENVÍO DEL FORMULARIO
  const handleFormSubmit = async (formData: PolicyFormData) => {
    console.log('📋 Datos del formulario (IntegratedPolicyForm con UX mejorado):', formData);
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
      //   scannedDocument
      // });
      
      // ✅ MOSTRAR MODAL DE ÉXITO CON ANIMACIONES
      setModalContent(
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <span className="text-green-500 text-3xl">✓</span>
          </div>
          <h3 className="text-xl font-bold text-green-600">¡Póliza Procesada con Éxito!</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✅ Validaciones completadas</p>
            <p>✅ Datos enviados a Velneo</p>
            <p>✅ Formulario procesado correctamente</p>
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-700">
              <strong>Cliente:</strong> {selectedClient?.clinom}<br/>
              <strong>Compañía:</strong> {selectedCompany?.comalias}<br/>
              <strong>Póliza:</strong> {formData.poliza}
            </p>
          </div>
        </div>
      );
      setShowModal(true);
      
      setTimeout(() => {
        setShowModal(false);
        setCurrentPage('dashboard');
        resetWizard();
      }, 4000);
      
    } catch (error) {
      console.error('❌ Error enviando a Velneo:', error);
      
      // ✅ MOSTRAR MODAL DE ERROR CON ANIMACIONES
      setModalContent(
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-500 text-2xl">✗</span>
          </div>
          <h3 className="text-xl font-bold text-red-600">Error al Procesar Póliza</h3>
          <p className="text-muted-foreground">
            Hubo un problema enviando los datos a Velneo. Por favor, verifica los datos e intenta nuevamente.
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
                duration={300}
                isActive={true}
                key={currentWizardStep}
              >
                {renderWizardStep()}
              </PageTransition>
            </div>
          </PageTransition>
        );

      case 'analytics':
        return (
          <PageTransition 
            direction="slide-left" 
            duration={500}
            isActive={currentPage === 'analytics'}
          >
            <AnalyticsPage />
          </PageTransition>
        );

      case 'billing':
        return (
          <PageTransition 
            direction="slide-left" 
            duration={500}
            isActive={currentPage === 'billing'}
          >
            <BillingPage />
          </PageTransition>
        );

      case 'history':
        return (
          <PageTransition 
            direction="slide-left" 
            duration={500}
            isActive={currentPage === 'history'}
          >
            <HistoryPage />
          </PageTransition>
        );

      case 'settings':
        return (
          <PageTransition 
            direction="slide-left" 
            duration={500}
            isActive={currentPage === 'settings'}
          >
            <SettingsPage />
          </PageTransition>
        );

      default:
        return (
          <PageTransition direction="fade" duration={400}>
            <Dashboard onStartWizard={handleStartWizard} />
          </PageTransition>
        );
    }
  };

  const renderWizardStep = () => {
    switch (currentWizardStep) {
      case 'operation':
        return (
          <div className="animate-in fade-in-0 duration-500">
            <OperationSelector onSelect={handleOperationSelect} />
          </div>
        );

      case 'client':
        return (
          <div className="animate-in fade-in-0 slide-in-from-right-4 duration-400">
            <ClientSelector 
              onSelect={handleClientSelect} 
              selected={selectedClient}
              onBack={handleWizardBack}
            />
          </div>
        );

      case 'company-section':
        return (
          <div className="animate-in fade-in-0 slide-in-from-right-4 duration-400">
            <CompanySectionSelector 
              onSelect={handleCompanySectionSelect}
              onBack={handleWizardBack}
            />
          </div>
        );

      case 'document-scan':
        return (
          <div className="animate-in fade-in-0 scale-in duration-400">
            <DocumentScanner 
              onFileProcess={handleFileProcess}
              onDocumentProcessed={handleDocumentProcessed}
              onBack={handleWizardBack}
            />
          </div>
        );

      case 'form':
        return (
          scannedDocument ? (
            <div className="animate-in fade-in-0 duration-400">
              {/* 🚀 CAMBIO PRINCIPAL: Usar nuestro IntegratedPolicyForm mejorado */}
              <IntegratedPolicyForm
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
          )
        );

      default:
        return (
          <div className="text-center p-8 animate-in fade-in-0 duration-300">
            Paso no implementado aún
          </div>
        );
    }
  };

  // ✅ PÁGINAS PLACEHOLDER CON ANIMACIONES MEJORADAS (mantener igual)
  const AnalyticsPage = () => (
    <div className="p-6 gradient-bg min-h-screen">
      <AdvancedStaggered
        direction="up"
        staggerDelay={200}
        trigger="immediate"
      >
        {[
          <Card key="analytics-card" className="max-w-2xl mx-auto border-0 shadow-medium card-enhanced hover-lift">
            <CardHeader className="gradient-primary text-white rounded-t-lg">
              <CardTitle className="text-center flex items-center justify-center text-xl">
                <div className="p-3 bg-white/20 rounded-full mr-3 animate-float">
                  <BarChart3 className="h-6 w-6" />
                </div>
                Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6 p-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl opacity-50 rounded-full animate-glow"></div>
                <Construction className="relative h-20 w-20 text-primary mx-auto animate-float" />
              </div>
              <h3 className="text-2xl font-bold text-gradient-primary">
                Próximamente
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                El dashboard de analytics con métricas avanzadas, reportes interactivos y 
                seguimiento de facturación estará disponible en la próxima fase.
              </p>
              <Badge variant="outline" className="animate-shimmer">
                FASE 2 del Desarrollo
              </Badge>
            </CardContent>
          </Card>
        ]}
      </AdvancedStaggered>
    </div>
  );

  const BillingPage = () => (
    <div className="p-6 gradient-bg min-h-screen">
      <AdvancedStaggered
        direction="scale"
        staggerDelay={150}
        trigger="immediate"
      >
        {[
          <Card key="billing-card" className="max-w-2xl mx-auto border-0 shadow-medium card-enhanced hover-lift">
            <CardHeader className="gradient-secondary text-white rounded-t-lg">
              <CardTitle className="text-center flex items-center justify-center text-xl">
                <div className="p-3 bg-white/20 rounded-full mr-3 animate-pulse">
                  <DollarSign className="h-6 w-6" />
                </div>
                Sistema de Facturación
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6 p-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 blur-3xl opacity-50 rounded-full"></div>
                <DollarSign className="relative h-20 w-20 text-green-500 mx-auto animate-float" />
              </div>
              <h3 className="text-2xl font-bold text-green-600">
                Facturación Automática
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Sistema de cobro por escaneo con tiers de volumen. 
                Métricas de facturación en tiempo real próximamente.
              </p>
            </CardContent>
          </Card>
        ]}
      </AdvancedStaggered>
    </div>
  );

  const HistoryPage = () => (
    <div className="p-6 gradient-bg min-h-screen">
      <AdvancedStaggered
        direction="left"
        staggerDelay={100}
        trigger="immediate"
      >
        {[
          <Card key="history-card" className="max-w-2xl mx-auto border-0 shadow-medium card-enhanced hover-lift">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="text-center flex items-center justify-center text-xl">
                <div className="p-3 bg-white/20 rounded-full mr-3 animate-pulse">
                  <Clock className="h-6 w-6" />
                </div>
                Historial de Procesos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6 p-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-3xl opacity-50 rounded-full"></div>
                <Clock className="relative h-20 w-20 text-purple-500 mx-auto animate-float" />
              </div>
              <h3 className="text-2xl font-bold text-purple-600">
                Historial Completo
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Registro detallado de todas las pólizas procesadas, 
                métricas de rendimiento y auditoría completa.
              </p>
            </CardContent>
          </Card>
        ]}
      </AdvancedStaggered>
    </div>
  );

  const SettingsPage = () => (
    <div className="p-6 gradient-bg min-h-screen">
      <AdvancedStaggered
        direction="right"
        staggerDelay={100}
        trigger="immediate"
      >
        {[
          <Card key="settings-card" className="max-w-2xl mx-auto border-0 shadow-medium card-enhanced hover-lift">
            <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-t-lg">
              <CardTitle className="text-center flex items-center justify-center text-xl">
                <div className="p-3 bg-white/20 rounded-full mr-3 animate-pulse">
                  <Settings className="h-6 w-6" />
                </div>
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6 p-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-slate-400/20 blur-3xl opacity-50 rounded-full"></div>
                <Settings className="relative h-20 w-20 text-gray-600 mx-auto animate-float" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700">
                Configuración Avanzada
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Configuraciones del sistema, preferencias de usuario, 
                y configuración de integraciones.
              </p>
            </CardContent>
          </Card>
        ]}
      </AdvancedStaggered>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <PageTransition direction="fade" duration={800}>
        <LoginForm />
      </PageTransition>
    );
  }

  return (
    <MainLayout onNavigate={handleNavigate} currentPage={currentPage}>
      {renderPageContent()}
      
      {/* ✅ MODAL CON ANIMACIONES AVANZADAS Y INFORMACIÓN MEJORADA */}
      <AnimatedModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        animation="scale"
        backdropAnimation="blur"
        size="md"
        closeOnBackdrop={false}
        showCloseButton={false}
      >
        {modalContent}
      </AnimatedModal>
    </MainLayout>
  );
}

// Componente principal con providers
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;