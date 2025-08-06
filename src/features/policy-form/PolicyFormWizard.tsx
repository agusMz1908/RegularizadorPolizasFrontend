import { PolicyFormProvider, usePolicyFormContext } from './PolicyFormProvider';
import { TabNavigation } from './components/TabNavigation';
import { FormProgress } from './components/FormProgress';
import { FormActions } from './components/FormActions';

import { DatosBasicosTab } from './tabs/DatosBasicosTab';
import { DatosPolizaTab } from './tabs/DatosPolizaTab';
import { DatosVehiculoTab } from './tabs/DatosVehiculosTab'; 
import { DatosCoberturaTab } from './tabs/DatosCoberturaTab';
import { CondicionesPagoTab } from './tabs/CondicionesPagoTab';
import { ObservacionesTab } from './tabs/ObservacionesTab';

import type { PolicyFormData } from '@/types/poliza';
import type { AzureProcessResponse } from '@/types/azureDocumentResult';
import type { CompanyDto, SeccionDto } from '@/types/masterData';
import type { ClientDto } from '@/types/cliente';

interface PolicyFormWizardProps {
  scannedData?: AzureProcessResponse | null;
  selectedClient?: ClientDto | null;
  selectedCompany?: CompanyDto | null;
  selectedSection?: SeccionDto | null;
  onSubmit: (formData: PolicyFormData) => void;
  onBack?: () => void;
}

function PolicyFormContent({ onBack }: { onBack?: () => void }) {
  const { 
    activeTab, 
    isLoading,
    selectedCompany,
    selectedClient
  } = usePolicyFormContext();

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

    // Renderizar la pestaña correspondiente según el estado activo
    switch (activeTab) {
      case 'datos_basicos':
        return <DatosBasicosTab />;
      
      case 'datos_poliza':
        return <DatosPolizaTab />;
      
      case 'datos_vehiculo':
        return <DatosVehiculoTab />;
      
      case 'datos_cobertura':
        return <DatosCoberturaTab />;
      
      case 'condiciones_pago':
        return <CondicionesPagoTab />;
      
      case 'observaciones':
        return <ObservacionesTab />;
      
      default:
        return (
          <div className="p-6 text-center text-gray-500">
            <p>Pestaña no encontrada: {activeTab}</p>
          </div>
        );
    }
  };

  return (
    <div className="policy-form-wizard max-w-7xl mx-auto">
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

        {/* Información de contexto - Mostrar cliente y compañía seleccionados */}
        <div className="flex items-center gap-6 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
          {selectedClient && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Cliente:</span>
              <span className="text-gray-900">{selectedClient.clinom}</span>
              {selectedClient.id && (
                <span className="text-gray-500">({selectedClient.clinom})</span>
              )}
            </div>
          )}
          
          {selectedCompany && (
            <div className="flex items-center gap-2 border-l border-gray-300 pl-6">
              <span className="font-medium text-gray-700">Compañía:</span>
              <span className="text-gray-900">{selectedCompany.comalias}</span>
              {selectedCompany.comcod && (
                <span className="text-gray-500">({selectedCompany.comcod})</span>
              )}
            </div>
          )}
          
          {!selectedClient && !selectedCompany && (
            <span className="text-gray-500 italic">
              No se ha seleccionado cliente ni compañía
            </span>
          )}
        </div>
      </div>

      {/* Contenedor principal con navegación y contenido */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Navegación de pestañas */}
        <TabNavigation />
        
        {/* Línea divisoria */}
        <div className="border-b border-gray-200"></div>
        
        {/* Contenido de la pestaña activa */}
        <div className="p-6">
          {renderActiveTab()}
        </div>

        {/* Línea divisoria antes de las acciones */}
        <div className="border-t border-gray-200"></div>
        
        {/* Acciones del formulario */}
        <div className="p-6">
          <FormActions onBack={onBack} />
        </div>
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
  // Wrapper para manejar el submit con datos adicionales
  const handleSubmit = async (formData: PolicyFormData) => {
    try {
      // Agregar campos adicionales necesarios para Velneo
      const dataToSend = {
        ...formData,
        // Agregar IDs y códigos de entidades seleccionadas
        companiaId: selectedCompany?.id,
        companiaCodigo: selectedCompany?.comcod,
        companiaNombre: selectedCompany?.comalias,
        clienteId: selectedClient?.id,
        clienteCodigo: selectedClient?.id,
        clienteNombre: selectedClient?.clinom,
        seccionId: selectedSection?.id,
        seccionCodigo: selectedSection?.seccion,
        seccionNombre: selectedSection?.nombre
      };
      
      console.log('📤 Enviando formulario a Velneo:', dataToSend);
      await onSubmit(dataToSend as PolicyFormData);
    } catch (error) {
      console.error('❌ Error al enviar formulario:', error);
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