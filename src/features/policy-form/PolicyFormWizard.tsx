import { PolicyFormProvider, usePolicyFormContext } from './PolicyFormProvider';
import { TabNavigation } from './components/TabNavigation';
import { FormProgress } from './components/FormProgress';
import { FormActions } from './components/FormActions';

// Por ahora, importar tabs que ya existen o crear placeholders
// TODO: Crear estos componentes
// import { DatosBasicosTab } from './tabs/DatosBasicosTab';
// import { DatosPolizaTab } from './tabs/DatosPolizaTab';
// import { DatosVehiculoTab } from './tabs/DatosVehiculoTab';
// import { DatosCoberturaTab } from './tabs/DatosCoberturaTab';
// import { CondicionesPagoTab } from './tabs/CondicionesPagoTab';
// import { ObservacionesTab } from './tabs/ObservacionesTab';

// Tipos
import type { PolicyFormData } from '@/types/poliza';
import type { AzureProcessResponse } from '@/types/azureDocumentResult';
import type { ClienteDto, CompanyDto, SeccionDto } from '@/types/masterData';

// ===== PROPS =====
interface PolicyFormWizardProps {
  scannedData?: AzureProcessResponse | null;
  selectedClient?: ClienteDto | null;
  selectedCompany?: CompanyDto | null;
  selectedSection?: SeccionDto | null;
  onSubmit: (formData: PolicyFormData) => void;
  onBack?: () => void;
}

// ===== COMPONENTE INTERNO - CONTENIDO =====
function PolicyFormContent({ onBack }: { onBack?: () => void }) {
  const { 
    activeTab, 
    isLoading,
    masterData,
    selectedCompany,
    selectedClient
  } = usePolicyFormContext();

  // Renderizar la pestaña activa
  const renderActiveTab = () => {
    if (isLoading && (activeTab === 'datos_vehiculo' || activeTab === 'datos_cobertura')) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos maestros...</p>
          </div>
        </div>
      );
    }

    // Por ahora, mostrar un placeholder para las pestañas
    // TODO: Reemplazar con componentes reales cuando se creen
    switch (activeTab) {
      case 'datos_basicos':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Datos Básicos</h3>
            <p className="text-gray-600">
              Contenido de la pestaña Datos Básicos
            </p>
            {/* Aquí irá <DatosBasicosTab /> */}
          </div>
        );
      
      case 'datos_poliza':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Datos de Póliza</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Compañía seleccionada:</p>
                <p className="font-medium">{selectedCompany?.comalias || 'No seleccionada'}</p>
                <p className="text-sm text-gray-500">Código: {selectedCompany?.comcod || 'N/A'}</p>
              </div>
            </div>
            {/* Aquí irá <DatosPolizaTab /> */}
          </div>
        );
      
      case 'datos_vehiculo':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Datos del Vehículo</h3>
            {masterData ? (
              <p className="text-gray-600">Datos maestros cargados. Listo para seleccionar.</p>
            ) : (
              <p className="text-gray-600">Cargando datos maestros...</p>
            )}
            {/* Aquí irá <DatosVehiculoTab /> */}
          </div>
        );
      
      case 'datos_cobertura':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Datos de Cobertura</h3>
            <p className="text-gray-600">
              Contenido de la pestaña Cobertura
            </p>
            {/* Aquí irá <DatosCoberturaTab /> */}
          </div>
        );
      
      case 'condiciones_pago':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Condiciones de Pago</h3>
            <p className="text-gray-600">
              Contenido de la pestaña Condiciones de Pago
            </p>
            {/* Aquí irá <CondicionesPagoTab /> */}
          </div>
        );
      
      case 'observaciones':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Observaciones</h3>
            <p className="text-gray-600">
              Contenido de la pestaña Observaciones
            </p>
            {/* Aquí irá <ObservacionesTab /> */}
          </div>
        );
      
      default:
        return (
          <div className="p-6 text-center text-gray-500">
            Pestaña no encontrada
          </div>
        );
    }
  };

  return (
    <div className="policy-form-wizard max-w-7xl mx-auto p-6">
      {/* Header con progreso */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Formulario de Póliza
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete los datos de la póliza para enviar a Velneo
            </p>
          </div>
          <FormProgress />
        </div>

        {/* Información de contexto */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {selectedClient && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Cliente:</span>
              <span>{selectedClient.clinom}</span>
            </div>
          )}
          {selectedCompany && (
            <div className="flex items-center gap-1">
              <span className="font-medium">Compañía:</span>
              <span>{selectedCompany.comalias}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navegación de tabs y contenido */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <TabNavigation />
        
        {/* Contenido de la pestaña activa */}
        <div className="p-6">
          {renderActiveTab()}
        </div>

        {/* Acciones del formulario */}
        <FormActions onBack={onBack} />
      </div>
    </div>
  );
}

// ===== COMPONENTE PRINCIPAL =====
export function PolicyFormWizard({
  scannedData,
  selectedClient,
  selectedCompany,
  selectedSection,
  onSubmit,
  onBack
}: PolicyFormWizardProps) {
  // Wrapper para manejar el submit
  const handleSubmit = async (formData: PolicyFormData) => {
    try {
      // Aquí podrías agregar transformaciones adicionales si es necesario
      // Por ejemplo, agregar los datos de la compañía al enviar
      const dataToSend = {
        ...formData,
        // Agregar campos adicionales si es necesario para Velneo
        companiaId: selectedCompany?.id,
        companiaCodigo: selectedCompany?.comcod,
        companiaNombre: selectedCompany?.comalias,
        clienteId: selectedClient?.id,
        seccionId: selectedSection?.id
      };
      
      await onSubmit(dataToSend as PolicyFormData);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      throw error;
    }
  };

  return (
    <PolicyFormProvider
      scannedData={scannedData}
      selectedClient={selectedClient}
      selectedCompany={selectedCompany}
      selectedSection={selectedSection}
      onSubmit={handleSubmit}
    >
      <PolicyFormContent onBack={onBack} />
    </PolicyFormProvider>
  );
}

// Export default para compatibilidad con imports existentes
export default PolicyFormWizard;