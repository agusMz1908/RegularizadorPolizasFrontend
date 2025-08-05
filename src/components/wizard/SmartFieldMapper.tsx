// src/components/wizard/SmartFieldMapper.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Edit3,
  Search,
  ArrowRight,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types based on backend DTOs
interface MappedField {
  valorExtraido: string;
  valorMapeado: any;
  confianza: number;
  opcionesDisponibles?: any[];
  nivelConfianza: 'high' | 'medium' | 'low' | 'failed';
}

interface SmartFieldMapperProps {
  fieldName: string;
  label: string;
  extractedValue: string;
  mappedField?: MappedField;
  masterOptions?: any[];
  onManualOverride: (fieldName: string, value: any) => void;
  onValidationRequest?: () => void;
  disabled?: boolean;
}

const SmartFieldMapper: React.FC<SmartFieldMapperProps> = ({
  fieldName,
  label,
  extractedValue,
  mappedField,
  masterOptions = [],
  onManualOverride,
  onValidationRequest,
  disabled = false
}) => {
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const confidence = mappedField?.confianza || 0;
  const confidenceLevel = mappedField?.nivelConfianza || 'failed';
  const mappedValue = mappedField?.valorMapeado;

  // Initialize manual value
  useEffect(() => {
    if (mappedValue && typeof mappedValue === 'object') {
      setManualValue(mappedValue.nombre || mappedValue.descripcion || mappedValue.codigo || '');
    } else {
      setManualValue(mappedValue || '');
    }
  }, [mappedValue]);

  // Filter options based on search
  const filteredOptions = masterOptions.filter(option => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      option.nombre?.toLowerCase().includes(searchLower) ||
      option.descripcion?.toLowerCase().includes(searchLower) ||
      option.codigo?.toLowerCase().includes(searchLower)
    );
  });

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceIcon = (level: string) => {
    switch (level) {
      case 'high': return <CheckCircle2 className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <AlertTriangle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  const getConfidenceText = (level: string, confidence: number) => {
    switch (level) {
      case 'high': return `Alta Confianza (${confidence}%)`;
      case 'medium': return `Media Confianza (${confidence}%)`;
      case 'low': return `Baja Confianza (${confidence}%)`;
      case 'failed': return 'Mapeo Fallido (0%)';
      default: return 'Sin Mapeo';
    }
  };

  const handleManualSelection = (selectedOption: any) => {
    setManualValue(selectedOption.nombre || selectedOption.descripcion || selectedOption);
    onManualOverride(fieldName, selectedOption);
    setIsManualMode(false);
  };

  const handleManualInput = () => {
    onManualOverride(fieldName, manualValue);
    setIsManualMode(false);
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      confidenceLevel === 'high' && "border-green-200 bg-green-50/30",
      confidenceLevel === 'medium' && "border-yellow-200 bg-yellow-50/30",
      confidenceLevel === 'low' && "border-orange-200 bg-orange-50/30",
      confidenceLevel === 'failed' && "border-red-200 bg-red-50/30",
      disabled && "opacity-50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-900">
            {label}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn("text-xs", getConfidenceColor(confidenceLevel))}
            >
              {getConfidenceIcon(confidenceLevel)}
              <span className="ml-1">{getConfidenceText(confidenceLevel, confidence)}</span>
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Comparison View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Extracted Value */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-500 flex items-center">
              <Search className="h-3 w-3 mr-1" />
              Valor Extraído
            </Label>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <code className="text-sm text-blue-800">
                {extractedValue || 'No detectado'}
              </code>
            </div>
          </div>

          {/* Mapped Value */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-500 flex items-center">
              <ArrowRight className="h-3 w-3 mr-1" />
              Valor Mapeado
            </Label>
            <div className={cn(
              "p-3 border rounded-md transition-colors",
              confidenceLevel === 'high' && "bg-green-50 border-green-200",
              confidenceLevel === 'medium' && "bg-yellow-50 border-yellow-200",
              confidenceLevel === 'low' && "bg-orange-50 border-orange-200",
              confidenceLevel === 'failed' && "bg-red-50 border-red-200"
            )}>
              {mappedValue ? (
                <div className="text-sm">
                  {typeof mappedValue === 'object' ? (
                    <div>
                      <div className="font-medium">{mappedValue.nombre || mappedValue.descripcion}</div>
                      {mappedValue.codigo && (
                        <div className="text-xs text-gray-500">Código: {mappedValue.codigo}</div>
                      )}
                    </div>
                  ) : (
                    <span className="font-medium">{mappedValue}</span>
                  )}
                </div>
              ) : (
                <span className="text-sm text-gray-500 italic">
                  {confidenceLevel === 'failed' ? 'Requiere selección manual' : 'No mapeado'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Manual Override Section */}
        {(confidenceLevel === 'failed' || confidenceLevel === 'low') && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {confidenceLevel === 'failed' 
                ? 'Este campo requiere selección manual'
                : 'Confianza baja. Considere revisar la selección automática'
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Manual Selection UI */}
        {!isManualMode ? (
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsManualMode(true)}
              disabled={disabled}
              className="text-xs"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              {confidenceLevel === 'failed' ? 'Seleccionar' : 'Editar'}
            </Button>
            
            {onValidationRequest && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onValidationRequest}
                disabled={disabled}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Revalidar
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3 p-3 bg-gray-50 rounded-md border">
            <Label className="text-sm font-medium">Selección Manual</Label>
            
            {masterOptions.length > 0 ? (
              <>
                <div className="space-y-2">
                  <Input
                    placeholder="Buscar opciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-sm"
                  />
                  
                  <Select onValueChange={(value) => {
                    const selected = masterOptions.find(opt => 
                      (opt.codigo || opt.nombre || opt) === value
                    );
                    handleManualSelection(selected || value);
                  }}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Seleccionar opción..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredOptions.map((option, index) => (
                        <SelectItem 
                          key={index} 
                          value={option.codigo || option.nombre || option}
                          className="text-sm"
                        >
                          <div>
                            <div>{option.nombre || option.descripcion || option}</div>
                            {option.codigo && (
                              <div className="text-xs text-gray-500">Código: {option.codigo}</div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                      {filteredOptions.length === 0 && (
                        <SelectItem value="no-results" disabled>
                          No se encontraron opciones
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Ingresar valor manual..."
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value)}
                  className="text-sm"
                />
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={masterOptions.length > 0 ? () => {} : handleManualInput}
                disabled={!manualValue}
                className="text-xs"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Confirmar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsManualMode(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Detailed Information */}
        {showDetails && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md border">
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>Campo:</strong> {fieldName}</div>
              <div><strong>Confianza:</strong> {confidence}%</div>
              <div><strong>Algoritmo:</strong> 
                {confidence >= 95 ? ' Coincidencia exacta' : 
                 confidence >= 80 ? ' Similitud alta' : 
                 confidence >= 50 ? ' Similitud parcial' : ' Sin coincidencias'}
              </div>
              {masterOptions.length > 0 && (
                <div><strong>Opciones disponibles:</strong> {masterOptions.length}</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartFieldMapper;