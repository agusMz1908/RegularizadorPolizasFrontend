import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, FileText, Car, Shield, CreditCard, MessageSquare, CheckCircle2, AlertCircle, 
  Building2, MapPin, Calendar, UserCheck, Briefcase, Database, RefreshCw, Eye, Loader2, Send,
  Clock, Fuel, Settings, Navigation, Sparkles, ArrowLeft,
  FileCheck,
  Info,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePolicyForm } from '@/hooks/usePolicyForm';
import { useTheme } from '@/context/ThemeContext';
import type { FormTabId } from '@/types/policyForm';
import { Alert, AlertDescription } from '../ui/alert';
import { Textarea } from '../ui/textarea';

// ===== PROPS DEL COMPONENTE =====
interface PolicyFormTabsProps {
  scannedData?: any;
  selectedClient?: any;
  selectedCompany?: any;
  selectedSection?: any;
  operationType?: 'EMISION' | 'RENOVACION' | 'CAMBIO';
  onSubmit?: (data: any) => void;
  onBack?: () => void;
}

// ===== COMPONENTE PRINCIPAL =====
export default function PolicyFormTabs({
  scannedData,
  selectedClient,
  selectedCompany,
  selectedSection,
  operationType = 'EMISION',
  onSubmit,
  onBack
}: PolicyFormTabsProps) {
  
  // Hook del tema
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Hook con toda la lógica del formulario
  const {
    formData,
    errors,
    touchedFields,
    masterData,
    loading,
    isSubmitting,
    activeTab,
    updateField,
    validateForm,
    submitForm,
    resetForm,
    loadMasterData,
    setActiveTab,
    progress,
    isDirty,
    canSubmit
  } = usePolicyForm({
    scannedData,
    selectedClient,
    selectedCompany,
    selectedSection,
    operationType
  });

  const [showDataOrigin, setShowDataOrigin] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Manejar el submit
  const handleSubmit = async () => {
    const result = await submitForm();
    if (result.success && onSubmit) {
      onSubmit(result.data);
    }
  };

  // ===== CONFIGURACIÓN DE TABS =====
  const tabs = [
    { id: 'datos_basicos', label: 'Básicos', icon: User, color: 'blue' },
    { id: 'datos_poliza', label: 'Póliza', icon: FileText, color: 'emerald' },
    { id: 'datos_vehiculo', label: 'Vehículo', icon: Car, color: 'purple' },
    { id: 'datos_cobertura', label: 'Cobertura', icon: Shield, color: 'orange' },
    { id: 'condiciones_pago', label: 'Pago', icon: CreditCard, color: 'green' },
    { id: 'observaciones', label: 'Notas', icon: MessageSquare, color: 'gray' }
  ];

  // ===== COMPONENTES DE UTILIDAD =====
  
  const FormSection = ({ title, description, children, icon }: any) => (
    <div className={cn(
      "rounded-xl p-5 mb-6 border transition-all",
      isDark 
        ? "bg-gray-900/50 border-gray-800 hover:border-gray-700" 
        : "bg-gray-50/50 border-gray-200 hover:border-gray-300"
    )}>
      <div className="mb-4 flex items-start gap-3">
        {icon && (
          <div className={cn(
            "p-2 rounded-lg",
            isDark ? "bg-gray-800" : "bg-white shadow-sm"
          )}>
            <span className="text-primary">{icon}</span>
          </div>
        )}
        <div className="flex-1">
          <h4 className={cn(
            "text-sm font-semibold",
            isDark ? "text-gray-200" : "text-gray-700"
          )}>{title}</h4>
          {description && (
            <p className={cn(
              "text-xs mt-1",
              isDark ? "text-gray-400" : "text-gray-500"
            )}>{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );

  const InfoField = ({ label, value, icon, className = "" }: any) => (
    <div className={cn("flex items-start gap-3", className)}>
      {icon && (
        <span className={cn(
          "mt-1",
          isDark ? "text-gray-500" : "text-gray-400"
        )}>{icon}</span>
      )}
      <div className="flex-1">
        <Label className={cn(
          "text-xs",
          isDark ? "text-gray-400" : "text-gray-500"
        )}>{label}</Label>
        <p className={cn(
          "text-sm font-medium mt-1",
          isDark ? "text-gray-100" : "text-gray-900"
        )}>{value || '-'}</p>
      </div>
    </div>
  );

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
    disabled = false,
    min,
    max,
    step,
    helperText
  }: any) => {
    const hasError = error && touchedFields.has(id);
    
    return (
      <div className="space-y-2">
        <Label htmlFor={id} className={cn(
          "text-sm font-medium flex items-center gap-2",
          isDark ? "text-gray-200" : "text-gray-700"
        )}>
          {icon && <span className="text-primary">{icon}</span>}
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
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={cn(
            "w-full transition-all",
            hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
            isDark && "bg-gray-900/50 border-gray-700 focus:border-primary",
            !isDark && "bg-white border-gray-300 focus:border-primary"
          )}
        />
        {helperText && !hasError && (
          <p className={cn(
            "text-xs",
            isDark ? "text-gray-400" : "text-gray-500"
          )}>{helperText}</p>
        )}
        {hasError && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  };

  const SelectField = ({ 
    id, 
    label, 
    value, 
    onChange, 
    options, 
    placeholder = "Seleccione una opción", 
    required = false, 
    error,
    loading = false,
    icon,
    disabled = false,
    helperText
  }: any) => {
    const hasError = error && touchedFields.has(id);
    
    return (
      <div className="space-y-2">
        <Label htmlFor={id} className={cn(
          "text-sm font-medium flex items-center gap-2",
          isDark ? "text-gray-200" : "text-gray-700"
        )}>
          {icon && <span className="text-primary">{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select 
          value={value?.toString() || ''} 
          onValueChange={onChange}
          disabled={disabled || loading || !options?.length}
        >
          <SelectTrigger className={cn(
            "w-full transition-all",
            hasError && "border-red-500 focus:border-red-500",
            isDark && "bg-gray-900/50 border-gray-700 hover:border-gray-600",
            !isDark && "bg-white border-gray-300 hover:border-gray-400"
          )}>
            <SelectValue placeholder={loading ? "Cargando..." : placeholder} />
          </SelectTrigger>
          <SelectContent className={cn(
            isDark && "bg-gray-900 border-gray-700",
            !isDark && "bg-white border-gray-200"
          )}>
            {options?.map((option: any) => (
              <SelectItem 
                key={option.id} 
                value={option.id.toString()}
                className={cn(
                  isDark && "focus:bg-gray-800",
                  !isDark && "focus:bg-gray-100"
                )}
              >
                {option.name || option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {helperText && !hasError && (
          <p className={cn(
            "text-xs",
            isDark ? "text-gray-400" : "text-gray-500"
          )}>{helperText}</p>
        )}
        {hasError && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  };

  // ===== RENDER PRINCIPAL =====
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* HEADER CON PROGRESO */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={cn(
              "text-3xl font-bold flex items-center gap-3",
              isDark ? "text-white" : "text-gray-900"
            )}>
              <Sparkles className="w-8 h-8 text-primary" />
              Formulario de Póliza - {operationType === 'EMISION' ? 'Nueva' : operationType}
            </h2>
            <p className={cn(
              "text-sm mt-2",
              isDark ? "text-gray-400" : "text-gray-600"
            )}>
              {selectedCompany?.comalias || 'BSE'} - {selectedSection?.seccion || 'AUTOMÓVILES'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDataOrigin(!showDataOrigin)}
              className={cn(
                isDark && "border-gray-700 hover:bg-gray-800",
                !isDark && "border-gray-300 hover:bg-gray-100"
              )}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showDataOrigin ? 'Ocultar' : 'Ver'} Origen
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowValidation(!showValidation)}
              className={cn(
                isDark && "border-gray-700 hover:bg-gray-800",
                !isDark && "border-gray-300 hover:bg-gray-100"
              )}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Validación
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMasterData}
              disabled={loading}
              className={cn(
                isDark && "border-gray-700 hover:bg-gray-800",
                !isDark && "border-gray-300 hover:bg-gray-100"
              )}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Recargar
            </Button>
          </div>
        </div>
        
        {/* BARRA DE PROGRESO */}
        <Card className={cn(
          "overflow-hidden",
          isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className={cn(
                "text-sm font-medium",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>Progreso del formulario</span>
              <div className="flex gap-3">
                <Badge variant={progress.required >= 100 ? "default" : "secondary"}>
                  Requeridos: {progress.required}%
                </Badge>
                <Badge variant={progress.total >= 75 ? "default" : "outline"}>
                  Total: {progress.total}%
                </Badge>
              </div>
            </div>
            <Progress 
              value={progress.total} 
              className={cn(
                "h-2",
                isDark ? "bg-gray-800" : "bg-gray-200"
              )}
            />
            
            {showDataOrigin && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                <Badge variant="outline" className="justify-center py-2">
                  <Database className="w-3 h-3 mr-1" />
                  Azure: {scannedData ? '45%' : '0%'}
                </Badge>
                <Badge variant="outline" className="justify-center py-2">
                  <User className="w-3 h-3 mr-1" />
                  Cliente: {selectedClient ? '25%' : '0%'}
                </Badge>
                <Badge variant="outline" className="justify-center py-2">
                  <Briefcase className="w-3 h-3 mr-1" />
                  Manual: 30%
                </Badge>
                <Badge variant="outline" className="justify-center py-2">
                  <Settings className="w-3 h-3 mr-1" />
                  Auto: {operationType !== 'EMISION' ? '15%' : '5%'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* PESTAÑAS DEL FORMULARIO */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FormTabId)} className="w-full">
        <TabsList className={cn(
          "grid w-full h-auto p-2 mb-6",
          `grid-cols-${tabs.length}`,
          isDark ? "bg-gray-900 border-gray-800" : "bg-gray-100 border-gray-200"
        )}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const tabProgress = progress.byTab?.[tab.id] || 0;
            
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex flex-col items-center gap-2 py-3 px-2 relative transition-all",
                  "data-[state=active]:shadow-lg",
                  isDark && "data-[state=active]:bg-gray-800 data-[state=active]:text-white",
                  !isDark && "data-[state=active]:bg-white data-[state=active]:text-primary"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isActive && `bg-${tab.color}-500/20 text-${tab.color}-500`,
                  !isActive && isDark && "bg-gray-800 text-gray-400",
                  !isActive && !isDark && "bg-gray-200 text-gray-600"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
                {tabProgress > 0 && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className={cn(
                      "h-1 rounded-full transition-all",
                      tabProgress === 100 ? "bg-green-500" : "bg-yellow-500"
                    )} style={{ width: `${tabProgress * 0.4}px` }} />
                  </div>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* CONTENIDO DE LAS PESTAÑAS */}
        <Card className={cn(
          "border-2",
          isDark ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"
        )}>
          <CardContent className="p-8">
            
            {/* PESTAÑA 1: DATOS BÁSICOS */}
            <TabsContent value="datos_basicos" className="mt-0">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className={cn(
                    "text-xl font-semibold flex items-center justify-center gap-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    <User className="w-6 h-6 text-blue-500" />
                    Datos Básicos
                  </h3>
                  <p className={cn(
                    "text-sm mt-1",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}>
                    Información del cliente y estado del trámite
                  </p>
                </div>
                
                <FormSection 
                  title="Información del Cliente" 
                  description="Datos del asegurado y tomador"
                  icon={<User className="w-4 h-4" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      onChange={(value: string) => updateField('dirCobro', value)}
                      placeholder="Opcional - Dejar vacío si es la misma"
                      error={errors.dirCobro}
                      icon={<MapPin className="w-4 h-4" />}
                      helperText="Solo completar si es diferente al domicilio"
                    />
                  </div>
                </FormSection>

                <FormSection 
                  title="Información del Trámite" 
                  description="Datos del corredor y estado"
                  icon={<Briefcase className="w-4 h-4" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id="corredor"
                      label="Corredor"
                      value={formData.corredor}
                      onChange={(value: string) => updateField('corredor', value)}
                      placeholder="Nombre del corredor"
                      required
                      error={errors.corredor}
                      icon={<Briefcase className="w-4 h-4" />}
                    />
                    
                    <SelectField
                      id="estadoTramite"
                      label="Estado del Trámite"
                      value={formData.estadoTramite}
                      onChange={(value: string) => updateField('estadoTramite', value)}
                      options={[
                        { id: 'Pendiente', name: 'Pendiente' },
                        { id: 'En proceso', name: 'En proceso' },
                        { id: 'Terminado', name: 'Terminado' },
                        { id: 'Modificaciones', name: 'Modificaciones' }
                      ]}
                      error={errors.estadoTramite}
                      icon={<Clock className="w-4 h-4" />}
                    />

                    <SelectField
                      id="tramite"
                      label="Tipo de Trámite"
                      value={formData.tramite}
                      onChange={(value: string) => updateField('tramite', value)}
                      options={[
                        { id: 'Nuevo', name: 'Nuevo' },
                        { id: 'Renovación', name: 'Renovación' },
                        { id: 'Cambio', name: 'Cambio' },
                        { id: 'Endoso', name: 'Endoso' }
                      ]}
                      required
                      error={errors.tramite}
                      icon={<FileText className="w-4 h-4" />}
                    />

                    <SelectField
                      id="estadoPoliza"
                      label="Estado de la Póliza"
                      value={formData.estadoPoliza}
                      onChange={(value: string) => updateField('estadoPoliza', value)}
                      options={[
                        { id: 'VIG', name: 'Vigente (VIG)' },
                        { id: 'ANT', name: 'Anulada (ANT)' },
                        { id: 'VEN', name: 'Vencida (VEN)' },
                        { id: 'END', name: 'Con Endoso (END)' }
                      ]}
                      required
                      error={errors.estadoPoliza}
                      icon={<Shield className="w-4 h-4" />}
                    />

                    <FormField
                      id="fecha"
                      label="Fecha de Gestión"
                      value={formData.fecha}
                      onChange={(value: string) => updateField('fecha', value)}
                      type="date"
                      error={errors.fecha}
                      icon={<Calendar className="w-4 h-4" />}
                    />

                    <SelectField
                      id="tipo"
                      label="Tipo de Línea"
                      value={formData.tipo}
                      onChange={(value: string) => updateField('tipo', value)}
                      options={[
                        { id: 'Líneas personales', name: 'Líneas personales' },
                        { id: 'Líneas comerciales', name: 'Líneas comerciales' }
                      ]}
                      error={errors.tipo}
                    />
                  </div>
                </FormSection>
              </div>
            </TabsContent>

            {/* PESTAÑA 2: DATOS DE LA PÓLIZA */}
            <TabsContent value="datos_poliza" className="mt-0">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className={cn(
                    "text-xl font-semibold flex items-center justify-center gap-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    <FileText className="w-6 h-6 text-emerald-500" />
                    Datos de la Póliza
                  </h3>
                  <p className={cn(
                    "text-sm mt-1",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}>
                    Información de la compañía y números de póliza
                  </p>
                </div>
                
                <FormSection 
                  title="Compañía y Sección" 
                  description="Configuración fija para BSE AUTOMÓVILES"
                  icon={<Building2 className="w-4 h-4" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField 
                      label="Compañía" 
                      value={`${formData.comalias} (ID: ${formData.compania})`} 
                      icon={<Building2 className="w-4 h-4" />} 
                    />
                    <InfoField 
                      label="Sección" 
                      value={`AUTOMÓVILES (ID: ${formData.seccion})`} 
                      icon={<Car className="w-4 h-4" />} 
                    />
                  </div>
                </FormSection>

                <FormSection 
                  title="Identificación de la Póliza" 
                  description="Números y fechas de vigencia"
                  icon={<FileText className="w-4 h-4" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id="poliza"
                      label="Número de Póliza"
                      value={formData.poliza}
                      onChange={(value: string) => updateField('poliza', value)}
                      placeholder="Ej: BSE-AUTO-2024-001234"
                      required
                      error={errors.poliza}
                      icon={<FileText className="w-4 h-4" />}
                    />

                    <FormField
                      id="certificado"
                      label="Certificado"
                      value={formData.certificado}
                      onChange={(value: string) => updateField('certificado', value)}
                      placeholder="Número de certificado (opcional)"
                      error={errors.certificado}
                    />

                    <FormField
                      id="endoso"
                      label="Endoso"
                      value={formData.endoso}
                      onChange={(value: string) => updateField('endoso', value)}
                      placeholder="0"
                      error={errors.endoso}
                      helperText={operationType === 'CAMBIO' ? 'Se incrementará automáticamente' : ''}
                    />

                    <div></div>

                    <FormField
                      id="desde"
                      label="Vigencia Desde"
                      value={formData.desde}
                      onChange={(value: string) => updateField('desde', value)}
                      type="date"
                      required
                      error={errors.desde}
                      icon={<Calendar className="w-4 h-4" />}
                    />

                    <FormField
                      id="hasta"
                      label="Vigencia Hasta"
                      value={formData.hasta}
                      onChange={(value: string) => updateField('hasta', value)}
                      type="date"
                      required
                      error={errors.hasta}
                      icon={<Calendar className="w-4 h-4" />}
                    />
                  </div>
                </FormSection>
              </div>
            </TabsContent>

            {/* PESTAÑA 3: DATOS DEL VEHÍCULO */}
            <TabsContent value="datos_vehiculo" className="mt-0">
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className={cn(
                    "text-xl font-semibold flex items-center justify-center gap-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    <Car className="w-6 h-6 text-purple-500" />
                    Datos del Vehículo
                  </h3>
                  <p className={cn(
                    "text-sm mt-1",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}>
                    Información completa del automóvil asegurado
                  </p>
                </div>
                
                <FormSection 
                  title="Identificación del Vehículo" 
                  description="Marca, modelo y datos técnicos"
                  icon={<Car className="w-4 h-4" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id="marcaModelo"
                      label="Marca y Modelo"
                      value={formData.marcaModelo}
                      onChange={(value: string) => updateField('marcaModelo', value)}
                      placeholder="Ej: VOLKSWAGEN GOL TREND"
                      required
                      error={errors.marcaModelo}
                      icon={<Car className="w-4 h-4" />}
                    />

                    <FormField
                      id="anio"
                      label="Año"
                      value={formData.anio}
                      onChange={(value: string) => updateField('anio', value)}
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      placeholder="Ej: 2020"
                      required
                      error={errors.anio}
                      icon={<Calendar className="w-4 h-4" />}
                    />

                    <FormField
                      id="matricula"
                      label="Matrícula"
                      value={formData.matricula}
                      onChange={(value: string) => updateField('matricula', value.toUpperCase())}
                      placeholder="Ej: ABC 1234"
                      error={errors.matricula}
                      helperText="Opcional pero recomendado"
                    />

                    <FormField
                      id="motor"
                      label="Motor"
                      value={formData.motor}
                      onChange={(value: string) => updateField('motor', value)}
                      placeholder="Número de motor"
                      error={errors.motor}
                    />

                    <FormField
                      id="chasis"
                      label="Chasis"
                      value={formData.chasis}
                      onChange={(value: string) => updateField('chasis', value)}
                      placeholder="Número de chasis"
                      error={errors.chasis}
                      className="md:col-span-2"
                    />
                  </div>
                </FormSection>

                <FormSection 
                  title="Características del Vehículo" 
                  description="Datos maestros específicos"
                  icon={<Settings className="w-4 h-4" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      id="categoriaId"
                      label="Categoría"
                      value={formData.categoriaId}
                      onChange={(value: string) => updateField('categoriaId', parseInt(value))}
                      options={masterData?.categorias?.map(cat => ({
                        id: cat.id,
                        name: cat.catdsc
                      })) || []}
                      placeholder="Seleccione categoría"
                      loading={loading}
                      error={errors.categoriaId}
                      icon={<Car className="w-4 h-4" />}
                    />

                    <SelectField
                      id="combustibleId"
                      label="Combustible"
                      value={formData.combustibleId}
                      onChange={(value: string) => updateField('combustibleId', value)}
                      options={masterData?.combustibles?.map(comb => ({
                        id: comb.id,
                        name: comb.name
                      })) || []}
                      placeholder="Seleccione combustible"
                      required
                      loading={loading}
                      error={errors.combustibleId}
                      icon={<Fuel className="w-4 h-4" />}
                    />

                    <SelectField
                      id="destinoId"
                      label="Destino/Uso"
                      value={formData.destinoId}
                      onChange={(value: string) => updateField('destinoId', parseInt(value))}
                      options={masterData?.destinos?.map(dest => ({
                        id: dest.id,
                        name: dest.desnom
                      })) || []}
                      placeholder="Seleccione destino"
                      required
                      loading={loading}
                      error={errors.destinoId}
                      icon={<Navigation className="w-4 h-4" />}
                    />

                    <SelectField
                      id="calidadId"
                      label="Calidad"
                      value={formData.calidadId}
                      onChange={(value: string) => updateField('calidadId', parseInt(value))}
                      options={masterData?.calidades?.map(cal => ({
                        id: cal.id,
                        name: cal.caldsc
                      })) || []}
                      placeholder="Seleccione calidad"
                      loading={loading}
                      error={errors.calidadId}
                      icon={<Shield className="w-4 h-4" />}
                    />
                  </div>
                </FormSection>
              </div>
            </TabsContent>

            {/* PESTAÑA 4: DATOS DE COBERTURA */}
          <TabsContent value="datos_cobertura" className="mt-0">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className={cn(
                  "text-xl font-semibold flex items-center justify-center gap-2",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  <Shield className="w-6 h-6 text-orange-500" />
                  Datos de Cobertura
                </h3>
                <p className={cn(
                  "text-sm mt-1",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}>
                  Zona de circulación y moneda
                </p>
              </div>
              
              <FormSection 
                title="Configuración de Cobertura"
                description="Detalles de la cobertura del vehículo"
                icon={<Shield className="w-4 h-4" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    id="zonaCirculacion"
                    label="Zona de Circulación"
                    value={formData.zonaCirculacion}
                    onChange={(value: string) => updateField('zonaCirculacion', value)}
                    placeholder="Ej: MONTEVIDEO"
                    error={errors.zonaCirculacion}
                    icon={<MapPin className="w-4 h-4" />}
                  />

                  <SelectField
                    id="monedaId"
                    label="Moneda"
                    value={formData.monedaId}
                    onChange={(value: string) => updateField('monedaId', parseInt(value))}
                    options={masterData?.monedas?.map(mon => ({
                      id: mon.id,
                      name: `${mon.nombre}${mon.codigo ? ` (${mon.codigo})` : ''}`
                    })) || []}
                    placeholder="Seleccione moneda"
                    required
                    loading={loading}
                    error={errors.monedaId}
                    icon={<DollarSign className="w-4 h-4" />}
                  />
                </div>
              </FormSection>
            </div>
          </TabsContent>

          {/* PESTAÑA 5: CONDICIONES DE PAGO */}
          <TabsContent value="condiciones_pago" className="mt-0">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className={cn(
                  "text-xl font-semibold flex items-center justify-center gap-2",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  <CreditCard className="w-6 h-6 text-green-500" />
                  Condiciones de Pago
                </h3>
                <p className={cn(
                  "text-sm mt-1",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}>
                  Premio y forma de pago
                </p>
              </div>
              
              <FormSection 
                title="Valores y Condiciones"
                description="Configure el premio y las condiciones de pago"
                icon={<DollarSign className="w-4 h-4" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    id="premio"
                    label="Premio"
                    value={formData.premio}
                    onChange={(value: number) => updateField('premio', value)}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                    error={errors.premio}
                    icon={<DollarSign className="w-4 h-4" />}
                  />

                  <SelectField
                    id="formaPago"
                    label="Forma de Pago"
                    value={formData.formaPago}
                    onChange={(value: string) => updateField('formaPago', value)}
                    options={[
                      { id: 'Contado', name: 'Contado' },
                      { id: 'Tarjeta de Crédito', name: 'Tarjeta de Crédito' },
                      { id: 'Débito Automático', name: 'Débito Automático' },
                      { id: 'Cuotas', name: 'Cuotas' },
                      { id: 'Financiado', name: 'Financiado' }
                    ]}
                    error={errors.formaPago}
                    icon={<CreditCard className="w-4 h-4" />}
                  />

                  <FormField
                    id="cuotas"
                    label="Cantidad de Cuotas"
                    value={formData.cuotas}
                    onChange={(value: number) => updateField('cuotas', value)}
                    type="number"
                    min="1"
                    max="12"
                    placeholder="1"
                    error={errors.cuotas}
                    disabled={formData.formaPago === 'Contado'}
                    helperText={formData.formaPago === 'Contado' ? 'No aplica para pago al contado' : ''}
                  />

                  <div className="space-y-2">
                    <Label className={cn(
                      "text-sm font-medium flex items-center gap-2",
                      isDark ? "text-gray-200" : "text-gray-700"
                    )}>
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Valor por Cuota
                    </Label>
                    <div className={cn(
                      "p-3 rounded-lg text-2xl font-bold",
                      isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
                    )}>
                      {masterData?.monedas?.find(m => m.id === formData.monedaId)?.simbolo || '$'} 
                      {formData.valorCuota.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Resumen financiero */}
                <div className={cn(
                  "mt-6 p-6 rounded-xl border-2",
                  isDark 
                    ? "bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-800" 
                    : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
                )}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className={cn(
                        "text-sm font-medium",
                        isDark ? "text-gray-300" : "text-gray-700"
                      )}>Total a Pagar:</span>
                      {formData.cuotas > 1 && (
                        <p className={cn(
                          "text-xs mt-1",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}>
                          {formData.cuotas} cuotas de {masterData?.monedas?.find(m => m.id === formData.monedaId)?.simbolo}{formData.valorCuota.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-3xl font-bold",
                        isDark ? "text-white" : "text-gray-900"
                      )}>
                        {masterData?.monedas?.find(m => m.id === formData.monedaId)?.simbolo || '$'} 
                        {formData.total.toFixed(2)}
                      </div>
                      <div className={cn(
                        "text-sm",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}>
                        {masterData?.monedas?.find(m => m.id === formData.monedaId)?.codigo || 'UYU'}
                      </div>
                    </div>
                  </div>
                </div>
              </FormSection>
            </div>
          </TabsContent>

          {/* PESTAÑA 6: OBSERVACIONES */}
          <TabsContent value="observaciones" className="mt-0">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className={cn(
                  "text-xl font-semibold flex items-center justify-center gap-2",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  <MessageSquare className="w-6 h-6 text-gray-500" />
                  Observaciones
                </h3>
                <p className={cn(
                  "text-sm mt-1",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}>
                  Notas adicionales o información relevante
                </p>
              </div>
              
              <FormSection 
                title="Notas y Comentarios"
                description="Agregue cualquier información adicional que considere relevante"
                icon={<MessageSquare className="w-4 h-4" />}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="observaciones" className={cn(
                      "text-sm font-medium flex items-center gap-2",
                      isDark ? "text-gray-200" : "text-gray-700"
                    )}>
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Observaciones Adicionales
                    </Label>
                    <Textarea
                      id="observaciones"
                      value={formData.observaciones}
                      onChange={(e) => updateField('observaciones', e.target.value)}
                      placeholder="Ingrese cualquier información adicional relevante para esta póliza..."
                      rows={8}
                      className={cn(
                        "resize-none transition-all",
                        isDark 
                          ? "bg-gray-900/50 border-gray-700 focus:border-primary placeholder-gray-500" 
                          : "bg-white border-gray-300 focus:border-primary placeholder-gray-400"
                      )}
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center">
                      <span className={cn(
                        "text-xs",
                        isDark ? "text-gray-500" : "text-gray-400"
                      )}>
                        Este campo es opcional
                      </span>
                      <span className={cn(
                        "text-xs",
                        formData.observaciones.length > 400 
                          ? "text-yellow-500" 
                          : isDark ? "text-gray-500" : "text-gray-400"
                      )}>
                        {formData.observaciones.length}/500 caracteres
                      </span>
                    </div>
                  </div>

                  {/* Sugerencias de observaciones según el tipo de operación */}
                  {operationType === 'CAMBIO' && !formData.observaciones && (
                    <Alert className={cn(
                      "border",
                      isDark 
                        ? "bg-yellow-900/20 border-yellow-800 text-yellow-300" 
                        : "bg-yellow-50 border-yellow-200 text-yellow-800"
                    )}>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Para operaciones de CAMBIO, se recomienda agregar observaciones sobre los motivos del cambio.
                      </AlertDescription>
                    </Alert>
                  )}

                  {operationType === 'RENOVACION' && !formData.observaciones && (
                    <Alert className={cn(
                      "border",
                      isDark 
                        ? "bg-blue-900/20 border-blue-800 text-blue-300" 
                        : "bg-blue-50 border-blue-200 text-blue-800"
                    )}>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Para RENOVACIONES, puede agregar notas sobre cambios en las condiciones o coberturas.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </FormSection>

              {/* Resumen de la operación */}
              <FormSection 
                title="Resumen de la Operación"
                description="Verificación final antes del envío"
                icon={<FileCheck className="w-4 h-4" />}
              >
                <div className={cn(
                  "p-4 rounded-lg space-y-2",
                  isDark ? "bg-gray-800" : "bg-gray-100"
                )}>
                  <div className="flex justify-between">
                    <span className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}>Tipo de Operación:</span>
                    <Badge variant="default">{operationType}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}>Cliente:</span>
                    <span className={cn(
                      "text-sm font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>{formData.asegurado || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}>Póliza:</span>
                    <span className={cn(
                      "text-sm font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>{formData.poliza || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}>Vehículo:</span>
                    <span className={cn(
                      "text-sm font-medium",
                      isDark ? "text-white" : "text-gray-900"
                    )}>{formData.marcaModelo || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}>Premio Total:</span>
                    <span className={cn(
                      "text-sm font-bold",
                      isDark ? "text-green-400" : "text-green-600"
                    )}>
                      {masterData?.monedas?.find(m => m.id === formData.monedaId)?.simbolo || '$'}
                      {formData.total.toFixed(2)} 
                      {' '}
                      {masterData?.monedas?.find(m => m.id === formData.monedaId)?.codigo || 'UYU'}
                    </span>
                  </div>
                </div>
              </FormSection>
            </div>
          </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {/* FOOTER CON ACCIONES */}
      <Card className={cn(
        "mt-6",
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
      )}>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              {onBack && (
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={onBack}
                  className={cn(
                    isDark && "border-gray-700 hover:bg-gray-800",
                    !isDark && "border-gray-300 hover:bg-gray-100"
                  )}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              )}
              <Button 
                variant="outline" 
                size="lg" 
                onClick={resetForm} 
                disabled={!isDirty}
                className={cn(
                  isDark && "border-gray-700 hover:bg-gray-800",
                  !isDark && "border-gray-300 hover:bg-gray-100"
                )}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="lg"
                onClick={validateForm}
                className={cn(
                  "border-2",
                  isDark && "border-green-800 hover:bg-green-900/50 text-green-400",
                  !isDark && "border-green-600 hover:bg-green-50 text-green-700"
                )}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Validar
              </Button>
              
              <Button 
                size="lg" 
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  "min-w-[160px] font-semibold",
                  canSubmit 
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg" 
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar a Velneo
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}