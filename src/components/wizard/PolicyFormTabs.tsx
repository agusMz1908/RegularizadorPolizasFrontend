// src/components/wizard/PolicyFormTabs.tsx

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, FileText, Car, Shield, CreditCard, MessageSquare, CheckCircle2, AlertCircle, 
  Building2, MapPin, Calendar, UserCheck, Briefcase, Database, RefreshCw, Eye, Loader2, Send,
  Clock, Fuel, Settings, Navigation, Sparkles, ArrowLeft,
  Info,
  DollarSign,
  Hash,
  Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePolicyForm } from '@/hooks/usePolicyForm';
import { useTheme } from '@/context/ThemeContext';
import type { FormTabId } from '@/types/policyForm';
import { CuotasDesglose, ResumenOperacion } from './components';

// 🔧 IMPORTAR LOS COMPONENTES EXTRAÍDOS
import { 
  FormSection, 
  InfoField, 
  FormField, 
  SelectField 
} from './PolicyFormComponents';

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

  useEffect(() => {
    console.log('🎯 PolicyFormTabs - Props recibidos:', {
      tieneScannedData: !!scannedData,
      scannedDataCompleto: scannedData,
      condicionesPago: scannedData?.datosVelneo?.condicionesPago,
      premio: scannedData?.datosVelneo?.condicionesPago?.premio,
      total: scannedData?.datosVelneo?.condicionesPago?.total
    });
  }, [scannedData]);
  
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

  // 🔧 HANDLERS INDIVIDUALES MEMOIZADOS

  // Handlers para Condiciones de Pago
  const handlePremioChange = useCallback((value: any) => {
    updateField('premio', parseFloat(value) || 0);
  }, [updateField]);

  const handleTotalChange = useCallback((value: any) => {
    updateField('total', parseFloat(value) || 0);
  }, [updateField]);

  const handleCuotasChange = useCallback((value: any) => {
    updateField('cuotas', parseInt(value) || 1);
  }, [updateField]);

  const handleValorCuotaChange = useCallback((value: any) => {
    updateField('valorCuota', parseFloat(value) || 0);
  }, [updateField]);

  const handleFormaPagoChange = useCallback((value: any) => {
    updateField('formaPago', value);
  }, [updateField]);

  const handleMonedaIdChange = useCallback((value: any) => {
    updateField('monedaId', parseInt(value));
  }, [updateField]);

  // Handlers para Datos Básicos
  const handleCorredorChange = useCallback((value: any) => {
    updateField('corredor', value);
  }, [updateField]);

  const handleDirCobroChange = useCallback((value: any) => {
    updateField('dirCobro', value);
  }, [updateField]);

  const handleEstadoTramiteChange = useCallback((value: any) => {
    updateField('estadoTramite', value);
  }, [updateField]);

  const handleTramiteChange = useCallback((value: any) => {
    updateField('tramite', value);
  }, [updateField]);

  const handleEstadoPolizaChange = useCallback((value: any) => {
    updateField('estadoPoliza', value);
  }, [updateField]);

  const handleFechaChange = useCallback((value: any) => {
    updateField('fecha', value);
  }, [updateField]);

  const handleTipoChange = useCallback((value: any) => {
    updateField('tipo', value);
  }, [updateField]);

  // Handlers para Datos de Póliza
  const handlePolizaChange = useCallback((value: any) => {
    updateField('poliza', value);
  }, [updateField]);

  const handleCertificadoChange = useCallback((value: any) => {
    updateField('certificado', value);
  }, [updateField]);

  const handleEndosoChange = useCallback((value: any) => {
    updateField('endoso', value);
  }, [updateField]);

  const handleDesdeChange = useCallback((value: any) => {
    updateField('desde', value);
  }, [updateField]);

  const handleHastaChange = useCallback((value: any) => {
    updateField('hasta', value);
  }, [updateField]);

  // Handlers para Datos del Vehículo
  const handleMarcaModeloChange = useCallback((value: any) => {
    updateField('marcaModelo', value);
  }, [updateField]);

  const handleAnioChange = useCallback((value: any) => {
    updateField('anio', value);
  }, [updateField]);

  const handleMatriculaChange = useCallback((value: any) => {
    updateField('matricula', value.toUpperCase());
  }, [updateField]);

  const handleMotorChange = useCallback((value: any) => {
    updateField('motor', value);
  }, [updateField]);

  const handleChasisChange = useCallback((value: any) => {
    updateField('chasis', value);
  }, [updateField]);

  const handleCategoriaIdChange = useCallback((value: any) => {
    updateField('categoriaId', parseInt(value));
  }, [updateField]);

  const handleCombustibleIdChange = useCallback((value: any) => {
    updateField('combustibleId', value);
  }, [updateField]);

  const handleDestinoIdChange = useCallback((value: any) => {
    updateField('destinoId', parseInt(value));
  }, [updateField]);

  const handleCalidadIdChange = useCallback((value: any) => {
    updateField('calidadId', parseInt(value));
  }, [updateField]);

  // Handlers para Datos de Cobertura
  const handleZonaCirculacionChange = useCallback((value: any) => {
    updateField('zonaCirculacion', value);
  }, [updateField]);

  const handleCoberturaIdChange = useCallback((value: any) => {
    updateField('coberturaId', parseInt(value));
  }, [updateField]);

  // Handlers para Observaciones
  const handleObservacionesChange = useCallback((value: any) => {
    updateField('observaciones', value);
  }, [updateField]);

  // Handler para submit
  const handleSubmit = useCallback(async () => {
    const result = await submitForm();
    if (result.success && onSubmit) {
      onSubmit(result.data);
    }
  }, [submitForm, onSubmit]);

  // Handler para cambio de tab
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as FormTabId);
  }, [setActiveTab]);

  // ===== CONFIGURACIÓN DE TABS =====
  const tabs = useMemo(() => [
    { id: 'datos_basicos', label: 'Básicos', icon: User, color: 'blue' },
    { id: 'datos_poliza', label: 'Póliza', icon: FileText, color: 'emerald' },
    { id: 'datos_vehiculo', label: 'Vehículo', icon: Car, color: 'purple' },
    { id: 'datos_cobertura', label: 'Cobertura', icon: Shield, color: 'orange' },
    { id: 'condiciones_pago', label: 'Pago', icon: CreditCard, color: 'green' },
    { id: 'observaciones', label: 'Notas', icon: MessageSquare, color: 'gray' }
  ], []);

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

      {/* TABS DEL FORMULARIO */}
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="w-full"
      >
        {/* LISTA DE TABS */}
        <TabsList className={cn(
          "grid w-full h-auto p-1 mb-6",
          "grid-cols-3 md:grid-cols-6 gap-2",
          isDark ? "bg-gray-900/50" : "bg-gray-100"
        )}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const tabProgress = progress.byTab[tab.id as FormTabId] || 0;
            
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg transition-all",
                  "hover:bg-opacity-80",
                  isActive && isDark && "bg-gray-800 text-white",
                  isActive && !isDark && "bg-white text-gray-900 shadow-sm",
                  !isActive && isDark && "text-gray-400 hover:text-gray-200",
                  !isActive && !isDark && "text-gray-600 hover:text-gray-900"
                )}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive && `text-${tab.color}-500`
                  )} />
                  <span className="text-xs font-medium">{tab.label}</span>
                  <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all",
                        `bg-${tab.color}-500`
                      )}
                      style={{ width: `${tabProgress}%` }}
                    />
                  </div>
                </div>
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
                  isDark={isDark}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField 
                      label="Asegurado" 
                      value={formData.asegurado} 
                      icon={<User className="w-4 h-4" />}
                      isDark={isDark}
                    />
                    <InfoField 
                      label="Tomador" 
                      value={formData.tomador} 
                      icon={<UserCheck className="w-4 h-4" />}
                      isDark={isDark}
                    />
                    <InfoField 
                      label="Domicilio" 
                      value={formData.domicilio} 
                      icon={<MapPin className="w-4 h-4" />}
                      isDark={isDark}
                    />
                    <FormField
                      id="dirCobro"
                      label="Dirección de Cobro"
                      value={formData.dirCobro}
                      onChange={handleDirCobroChange}
                      placeholder="Opcional - Dejar vacío si es la misma"
                      error={errors.dirCobro}
                      icon={<MapPin className="w-4 h-4" />}
                      helperText="Solo completar si es diferente al domicilio"
                      isDark={isDark}
                      hasError={!!(errors.dirCobro && touchedFields.has('dirCobro'))}
                    />
                  </div>
                </FormSection>

                <FormSection 
                  title="Información del Trámite" 
                  description="Datos del corredor y estado"
                  icon={<Briefcase className="w-4 h-4" />}
                  isDark={isDark}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id="corredor"
                      label="Corredor"
                      value={formData.corredor}
                      onChange={handleCorredorChange}
                      placeholder="Nombre del corredor"
                      required
                      error={errors.corredor}
                      icon={<Briefcase className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.corredor && touchedFields.has('corredor'))}
                    />
                    
                    <SelectField
                      id="estadoTramite"
                      label="Estado del Trámite"
                      value={formData.estadoTramite}
                      onChange={handleEstadoTramiteChange}
                      options={[
                        { id: 'Pendiente', name: 'Pendiente' },
                        { id: 'En proceso', name: 'En proceso' },
                        { id: 'Terminado', name: 'Terminado' },
                        { id: 'Modificaciones', name: 'Modificaciones' }
                      ]}
                      error={errors.estadoTramite}
                      icon={<Clock className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.estadoTramite && touchedFields.has('estadoTramite'))}
                    />

                    <SelectField
                      id="tramite"
                      label="Tipo de Trámite"
                      value={formData.tramite}
                      onChange={handleTramiteChange}
                      options={[
                        { id: 'Nuevo', name: 'Nuevo' },
                        { id: 'Renovación', name: 'Renovación' },
                        { id: 'Cambio', name: 'Cambio' },
                        { id: 'Endoso', name: 'Endoso' }
                      ]}
                      required
                      error={errors.tramite}
                      icon={<FileText className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.tramite && touchedFields.has('tramite'))}
                    />

                    <SelectField
                      id="estadoPoliza"
                      label="Estado de la Póliza"
                      value={formData.estadoPoliza}
                      onChange={handleEstadoPolizaChange}
                      options={[
                        { id: 'VIG', name: 'Vigente (VIG)' },
                        { id: 'ANT', name: 'Anulada (ANT)' },
                        { id: 'VEN', name: 'Vencida (VEN)' },
                        { id: 'END', name: 'Con Endoso (END)' }
                      ]}
                      required
                      error={errors.estadoPoliza}
                      icon={<Shield className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.estadoPoliza && touchedFields.has('estadoPoliza'))}
                    />

                    <FormField
                      id="fecha"
                      label="Fecha de Gestión"
                      value={formData.fecha}
                      onChange={handleFechaChange}
                      type="date"
                      error={errors.fecha}
                      icon={<Calendar className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.fecha && touchedFields.has('fecha'))}
                    />

                    <SelectField
                      id="tipo"
                      label="Tipo de Línea"
                      value={formData.tipo}
                      onChange={handleTipoChange}
                      options={[
                        { id: 'Líneas personales', name: 'Líneas personales' },
                        { id: 'Líneas comerciales', name: 'Líneas comerciales' }
                      ]}
                      error={errors.tipo}
                      isDark={isDark}
                      hasError={!!(errors.tipo && touchedFields.has('tipo'))}
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
                  isDark={isDark}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField 
                      label="Compañía" 
                      value={`${formData.comalias} (ID: ${formData.compania})`} 
                      icon={<Building2 className="w-4 h-4" />}
                      isDark={isDark}
                    />
                    <InfoField 
                      label="Sección" 
                      value={`AUTOMÓVILES (ID: ${formData.seccion})`} 
                      icon={<Car className="w-4 h-4" />}
                      isDark={isDark}
                    />
                  </div>
                </FormSection>

                <FormSection 
                  title="Identificación de la Póliza" 
                  description="Números y fechas de vigencia"
                  icon={<FileText className="w-4 h-4" />}
                  isDark={isDark}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id="poliza"
                      label="Número de Póliza"
                      value={formData.poliza}
                      onChange={handlePolizaChange}
                      placeholder="Ej: BSE-AUTO-2024-001234"
                      required
                      error={errors.poliza}
                      icon={<FileText className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.poliza && touchedFields.has('poliza'))}
                    />

                    <FormField
                      id="certificado"
                      label="Certificado"
                      value={formData.certificado}
                      onChange={handleCertificadoChange}
                      placeholder="Número de certificado (opcional)"
                      error={errors.certificado}
                      isDark={isDark}
                      hasError={!!(errors.certificado && touchedFields.has('certificado'))}
                    />

                    <FormField
                      id="endoso"
                      label="Endoso"
                      value={formData.endoso}
                      onChange={handleEndosoChange}
                      placeholder="0"
                      error={errors.endoso}
                      helperText={operationType === 'CAMBIO' ? 'Se incrementará automáticamente' : ''}
                      isDark={isDark}
                      hasError={!!(errors.endoso && touchedFields.has('endoso'))}
                    />

                    <div></div>

                    <FormField
                      id="desde"
                      label="Vigencia Desde"
                      value={formData.desde}
                      onChange={handleDesdeChange}
                      type="date"
                      required
                      error={errors.desde}
                      icon={<Calendar className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.desde && touchedFields.has('desde'))}
                    />

                    <FormField
                      id="hasta"
                      label="Vigencia Hasta"
                      value={formData.hasta}
                      onChange={handleHastaChange}
                      type="date"
                      required
                      error={errors.hasta}
                      icon={<Calendar className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.hasta && touchedFields.has('hasta'))}
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
                  isDark={isDark}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id="marcaModelo"
                      label="Marca y Modelo"
                      value={formData.marcaModelo}
                      onChange={handleMarcaModeloChange}
                      placeholder="Ej: VOLKSWAGEN GOL TREND"
                      required
                      error={errors.marcaModelo}
                      icon={<Car className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.marcaModelo && touchedFields.has('marcaModelo'))}
                    />

                    <FormField
                      id="anio"
                      label="Año"
                      value={formData.anio}
                      onChange={handleAnioChange}
                      type="number"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      placeholder="Ej: 2020"
                      required
                      error={errors.anio}
                      icon={<Calendar className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.anio && touchedFields.has('anio'))}
                    />

                    <FormField
                      id="matricula"
                      label="Matrícula"
                      value={formData.matricula}
                      onChange={handleMatriculaChange}
                      placeholder="Ej: ABC 1234"
                      error={errors.matricula}
                      helperText="Opcional pero recomendado"
                      isDark={isDark}
                      hasError={!!(errors.matricula && touchedFields.has('matricula'))}
                    />

                    <FormField
                      id="motor"
                      label="Motor"
                      value={formData.motor}
                      onChange={handleMotorChange}
                      placeholder="Número de motor"
                      error={errors.motor}
                      isDark={isDark}
                      hasError={!!(errors.motor && touchedFields.has('motor'))}
                    />

                    <FormField
                      id="chasis"
                      label="Chasis"
                      value={formData.chasis}
                      onChange={handleChasisChange}
                      placeholder="Número de chasis"
                      error={errors.chasis}
                      className="md:col-span-2"
                      isDark={isDark}
                      hasError={!!(errors.chasis && touchedFields.has('chasis'))}
                    />
                  </div>
                </FormSection>

                <FormSection 
                  title="Características del Vehículo" 
                  description="Datos maestros específicos"
                  icon={<Settings className="w-4 h-4" />}
                  isDark={isDark}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      id="categoriaId"
                      label="Categoría"
                      value={formData.categoriaId}
                      onChange={handleCategoriaIdChange}
                      options={masterData?.categorias?.map(cat => ({
                        id: cat.id,
                        name: cat.catdsc
                      })) || []}
                      placeholder="Seleccione categoría"
                      loading={loading}
                      error={errors.categoriaId}
                      icon={<Car className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.categoriaId && touchedFields.has('categoriaId'))}
                    />

                    <SelectField
                      id="combustibleId"
                      label="Combustible"
                      value={formData.combustibleId}
                      onChange={handleCombustibleIdChange}
                      options={masterData?.combustibles?.map(comb => ({
                        id: comb.id,
                        name: comb.name
                      })) || []}
                      placeholder="Seleccione combustible"
                      required
                      loading={loading}
                      error={errors.combustibleId}
                      icon={<Fuel className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.combustibleId && touchedFields.has('combustibleId'))}
                    />

                    <SelectField
                      id="destinoId"
                      label="Destino/Uso"
                      value={formData.destinoId}
                      onChange={handleDestinoIdChange}
                      options={masterData?.destinos?.map(dest => ({
                        id: dest.id,
                        name: dest.desnom
                      })) || []}
                      placeholder="Seleccione destino"
                      required
                      loading={loading}
                      error={errors.destinoId}
                      icon={<Navigation className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.destinoId && touchedFields.has('destinoId'))}
                    />

                    <SelectField
                      id="calidadId"
                      label="Calidad"
                      value={formData.calidadId}
                      onChange={handleCalidadIdChange}
                      options={masterData?.calidades?.map(cal => ({
                        id: cal.id,
                        name: cal.caldsc
                      })) || []}
                      placeholder="Seleccione calidad"
                      loading={loading}
                      error={errors.calidadId}
                      icon={<Shield className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.calidadId && touchedFields.has('calidadId'))}
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
                    Zona de circulación, moneda y tarifa de cobertura
                  </p>
                </div>
                
                <FormSection 
                  title="Configuración de Cobertura"
                  description="Detalles de la cobertura del vehículo"
                  icon={<Shield className="w-4 h-4" />}
                  isDark={isDark}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id="zonaCirculacion"
                      label="Zona de Circulación"
                      value={formData.zonaCirculacion}
                      onChange={handleZonaCirculacionChange}
                      placeholder="Ej: MONTEVIDEO"
                      error={errors.zonaCirculacion}
                      icon={<MapPin className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.zonaCirculacion && touchedFields.has('zonaCirculacion'))}
                    />

                    <SelectField
                      id="monedaId"
                      label="Moneda"
                      value={formData.monedaId}
                      onChange={handleMonedaIdChange}
                      options={masterData?.monedas?.map(mon => ({
                        id: mon.id,
                        name: `${mon.nombre}${mon.codigo ? ` (${mon.codigo})` : ''}`
                      })) || []}
                      placeholder="Seleccione moneda"
                      required
                      loading={loading}
                      error={errors.monedaId}
                      icon={<DollarSign className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.monedaId && touchedFields.has('monedaId'))}
                    />
                    
                    <SelectField
                      id="coberturaId"
                      label="Tarifa / Plan de Cobertura"
                      value={formData.coberturaId}
                      onChange={handleCoberturaIdChange}
                      options={masterData?.tarifas?.map(tarifa => ({
                        id: tarifa.id,
                        name: tarifa.nombre || 'Sin nombre' 
                      })) || []}
                      placeholder="Seleccione una tarifa"
                      required
                      loading={loading}
                      error={errors.coberturaId}
                      icon={<Shield className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.coberturaId && touchedFields.has('coberturaId'))}
                    />
                  </div>
                  
                  {formData.coberturaId && (() => {
                    const tarifa = masterData?.tarifas?.find(t => t.id === formData.coberturaId);
                    if (!tarifa) return null;
                    
                    return (
                      <div className={cn(
                        "mt-4 p-3 rounded-lg border flex items-start gap-2",
                        isDark 
                          ? "bg-blue-900/10 border-blue-800/50 text-blue-300" 
                          : "bg-blue-50/50 border-blue-200 text-blue-700"
                      )}>
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="font-medium">Tarifa seleccionada:</span> {tarifa.nombre}
                        </div>
                      </div>
                    );
                  })()}
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
                  isDark={isDark}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      id="premio"
                      label="Premio"
                      value={formData.premio}
                      onChange={handlePremioChange}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      required
                      error={errors.premio}
                      icon={<DollarSign className="w-4 h-4" />}
                      helperText="Monto del premio de la póliza"
                      isDark={isDark}
                      hasError={!!(errors.premio && touchedFields.has('premio'))}
                    />

                    <FormField
                      id="total"
                      label="Total a Pagar"
                      value={formData.total}
                      onChange={handleTotalChange}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      required
                      error={errors.total}
                      icon={<DollarSign className="w-4 h-4" />}
                      helperText="Monto total incluyendo impuestos"
                      isDark={isDark}
                      hasError={!!(errors.total && touchedFields.has('total'))}
                    />

                    <SelectField
                      id="formaPago"
                      label="Forma de Pago"
                      value={formData.formaPago}
                      onChange={handleFormaPagoChange}
                      options={[
                        { id: 'Contado', name: 'Contado' },
                        { id: 'Tarjeta', name: 'Tarjeta de Crédito' },
                        { id: 'Débito Automático', name: 'Débito Automático' },
                        { id: 'Cuotas', name: 'Cuotas' },
                        { id: 'Financiado', name: 'Financiado' }
                      ]}
                      placeholder="Seleccione forma de pago"
                      required
                      error={errors.formaPago}
                      icon={<CreditCard className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.formaPago && touchedFields.has('formaPago'))}
                    />

                    <FormField
                      id="cuotas"
                      label="Cantidad de Cuotas"
                      value={formData.cuotas}
                      onChange={handleCuotasChange}
                      type="number"
                      min="1"
                      max="36"
                      placeholder="1"
                      error={errors.cuotas}
                      icon={<Hash className="w-4 h-4" />}
                      helperText="Número de cuotas para el pago"
                      isDark={isDark}
                      hasError={!!(errors.cuotas && touchedFields.has('cuotas'))}
                    />

                    <FormField
                      id="valorCuota"
                      label="Valor por Cuota"
                      value={formData.valorCuota}
                      onChange={handleValorCuotaChange}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      error={errors.valorCuota}
                      icon={<Calculator className="w-4 h-4" />}
                      helperText="Monto de cada cuota mensual"
                      isDark={isDark}
                      hasError={!!(errors.valorCuota && touchedFields.has('valorCuota'))}
                    />

                    <SelectField
                      id="monedaId"
                      label="Moneda"
                      value={formData.monedaId}
                      onChange={handleMonedaIdChange}
                      options={masterData?.monedas?.map(mon => ({
                        id: mon.id,
                        name: `${mon.nombre}${mon.codigo ? ` (${mon.codigo})` : ''}`
                      })) || []}
                      placeholder="Seleccione moneda"
                      required
                      loading={loading}
                      error={errors.monedaId}
                      icon={<DollarSign className="w-4 h-4" />}
                      isDark={isDark}
                      hasError={!!(errors.monedaId && touchedFields.has('monedaId'))}
                    />
                  </div>

                  {/* Resumen visual */}
                  {(formData.total > 0 || formData.premio > 0) && (
                    <div className={cn(
                      "mt-6 p-4 rounded-lg border",
                      isDark 
                        ? "bg-gray-800/50 border-gray-700" 
                        : "bg-gray-50 border-gray-200"
                    )}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className={cn(
                            "block text-xs uppercase tracking-wider mb-1",
                            isDark ? "text-gray-400" : "text-gray-600"
                          )}>Premio</span>
                          <span className={cn(
                            "font-semibold",
                            isDark ? "text-white" : "text-gray-900"
                          )}>
                            ${formData.premio}
                          </span>
                        </div>
                        <div>
                          <span className={cn(
                            "block text-xs uppercase tracking-wider mb-1",
                            isDark ? "text-gray-400" : "text-gray-600"
                          )}>Total</span>
                          <span className={cn(
                            "font-semibold",
                            isDark ? "text-white" : "text-gray-900"
                          )}>
                            ${formData.total}
                          </span>
                        </div>
                        <div>
                          <span className={cn(
                            "block text-xs uppercase tracking-wider mb-1",
                            isDark ? "text-gray-400" : "text-gray-600"
                          )}>Cuotas</span>
                          <span className={cn(
                            "font-semibold",
                            isDark ? "text-white" : "text-gray-900"
                          )}>{formData.cuotas}</span>
                        </div>
                        <div>
                          <span className={cn(
                            "block text-xs uppercase tracking-wider mb-1",
                            isDark ? "text-gray-400" : "text-gray-600"
                          )}>Valor Cuota</span>
                          <span className={cn(
                            "font-semibold",
                            isDark ? "text-white" : "text-gray-900"
                          )}>
                            ${formData.valorCuota}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
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
                    Notas adicionales e información relevante
                  </p>
                </div>

                <FormSection 
                  title="Notas y Comentarios"
                  description="Agregue cualquier información adicional que considere relevante"
                  icon={<MessageSquare className="w-4 h-4" />}
                  isDark={isDark}
                >
                  <FormField
                    id="observaciones"
                    label="Observaciones Adicionales"
                    value={formData.observaciones}
                    onChange={handleObservacionesChange}
                    type="text"
                    placeholder="Ingrese cualquier información adicional relevante para esta póliza..."
                    error={errors.observaciones}
                    helperText="Este campo es opcional"
                    isDark={isDark}
                    hasError={!!(errors.observaciones && touchedFields.has('observaciones'))}
                  />
                </FormSection>

                {(formData.cuotas > 1 || scannedData?.datosVelneo?.condicionesPago?.detalleCuotas) && (
                  <FormSection 
                    title="Desglose de Cuotas"
                    description="Detalle del plan de pagos"
                    icon={<CreditCard className="w-4 h-4" />}
                    isDark={isDark}
                  >
                    <CuotasDesglose 
                      cuotas={scannedData?.datosVelneo?.condicionesPago?.detalleCuotas?.cuotas || []}
                      totalCuotas={formData.cuotas}
                      valorCuota={formData.valorCuota}
                      total={formData.total}
                      monedaId={formData.monedaId}
                      masterData={masterData}
                      isDark={isDark}
                    />
                  </FormSection>
                )}

                <FormSection 
                  title="Resumen de la Operación"
                  description="Información sobre el procesamiento de esta póliza"
                  icon={<Info className="w-4 h-4" />}
                  isDark={isDark}
                >
                  <ResumenOperacion
                    scannedData={scannedData}
                    operationType={operationType}
                    selectedClient={selectedClient}
                    selectedCompany={selectedCompany}
                    isDark={isDark}
                  />
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