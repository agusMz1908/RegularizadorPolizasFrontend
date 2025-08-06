// src/components/wizard/PolicyForm.tsx - CORREGIDO CON TIPOS REALES
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  FileText, 
  Car, 
  Shield, 
  CheckCircle, 
  ChevronRight, 
  AlertCircle,
  Calendar,
  DollarSign,
  Building2,
  IdCard,
  MapPin,
  Eye,
  EyeOff,
  Zap,
  ArrowLeft,
  Send,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ✅ IMPORTACIONES CORREGIDAS con tipos que realmente existen
import type { CompanyDto, SeccionDto } from '@/types/masterData';  // ✅ ESTOS EXISTEN
import type { AzureProcessResponse } from '@/types/azureDocumentResult';
import type { PolicyFormData } from '@/types/poliza';
import type { FormTabId } from '@/types/policyForm';
import { FORM_TABS, TabsUtils } from '@/constants/formTabs';  // ✅ IMPORTAR CONSTANTES OFICIALES

// ✅ INTERFAZ CORREGIDA para que coincida con App.tsx
interface PolicyFormProps {
  scannedData?: AzureProcessResponse;  // ✅ Opcional
  selectedClient: any;     // ✅ Tipo del cliente
  selectedCompany: CompanyDto;  // ✅ Tipo correcto  
  selectedSection: SeccionDto;  // ✅ Tipo correcto
  onSubmit: (formData: PolicyFormData) => void;
  onBack: () => void;
}

const PolicyForm: React.FC<PolicyFormProps> = ({
  scannedData,
  selectedClient,
  selectedCompany,
  selectedSection,
  onSubmit,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<FormTabId>('datos_basicos');  // ✅ Usar tipo correcto
  const [formData, setFormData] = useState<PolicyFormData>({} as PolicyFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showDataOrigin, setShowDataOrigin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ INICIALIZACIÓN CORREGIDA usando campos reales
  useEffect(() => {
    if (scannedData?.datosVelneo) {
      const { datosVelneo } = scannedData;
      
      // ✅ Mapear usando campos que realmente existen en PolicyFormData
      const initialData: Partial<PolicyFormData> = {
        // Datos básicos
        corredor: datosVelneo.datosBasicos?.corredor || '',
        asegurado: datosVelneo.datosBasicos?.asegurado || selectedClient?.clinom || '',
        tomador: datosVelneo.datosBasicos?.asegurado || selectedClient?.clinom || '',
        domicilio: datosVelneo.datosBasicos?.domicilio || selectedClient?.clidir || '',
        dirCobro: selectedClient?.clidircob || '',
        
        // Datos póliza  
        poliza: datosVelneo.datosPoliza?.numeroPoliza || '',
        certificado: datosVelneo.datosPoliza?.certificado || '',
        desde: datosVelneo.datosPoliza?.desde ? datosVelneo.datosPoliza.desde.split('T')[0] : '',
        hasta: datosVelneo.datosPoliza?.hasta ? datosVelneo.datosPoliza.hasta.split('T')[0] : '',
        
        // Datos vehículo
        marcaModelo: `${datosVelneo.datosVehiculo?.marca || ''} ${datosVelneo.datosVehiculo?.modelo || ''}`.trim(),
        anio: datosVelneo.datosVehiculo?.anio || '',
        matricula: datosVelneo.datosVehiculo?.matricula || '',
        motor: datosVelneo.datosVehiculo?.motor || '',
        chasis: datosVelneo.datosVehiculo?.chasis || '',
        
        // Condiciones pago
        formaPago: datosVelneo.condicionesPago?.formaPago || '',
        premio: datosVelneo.condicionesPago?.premio || 0,
        total: datosVelneo.condicionesPago?.total || 0,
        cuotas: datosVelneo.condicionesPago?.cuotas || 1,
        valorCuota: datosVelneo.condicionesPago?.valorCuota || 0,
        
        // Observaciones
        observaciones: datosVelneo.observaciones?.observacionesGenerales || '',
        
        // Datos de contexto
        compania: selectedCompany.id,
        comalias: selectedCompany.comalias
      };
      
      setFormData(initialData as PolicyFormData);
    } else {
      // Inicialización básica sin datos escaneados
      const basicData: Partial<PolicyFormData> = {
        asegurado: selectedClient?.clinom || '',
        tomador: selectedClient?.clinom || '',
        domicilio: selectedClient?.clidir || '',
        dirCobro: selectedClient?.clidircob || '',
        compania: selectedCompany.id,
        comalias: selectedCompany.comalias
      };
      
      setFormData(basicData as PolicyFormData);
    }
  }, [scannedData, selectedClient, selectedCompany]);

  const updateFormData = (field: keyof PolicyFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouchedFields(prev => new Set(prev.add(field as string)));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateField = (field: keyof PolicyFormData, value: any): string => {
    switch (field) {
      case 'corredor':
        return !value ? 'Corredor requerido' : '';
      case 'poliza':
        return !value ? 'Número de póliza requerido' : '';
      case 'asegurado':
        return !value ? 'Nombre del asegurado requerido' : '';
      case 'desde':
        return !value ? 'Fecha desde requerida' : '';
      case 'hasta':
        return !value ? 'Fecha hasta requerida' : '';
      case 'marcaModelo':
        return !value ? 'Marca y modelo requeridos' : '';
      case 'anio':
        const year = parseInt(value);
        if (!value) return 'Año requerido';
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
          return 'Año inválido';
        }
        return '';
      case 'premio':
        return (!value || value <= 0) ? 'Premio debe ser mayor a 0' : '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field as keyof PolicyFormData, formData[field as keyof PolicyFormData]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ USAR TabsUtils para obtener información de las pestañas
  const getTabStatus = (tab: typeof FORM_TABS[0]) => {
    const tabErrors = tab.fields.filter(field => errors[field]);
    const tabTouched = tab.fields.some(field => touchedFields.has(field));
    const tabComplete = tab.fields.every(field => formData[field]);
    
    if (tabErrors.length > 0) return 'error';
    if (tabComplete && tabTouched) return 'completed';
    if (tabTouched) return 'partial';
    return 'pending';
  };

  const handleTabChange = (tabId: string) => {  // ✅ Cambiar a string para compatibilidad
    setActiveTab(tabId as FormTabId);  // ✅ Cast seguro ya que sabemos que viene de FORM_TABS
  };

  const handleNext = () => {
    const nextTab = TabsUtils.getNextTab(activeTab);
    if (nextTab) {
      setActiveTab(nextTab.id);
    }
  };

  const handlePrevious = () => {
    const prevTab = TabsUtils.getPreviousTab(activeTab);
    if (prevTab) {
      setActiveTab(prevTab.id);
    }
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    const allFields = FORM_TABS.flatMap(tab => tab.fields);
    setTouchedFields(new Set(allFields));
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Navigate to first tab with errors
      const tabWithError = FORM_TABS.find(tab => 
        tab.fields.some(field => errors[field])
      );
      if (tabWithError) {
        setActiveTab(tabWithError.id);
      }
    }
  };

  const currentTabIndex = FORM_TABS.findIndex(tab => tab.id === activeTab);
  const isLastTab = TabsUtils.isLastTab(activeTab);  // ✅ Usar TabsUtils
  const isFirstTab = TabsUtils.isFirstTab(activeTab);  // ✅ Usar TabsUtils

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 animate-in fade-in-0 duration-500">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Formulario de Póliza
        </h2>
        <p className="text-lg text-muted-foreground">
          Completa los datos para crear la póliza
        </p>
        
        {/* Context badges */}
        <div className="flex items-center justify-center space-x-4 animate-in slide-in-from-top-4 duration-400 delay-200">
          <Badge variant="outline" className="text-sm">
            <Building2 className="h-3 w-3 mr-1" />
            {selectedCompany.comalias}
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Car className="h-3 w-3 mr-1" />
            {selectedSection.seccion}
          </Badge>
          {selectedClient && (
            <Badge variant="outline" className="text-sm">
              <User className="h-3 w-3 mr-1" />
              {selectedClient.clinom}
            </Badge>
          )}
          {scannedData && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDataOrigin(!showDataOrigin)}
            >
              {showDataOrigin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showDataOrigin ? 'Ocultar origen' : 'Ver datos escaneados'}
            </Button>
          )}
        </div>
      </div>

      {/* Data origin indicator */}
      {showDataOrigin && scannedData && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="text-sm text-primary flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                <strong>Datos extraídos de:</strong> 
                <span className="ml-2 font-mono">{scannedData.archivo}</span>
                <span className="ml-4 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {(scannedData.tiempoProcesamiento / 1000).toFixed(1)}s
                </span>
                <span className="ml-4 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {scannedData.porcentajeCompletitud}% completitud
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Form Tabs */}
      <div className="animate-in slide-in-from-bottom-4 duration-500 delay-300">
        <Card className="border-2 overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            {/* Tab Navigation */}
            <div className="border-b bg-gradient-to-r from-muted/50 to-muted/30">
              <div className="relative">
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                     style={{ width: `${((currentTabIndex + 1) / FORM_TABS.length) * 100}%` }}
                />
                
                <TabsList className="grid w-full h-auto p-3 bg-transparent" style={{ gridTemplateColumns: `repeat(${FORM_TABS.length}, 1fr)` }}>
                  {FORM_TABS.map((tab) => {
                    const status = getTabStatus(tab);
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={cn(
                          "flex flex-col items-center space-y-3 p-4 rounded-xl transition-all duration-300",
                          "data-[state=active]:bg-background data-[state=active]:shadow-lg",
                          status === 'error' && "text-destructive",
                          status === 'completed' && "text-emerald-600"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                          isActive ? "bg-primary text-white shadow-lg" :
                          status === 'error' ? "bg-destructive/10 text-destructive" :
                          status === 'completed' ? "bg-emerald-100 text-emerald-600" :
                          "bg-muted text-muted-foreground"
                        )}>
                          <tab.icon className="h-6 w-6" />  {/* ✅ Usar tab.icon directamente */}
                        </div>
                        
                        <div className="text-center space-y-1">
                          <div className="font-semibold text-sm">
                            {tab.label}
                          </div>
                          <div className="text-xs text-muted-foreground hidden sm:block">
                            {tab.description}
                          </div>
                        </div>

                        {/* Status indicators */}
                        {status === 'completed' && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {status === 'error' && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center">
                            <AlertCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              <div key={activeTab} className="min-h-[400px] animate-in fade-in-0 duration-400">
                {/* Datos Básicos */}
                <TabsContent value="datos_basicos" className="mt-0 space-y-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center">
                        <User className="h-5 w-5 mr-2 text-primary" />
                        Datos Básicos
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        id="corredor"
                        label="Corredor"
                        icon={<Building2 className="h-4 w-4" />}
                        value={formData.corredor || ''}
                        onChange={(value) => updateFormData('corredor', value)}
                        error={errors.corredor}
                        touched={touchedFields.has('corredor')}
                        required
                      />
                      
                      <FormField
                        id="asegurado"
                        label="Asegurado"
                        icon={<User className="h-4 w-4" />}
                        value={formData.asegurado || ''}
                        onChange={(value) => updateFormData('asegurado', value)}
                        error={errors.asegurado}
                        touched={touchedFields.has('asegurado')}
                        required
                      />
                      
                      <FormField
                        id="tomador"
                        label="Tomador"
                        icon={<User className="h-4 w-4" />}
                        value={formData.tomador || ''}
                        onChange={(value) => updateFormData('tomador', value)}
                        error={errors.tomador}
                        touched={touchedFields.has('tomador')}
                      />
                      
                      <FormField
                        id="domicilio"
                        label="Domicilio"
                        icon={<MapPin className="h-4 w-4" />}
                        value={formData.domicilio || ''}
                        onChange={(value) => updateFormData('domicilio', value)}
                        error={errors.domicilio}
                        touched={touchedFields.has('domicilio')}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Datos Póliza */}
                <TabsContent value="datos_poliza" className="mt-0 space-y-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        Datos de la Póliza
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        id="poliza"
                        label="Número de Póliza"
                        icon={<FileText className="h-4 w-4" />}
                        value={formData.poliza || ''}
                        onChange={(value) => updateFormData('poliza', value)}
                        error={errors.poliza}
                        touched={touchedFields.has('poliza')}
                        required
                      />
                      
                      <FormField
                        id="certificado"
                        label="Certificado"
                        icon={<FileText className="h-4 w-4" />}
                        value={formData.certificado || ''}
                        onChange={(value) => updateFormData('certificado', value)}
                        error={errors.certificado}
                        touched={touchedFields.has('certificado')}
                      />
                      
                      <FormField
                        id="desde"
                        label="Vigencia Desde"
                        type="date"
                        icon={<Calendar className="h-4 w-4" />}
                        value={formData.desde || ''}
                        onChange={(value) => updateFormData('desde', value)}
                        error={errors.desde}
                        touched={touchedFields.has('desde')}
                        required
                      />
                      
                      <FormField
                        id="hasta"
                        label="Vigencia Hasta"
                        type="date"
                        icon={<Calendar className="h-4 w-4" />}
                        value={formData.hasta || ''}
                        onChange={(value) => updateFormData('hasta', value)}
                        error={errors.hasta}
                        touched={touchedFields.has('hasta')}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Datos Vehículo */}
                <TabsContent value="datos_vehiculo" className="mt-0 space-y-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center">
                        <Car className="h-5 w-5 mr-2 text-primary" />
                        Datos del Vehículo
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        id="marcaModelo"
                        label="Marca - Modelo"
                        icon={<Car className="h-4 w-4" />}
                        value={formData.marcaModelo || ''}
                        onChange={(value) => updateFormData('marcaModelo', value)}
                        error={errors.marcaModelo}
                        touched={touchedFields.has('marcaModelo')}
                        required
                      />
                      
                      <FormField
                        id="anio"
                        label="Año"
                        type="number"
                        icon={<Calendar className="h-4 w-4" />}
                        value={formData.anio || ''}
                        onChange={(value) => updateFormData('anio', value)}
                        error={errors.anio}
                        touched={touchedFields.has('anio')}
                        required
                      />
                      
                      <FormField
                        id="matricula"
                        label="Matrícula"
                        icon={<IdCard className="h-4 w-4" />}
                        value={formData.matricula || ''}
                        onChange={(value) => updateFormData('matricula', value)}
                        error={errors.matricula}
                        touched={touchedFields.has('matricula')}
                      />
                      
                      <FormField
                        id="motor"
                        label="Número de Motor"
                        icon={<Car className="h-4 w-4" />}
                        value={formData.motor || ''}
                        onChange={(value) => updateFormData('motor', value)}
                        error={errors.motor}
                        touched={touchedFields.has('motor')}
                      />
                      
                      <div className="md:col-span-2">
                        <FormField
                          id="chasis"
                          label="Número de Chasis"
                          icon={<IdCard className="h-4 w-4" />}
                          value={formData.chasis || ''}
                          onChange={(value) => updateFormData('chasis', value)}
                          error={errors.chasis}
                          touched={touchedFields.has('chasis')}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Condiciones Pago */}
                <TabsContent value="condiciones_pago" className="mt-0 space-y-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center">
                        <Shield className="h-5 w-5 mr-2 text-primary" />
                        Condiciones de Pago
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        id="formaPago"
                        label="Forma de Pago"
                        icon={<DollarSign className="h-4 w-4" />}
                        value={formData.formaPago || ''}
                        onChange={(value) => updateFormData('formaPago', value)}
                        error={errors.formaPago}
                        touched={touchedFields.has('formaPago')}
                      />
                      
                      <FormField
                        id="premio"
                        label="Premio"
                        type="number"
                        icon={<DollarSign className="h-4 w-4" />}
                        value={formData.premio?.toString() || ''}
                        onChange={(value) => updateFormData('premio', parseFloat(value as string) || 0)}
                        error={errors.premio}
                        touched={touchedFields.has('premio')}
                        required
                      />
                      
                      <FormField
                        id="total"
                        label="Total"
                        type="number"
                        icon={<DollarSign className="h-4 w-4" />}
                        value={formData.total?.toString() || ''}
                        onChange={(value) => updateFormData('total', parseFloat(value as string) || 0)}
                        error={errors.total}
                        touched={touchedFields.has('total')}
                      />
                      
                      <FormField
                        id="cuotas"
                        label="Número de Cuotas"
                        type="number"
                        icon={<DollarSign className="h-4 w-4" />}
                        value={formData.cuotas?.toString() || '1'}
                        onChange={(value) => updateFormData('cuotas', parseInt(value as string) || 1)}
                        error={errors.cuotas}
                        touched={touchedFields.has('cuotas')}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Observaciones */}
                <TabsContent value="observaciones" className="mt-0 space-y-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                        Observaciones
                      </h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="observaciones" className="text-sm font-medium">
                          Observaciones Adicionales
                        </Label>
                        <Textarea
                          id="observaciones"
                          placeholder="Agrega cualquier observación adicional..."
                          value={formData.observaciones || ''}
                          onChange={(e) => updateFormData('observaciones', e.target.value)}
                          rows={6}
                          className="mt-2 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="min-w-[140px]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        
        <div className="flex space-x-4">
          {!isFirstTab && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="min-w-[120px]"
            >
              Anterior
            </Button>
          )}
          
          {!isLastTab ? (
            <Button
              onClick={handleNext}
              className="min-w-[140px]"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[200px] bg-gradient-to-r from-emerald-500 to-emerald-600"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar a Velneo
                  <Send className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ FORMFIELD COMPONENT SIMPLE
interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  type?: string;
  icon?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  touched,
  required = false,
  type = "text",
  icon
}) => {
  const hasError = error && touched;
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full",
          hasError && "border-red-500 focus:border-red-500"
        )}
      />
      
      {hasError && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

export default PolicyForm;