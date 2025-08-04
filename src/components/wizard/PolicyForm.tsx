// src/components/wizard/PolicyForm.tsx - CORREGIDA CON LAYOUT Y TIPOS FIXES
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Phone,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  Zap,
  ArrowLeft,
  Send,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

import type { CompanyDto, SeccionDto } from '../../types/maestros';
import type { AzureProcessResponse } from '../../types/azureDocumentResult';
import type { PolicyFormData } from '../../types/poliza';

interface PolicyFormProps {
  scannedData: AzureProcessResponse;
  selectedCompany: CompanyDto;
  selectedSection: SeccionDto;
  onSubmit: (formData: PolicyFormData) => void;
  onBack: () => void;
}

interface FormTab {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  fields: (keyof PolicyFormData)[];
  color: string;
}

const FORM_TABS: FormTab[] = [
  {
    id: 'cliente',
    label: 'Cliente',
    icon: User,
    description: 'Información del asegurado',
    fields: ['corredor', 'asegurado', 'documento', 'domicilio', 'telefono', 'email'],
    color: 'blue'
  },
  {
    id: 'poliza',
    label: 'Póliza',
    icon: FileText,
    description: 'Datos de la póliza',
    fields: ['numeroPoliza', 'desde', 'hasta', 'endoso'],
    color: 'green'
  },
  {
    id: 'vehiculo',
    label: 'Vehículo',
    icon: Car,
    description: 'Datos del vehículo',
    fields: ['marca', 'modelo', 'anio', 'combustible', 'categoria', 'chasis', 'matricula'],
    color: 'purple'
  },
  {
    id: 'cobertura',
    label: 'Cobertura',
    icon: Shield,
    description: 'Cobertura y condiciones',
    fields: ['cobertura', 'premio', 'total', 'formaPago', 'cuotas'],
    color: 'orange'
  },
  {
    id: 'resumen',
    label: 'Resumen',
    icon: CheckCircle,
    description: 'Revisión final',
    fields: ['observaciones'],
    color: 'emerald'
  }
];

const PolicyForm: React.FC<PolicyFormProps> = ({
  scannedData,
  selectedCompany,
  selectedSection,
  onSubmit,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState('cliente');
  const [formData, setFormData] = useState<PolicyFormData>({} as PolicyFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showDataOrigin, setShowDataOrigin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // ✅ INITIALIZE FORM DATA FROM SCANNED DATA
  useEffect(() => {
    if (scannedData?.datosVelneo) {
      const { datosVelneo } = scannedData;
      setFormData({
        // Datos básicos
        corredor: datosVelneo.datosBasicos.corredor || '',
        asegurado: datosVelneo.datosBasicos.asegurado || '',
        documento: datosVelneo.datosBasicos.documento || '',
        domicilio: datosVelneo.datosBasicos.domicilio || '',
        telefono: datosVelneo.datosBasicos.telefono || '',
        email: datosVelneo.datosBasicos.email || '',
        
        // Datos póliza
        numeroPoliza: datosVelneo.datosPoliza.numeroPoliza || '',
        desde: datosVelneo.datosPoliza.desde ? datosVelneo.datosPoliza.desde.split('T')[0] : '',
        hasta: datosVelneo.datosPoliza.hasta ? datosVelneo.datosPoliza.hasta.split('T')[0] : '',
        endoso: datosVelneo.datosPoliza.endoso || '0',
        
        // Datos vehículo
        marca: datosVelneo.datosVehiculo.marca || '',
        modelo: datosVelneo.datosVehiculo.modelo || '',
        anio: datosVelneo.datosVehiculo.anio || '',
        combustible: datosVelneo.datosVehiculo.combustible || '',
        categoria: datosVelneo.datosVehiculo.categoria || '',
        chasis: datosVelneo.datosVehiculo.chasis || '',
        matricula: datosVelneo.datosVehiculo.matricula || '',
        
        // Datos cobertura
        cobertura: datosVelneo.datosCobertura.cobertura || '',
        premio: datosVelneo.condicionesPago.premio || 0,
        total: datosVelneo.condicionesPago.total || 0,
        formaPago: datosVelneo.condicionesPago.formaPago || '',
        cuotas: datosVelneo.condicionesPago.cuotas || 1,
        
        // Observaciones
        observaciones: datosVelneo.observaciones.observacionesGenerales || ''
      });
    }
  }, [scannedData]);

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
      case 'numeroPoliza':
        return !value ? 'Número de póliza requerido' : '';
      case 'asegurado':
        return !value ? 'Nombre del asegurado requerido' : '';
      case 'documento':
        return !value ? 'Documento requerido' : '';
      case 'desde':
        return !value ? 'Fecha desde requerida' : '';
      case 'hasta':
        return !value ? 'Fecha hasta requerida' : '';
      case 'marca':
        return !value ? 'Marca requerida' : '';
      case 'modelo':
        return !value ? 'Modelo requerido' : '';
      case 'anio':
        return !value ? 'Año requerido' : '';
      case 'cobertura':
        return !value ? 'Cobertura requerida' : '';
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

  const getTabStatus = (tab: FormTab) => {
    const tabErrors = tab.fields.filter(field => errors[field]);
    const tabTouched = tab.fields.some(field => touchedFields.has(field));
    const tabComplete = tab.fields.every(field => formData[field]);
    
    if (tabErrors.length > 0) return 'error';
    if (tabComplete && tabTouched) return 'completed';
    if (tabTouched) return 'partial';
    return 'pending';
  };

  const getTabIcon = (tab: FormTab) => {
    const status = getTabStatus(tab);
    if (status === 'completed') return CheckCircle;
    if (status === 'error') return AlertCircle;
    return tab.icon;
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleNext = () => {
    const currentIndex = FORM_TABS.findIndex(tab => tab.id === activeTab);
    if (currentIndex < FORM_TABS.length - 1) {
      setActiveTab(FORM_TABS[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = FORM_TABS.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(FORM_TABS[currentIndex - 1].id);
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
        setShowSuccessNotification(true);
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
  const isLastTab = currentTabIndex === FORM_TABS.length - 1;
  const isFirstTab = currentTabIndex === 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* ✅ HEADER CON ANIMACIONES ENTRADA */}
      <div className="text-center space-y-4 animate-in fade-in-0 duration-500">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Formulario de Póliza
        </h2>
        <p className="text-lg text-muted-foreground">
          Revisa y completa los datos extraídos del documento
        </p>
        
        {/* ✅ COMPANY/SECTION CONTEXT CON BADGES ANIMADOS */}
        <div className="flex items-center justify-center space-x-4 animate-in slide-in-from-top-4 duration-400 delay-200">
          <Badge variant="outline" className="text-sm hover:scale-105 transition-transform duration-200">
            <Building2 className="h-3 w-3 mr-1" />
            {selectedCompany.alias}
          </Badge>
          <Badge variant="outline" className="text-sm hover:scale-105 transition-transform duration-200">
            <Car className="h-3 w-3 mr-1" />
            {selectedSection.seccion}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDataOrigin(!showDataOrigin)}
            className="hover:scale-105 transition-all duration-200"
          >
            {showDataOrigin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showDataOrigin ? 'Ocultar origen' : 'Ver origen de datos'}
          </Button>
        </div>
      </div>

      {/* ✅ DATA ORIGIN INDICATOR CON ANIMACIÓN */}
      {showDataOrigin && (
        <div className="animate-in slide-in-from-top-4 duration-300">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="text-sm text-primary flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                <strong>Datos extraídos automáticamente de:</strong> 
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

      {/* ✅ ENHANCED TABS CON ANIMACIONES AVANZADAS */}
      <div className="animate-in slide-in-from-bottom-4 duration-500 delay-300">
        <Card className="border-2 overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            {/* ✅ ENHANCED TAB NAVIGATION CON PROGRESS INDICATOR */}
            <div className="border-b bg-gradient-to-r from-muted/50 to-muted/30">
              <div className="relative">
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                     style={{ width: `${((currentTabIndex + 1) / FORM_TABS.length) * 100}%` }}
                />
                
                <TabsList className="grid w-full grid-cols-5 h-auto p-3 bg-transparent">
                  {FORM_TABS.map((tab, index) => {
                    const Icon = getTabIcon(tab);
                    const status = getTabStatus(tab);
                    const isActive = activeTab === tab.id;
                    const isPassed = index < currentTabIndex;
                    
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className={cn(
                          "flex flex-col items-center space-y-3 p-4 rounded-xl transition-all duration-300",
                          "data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:scale-105",
                          "hover:scale-102 hover:bg-background/50",
                          status === 'error' && "text-destructive",
                          status === 'completed' && "text-emerald-600",
                          isPassed && "opacity-75"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                          isActive ? "bg-primary text-white shadow-lg" :
                          status === 'error' ? "bg-destructive/10 text-destructive" :
                          status === 'completed' ? "bg-emerald-100 text-emerald-600" :
                          "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}>
                          <Icon className={cn(
                            "transition-all duration-200",
                            isActive ? "h-6 w-6" : "h-5 w-5"
                          )} />
                        </div>
                        
                        <div className="text-center space-y-1">
                          <div className={cn(
                            "font-semibold text-sm transition-colors",
                            isActive && "text-primary"
                          )}>
                            {tab.label}
                          </div>
                          <div className="text-xs text-muted-foreground hidden sm:block">
                            {tab.description}
                          </div>
                          <div className="text-xs font-medium text-muted-foreground">
                            {index + 1}/{FORM_TABS.length}
                          </div>
                        </div>

                        {/* Status indicators */}
                        {status === 'completed' && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center animate-in scale-in duration-200">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {status === 'error' && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center animate-bounce">
                            <AlertCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
            </div>

            {/* ✅ TAB CONTENT CON TRANSICIONES */}
            <div className="p-8">
              <div
                key={activeTab}
                className="min-h-[600px] animate-in fade-in-0 duration-400"
              >
                {/* Cliente Tab */}
                <TabsContent value="cliente" className="mt-0 space-y-6">
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-foreground flex items-center justify-center">
                        <User className="h-5 w-5 mr-2 text-primary" />
                        Información del Cliente
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Datos personales del asegurado
                      </p>
                    </div>
                    
                    {/* ✅ GRID FUNCIONANDO - CON MEJOR ESPACIADO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <EnhancedFormField
                        id="corredor"
                        label="Corredor"
                        icon={<Building2 className="h-4 w-4" />}
                        value={formData.corredor || ''}
                        onChange={(value) => updateFormData('corredor', value)}
                        error={errors.corredor}
                        touched={touchedFields.has('corredor')}
                      />
                      
                      <EnhancedFormField
                        id="asegurado"
                        label="Nombre del Asegurado"
                        required
                        icon={<User className="h-4 w-4" />}
                        value={formData.asegurado || ''}
                        onChange={(value) => updateFormData('asegurado', value)}
                        error={errors.asegurado}
                        touched={touchedFields.has('asegurado')}
                      />
                      
                      <EnhancedFormField
                        id="documento"
                        label="Documento (CI/RUT)"
                        required
                        icon={<IdCard className="h-4 w-4" />}
                        value={formData.documento || ''}
                        onChange={(value) => updateFormData('documento', value)}
                        error={errors.documento}
                        touched={touchedFields.has('documento')}
                      />
                      
                      <EnhancedFormField
                        id="domicilio"
                        label="Domicilio"
                        icon={<MapPin className="h-4 w-4" />}
                        value={formData.domicilio || ''}
                        onChange={(value) => updateFormData('domicilio', value)}
                        error={errors.domicilio}
                        touched={touchedFields.has('domicilio')}
                      />
                      
                      <EnhancedFormField
                        id="telefono"
                        label="Teléfono"
                        icon={<Phone className="h-4 w-4" />}
                        value={formData.telefono || ''}
                        onChange={(value) => updateFormData('telefono', value)}
                        error={errors.telefono}
                        touched={touchedFields.has('telefono')}
                      />
                      
                      <EnhancedFormField
                        id="email"
                        label="Email"
                        type="email"
                        icon={<Mail className="h-4 w-4" />}
                        value={formData.email || ''}
                        onChange={(value) => updateFormData('email', value)}
                        error={errors.email}
                        touched={touchedFields.has('email')}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Póliza Tab */}
                <TabsContent value="poliza" className="mt-0 space-y-6">
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-foreground flex items-center justify-center">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        Datos de la Póliza
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Información específica de la póliza
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <EnhancedFormField
                        id="numeroPoliza"
                        label="Número de Póliza"
                        required
                        icon={<FileText className="h-4 w-4" />}
                        value={formData.numeroPoliza || ''}
                        onChange={(value) => updateFormData('numeroPoliza', value)}
                        error={errors.numeroPoliza}
                        touched={touchedFields.has('numeroPoliza')}
                      />
                      
                      <EnhancedFormField
                        id="endoso"
                        label="Endoso"
                        icon={<FileText className="h-4 w-4" />}
                        value={formData.endoso || ''}
                        onChange={(value) => updateFormData('endoso', value)}
                        error={errors.endoso}
                        touched={touchedFields.has('endoso')}
                      />
                      
                      <EnhancedFormField
                        id="desde"
                        label="Vigencia Desde"
                        type="date"
                        required
                        icon={<Calendar className="h-4 w-4" />}
                        value={formData.desde || ''}
                        onChange={(value) => updateFormData('desde', value)}
                        error={errors.desde}
                        touched={touchedFields.has('desde')}
                      />
                      
                      <EnhancedFormField
                        id="hasta"
                        label="Vigencia Hasta"
                        type="date"
                        required
                        icon={<Calendar className="h-4 w-4" />}
                        value={formData.hasta || ''}
                        onChange={(value) => updateFormData('hasta', value)}
                        error={errors.hasta}
                        touched={touchedFields.has('hasta')}
                      />
                    </div>
                    
                    {/* Company/Section info - Read only */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-4 rounded-lg">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Compañía</Label>
                        <div className="flex items-center space-x-2 p-3 bg-background rounded-md border">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span className="font-medium">{selectedCompany.alias}</span>
                          <Badge variant="secondary" className="text-xs">Seleccionada</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Sección</Label>
                        <div className="flex items-center space-x-2 p-3 bg-background rounded-md border">
                          <span className="text-lg">{selectedSection.icono}</span>
                          <span className="font-medium">{selectedSection.seccion}</span>
                          <Badge variant="secondary" className="text-xs">Seleccionada</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Vehículo Tab */}
                <TabsContent value="vehiculo" className="mt-0 space-y-6">
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-foreground flex items-center justify-center">
                        <Car className="h-5 w-5 mr-2 text-primary" />
                        Datos del Vehículo
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Información técnica del vehículo asegurado
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <EnhancedFormField
                        id="marca"
                        label="Marca"
                        required
                        icon={<Car className="h-4 w-4" />}
                        value={formData.marca || ''}
                        onChange={(value) => updateFormData('marca', value)}
                        error={errors.marca}
                        touched={touchedFields.has('marca')}
                      />
                      
                      <EnhancedFormField
                        id="modelo"
                        label="Modelo"
                        required
                        icon={<Car className="h-4 w-4" />}
                        value={formData.modelo || ''}
                        onChange={(value) => updateFormData('modelo', value)}
                        error={errors.modelo}
                        touched={touchedFields.has('modelo')}
                      />
                      
                      <EnhancedFormField
                        id="anio"
                        label="Año"
                        required
                        type="number"
                        icon={<Calendar className="h-4 w-4" />}
                        value={formData.anio || ''}
                        onChange={(value) => updateFormData('anio', value)}
                        error={errors.anio}
                        touched={touchedFields.has('anio')}
                      />
                      
                      <EnhancedFormField
                        id="combustible"
                        label="Combustible"
                        icon={<Car className="h-4 w-4" />}
                        value={formData.combustible || ''}
                        onChange={(value) => updateFormData('combustible', value)}
                        error={errors.combustible}
                        touched={touchedFields.has('combustible')}
                      />
                      
                      <EnhancedFormField
                        id="categoria"
                        label="Categoría"
                        icon={<Car className="h-4 w-4" />}
                        value={formData.categoria || ''}
                        onChange={(value) => updateFormData('categoria', value)}
                        error={errors.categoria}
                        touched={touchedFields.has('categoria')}
                      />
                      
                      <EnhancedFormField
                        id="matricula"
                        label="Matrícula"
                        icon={<IdCard className="h-4 w-4" />}
                        value={formData.matricula || ''}
                        onChange={(value) => updateFormData('matricula', value)}
                        error={errors.matricula}
                        touched={touchedFields.has('matricula')}
                      />
                      
                      <div className="md:col-span-2 lg:col-span-3">
                        <EnhancedFormField
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

                {/* Cobertura Tab */}
                <TabsContent value="cobertura" className="mt-0 space-y-6">
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-foreground flex items-center justify-center">
                        <Shield className="h-5 w-5 mr-2 text-primary" />
                        Cobertura y Condiciones
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Detalles de cobertura y forma de pago
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="md:col-span-2">
                        <EnhancedFormField
                          id="cobertura"
                          label="Tipo de Cobertura"
                          required
                          icon={<Shield className="h-4 w-4" />}
                          value={formData.cobertura || ''}
                          onChange={(value) => updateFormData('cobertura', value)}
                          error={errors.cobertura}
                          touched={touchedFields.has('cobertura')}
                        />
                      </div>
                      
                      <EnhancedFormField
                        id="premio"
                        label="Premio"
                        required
                        type="number"
                        icon={<DollarSign className="h-4 w-4" />}
                        value={formData.premio?.toString() || ''}
                        onChange={(value) => updateFormData('premio', parseFloat(value) || 0)}
                        error={errors.premio}
                        touched={touchedFields.has('premio')}
                      />
                      
                      <EnhancedFormField
                        id="total"
                        label="Total"
                        type="number"
                        icon={<DollarSign className="h-4 w-4" />}
                        value={formData.total?.toString() || ''}
                        onChange={(value) => updateFormData('total', parseFloat(value) || 0)}
                        error={errors.total}
                        touched={touchedFields.has('total')}
                      />
                      
                      <EnhancedFormField
                        id="formaPago"
                        label="Forma de Pago"
                        icon={<DollarSign className="h-4 w-4" />}
                        value={formData.formaPago || ''}
                        onChange={(value) => updateFormData('formaPago', value)}
                        error={errors.formaPago}
                        touched={touchedFields.has('formaPago')}
                      />
                      
                      <EnhancedFormField
                        id="cuotas"
                        label="Número de Cuotas"
                        type="number"
                        icon={<DollarSign className="h-4 w-4" />}
                        value={formData.cuotas?.toString() || ''}
                        onChange={(value) => updateFormData('cuotas', parseInt(value) || 1)}
                        error={errors.cuotas}
                        touched={touchedFields.has('cuotas')}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Resumen Tab */}
                <TabsContent value="resumen" className="mt-0 space-y-6">
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-foreground flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                        Resumen Final
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Revisa toda la información antes de enviar
                      </p>
                    </div>

                    {/* Summary cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SummaryCard
                        title="Cliente"
                        icon={<User className="h-5 w-5" />}
                        items={[
                          { label: 'Corredor', value: formData.corredor },
                          { label: 'Asegurado', value: formData.asegurado },
                          { label: 'Documento', value: formData.documento },
                          { label: 'Email', value: formData.email }
                        ]}
                      />
                      
                      <SummaryCard
                        title="Póliza"
                        icon={<FileText className="h-5 w-5" />}
                        items={[
                          { label: 'Número', value: formData.numeroPoliza },
                          { label: 'Vigencia', value: `${formData.desde} al ${formData.hasta}` },
                          { label: 'Compañía', value: selectedCompany.alias }
                        ]}
                      />
                      
                      <SummaryCard
                        title="Vehículo"
                        icon={<Car className="h-5 w-5" />}
                        items={[
                          { label: 'Marca/Modelo', value: `${formData.marca} ${formData.modelo}` },
                          { label: 'Año', value: formData.anio },
                          { label: 'Matrícula', value: formData.matricula }
                        ]}
                      />
                      
                      <SummaryCard
                        title="Cobertura"
                        icon={<Shield className="h-5 w-5" />}
                        items={[
                          { label: 'Tipo', value: formData.cobertura },
                          { label: 'Premio', value: `${formData.premio?.toLocaleString()}` },
                          { label: 'Forma de Pago', value: formData.formaPago }
                        ]}
                      />
                    </div>

                    {/* Observaciones */}
                    <div className="space-y-2">
                      <Label htmlFor="observaciones" className="text-sm font-medium flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Observaciones Adicionales
                      </Label>
                      <Textarea
                        id="observaciones"
                        placeholder="Agrega cualquier observación adicional..."
                        value={formData.observaciones || ''}
                        onChange={(e) => updateFormData('observaciones', e.target.value)}
                        rows={4}
                        className="resize-none transition-all duration-200 hover:border-primary/50 focus:border-primary"
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </Card>
      </div>

      {/* ✅ ENHANCED NAVIGATION */}
      <div className="flex justify-between items-center pt-8 animate-in fade-in-0 duration-400 delay-700">
        <Button
          variant="outline"
          onClick={onBack}
          className="min-w-[140px] hover:scale-105 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        
        <div className="flex space-x-4">
          {!isFirstTab && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="min-w-[120px] hover:scale-105 transition-all duration-200"
            >
              Anterior
            </Button>
          )}
          
          {!isLastTab ? (
            <Button
              onClick={handleNext}
              className="min-w-[140px] hover:scale-105 transition-all duration-200"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[200px] bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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

      {/* ✅ SUCCESS NOTIFICATION */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-4 duration-300">
          <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              ¡Formulario enviado exitosamente a Velneo!
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

// ================================================================================================
// ✅ ENHANCED FORM FIELD COMPONENT
// ================================================================================================

interface EnhancedFormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  type?: string;
  icon?: React.ReactNode;
  placeholder?: string;
}

const EnhancedFormField: React.FC<EnhancedFormFieldProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  touched,
  required = false,
  type = "text",
  icon,
  placeholder
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = error && touched;
  const isValid = !error && touched && value;
  
  return (
    <div className="space-y-2 w-full">
      <Label 
        htmlFor={id} 
        className={cn(
          "text-sm font-medium transition-colors duration-200 flex items-center",
          isFocused && "text-primary",
          hasError && "text-destructive",
          isValid && "text-emerald-600"
        )}
      >
        {icon && (
          <span className={cn(
            "inline-flex mr-2 transition-colors duration-200",
            isFocused && "text-primary",
            hasError && "text-destructive",
            isValid && "text-emerald-600"
          )}>
            {icon}
          </span>
        )}
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder || `Ingresa ${label.toLowerCase()}`}
          className={cn(
            "w-full transition-all duration-200 hover:border-primary/50",
            isFocused && "border-primary shadow-sm",
            hasError && "border-destructive focus:border-destructive",
            isValid && "border-emerald-500 focus:border-emerald-500"
          )}
        />
        
        {/* Status indicator */}
        {(hasError || isValid) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {hasError ? (
              <AlertCircle className="h-4 w-4 text-destructive animate-in scale-in duration-200" />
            ) : (
              <CheckCircle className="h-4 w-4 text-emerald-500 animate-in scale-in duration-200" />
            )}
          </div>
        )}

        {/* Focus ring effect */}
        {isFocused && (
          <div className="absolute inset-0 rounded-md ring-2 ring-primary/20 pointer-events-none animate-in fade-in duration-200" />
        )}
      </div>
      
      {hasError && (
        <p className="text-sm text-destructive flex items-center animate-in slide-in-from-top-2 duration-200">
          <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

// ================================================================================================
// ✅ SUMMARY CARD COMPONENT
// ================================================================================================

interface SummaryCardProps {
  title: string;
  icon: React.ReactNode;
  items: { label: string; value: string | undefined }[];
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, icon, items }) => (
  <Card className="border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
    <CardHeader className="pb-4">
      <CardTitle className="text-base flex items-center text-foreground">
        <div className="p-2 bg-primary/10 text-primary rounded-lg mr-3 transition-all duration-200">
          {icon}
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {items.map((item, index) => (
        <div 
          key={index} 
          className="flex justify-between items-center py-1 border-b border-border/30 last:border-0"
        >
          <span className="text-sm text-muted-foreground">{item.label}:</span>
          <span className={cn(
            "text-sm font-medium transition-colors duration-200",
            item.value ? "text-foreground" : "text-muted-foreground"
          )}>
            {item.value || 'No especificado'}
          </span>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default PolicyForm;