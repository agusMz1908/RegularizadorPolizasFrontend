// src/App.tsx - Con autenticación Y CompanySectionSelector Y DocumentScanner
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import OperationSelector from './components/wizard/OperationSelector';
import ClientSelector from './components/wizard/ClientSelector';
import CompanySectionSelector from './components/wizard/CompanySectionSelector';
import DocumentScanner from './components/wizard/DocumentScanner';
import PolicyForm from './components/wizard/PolicyForm';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import type { OperationType } from './components/wizard/OperationSelector';
import type { ClientDto } from '../src/types/cliente';
import type { CompanyDto, SeccionDto } from '../src/types/maestros';
import type { AzureProcessResponse } from '../src/types/azureDocumentResult';

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
import './App.css';

// Crear el QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 1,
    },
  },
});

type WizardStep = 'operation' | 'client' | 'company-section' | 'document-scan' | 'form' | 'review';

// Componente principal protegido
const AuthenticatedApp: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<WizardStep>('operation');
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

  const handleOperationSelect = (operation: OperationType) => {
    setSelectedOperation(operation);
    console.log('Operación seleccionada:', operation);
    setCurrentStep('client');
  };

  const handleClientSelect = (client: ClientDto) => {
    setSelectedClient(client);
    console.log('Cliente seleccionado:', client);
    setCurrentStep('company-section');
  };

  const handleCompanySectionSelect = (company: CompanyDto, section: SeccionDto) => {
    setSelectedCompany(company);
    setSelectedSection(section);
    console.log('Compañía seleccionada:', company);
    console.log('Sección seleccionada:', section);
    setCurrentStep('document-scan');
  };

  const handleDocumentProcessed = (scannedData: AzureProcessResponse) => {
    setScannedDocument(scannedData);
    console.log('Documento escaneado:', scannedData);
    setCurrentStep('form');
  };

  const handleFormSubmit = async (formData: PolicyFormData) => {
    console.log('📋 Datos del formulario:', formData);
    console.log('🏢 Compañía:', selectedCompany);
    console.log('🚗 Sección:', selectedSection);
    console.log('📄 Documento escaneado:', scannedDocument);
    
    try {
      // Aquí irías al API de Velneo para crear la póliza
      // Por ahora solo logueamos los datos
      alert('✅ Póliza enviada exitosamente a Velneo!\n\nEsta funcionalidad se completará en la siguiente iteración.');
      
      // Resetear el wizard para una nueva póliza
      setCurrentStep('operation');
      setSelectedOperation(undefined);
      setSelectedClient(undefined);
      setSelectedCompany(undefined);
      setSelectedSection(undefined);
      setScannedDocument(undefined);
      
    } catch (error) {
      console.error('❌ Error enviando a Velneo:', error);
      alert('❌ Error enviando la póliza a Velneo. Por favor intenta nuevamente.');
    }
  };

  const handleBack = () => {
    if (currentStep === 'client') {
      setCurrentStep('operation');
      setSelectedClient(undefined);
    } else if (currentStep === 'company-section') {
      setCurrentStep('client');
      setSelectedCompany(undefined);
      setSelectedSection(undefined);
    } else if (currentStep === 'document-scan') {
      setCurrentStep('company-section');
      setScannedDocument(undefined);
    } else if (currentStep === 'form') {
      setCurrentStep('document-scan');
      // No limpiar scannedDocument para mantener los datos
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentStep('operation');
    setSelectedOperation(undefined);
    setSelectedClient(undefined);
    setSelectedCompany(undefined);
    setSelectedSection(undefined);
    setScannedDocument(undefined);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
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
            onBack={handleBack}
          />
        );

      case 'company-section':
        return (
          <CompanySectionSelector
            onSelect={handleCompanySectionSelect}
            selectedCompany={selectedCompany}
            selectedSection={selectedSection}
            onBack={handleBack}
          />
        );

      case 'document-scan':
        return (
          <DocumentScanner
            onDocumentProcessed={handleDocumentProcessed}
            onBack={handleBack}
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
              onBack={handleBack}
            />
          ) : (
            <div>Error: Datos faltantes para el formulario</div>
          )
        );
        
      default:
        return <div>Paso no implementado aún</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con info del usuario */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold text-gray-900">
                RegularizadorPolizas V2
              </h1>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {user?.tenantId}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Hola, <strong>{user?.nombre}</strong></span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">
        {renderCurrentStep()}
        
        {/* Debug info - remover después */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow max-w-md mx-auto">
          <h3 className="font-semibold text-gray-800 mb-2">Debug Info:</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Usuario: <strong>{user?.nombre}</strong></p>
            <p>Tenant: <strong>{user?.tenantId}</strong></p>
            <p>Paso actual: <strong>{currentStep}</strong></p>
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
              currentStep === 'form' ? 'Envío a Velneo' : 
              currentStep === 'document-scan' ? 'Formulario de datos' : 
              'Completar wizard'
            }
          </p>
        </div>
      </main>
    </div>
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