// src/components/wizard/PolicyMappingForm.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  ArrowLeft,
  Send,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';
import SmartFieldMapper from './SmartFieldMapper';
import { usePolicyMapping } from '../../hooks/usePolicyMapping';
import type { AzureProcessResponse } from '../../types/azureDocumentResult';
import type { PolicyFormData } from '../../types/poliza';
import type { MasterDataOptions } from  '../../types/mappings';

interface PolicyMappingFormProps {
  scannedData: AzureProcessResponse;
  onSubmit: (formData: PolicyFormData) => void;
  onBack: () => void;
}

// Field configuration
interface FieldConfig {
  id: string;
  label: string;
  category: 'basicos' | 'poliza' | 'vehiculo' | 'cobertura';
  masterDataKey?: keyof MasterDataOptions;
  required?: boolean;
}

const FIELD_CONFIGS: FieldConfig[] = [
  // Datos Básicos
  { id: 'corredor', label: 'Corredor', category: 'basicos' },
  { id: 'asegurado', label: 'Asegurado', category: 'basicos', required: true },
  { id: 'documento', label: 'Documento', category: 'basicos', required: true },
  { id: 'domicilio', label: 'Domicilio', category: 'basicos' },
  { id: 'telefono', label: 'Teléfono', category: 'basicos' },
  { id: 'email', label: 'Email', category: 'basicos' },
  
  // Datos Póliza
  { id: 'numeroPoliza', label: 'Número de Póliza', category: 'poliza', required: true },
  { id: 'desde', label: 'Vigencia Desde', category: 'poliza' },
  { id: 'hasta', label: 'Vigencia Hasta', category: 'poliza' },
  { id: 'endoso', label: 'Endoso', category: 'poliza' },
  
  // Datos Vehículo
  { id: 'marca', label: 'Marca', category: 'vehiculo' },
  { id: 'modelo', label: 'Modelo', category: 'vehiculo' },
  { id: 'anio', label: 'Año', category: 'vehiculo' },
  { id: 'combustible', label: 'Combustible', category: 'vehiculo', masterDataKey: 'combustibles' },
  { id: 'categoria', label: 'Categoría', category: 'vehiculo', masterDataKey: 'categorias' },
  { id: 'chasis', label: 'Chasis', category: 'vehiculo' },
  { id: 'matricula', label: 'Matrícula', category: 'vehiculo' },
  
  // Datos Cobertura
  { id: 'cobertura', label: 'Cobertura', category: 'cobertura', masterDataKey: 'coberturas' },
  { id: 'premio', label: 'Premio', category: 'cobertura' },
  { id: 'total', label: 'Total', category: 'cobertura' },
  { id: 'formaPago', label: 'Forma de Pago', category: 'cobertura', masterDataKey: 'formasPago' },
  { id: 'cuotas', label: 'Cuotas', category: 'cobertura' }
];

const PolicyMappingForm: React.FC<PolicyMappingFormProps> = ({
  scannedData,
  onSubmit,
  onBack
}) => {
  const {
    mappingResult,
    masterOptions,
    isLoading,
    error,
    recommendations,
    validateMapping,
    getMasterOptions,
    clearError
  } = usePolicyMapping();

  const [showRawData, setShowRawData] = useState(false);
  const [activeTab, setActiveTab] = useState('basicos');
  const [manualOverrides, setManualOverrides] = useState<Record<string, any>>({});

  // Validate automatic mapping on component mount
  useEffect(() => {
    if (scannedData?.datosVelneo) {
      validateMapping(scannedData.datosVelneo);
    }
  }, [scannedData, validateMapping]);

  // Load master options
  useEffect(() => {
    getMasterOptions();
  }, [getMasterOptions]);

  const handleManualOverride = (fieldName: string, value: any) => {
    setManualOverrides(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = () => {
    if (!mappingResult) return;

    // Combine automatic mapping with manual overrides
    const finalFormData: Partial<PolicyFormData> = {};

    FIELD_CONFIGS.forEach(config => {
      const mappedField = mappingResult.camposMapeados[config.id];
      const manualValue = manualOverrides[config.id];
      
      if (manualValue !== undefined) {
        (finalFormData as any)[config.id] = manualValue;
      } else if (mappedField?.valorMapeado !== undefined) {
        (finalFormData as any)[config.id] = mappedField.valorMapeado;
      }
    });

    onSubmit(finalFormData as PolicyFormData);
  };

  const getTabMetrics = (category: string) => {
    if (!mappingResult) return { total: 0, successful: 0, failed: 0 };
    
    const fieldsInCategory = FIELD_CONFIGS.filter(f => f.category === category);
    const total = fieldsInCategory.length;
    const successful = fieldsInCategory.filter(f => 
      mappingResult.camposMapeados[f.id]?.nivelConfianza !== 'failed'
    ).length;
    const failed = total - successful;

    return { total, successful, failed };
  };

  const getTabColor = (category: string) => {
    const { successful, failed } = getTabMetrics(category);
    if (failed === 0) return 'text-green-600';
    if (failed > successful) return 'text-red-600';
    return 'text-yellow-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
              <h3 className="text-lg font-semibold">Validando Mapeo Automático</h3>
              <p className="text-muted-foreground">
                Analizando datos extraídos y mapeando a campos de Velneo...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">Error al validar el mapeo automático</div>
              <div className="text-sm">{error}</div>
            </div>
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Button onClick={clearError}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!mappingResult) {
    return (
      <div className="space-y-6">
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Error al validar el mapeo automático. Intente nuevamente.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Button onClick={() => scannedData?.datosVelneo && validateMapping(scannedData.datosVelneo)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const totalFields = FIELD_CONFIGS.length;
  const successfulFields = Object.keys(mappingResult.camposMapeados).length - mappingResult.camposQueFallaronMapeo.length;
  const failedFields = mappingResult.camposQueFallaronMapeo.length;

  return (
    <div className="space-y-6">
      {/* Header with Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-primary" />
                Mapeo Automático Inteligente
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Validación automática de datos extraídos con indicadores de confianza
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawData(!showRawData)}
            >
              {showRawData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="ml-2">Datos Raw</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {mappingResult.porcentajeExito}%
              </div>
              <div className="text-sm text-muted-foreground">Éxito General</div>
              <Progress value={mappingResult.porcentajeExito} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mappingResult.camposConAltaConfianza}
              </div>
              <div className="text-sm text-muted-foreground">Alta Confianza</div>
              <Badge variant="outline" className="mt-1 text-green-600 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                90%+
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {mappingResult.camposConMediaConfianza + mappingResult.camposConBajaConfianza}
              </div>
              <div className="text-sm text-muted-foreground">Requiere Revisión</div>
              <Badge variant="outline" className="mt-1 text-yellow-600 border-yellow-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                &lt;90%
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {failedFields}
              </div>
              <div className="text-sm text-muted-foreground">Mapeo Manual</div>
              <Badge variant="outline" className="mt-1 text-red-600 border-red-200">
                <XCircle className="h-3 w-3 mr-1" />
                0%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {recommendations.map((rec, index) => (
                <div key={index} className="text-sm">{rec}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Raw Data View */}
      {showRawData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Datos Extraídos del PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-50 p-4 rounded-md overflow-auto max-h-40">
              {JSON.stringify(scannedData.datosVelneo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Field Mapping Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 p-1">
              {[
                { id: 'basicos', label: 'Datos Básicos' },
                { id: 'poliza', label: 'Póliza' },
                { id: 'vehiculo', label: 'Vehículo' },
                { id: 'cobertura', label: 'Cobertura' }
              ].map(tab => {
                const metrics = getTabMetrics(tab.id);
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="relative"
                  >
                    <span className={getTabColor(tab.id)}>{tab.label}</span>
                    <Badge 
                      variant="secondary" 
                      className="ml-2 text-xs"
                    >
                      {metrics.successful}/{metrics.total}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {['basicos', 'poliza', 'vehiculo', 'cobertura'].map(category => (
              <TabsContent key={category} value={category} className="p-6 space-y-4">
                {FIELD_CONFIGS
                  .filter(config => config.category === category)
                  .map(config => {
                    const mappedField = mappingResult.camposMapeados[config.id];
                    const masterOptionsForField = config.masterDataKey && masterOptions
                      ? masterOptions[config.masterDataKey]
                      : [];

                    return (
                      <SmartFieldMapper
                        key={config.id}
                        fieldName={config.id}
                        label={config.label}
                        extractedValue={mappedField?.valorExtraido || ''}
                        mappedField={mappedField}
                        masterOptions={Array.isArray(masterOptionsForField) ? masterOptionsForField : []}
                        onManualOverride={handleManualOverride}
                        onValidationRequest={() => scannedData?.datosVelneo && validateMapping(scannedData.datosVelneo)}
                      />
                    );
                  })}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Submit Actions */}
      <div className="flex justify-between items-center">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => scannedData?.datosVelneo && validateMapping(scannedData.datosVelneo)} 
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Revalidar
          </Button>
          
          <Button 
            onClick={handleSubmit}
            disabled={failedFields > 0}
            className="bg-primary"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar a Velneo ({successfulFields}/{totalFields} campos)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PolicyMappingForm;