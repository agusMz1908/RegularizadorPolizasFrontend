// src/App.tsx - VERSIÓN FINAL CORREGIDA
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
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
import './App.css';

// Interface para los datos del formulario
interface PolicyFormData {
  corredor: string;
  asegurado: string;
  domicilio: string;
  telefono: string;
  email: string;
  documento: string;
  numeroPoliza: string;
  desde: string;
  hasta: string;
  endoso: string;
  marca: string;
  modelo: string;
  anio: string;
  combustible: string;
  categoria: string;
  chasis: string;
  matricula: string;
  cobertura: string;
  premio: number;
  total: number;
  formaPago: string;
  cuotas: number;
  observaciones: string;
}

// Crear el QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
    },
  },
});

// ✅ TIPOS CORREGIDOS - SIN "review"
type CurrentPage = 'dashboard' | 'wizard' | 'analytics' | 'billing' | 'history' | 'settings';
type WizardStep = 'operation' | 'client' | 'company-section' | 'document-scan' | 'form';

// Componente principal protegido
const AuthenticatedApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  // Estado de navegación principal
  const [currentPage, setCurrentPage] = useState<CurrentPage>('dashboard');
  
  // Estado del wizard
  const [currentWizardStep, setCurrentWizardStep] = useState<WizardStep>('operation');
  const [selectedOperation, setSelectedOperation] = useState<OperationType | undefined>();
  const [selectedClient, setSelectedClient] = useState<ClientDto | undefined>();
  const [selectedCompany, setSelectedCompany] = useState<CompanyDto | undefined>();
  const [selectedSection, setSelectedSection] = useState<SeccionDto | undefined>();
  const [scannedDocument, setScannedDocument] = useState<AzureProcessResponse | undefined>();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Navegación principal
  const handleNavigation = (page: string) => {
    setCurrentPage(page as CurrentPage);
    
    // Si vamos al wizard, resetear el estado
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

  // Handlers del wizard
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

  const handleFormSubmit = async (formData: PolicyFormData) => {
    console.log('📋 Datos del formulario:', formData);
    console.log('🏢 Compañía:', selectedCompany);
    console.log('🚗 Sección:', selectedSection);
    console.log('📄 Documento escaneado:', scannedDocument);
    
    try {
      // Aquí irías al API de Velneo para crear la póliza
      alert('✅ Póliza enviada exitosamente a Velneo!\n\nEsta funcionalidad se completará en la siguiente iteración.');
      
      // Volver al dashboard después del envío exitoso
      setCurrentPage('dashboard');
      resetWizard();
      
    } catch (error) {
      console.error('❌ Error enviando a Velneo:', error);
      alert('❌ Error enviando la póliza a Velneo. Por favor intenta nuevamente.');
    }
  };

  const handleWizardBack = () => {
    if (currentWizardStep === 'client') {
      setCurrentWizardStep('operation');
      setSelectedClient(undefined);
    } else if (currentWizardStep === 'company-section') {
      setCurrentWizardStep('client');
      setSelectedCompany(undefined);
      setSelectedSection(undefined);
    } else if (currentWizardStep === 'document-scan') {
      setCurrentWizardStep('company-section');
      setScannedDocument(undefined);
    } else if (currentWizardStep === 'form') {
      setCurrentWizardStep('document-scan');
      // No limpiar scannedDocument para mantener los datos
    }
  };

  // Renderizar contenido del wizard
  const renderWizardStep = () => {
    switch (currentWizardStep) {
      case 'operation':
        return (
          <OperationSelector
            onSelect={handleOperationSelect}
            selected={selectedOperation}
          />
        );
        
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
            selectedCompany={selectedCompany}
            selectedSection={selectedSection}
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
            <div>Error: Datos faltantes para el formulario</div>
          )
        );
        
      default:
        return <div>Paso no implementado aún</div>;
    }
  };

  // Componentes placeholder para páginas futuras
  const AnalyticsPage = () => (
    <div className="p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen">
      <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-gradient-to-br from-white to-purple-50">
        <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-center flex items-center justify-center text-xl">
            <div className="p-3 bg-white/20 rounded-full mr-3">
              <BarChart3 className="h-6 w-6" />
            </div>
            Analytics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-indigo-200 blur-3xl opacity-50 rounded-full"></div>
            <Construction className="relative h-20 w-20 text-purple-500 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Próximamente
          </h3>
          <p className="text-gray-700 leading-relaxed">
            El dashboard de analytics con métricas avanzadas, reportes interactivos y 
            seguimiento de facturación estará disponible en la próxima fase.
          </p>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 shadow-sm">
            Fase 2 del desarrollo
          </Badge>
        </CardContent>
      </Card>
    </div>
  );

  const BillingPage = () => (
    <div className="p-6 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 min-h-screen">
      <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-gradient-to-br from-white to-emerald-50">
        <CardHeader className="text-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="text-center flex items-center justify-center text-xl">
            <div className="p-3 bg-white/20 rounded-full mr-3">
              <DollarSign className="h-6 w-6" />
            </div>
            Sistema de Facturación
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-teal-200 blur-3xl opacity-50 rounded-full"></div>
            <Construction className="relative h-20 w-20 text-emerald-500 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            En Desarrollo
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Sistema automatizado de facturación por volumen de escaneos,
            con tiers de precios dinámicos y cobros mensuales automáticos.
          </p>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm">
            Modelo de negocio por escaneo
          </Badge>
        </CardContent>
      </Card>
    </div>
  );

  const HistoryPage = () => (
    <div className="p-6 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 min-h-screen">
      <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-gradient-to-br from-white to-orange-50">
        <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-t-lg">
          <CardTitle className="text-center flex items-center justify-center text-xl">
            <div className="p-3 bg-white/20 rounded-full mr-3">
              <Clock className="h-6 w-6" />
            </div>
            Historial de Pólizas
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-amber-200 blur-3xl opacity-50 rounded-full"></div>
            <Construction className="relative h-20 w-20 text-orange-500 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Próximamente
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Historial completo de todas las pólizas procesadas, con filtros avanzados,
            búsqueda inteligente y exportación de datos en múltiples formatos.
          </p>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 shadow-sm">
            Funcionalidad básica
          </Badge>
        </CardContent>
      </Card>
    </div>
  );

  const SettingsPage = () => (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 min-h-screen">
      <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="text-center bg-gradient-to-r from-gray-600 to-slate-700 text-white rounded-t-lg">
          <CardTitle className="text-center flex items-center justify-center text-xl">
            <div className="p-3 bg-white/20 rounded-full mr-3">
              <Settings className="h-6 w-6" />
            </div>
            Configuración del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-slate-200 blur-3xl opacity-50 rounded-full"></div>
            <Construction className="relative h-20 w-20 text-gray-500 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-slate-700 bg-clip-text text-transparent">
            En Planificación
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Configuraciones avanzadas de usuario, preferencias del sistema,
            gestión de permisos granular y configuración de integraciones externas.
          </p>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 shadow-sm">
            Funcionalidad futura
          </Badge>
        </CardContent>
      </Card>
    </div>
  );

  // Renderizar contenido principal según la página actual
  const renderMainContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onStartWizard={() => setCurrentPage('wizard')} />;
      
      case 'wizard':
        return (
          <div className="p-6">
            <WizardProgress 
              currentStep={currentWizardStep} 
              completedSteps={[]} 
            />
            {renderWizardStep()}
            
            {/* Debug info del wizard */}
            <div className="mt-8 p-4 bg-white rounded-lg shadow max-w-md mx-auto">
              <h3 className="font-semibold text-gray-800 mb-2">Debug Info:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Usuario: <strong>{user?.nombre}</strong></p>
                <p>Tenant: <strong>{user?.tenantId}</strong></p>
                <p>Paso actual: <strong>{currentWizardStep}</strong></p>
                {selectedOperation && (
                  <p>Operación: <strong>{selectedOperation}</strong></p>
                )}
                {selectedClient && (
                  <p>Cliente: <strong>{selectedClient.clinom}</strong></p>
                )}
                {selectedCompany && (
                  <p>Compañía: <strong>{selectedCompany.alias}</strong></p>
                )}
                {selectedSection && (
                  <p>Sección: <strong>{selectedSection.seccion}</strong></p>
                )}
                {scannedDocument && (
                  <p>Documento: <strong>{scannedDocument.archivo}</strong> ({scannedDocument.porcentajeCompletitud}%)</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Siguiente: {
                  currentWizardStep === 'form' ? 'Envío a Velneo' : 
                  currentWizardStep === 'document-scan' ? 'Formulario de datos' : 
                  'Completar wizard'
                }
              </p>
            </div>
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
        return <Dashboard onStartWizard={() => setCurrentPage('wizard')} />;
    }
  };

  return (
    <MainLayout 
      currentPage={currentPage} 
      onNavigate={handleNavigation}
    >
      {renderMainContent()}
    </MainLayout>
  );
};

// Componente principal que maneja autenticación
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

// Componente que decide mostrar Login o App principal
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <AuthenticatedApp /> : <LoginForm />;
};

export default App;