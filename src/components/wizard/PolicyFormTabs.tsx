import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePolicyForm } from '../../hooks/usePolicyForm';
import { FORM_TABS, TabsUtils } from '../../constants/formTabs';
import { 
  User, 
  FileText, 
  Car, 
  Shield, 
  CreditCard, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  MapPin, 
  Calendar, 
  UserCheck, 
  Briefcase, 
  Zap 
} from 'lucide-react';
import type { FormTabId } from '@/types/policyForm';
import { cn } from '@/lib/utils';

// Mapeo de iconos
const ICON_MAP = {
  User,
  FileText,
  Car,
  Shield,
  CreditCard,
  MessageSquare
};

// ✅ COMPONENTE FORMFIELD SIMPLIFICADO - INLINE
const FormField = ({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error, 
  type = "text", 
  icon,
  min,
  max,
  step
}: {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  type?: string;
  icon?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm font-medium flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <Input
      id={id}
      type={type}
      value={value || ''}
      onChange={(e) => {
        const val = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
        onChange(val);
      }}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className={cn(
        "w-full",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500"
      )}
    />
    {error && (
      <p className="text-sm text-red-600 flex items-center">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </p>
    )}
  </div>
);

// ✅ COMPONENTE SELECTFIELD SIMPLIFICADO - INLINE
const SelectField = ({ 
  id, 
  label, 
  value, 
  onChange, 
  options, 
  placeholder, 
  required = false, 
  error,
  loading = false,
  icon,
  isNumeric = false
}: {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: Array<{ id: string | number; name: string }>;
  placeholder?: string;
  required?: boolean;
  error?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  isNumeric?: boolean;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm font-medium flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {loading ? (
      <div className="h-10 bg-gray-100 rounded-md flex items-center justify-center">
        <span className="text-sm text-gray-500">Cargando opciones...</span>
      </div>
    ) : (
      <Select 
        value={String(value || '')} 
        onValueChange={(val) => {
          const newValue = isNumeric ? Number(val) : val;
          onChange(newValue);
        }}
      >
        <SelectTrigger className={cn("w-full", error && "border-red-500")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={String(option.id)}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
    {error && (
      <p className="text-sm text-red-600 flex items-center">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </p>
    )}
  </div>
);

// ✅ COMPONENTE INFOFIELD SIMPLIFICADO - INLINE
const InfoField = ({ 
  label, 
  value, 
  icon, 
  emptyText = 'No especificado' 
}: {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ReactNode;
  emptyText?: string;
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium flex items-center">
      {icon && <span className="mr-2 text-gray-500">{icon}</span>}
      {label}
    </Label>
    <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm text-gray-900">
      {value || emptyText}
    </div>
  </div>
);

// ✅ COMPONENTE FORMSECTION SIMPLIFICADO - INLINE
const FormSection = ({ 
  title, 
  description, 
  children 
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <Card className="border-gray-200">
    <CardHeader className="pb-3">
      <CardTitle className="text-base font-semibold text-gray-900">{title}</CardTitle>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </CardHeader>
    <CardContent className="pt-0">
      {children}
    </CardContent>
  </Card>
);

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
    const progress = formProgress?.byTab?.[tabId as FormTabId];
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
    const progress = formProgress?.byTab?.[tab.id as FormTabId];
    const hasErrors = progress?.errors > 0;
    
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={cn(
          "relative px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
          "flex items-center gap-3 min-w-0 flex-1",
          isActive 
            ? "bg-blue-50 text-blue-700 border-2 border-blue-200" 
            : hasErrors
              ? "bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100"
              : "bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50"
        )}
      >
        <Icon className={cn(
          "w-5 h-5 flex-shrink-0",
          isActive ? "text-blue-600" : hasErrors ? "text-red-600" : "text-gray-500"
        )} />
        
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
              Progreso general: <span className="font-semibold text-blue-600">{formProgress?.overall || 0}%</span>
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
            <Button
              onClick={onBack}
              variant="outline"
            >
              ← Volver
            </Button>
          )}
          
          {!isFirstTab && (
            <Button
              onClick={goToPreviousTab}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isLastTab ? (
            <Button
              onClick={goToNextTab}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={submitForm}
              disabled={!canSubmit}
              className={cn(
                "flex items-center gap-2 font-medium",
                canSubmit 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
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
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== COMPONENTES DE PESTAÑAS =====

function DatosBasicosTab({ formData, updateFormData, errors }: any) {
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

function DatosPolizaTab({ formData, updateFormData, errors, selectedCompany }: any) {
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
    </div>
  );
}

function DatosVehiculoTab({ formData, updateFormData, errors, masterOptions }: any) {
  // Preparar opciones de maestros con la estructura correcta
  const destinoOptions = masterOptions?.destinos?.map((item: any) => ({
    id: item.id,
    name: item.desnom || item.nombre || `Destino ${item.id}`
  })) || [];

  const combustibleOptions = masterOptions?.combustibles?.map((item: any) => ({
    id: item.id,
    name: item.name || `Combustible ${item.id}`
  })) || [];

  const calidadOptions = masterOptions?.calidades?.map((item: any) => ({
    id: item.id,
    name: item.caldsc || item.nombre || `Calidad ${item.id}`
  })) || [];

  const categoriaOptions = masterOptions?.categorias?.map((item: any) => ({
    id: item.id,
    name: item.catdsc || item.nombre || `Categoría ${item.id}`
  })) || [];

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

      {/* Sección 3: Características del Vehículo */}
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
            isNumeric={false}
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
    </div>
  );
}

function DatosCoberturaTab({ formData, updateFormData, errors, masterOptions }: any) {
  const monedaOptions = masterOptions?.monedas?.map((item: any) => ({
    id: item.id,
    name: `${item.nombre || 'Moneda'} ${item.codigo ? `(${item.codigo})` : ''}`
  })) || [];

  const departamentoOptions = [
    'MONTEVIDEO', 'ARTIGAS', 'CANELONES', 'CERRO LARGO', 'COLONIA', 
    'DURAZNO', 'FLORES', 'FLORIDA', 'LAVALLEJA', 'MALDONADO', 
    'PAYSANDÚ', 'RÍO NEGRO', 'RIVERA', 'ROCHA', 'SALTO', 
    'SAN JOSÉ', 'SORIANO', 'TACUAREMBÓ', 'TREINTA Y TRES'
  ].map(dept => ({ id: dept, name: dept }));

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos de la Cobertura</h3>

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
    </div>
  );
}

function CondicionesPagoTab({ formData, updateFormData, errors }: any) {
  const formaPagoOptions = [
    'Contado', 'Tarjeta de Crédito', 'Débito Automático', 
    'Cuotas', 'Financiado', 'Transferencia'
  ].map(item => ({ id: item, name: item }));

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Condiciones de Pago</h3>
      
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

function ObservacionesTab({ formData, updateFormData, errors }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Observaciones</h3>
      
      <FormSection 
        title="Observaciones Generales" 
        description="Notas adicionales sobre la póliza"
      >
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-sm font-medium text-gray-700">
              Observaciones
            </Label>
            
            <div className="relative">
              <Textarea
                id="observaciones"
                value={formData.observaciones || ''}
                onChange={(e) => updateFormData('observaciones', e.target.value)}
                placeholder="Ingrese cualquier observación adicional sobre la póliza..."
                rows={6}
                maxLength={1000}
                className="block w-full rounded-lg border-2 px-3 py-2 text-sm transition-colors border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-vertical"
              />
              
              <div className="absolute top-2 right-2">
                <MessageSquare className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            
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