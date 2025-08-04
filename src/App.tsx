// src/App.tsx - INTERFACE CORREGIDA PARA COINCIDIR CON POLICYFORM
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import LoginForm from '@/components/auth/LoginForm';
import MainLayout from '@/components/layout/MainLayout';
import Dashboard from '../src/pages/Dashboard';
import WizardProgress from '@/components/wizard/WizardProgress';
import OperationSelector from './components/wizard/OperationSelector';
import ClientSelector from './components/wizard/ClientSelector';
import CompanySectionSelector from './components/wizard/CompanySectionSelector';
import DocumentScanner from './components/wizard/DocumentScanner';
import PolicyForm from './components/wizard/PolicyForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, DollarSign, Clock, Settings, Construction } from 'lucide-react';
import type { OperationType } from './components/wizard/OperationSelector';
import type { ClientDto } from '../src/types/cliente';
import type { CompanyDto, SeccionDto } from '../src/types/maestros';
import type { AzureProcessResponse } from '../src/types/azureDocumentResult';
import type { PolicyFormData } from './types/poliza';
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

  // ✅ HANDLER PARA DASHBOARD
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

  // ✅ NOMBRE CORRECTO DEL HANDLER
  const handleDocumentProcessed = (scannedData: AzureProcessResponse) => {
    setScannedDocument(scannedData);
    console.log('Documento escaneado:', scannedData);
    setCurrentWizardStep('form');
  };

  const handleFormSubmit = async (formData: PolicyFormData) => {
    console.log('📋 Datos del formulario:', formData);
    console.log('🏢 Compañía:', selectedCompany);
    console.log('🚗 Sección:', selectedSection);
    console.log('📄 Documento escaneado:', scannedDocument);
    
    try {
      alert('✅ Póliza enviada exitosamente a Velneo!\n\nEsta funcionalidad se completará en la siguiente iteración.');
      setCurrentPage('dashboard');
      resetWizard();
    } catch (error) {
      console.error('❌ Error enviando a Velneo:', error);
      alert('❌ Error enviando la póliza a Velneo. Por favor intenta nuevamente.');
    }
  };

  // Renderizado del contenido principal basado en la página actual
  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onStartWizard={handleStartWizard} />;

      case 'wizard':
        return (
          <div className="container-responsive py-6 space-y-6">
            <WizardProgress currentStep={currentWizardStep} />
            {renderWizardStep()}
          </div>
        );

      case 'analytics':
        return <AnalyticsPage />;

      case 'billing':
        return <BillingPage />;

      case 'history':
        return <HistoryPage />;

      case 'settings':
        return <SettingsPage />;

      default:
        return <Dashboard onStartWizard={handleStartWizard} />;
    }
  };

  const renderWizardStep = () => {
    switch (currentWizardStep) {
      case 'operation':
        return <OperationSelector onSelect={handleOperationSelect} />;


case 'client':
  return (
    <ClientSelector 
      onSelect={handleClientSelect} 
      selected={selectedClient}
      onBack={handleWizardBack}
    />
  );

      case 'company-section':
        return (
          <CompanySectionSelector 
            onSelect={handleCompanySectionSelect}
            onBack={handleWizardBack}
          />
        );

      case 'document-scan':
        return (
          <DocumentScanner 
            onDocumentProcessed={handleDocumentProcessed}
            onBack={handleWizardBack}
          />
        );

      case 'form':
        return (
          scannedDocument && selectedCompany && selectedSection ? (
            <PolicyForm
              scannedData={scannedDocument}
              selectedCompany={selectedCompany}
              selectedSection={selectedSection}
              onSubmit={handleFormSubmit}
              onBack={handleWizardBack}
            />
          ) : (
            <div className="text-center p-8">
              <p className="text-destructive">Error: Datos faltantes para el formulario</p>
              <button onClick={handleWizardBack} className="mt-4 text-primary hover:underline">
                Volver al paso anterior
              </button>
            </div>
          )
        );

      default:
        return <div className="text-center p-8">Paso no implementado aún</div>;
    }
  };

  // Páginas placeholder con diseño mejorado
  const AnalyticsPage = () => (
    <div className="p-6 gradient-bg min-h-screen">
      <Card className="max-w-2xl mx-auto border-0 shadow-medium card-enhanced">
        <CardHeader className="gradient-primary text-white rounded-t-lg">
          <CardTitle className="text-center flex items-center justify-center text-xl">
            <div className="p-3 bg-white/20 rounded-full mr-3">
              <BarChart3 className="h-6 w-6" />
            </div>
            Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl opacity-50 rounded-full"></div>
            <Construction className="relative h-20 w-20 text-primary mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gradient-primary">
            Próximamente
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            El dashboard de analytics con métricas avanzadas, reportes interactivos y 
            seguimiento de facturación estará disponible en la próxima fase.
          </p>
          <Badge variant="outline" className="mt-4">
            En desarrollo - Fase 2
          </Badge>
        </CardContent>
      </Card>
    </div>
  );

  const BillingPage = () => (
    <div className="p-6 gradient-bg min-h-screen">
      <Card className="max-w-2xl mx-auto border-0 shadow-medium card-enhanced">
        <CardHeader className="gradient-secondary text-white rounded-t-lg">
          <CardTitle className="text-center flex items-center justify-center text-xl">
            <div className="p-3 bg-white/20 rounded-full mr-3">
              <DollarSign className="h-6 w-6" />
            </div>
            Sistema de Facturación
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-accent/20 blur-3xl opacity-50 rounded-full"></div>
            <Construction className="relative h-20 w-20 text-secondary mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gradient-secondary">
            Próximamente
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Sistema automatizado de facturación por póliza escaneada con 
            tiers de precios según volumen mensual.
          </p>
          <Badge variant="outline" className="mt-4">
            En desarrollo - Fase 2
          </Badge>
        </CardContent>
      </Card>
    </div>
  );

  const HistoryPage = () => (
    <div className="p-6 gradient-bg min-h-screen">
      <Card className="max-w-2xl mx-auto border-0 shadow-medium card-enhanced">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-t-lg">
          <CardTitle className="text-center flex items-center justify-center text-xl">
            <div className="p-3 bg-white/20 rounded-full mr-3">
              <Clock className="h-6 w-6" />
            </div>
            Historial de Pólizas
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 blur-3xl opacity-50 rounded-full"></div>
            <Construction className="relative h-20 w-20 text-orange-500 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Próximamente
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Historial completo de todas las pólizas procesadas con 
            filtros avanzados y exportación de datos.
          </p>
          <Badge variant="outline" className="mt-4">
            En desarrollo - Fase 2
          </Badge>
        </CardContent>
      </Card>
    </div>
  );

  const SettingsPage = () => (
    <div className="p-6 gradient-bg min-h-screen">
      <Card className="max-w-2xl mx-auto border-0 shadow-medium card-enhanced">
        <CardHeader className="bg-gradient-to-r from-gray-500 to-slate-600 text-white rounded-t-lg">
          <CardTitle className="text-center flex items-center justify-center text-xl">
            <div className="p-3 bg-white/20 rounded-full mr-3">
              <Settings className="h-6 w-6" />
            </div>
            Configuración
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-slate-500/20 blur-3xl opacity-50 rounded-full"></div>
            <Construction className="relative h-20 w-20 text-gray-500 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent">
            Próximamente
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Panel de configuración para personalizar el comportamiento 
            del sistema, gestión de usuarios y configuraciones de API.
          </p>
          <Badge variant="outline" className="mt-4">
            En desarrollo - Fase 2
          </Badge>
        </CardContent>
      </Card>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <LoginForm />
      </div>
    );
  }

  return (
    <MainLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPageContent()}
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="regularizador-theme">
        <AuthProvider>
          <AppContent />
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;