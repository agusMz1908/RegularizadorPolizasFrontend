import { usePolicyForm } from '../../hooks/usePolicyForm';
import { FORM_TABS, TabsUtils } from '../../constants/formTabs';
import { FormField, SelectField, InfoField, FormSection } from './FormComponents';
import { User, FileText, Car, Shield, CreditCard, MessageSquare, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Building2, MapPin, Calendar, UserCheck, Briefcase, Zap } from 'lucide-react';
import type { FormTabId, PolicyFormData } from '@/types/policyForm';
import type { MasterDataOptionsDto, SelectOption, DestinoDto, CombustibleDto, CalidadDto, CategoriaDto, MonedaDto } from '@/types/masterData';

// Mapeo de iconos
const ICON_MAP = {
  User,
  FileText,
  Car,
  Shield,
  CreditCard,
  MessageSquare
};

interface IntegratedPolicyFormProps {
  scannedData?: any;
  selectedClient: any;
  selectedCompany: any;
  selectedSection: any;
  onSubmit: (result: any) => void;
  onBack?: () => void;
}

export default function IntegratedPolicyForm({
  scannedData,
  selectedClient,
  selectedCompany,
  selectedSection,
  onSubmit,
  onBack
}: IntegratedPolicyFormProps) {
  const {
    formData,
    errors,
    activeTab,
    isSubmitting,
    canSubmit,
    loadingMasters,
    masterOptions,
    formProgress,
    updateFormData,
    setActiveTab,
    goToNextTab,
    goToPreviousTab,
    submitForm
  } = usePolicyForm({
    scannedData,
    selectedClient,
    selectedCompany,
    selectedSection,
    onSuccess: onSubmit,
    onError: (error) => console.error('Error en formulario:', error),
    onBack
  });

  // Renderizar indicador de progreso de pestaña
  const renderTabProgress = (tabId: string) => {
    const progress = formProgress.byTab[tabId as FormTabId];
    if (!progress) return null;

    const completion = progress.completion;
    const hasErrors = progress.errors > 0;

    return (
      <div className="flex items-center gap-1 text-xs">
        {hasErrors ? (
          <AlertCircle className="w-3 h-3 text-red-500" />
        ) : completion === 100 ? (
          <CheckCircle2 className="w-3 h-3 text-green-500" />
        ) : (
          <div className="w-3 h-3 rounded-full border-2 border-gray-300">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
        )}
        <span className={hasErrors ? 'text-red-600' : completion === 100 ? 'text-green-600' : 'text-gray-600'}>
          {completion}%
        </span>
      </div>
    );
  };

  // Renderizar pestaña
  const renderTab = (tab: any) => {
    const Icon = ICON_MAP[tab.icon as keyof typeof ICON_MAP];
    const isActive = activeTab === tab.id;
    const progress = formProgress.byTab[tab.id as FormTabId];
    const hasErrors = progress?.errors > 0;
    
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`
          relative px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
          flex items-center gap-3 min-w-0 flex-1
          ${isActive 
            ? 'bg-blue-50 text-blue-700 border-2 border-blue-200' 
            : hasErrors
              ? 'bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'
          }
        `}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : hasErrors ? 'text-red-600' : 'text-gray-500'}`} />
        
        <div className="flex-1 text-left">
          <div className="font-medium truncate">{tab.label}</div>
          <div className="text-xs text-gray-500 truncate">{tab.description}</div>
        </div>

        {renderTabProgress(tab.id)}
      </button>
    );
  };

  // Renderizar contenido de pestaña activa
  const renderTabContent = () => {
    if (loadingMasters) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando opciones de maestros...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'datos_basicos':
        return <DatosBasicosTab formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 'datos_poliza':
        return <DatosPolizaTab formData={formData} updateFormData={updateFormData} errors={errors} selectedCompany={selectedCompany} />;
      case 'datos_vehiculo':
        return <DatosVehiculoTab formData={formData} updateFormData={updateFormData} errors={errors} masterOptions={masterOptions} />;
      case 'datos_cobertura':
        return <DatosCoberturaTab formData={formData} updateFormData={updateFormData} errors={errors} masterOptions={masterOptions} />;
      case 'condiciones_pago':
        return <CondicionesPagoTab formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 'observaciones':
        return <ObservacionesTab formData={formData} updateFormData={updateFormData} errors={errors} />;
      default:
        return <div className="p-8 text-center text-gray-500">Pestaña no encontrada</div>;
    }
  };

  const isFirstTab = TabsUtils.isFirstTab(activeTab);
  const isLastTab = TabsUtils.isLastTab(activeTab);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Formulario de Póliza</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Progreso general: <span className="font-semibold text-blue-600">{formProgress.overall}%</span>
            </div>
            {scannedData && (
              <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <Zap className="w-4 h-4 inline mr-1" />
                Documento escaneado ({scannedData.porcentajeCompletitud}% completitud)
              </div>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <span className="font-medium">Cliente:</span> {selectedClient?.clinom || 'No seleccionado'} | 
          <span className="font-medium ml-2">Compañía:</span> {selectedCompany?.comalias || 'No seleccionada'}
        </div>
      </div>

      {/* Pestañas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
        {FORM_TABS.map(renderTab)}
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="min-h-[500px] bg-gray-50 rounded-lg p-6">
        {renderTabContent()}
      </div>

      {/* Navegación y acciones */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Volver
            </button>
          )}
          
          {!isFirstTab && (
            <button
              onClick={goToPreviousTab}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isLastTab ? (
            <button
              onClick={goToNextTab}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submitForm}
              disabled={!canSubmit}
              className={`
                px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                ${canSubmit 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Enviar a Velneo
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== COMPONENTES DE PESTAÑAS CON TIPOS CORREGIDOS =====

interface TabProps {
  formData: PolicyFormData;
  updateFormData: (field: keyof PolicyFormData, value: any) => void;
  errors: Record<string, string>;
}

interface TabPropsWithCompany extends TabProps {
  selectedCompany: any;
}

interface TabPropsWithMasters extends TabProps {
  masterOptions: MasterDataOptionsDto | null;
}

function DatosBasicosTab({ formData, updateFormData, errors }: TabProps) {
  // Opciones para los selects de texto plano
  const estadosTramiteOptions = [
    'Pendiente', 'En proceso', 'Terminado', 'Modificaciones'
  ].map(item => ({ id: item, name: item }));

  const tiposTramiteOptions = [
    'Nuevo', 'Renovación', 'Cambio', 'Endoso'
  ].map(item => ({ id: item, name: item }));

  const estadosPolizaOptions = [
    'VIG', 'ANT', 'VEN', 'END', 'ELIM', 'FIN'
  ].map(item => ({ id: item, name: item }));

  const tiposOptions = [
    { id: 'Líneas personales', name: 'Líneas personales' },
    { id: 'Líneas comerciales', name: 'Líneas comerciales' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Básicos</h3>
      
      {/* Sección 1: Información del Cliente */}
      <FormSection 
        title="Información del Cliente" 
        description="Datos del asegurado y tomador"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField
            label="Asegurado"
            value={formData.asegurado}
            icon={<User className="w-4 h-4" />}
          />
          
          <InfoField
            label="Tomador"
            value={formData.tomador}
            icon={<UserCheck className="w-4 h-4" />}
          />
          
          <InfoField
            label="Domicilio"
            value={formData.domicilio}
            icon={<MapPin className="w-4 h-4" />}
          />
          
          <FormField
            id="dirCobro"
            label="Dirección de Cobro"
            value={formData.dirCobro}
            onChange={(value) => updateFormData('dirCobro', value)}
            placeholder="Dirección para el cobro (opcional)"
            error={errors.dirCobro}
            icon={<MapPin className="w-4 h-4" />}
          />
        </div>
      </FormSection>

      {/* Sección 2: Datos del Corredor */}
      <FormSection 
        title="Datos del Corredor" 
        description="Información del corredor responsable"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="corredor"
            label="Corredor"
            value={formData.corredor}
            onChange={(value) => updateFormData('corredor', value)}
            placeholder="Nombre del corredor"
            required={true}
            error={errors.corredor}
            icon={<Building2 className="w-4 h-4" />}
          />
          
          <FormField
            id="asignado"
            label="Asignado"
            value={formData.asignado}
            onChange={(value) => updateFormData('asignado', value)}
            placeholder="Usuario asignado (opcional)"
            error={errors.asignado}
            icon={<User className="w-4 h-4" />}
          />
        </div>
      </FormSection>

      {/* Sección 3: Estado y Tipo de Trámite */}
      <FormSection 
        title="Estado y Tipo de Trámite" 
        description="Configuración del trámite y estado"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SelectField
            id="estadoTramite"
            label="Estado del Trámite"
            value={formData.estadoTramite}
            onChange={(value) => updateFormData('estadoTramite', value)}
            options={estadosTramiteOptions}
            required={true}
            error={errors.estadoTramite}
            icon={<FileText className="w-4 h-4" />}
          />
          
          <SelectField
            id="tramite"
            label="Tipo de Trámite"
            value={formData.tramite}
            onChange={(value) => updateFormData('tramite', value)}
            options={tiposTramiteOptions}
            required={true}
            error={errors.tramite}
            icon={<Briefcase className="w-4 h-4" />}
          />
          
          <SelectField
            id="tipo"
            label="Tipo"
            value={formData.tipo}
            onChange={(value) => updateFormData('tipo', value)}
            options={tiposOptions}
            required={true}
            error={errors.tipo}
            icon={<Briefcase className="w-4 h-4" />}
          />
        </div>
      </FormSection>

      {/* Sección 4: Estado de la Póliza y Fecha */}
      <FormSection 
        title="Estado de la Póliza" 
        description="Estado actual y fecha de gestión"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            id="estadoPoliza"
            label="Estado de la Póliza"
            value={formData.estadoPoliza}
            onChange={(value) => updateFormData('estadoPoliza', value)}
            options={estadosPolizaOptions}
            required={true}
            error={errors.estadoPoliza}
            icon={<Shield className="w-4 h-4" />}
          />
          
          <FormField
            id="fecha"
            label="Fecha de Gestión"
            value={formData.fecha}
            onChange={(value) => updateFormData('fecha', value)}
            type="date"
            error={errors.fecha}
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>
      </FormSection>
    </div>
  );
}

function DatosPolizaTab({ formData, updateFormData, errors, selectedCompany }: TabPropsWithCompany) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos de la Póliza</h3>
      
      {/* Sección 1: Información de la Compañía */}
      <FormSection 
        title="Información de la Compañía" 
        description="Compañía aseguradora seleccionada"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField
            label="Compañía"
            value={selectedCompany?.comalias || selectedCompany?.nombre || 'No seleccionada'}
            icon={<Building2 className="w-4 h-4" />}
          />
          
          <InfoField
            label="Código"
            value={selectedCompany?.comcod || 'N/A'}
            icon={<FileText className="w-4 h-4" />}
          />
        </div>
      </FormSection>

      {/* Sección 2: Números de Póliza y Certificado */}
      <FormSection 
        title="Identificación de la Póliza" 
        description="Números de póliza y certificado"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="poliza"
            label="Número de Póliza"
            value={formData.poliza}
            onChange={(value) => updateFormData('poliza', value)}
            placeholder="Número de póliza"
            required={true}
            error={errors.poliza}
            icon={<FileText className="w-4 h-4" />}
          />
          
          <FormField
            id="certificado"
            label="Certificado"
            value={formData.certificado}
            onChange={(value) => updateFormData('certificado', value)}
            placeholder="Número de certificado (opcional)"
            error={errors.certificado}
            icon={<FileText className="w-4 h-4" />}
          />
        </div>
      </FormSection>

      {/* Sección 3: Vigencia de la Póliza */}
      <FormSection 
        title="Vigencia de la Póliza" 
        description="Fechas de inicio y fin de vigencia"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="desde"
            label="Vigencia Desde"
            value={formData.desde}
            onChange={(value) => updateFormData('desde', value)}
            type="date"
            required={true}
            error={errors.desde}
            icon={<Calendar className="w-4 h-4" />}
          />
          
          <FormField
            id="hasta"
            label="Vigencia Hasta"
            value={formData.hasta}
            onChange={(value) => updateFormData('hasta', value)}
            type="date"
            required={true}
            error={errors.hasta}
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>
      </FormSection>

      {/* Información de ayuda */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-green-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-green-900 mb-1">Datos de la póliza</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• El <strong>número de póliza</strong> puede ser extraído automáticamente del documento</li>
              <li>• Las <strong>fechas de vigencia</strong> definen el período de cobertura</li>
              <li>• El <strong>certificado</strong> es opcional pero puede ser requerido por algunas compañías</li>
              <li>• La fecha hasta debe ser posterior a la fecha desde</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function DatosVehiculoTab({ formData, updateFormData, errors, masterOptions }: TabPropsWithMasters) {
  // ✅ CORREGIDO: Usar nombres exactos de campos del backend
  const destinoOptions: SelectOption[] = masterOptions?.Destinos?.map((item: DestinoDto) => ({
    id: item.id,
    name: item.desnom  // ← Campo correcto del backend
  })) || [];

  const combustibleOptions: SelectOption[] = masterOptions?.Combustibles?.map((item: CombustibleDto) => ({
    id: item.id,       // ← STRING para combustibles
    name: item.name    // ← Campo correcto del backend
  })) || [];

  const calidadOptions: SelectOption[] = masterOptions?.Calidades?.map((item: CalidadDto) => ({
    id: item.id,
    name: item.caldsc  // ← Campo correcto del backend
  })) || [];

  const categoriaOptions: SelectOption[] = masterOptions?.Categorias?.map((item: CategoriaDto) => ({
    id: item.id,
    name: item.catdsc  // ← Campo correcto del backend
  })) || [];

  // ✅ DEBUG MEJORADO
  console.log('🔍 [COMPONENT] Debug masterOptions:', {
    exists: !!masterOptions,
    destinos: masterOptions?.Destinos?.length || 0,
    combustibles: masterOptions?.Combustibles?.length || 0,
    calidades: masterOptions?.Calidades?.length || 0,
    categorias: masterOptions?.Categorias?.length || 0,
    
    // Ejemplos de datos
    sampleDestino: masterOptions?.Destinos?.[0],
    sampleCombustible: masterOptions?.Combustibles?.[0],
    
    // Opciones procesadas
    destinoOptionsLength: destinoOptions.length,
    combustibleOptionsLength: combustibleOptions.length
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Car className="w-5 h-5 text-blue-600" />
        Datos del Vehículo
      </h3>
      
      {/* Sección 1: Identificación del Vehículo */}
      <FormSection 
        title="Identificación del Vehículo" 
        description="Marca, modelo y año del vehículo"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="marcaModelo"
            label="Marca - Modelo"
            value={formData.marcaModelo}
            onChange={(value) => updateFormData('marcaModelo', value)}
            placeholder="Ej: Toyota Corolla"
            required={true}
            error={errors.marcaModelo}
            icon={<Car className="w-4 h-4" />}
          />
          
          <FormField
            id="anio"
            label="Año"
            value={formData.anio}
            onChange={(value) => updateFormData('anio', value)}
            placeholder="Ej: 2020"
            required={true}
            error={errors.anio}
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>
      </FormSection>

      {/* Sección 2: Documentación del Vehículo */}
      <FormSection 
        title="Documentación del Vehículo" 
        description="Matrícula y números de identificación"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            id="matricula"
            label="Matrícula"
            value={formData.matricula}
            onChange={(value) => updateFormData('matricula', value)}
            placeholder="Ej: ABC-1234"
            error={errors.matricula}
            icon={<FileText className="w-4 h-4" />}
          />
          
          <FormField
            id="motor"
            label="Motor"
            value={formData.motor}
            onChange={(value) => updateFormData('motor', value)}
            placeholder="Número de motor"
            error={errors.motor}
            icon={<Car className="w-4 h-4" />}
          />
          
          <FormField
            id="chasis"
            label="Chasis"
            value={formData.chasis}
            onChange={(value) => updateFormData('chasis', value)}
            placeholder="Número de chasis"
            error={errors.chasis}
            icon={<FileText className="w-4 h-4" />}
          />
        </div>
      </FormSection>

      {/* Sección 3: Características del Vehículo - CORREGIDA */}
      <FormSection 
        title="Características del Vehículo" 
        description="Destino, combustible, calidad y categoría"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            id="destinoId"
            label="Destino"
            value={formData.destinoId}
            onChange={(value) => updateFormData('destinoId', value)}
            options={destinoOptions}
            placeholder="Seleccionar destino"
            required={true}
            error={errors.destinoId}
            loading={!masterOptions}
            isNumeric={true}
            icon={<Car className="w-4 h-4" />}
          />
          
          <SelectField
            id="combustibleId"
            label="Combustible"
            value={formData.combustibleId}
            onChange={(value) => updateFormData('combustibleId', value)}
            options={combustibleOptions}
            placeholder="Seleccionar combustible"
            required={true}
            error={errors.combustibleId}
            loading={!masterOptions}
            isNumeric={false}  // ← ID string
            icon={<Zap className="w-4 h-4" />}
          />
          
          <SelectField
            id="calidadId"
            label="Calidad"
            value={formData.calidadId}
            onChange={(value) => updateFormData('calidadId', value)}
            options={calidadOptions}
            placeholder="Seleccionar calidad"
            required={true}
            error={errors.calidadId}
            loading={!masterOptions}
            isNumeric={true}
            icon={<Shield className="w-4 h-4" />}
          />
          
          <SelectField
            id="categoriaId"
            label="Categoría"
            value={formData.categoriaId}
            onChange={(value) => updateFormData('categoriaId', value)}
            options={categoriaOptions}
            placeholder="Seleccionar categoría"
            required={true}
            error={errors.categoriaId}
            loading={!masterOptions}
            isNumeric={true}
            icon={<Car className="w-4 h-4" />}
          />
        </div>
      </FormSection>

      {/* ✅ DEBUG: Mostrar información de los maestros para verificar */}
      {process.env.NODE_ENV === 'development' && masterOptions && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">🔍 Debug - Maestros cargados:</h4>
          <div className="text-xs text-yellow-800 space-y-1">
            <div>Destinos: {destinoOptions.length} opciones</div>
            <div>Combustibles: {combustibleOptions.length} opciones</div>
            <div>Calidades: {calidadOptions.length} opciones</div>
            <div>Categorías: {categoriaOptions.length} opciones</div>
            
            {destinoOptions.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer">Ver destinos:</summary>
                <div className="mt-1 max-h-20 overflow-y-auto">
                  {destinoOptions.slice(0, 3).map((d: SelectOption) => (
                    <div key={d.id}>ID: {d.id}, Nombre: {d.name}</div>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      )}

      {/* Información de ayuda */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-purple-600 mt-0.5">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-purple-900 mb-1">Datos del vehículo</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• <strong>Marca-Modelo</strong> pueden ser extraídos automáticamente del documento</li>
              <li>• <strong>Matrícula</strong> es opcional si el vehículo no está matriculado aún</li>
              <li>• Los campos de <strong>maestros</strong> (destino, combustible, etc.) son requeridos</li>
              <li>• El <strong>destino</strong> define el uso del vehículo (particular, comercial, etc.)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function DatosCoberturaTab({ formData, updateFormData, errors, masterOptions }: TabPropsWithMasters) {
  
  // ✅ CORREGIDO: Usar monedas reales del backend
  const monedaOptions: SelectOption[] = masterOptions?.Monedas?.map((item: MonedaDto) => ({
    id: item.id,
    name: `${item.nombre}${item.simbolo ? ` (${item.simbolo})` : ''}${item.codigo ? ` [${item.codigo}]` : ''}`
  })) || [];

  // Opciones de departamentos de Uruguay
  const departamentoOptions = [
    'MONTEVIDEO', 'ARTIGAS', 'CANELONES', 'CERRO LARGO', 'COLONIA', 
    'DURAZNO', 'FLORES', 'FLORIDA', 'LAVALLEJA', 'MALDONADO', 
    'PAYSANDÚ', 'RÍO NEGRO', 'RIVERA', 'ROCHA', 'SALTO', 
    'SAN JOSÉ', 'SORIANO', 'TACUAREMBÓ', 'TREINTA Y TRES'
  ].map(dept => ({ id: dept, name: dept }));

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos de la Cobertura</h3>

      {/* Sección 2: Zona de Circulación */}
      <FormSection 
        title="Zona de Circulación" 
        description="Departamento donde circula principalmente el vehículo"
      >
        <div className="grid grid-cols-1 gap-6">
          <SelectField
            id="zonaCirculacion"
            label="Zona de Circulación"
            value={formData.zonaCirculacion}
            onChange={(value) => updateFormData('zonaCirculacion', value)}
            options={departamentoOptions}
            placeholder="Seleccionar departamento"
            required={true}
            error={errors.zonaCirculacion}
            icon={<MapPin className="w-4 h-4" />}
          />
        </div>
      </FormSection>

      {/* Sección 3: Moneda */}
      <FormSection 
        title="Moneda" 
        description="Moneda en la que se emite la póliza"
      >
        <div className="grid grid-cols-1 gap-6">
          <SelectField
            id="monedaId"
            label="Moneda"
            value={formData.monedaId}
            onChange={(value) => updateFormData('monedaId', value)}
            options={monedaOptions}
            placeholder="Seleccionar moneda"
            required={true}
            error={errors.monedaId}
            loading={!masterOptions}
            isNumeric={true}
            icon={<FileText className="w-4 h-4" />}
          />
        </div>
      </FormSection>

      {/* Información de ayuda */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-orange-600 mt-0.5">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-orange-900 mb-1">Información de cobertura</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• La <strong>zona de circulación</strong> puede afectar el costo de la prima</li>
              <li>• La <strong>moneda</strong> determina en qué divisa se factura la póliza</li>
              <li>• Estos datos son importantes para el cálculo de la prima</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function CondicionesPagoTab({ formData, updateFormData, errors }: TabProps) {
  // Opciones de forma de pago
  const formaPagoOptions = [
    'Contado', 'Tarjeta de Crédito', 'Débito Automático', 
    'Cuotas', 'Financiado', 'Transferencia'
  ].map(item => ({ id: item, name: item }));

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Condiciones de Pago</h3>
      
      {/* Sección 1: Forma de Pago */}
      <FormSection 
        title="Forma de Pago" 
        description="Método de pago seleccionado"
      >
        <div className="grid grid-cols-1 gap-6">
          <SelectField
            id="formaPago"
            label="Forma de Pago"
            value={formData.formaPago}
            onChange={(value) => updateFormData('formaPago', value)}
            options={formaPagoOptions}
            placeholder="Seleccionar forma de pago"
            required={true}
            error={errors.formaPago}
            icon={<CreditCard className="w-4 h-4" />}
          />
        </div>
      </FormSection>

      {/* Sección 2: Importes */}
      <FormSection 
        title="Importes de la Póliza" 
        description="Premio, total y valores financieros"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="premio"
            label="Premio"
            value={formData.premio}
            onChange={(value) => updateFormData('premio', value)}
            type="number"
            placeholder="0.00"
            required={true}
            error={errors.premio}
            icon={<FileText className="w-4 h-4" />}
            min={0}
            step={0.01}
          />
          
          <FormField
            id="total"
            label="Total"
            value={formData.total}
            onChange={(value) => updateFormData('total', value)}
            type="number"
            placeholder="0.00"
            required={true}
            error={errors.total}
            icon={<FileText className="w-4 h-4" />}
            min={0}
            step={0.01}
          />
        </div>
      </FormSection>

      {/* Sección 3: Financiamiento */}
      <FormSection 
        title="Condiciones de Financiamiento" 
        description="Cantidad de cuotas y valor"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="cuotas"
            label="Cantidad de Cuotas"
            value={formData.cuotas}
            onChange={(value) => updateFormData('cuotas', value)}
            type="number"
            placeholder="1"
            required={true}
            error={errors.cuotas}
            icon={<CreditCard className="w-4 h-4" />}
            min={1}
            max={48}
          />
          
          <FormField
            id="valorCuota"
            label="Valor de la Cuota"
            value={formData.valorCuota}
            onChange={(value) => updateFormData('valorCuota', value)}
            type="number"
            placeholder="0.00"
            error={errors.valorCuota}
            icon={<FileText className="w-4 h-4" />}
            min={0}
            step={0.01}
          />
        </div>
      </FormSection>
    </div>
  );
}

function ObservacionesTab({ formData, updateFormData, errors }: TabProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h3>
      
      {/* Sección de Observaciones */}
      <FormSection 
        title="Observaciones Generales" 
        description="Notas adicionales sobre la póliza"
      >
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
              Observaciones
            </label>
            
            <div className="relative">
              <textarea
                id="observaciones"
                value={formData.observaciones || ''}
                onChange={(e) => updateFormData('observaciones', e.target.value)}
                placeholder="Ingrese cualquier observación adicional sobre la póliza..."
                rows={6}
                maxLength={1000}
                className="block w-full rounded-lg border-2 px-3 py-2 text-sm transition-colors border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-vertical"
              />
              
              {/* Icono */}
              <div className="absolute top-2 right-2">
                <MessageSquare className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            {/* Contador de caracteres */}
            <div className="text-xs text-gray-500 text-right">
              {(formData.observaciones || '').length}/1000 caracteres
            </div>
            
            {errors.observaciones && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.observaciones}
              </p>
            )}
          </div>
        </div>
      </FormSection>
    </div>
  );
}