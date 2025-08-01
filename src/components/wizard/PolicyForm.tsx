// src/components/wizard/PolicyForm.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Car, 
  User, 
  FileText, 
  DollarSign, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  ChevronRight,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/apiService';
import type { AzureProcessResponse } from '@/types/azureDocumentResult';
import type { CompanyDto, SeccionDto } from '@/types/maestros';

interface PolicyFormProps {
  scannedData: AzureProcessResponse;
  selectedCompany: CompanyDto;
  selectedSection: SeccionDto;
  onSubmit: (formData: PolicyFormData) => void;
  onBack: () => void;
}

interface PolicyFormData {
  // Datos básicos
  corredor: string;
  asegurado: string;
  domicilio: string;
  telefono: string;
  email: string;
  documento: string;
  
  // Datos póliza
  numeroPoliza: string;
  desde: string;
  hasta: string;
  endoso: string;
  
  // Datos vehículo
  marca: string;
  modelo: string;
  anio: string;
  combustible: string;
  categoria: string;
  chasis: string;
  matricula: string;
  
  // Datos cobertura
  cobertura: string;
  premio: number;
  total: number;
  formaPago: string;
  cuotas: number;
  
  // Observaciones
  observaciones: string;
}

const PolicyForm: React.FC<PolicyFormProps> = ({
  scannedData,
  selectedCompany,
  selectedSection,
  onSubmit,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState('datos-basicos');
  const [formData, setFormData] = useState<PolicyFormData>({} as PolicyFormData);
  const [combustibles, setCombustibles] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [coberturas, setCoberturas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar maestros del backend
  useEffect(() => {
    const loadMaestros = async () => {
      try {
        setIsLoading(true);
        const [combustiblesData, categoriasData, coberturasData] = await Promise.all([
          apiService.getCombustibles(),
          apiService.getCategorias(),
          apiService.getCoberturas()
        ]);
        
        setCombustibles(combustiblesData);
        setCategorias(categoriasData);
        setCoberturas(coberturasData);
        
        console.log('🔧 Maestros cargados:', {
          combustibles: combustiblesData.length,
          categorias: categoriasData.length,
          coberturas: coberturasData.length
        });
      } catch (error) {
        console.error('❌ Error cargando maestros:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMaestros();
  }, []);

  // Inicializar form data con datos escaneados
  useEffect(() => {
    if (scannedData) {
      const { datosVelneo } = scannedData;
      setFormData({
        // Datos básicos
        corredor: datosVelneo.datosBasicos.corredor || '',
        asegurado: datosVelneo.datosBasicos.asegurado || '',
        domicilio: datosVelneo.datosBasicos.domicilio || '',
        telefono: datosVelneo.datosBasicos.telefono || '',
        email: datosVelneo.datosBasicos.email || '',
        documento: datosVelneo.datosBasicos.documento || '',
        
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
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validaciones básicas
    if (!formData.numeroPoliza) newErrors.numeroPoliza = 'Número de póliza requerido';
    if (!formData.asegurado) newErrors.asegurado = 'Nombre del asegurado requerido';
    if (!formData.desde) newErrors.desde = 'Fecha desde requerida';
    if (!formData.hasta) newErrors.hasta = 'Fecha hasta requerida';
    if (!formData.marca) newErrors.marca = 'Marca requerida';
    if (!formData.modelo) newErrors.modelo = 'Modelo requerido';
    if (!formData.anio) newErrors.anio = 'Año requerido';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    } else {
      // Ir a la primera pestaña con errores
      const tabsWithErrors = {
        'datos-basicos': ['asegurado', 'documento'],
        'datos-poliza': ['numeroPoliza', 'desde', 'hasta'],
        'datos-vehiculo': ['marca', 'modelo', 'anio'],
        'datos-cobertura': ['cobertura', 'premio']
      };
      
      for (const [tab, fields] of Object.entries(tabsWithErrors)) {
        if (fields.some(field => errors[field])) {
          setActiveTab(tab);
          break;
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando maestros...</p>
        </div>
      </div>
    );
  }

  const getTabIcon = (tabId: string) => {
    switch (tabId) {
      case 'datos-basicos': return <User className="h-4 w-4" />;
      case 'datos-poliza': return <FileText className="h-4 w-4" />;
      case 'datos-vehiculo': return <Car className="h-4 w-4" />;
      case 'datos-cobertura': return <Shield className="h-4 w-4" />;
      case 'resumen': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getCompletionBadge = () => {
    const completitud = scannedData.porcentajeCompletitud;
    if (completitud >= 90) return <Badge variant="default" className="bg-green-500">Excelente</Badge>;
    if (completitud >= 70) return <Badge variant="default" className="bg-yellow-500">Bueno</Badge>;
    return <Badge variant="destructive">Requiere revisión</Badge>;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Formulario de Póliza
        </h2>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <span><strong>Archivo:</strong> {scannedData.archivo}</span>
          <span><strong>Completitud:</strong> {scannedData.porcentajeCompletitud}%</span>
          {getCompletionBadge()}
        </div>
      </div>

      {/* Form Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="datos-basicos" className="flex items-center space-x-2">
                {getTabIcon('datos-basicos')}
                <span>Cliente</span>
              </TabsTrigger>
              <TabsTrigger value="datos-poliza" className="flex items-center space-x-2">
                {getTabIcon('datos-poliza')}
                <span>Póliza</span>
              </TabsTrigger>
              <TabsTrigger value="datos-vehiculo" className="flex items-center space-x-2">
                {getTabIcon('datos-vehiculo')}
                <span>Vehículo</span>
              </TabsTrigger>
              <TabsTrigger value="datos-cobertura" className="flex items-center space-x-2">
                {getTabIcon('datos-cobertura')}
                <span>Cobertura</span>
              </TabsTrigger>
              <TabsTrigger value="resumen" className="flex items-center space-x-2">
                {getTabIcon('resumen')}
                <span>Resumen</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content: Datos Básicos */}
            <TabsContent value="datos-basicos" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="corredor">Corredor</Label>
                    <Input
                      id="corredor"
                      value={formData.corredor || ''}
                      onChange={(e) => updateFormData('corredor', e.target.value)}
                      className={cn(errors.corredor && "border-red-500")}
                    />
                    {errors.corredor && <p className="text-sm text-red-500">{errors.corredor}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="asegurado">Asegurado *</Label>
                    <Input
                      id="asegurado"
                      value={formData.asegurado || ''}
                      onChange={(e) => updateFormData('asegurado', e.target.value)}
                      className={cn(errors.asegurado && "border-red-500")}
                    />
                    {errors.asegurado && <p className="text-sm text-red-500">{errors.asegurado}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documento">Documento</Label>
                    <Input
                      id="documento"
                      value={formData.documento || ''}
                      onChange={(e) => updateFormData('documento', e.target.value)}
                      className={cn(errors.documento && "border-red-500")}
                    />
                    {errors.documento && <p className="text-sm text-red-500">{errors.documento}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="domicilio">Domicilio</Label>
                    <Input
                      id="domicilio"
                      value={formData.domicilio || ''}
                      onChange={(e) => updateFormData('domicilio', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono || ''}
                      onChange={(e) => updateFormData('telefono', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => updateFormData('email', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab Content: Datos Póliza */}
            <TabsContent value="datos-poliza" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="numeroPoliza">Número de Póliza *</Label>
                    <Input
                      id="numeroPoliza"
                      value={formData.numeroPoliza || ''}
                      onChange={(e) => updateFormData('numeroPoliza', e.target.value)}
                      className={cn(errors.numeroPoliza && "border-red-500")}
                    />
                    {errors.numeroPoliza && <p className="text-sm text-red-500">{errors.numeroPoliza}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desde">Fecha Desde *</Label>
                    <Input
                      id="desde"
                      type="date"
                      value={formData.desde || ''}
                      onChange={(e) => updateFormData('desde', e.target.value)}
                      className={cn(errors.desde && "border-red-500")}
                    />
                    {errors.desde && <p className="text-sm text-red-500">{errors.desde}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endoso">Endoso</Label>
                    <Input
                      id="endoso"
                      value={formData.endoso || ''}
                      onChange={(e) => updateFormData('endoso', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Compañía</Label>
                    <Input
                      value={selectedCompany.alias}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hasta">Fecha Hasta *</Label>
                    <Input
                      id="hasta"
                      type="date"
                      value={formData.hasta || ''}
                      onChange={(e) => updateFormData('hasta', e.target.value)}
                      className={cn(errors.hasta && "border-red-500")}
                    />
                    {errors.hasta && <p className="text-sm text-red-500">{errors.hasta}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Sección</Label>
                    <Input
                      value={selectedSection.seccion}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab Content: Datos Vehículo */}
            <TabsContent value="datos-vehiculo" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="marca">Marca *</Label>
                    <Input
                      id="marca"
                      value={formData.marca || ''}
                      onChange={(e) => updateFormData('marca', e.target.value)}
                      className={cn(errors.marca && "border-red-500")}
                    />
                    {errors.marca && <p className="text-sm text-red-500">{errors.marca}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo *</Label>
                    <Input
                      id="modelo"
                      value={formData.modelo || ''}
                      onChange={(e) => updateFormData('modelo', e.target.value)}
                      className={cn(errors.modelo && "border-red-500")}
                    />
                    {errors.modelo && <p className="text-sm text-red-500">{errors.modelo}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anio">Año *</Label>
                    <Input
                      id="anio"
                      value={formData.anio || ''}
                      onChange={(e) => updateFormData('anio', e.target.value)}
                      className={cn(errors.anio && "border-red-500")}
                    />
                    {errors.anio && <p className="text-sm text-red-500">{errors.anio}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="combustible">Combustible</Label>
                    <Select value={formData.combustible || ''} onValueChange={(value) => updateFormData('combustible', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona combustible" />
                      </SelectTrigger>
                      <SelectContent>
                        {combustibles.map((combustible) => (
                          <SelectItem key={combustible.id} value={combustible.nombre}>
                            {combustible.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría</Label>
                    <Select value={formData.categoria || ''} onValueChange={(value) => updateFormData('categoria', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.nombre}>
                            {categoria.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chasis">Chasis</Label>
                    <Input
                      id="chasis"
                      value={formData.chasis || ''}
                      onChange={(e) => updateFormData('chasis', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="matricula">Matrícula</Label>
                    <Input
                      id="matricula"
                      value={formData.matricula || ''}
                      onChange={(e) => updateFormData('matricula', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab Content: Datos Cobertura */}
            <TabsContent value="datos-cobertura" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cobertura">Cobertura</Label>
                    <Select value={formData.cobertura || ''} onValueChange={(value) => updateFormData('cobertura', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona cobertura" />
                      </SelectTrigger>
                      <SelectContent>
                        {coberturas.map((cobertura) => (
                          <SelectItem key={cobertura.id} value={cobertura.nombre}>
                            {cobertura.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="premio">Premio</Label>
                    <Input
                      id="premio"
                      type="number"
                      value={formData.premio || ''}
                      onChange={(e) => updateFormData('premio', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="formaPago">Forma de Pago</Label>
                    <Select value={formData.formaPago || ''} onValueChange={(value) => updateFormData('formaPago', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona forma de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONTADO">Contado</SelectItem>
                        <SelectItem value="TARJETA DE CRÉDITO">Tarjeta de Crédito</SelectItem>
                        <SelectItem value="DÉBITO AUTOMÁTICO">Débito Automático</SelectItem>
                        <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="total">Total</Label>
                    <Input
                      id="total"
                      type="number"
                      value={formData.total || ''}
                      onChange={(e) => updateFormData('total', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cuotas">Cantidad de Cuotas</Label>
                    <Select value={formData.cuotas?.toString() || ''} onValueChange={(value) => updateFormData('cuotas', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona cuotas" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} cuota{num > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observaciones">Observaciones</Label>
                    <Textarea
                      id="observaciones"
                      value={formData.observaciones || ''}
                      onChange={(e) => updateFormData('observaciones', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab Content: Resumen */}
            <TabsContent value="resumen" className="space-y-6 mt-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Resumen de la Póliza
                  </h3>
                  <p className="text-sm text-gray-600">
                    Revisa todos los datos antes de enviar a Velneo
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Cliente */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Cliente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><strong>Asegurado:</strong> {formData.asegurado}</div>
                      <div><strong>Documento:</strong> {formData.documento}</div>
                      <div><strong>Email:</strong> {formData.email}</div>
                    </CardContent>
                  </Card>

                  {/* Póliza */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Póliza
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><strong>Número:</strong> {formData.numeroPoliza}</div>
                      <div><strong>Vigencia:</strong> {formData.desde} - {formData.hasta}</div>
                      <div><strong>Compañía:</strong> {selectedCompany.alias}</div>
                    </CardContent>
                  </Card>

                  {/* Vehículo */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center">
                        <Car className="h-4 w-4 mr-2" />
                        Vehículo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><strong>Marca:</strong> {formData.marca}</div>
                      <div><strong>Modelo:</strong> {formData.modelo}</div>
                      <div><strong>Año:</strong> {formData.anio}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Métricas del escaneo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Métricas del Escaneo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Completitud</div>
                        <div className="font-semibold text-lg">{scannedData.porcentajeCompletitud}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Campos extraídos</div>
                        <div className="font-semibold text-lg">{scannedData.datosVelneo.metricas.camposExtraidos}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Tiempo procesamiento</div>
                        <div className="font-semibold text-lg">{(scannedData.tiempoProcesamiento / 1000).toFixed(1)}s</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Estado</div>
                        <div className="font-semibold text-lg text-green-600">
                          {scannedData.listoParaVelneo ? 'Listo' : 'Requiere revisión'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="min-w-[120px]"
        >
          Volver
        </Button>
        
        <Button
          size="lg"
          onClick={handleSubmit}
          className="min-w-[200px]"
        >
          Enviar a Velneo
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PolicyForm;