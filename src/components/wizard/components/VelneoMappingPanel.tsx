import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Zap,
  Target,
  Brain,
  TrendingUp
} from 'lucide-react';
import { PolizaFormData } from '../../../types/core/poliza';
import { DocumentProcessResult } from '../../../types/ui/wizard';
import { 
  mapAzureToFormData, 
  FormDataMappingResult,
  MappingContext,
  validateFormData,
  defaultPolizaValidationRules
} from '../../../utils/formDataMapper';

interface VelneoMappingPanelProps {
  extractedData: DocumentProcessResult | null;
  formData: PolizaFormData;
  onFormDataChange: (data: PolizaFormData) => void;
  context: MappingContext;
  isDarkMode: boolean;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

interface FieldMapping {
  azureField: string;
  azureValue: string;
  confidence: number;
  velneoField: string;
  velneoValue: any;
  isValid: boolean;
  validationMessage?: string;
  isEditable: boolean;
  suggestions?: string[];
}

export const VelneoMappingPanel: React.FC<VelneoMappingPanelProps> = ({
  extractedData,
  formData,
  onFormDataChange,
  context,
  isDarkMode,
  isVisible,
  onToggleVisibility
}) => {
  const [mappingResult, setMappingResult] = useState<FormDataMappingResult<PolizaFormData> | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOnlyProblems, setShowOnlyProblems] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  // Procesar mapeo cuando hay datos extraídos
  useEffect(() => {
    if (extractedData && extractedData.extractedFields) {
      setIsProcessing(true);
      setTimeout(() => {
        const result = mapAzureToFormData(extractedData, context);
        setMappingResult(result);
        generateFieldMappings(extractedData, result.data);
        setIsProcessing(false);
      }, 800); // Simular procesamiento
    }
  }, [extractedData, context]);

  // Generar mapeos de campos individuales
  const generateFieldMappings = (azureData: DocumentProcessResult, velneoData: PolizaFormData) => {
    if (!azureData.extractedFields) return;

    const mappings: FieldMapping[] = [];
    
    azureData.extractedFields.forEach((field: any) => {
      const mapping = createFieldMapping(field, velneoData);
      if (mapping) {
        mappings.push(mapping);
      }
    });

    // Ordenar por confianza (menor confianza primero para revisar)
    mappings.sort((a, b) => a.confidence - b.confidence);
    setFieldMappings(mappings);
  };

  // Crear mapeo individual de campo
  const createFieldMapping = (azureField: any, velneoData: PolizaFormData): FieldMapping | null => {
    const fieldName = azureField.name.toLowerCase();
    let velneoField = '';
    let velneoValue: any = '';
    let isValid = true;
    let validationMessage = '';

    // Mapear campos Azure → Velneo
    switch (fieldName) {
      case 'nombre':
      case 'client_name':
      case 'asegurado':
        velneoField = 'asegurado';
        velneoValue = velneoData.asegurado;
        break;
      case 'documento':
      case 'ci':
      case 'cedula':
        velneoField = 'documento';
        velneoValue = velneoData.documento;
        if (velneoValue && !/^\d{7,8}$/.test(velneoValue)) {
          isValid = false;
          validationMessage = 'CI debe tener 7 u 8 dígitos';
        }
        break;
      case 'numero_poliza':
      case 'poliza':
        velneoField = 'numeroPoliza';
        velneoValue = velneoData.numeroPoliza;
        break;
      case 'vigencia_desde':
      case 'fecha_inicio':
        velneoField = 'vigenciaDesde';
        velneoValue = velneoData.vigenciaDesde;
        break;
      case 'vigencia_hasta':
      case 'fecha_vencimiento':
        velneoField = 'vigenciaHasta';
        velneoValue = velneoData.vigenciaHasta;
        break;
      case 'prima':
      case 'premio':
        velneoField = 'prima';
        velneoValue = velneoData.prima;
        if (velneoValue < 0) {
          isValid = false;
          validationMessage = 'La prima no puede ser negativa';
        }
        break;
      case 'marca':
        velneoField = 'marca';
        velneoValue = velneoData.marca;
        break;
      case 'modelo':
        velneoField = 'modelo';
        velneoValue = velneoData.modelo;
        break;
      case 'matricula':
      case 'patente':
        velneoField = 'matricula';
        velneoValue = velneoData.matricula;
        if (velneoValue && !/^[A-Z]{2,3}\d{4}$|^\d{4}[A-Z]{2}$/.test(velneoValue)) {
          isValid = false;
          validationMessage = 'Formato de matrícula inválido';
        }
        break;
      default:
        return null;
    }

    return {
      azureField: azureField.name,
      azureValue: azureField.value,
      confidence: azureField.confidence || 0.8,
      velneoField,
      velneoValue,
      isValid,
      validationMessage,
      isEditable: true,
      suggestions: generateSuggestions(fieldName, azureField.value)
    };
  };

  // Generar sugerencias para campos
  const generateSuggestions = (fieldName: string, value: string): string[] => {
    const suggestions: string[] = [];
    
    switch (fieldName) {
      case 'documento':
      case 'ci':
        if (value.length < 7) {
          suggestions.push('Agregar ceros al inicio');
        }
        break;
      case 'matricula':
        if (!/^[A-Z]/.test(value)) {
          suggestions.push('Convertir a mayúsculas');
        }
        break;
      case 'nombre':
        if (value.toLowerCase() === value) {
          suggestions.push('Capitalizar nombre');
        }
        break;
    }

    return suggestions;
  };

  // Aplicar sugerencia
  const applySuggestion = (mapping: FieldMapping, suggestionIndex: number) => {
    const suggestion = mapping.suggestions?.[suggestionIndex];
    if (!suggestion) return;

    let newValue = mapping.velneoValue;

    switch (suggestion) {
      case 'Agregar ceros al inicio':
        newValue = mapping.azureValue.padStart(8, '0');
        break;
      case 'Convertir a mayúsculas':
        newValue = mapping.azureValue.toUpperCase();
        break;
      case 'Capitalizar nombre':
        newValue = mapping.azureValue.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        break;
    }

    updateFieldValue(mapping.velneoField, newValue);
  };

  // Actualizar valor de campo
  const updateFieldValue = (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value };
    onFormDataChange(updatedData);
  };

  // Re-procesar mapeo
  const reprocessMapping = () => {
    if (extractedData) {
      setIsProcessing(true);
      setTimeout(() => {
        const result = mapAzureToFormData(extractedData, context);
        setMappingResult(result);
        generateFieldMappings(extractedData, result.data);
        onFormDataChange(result.data);
        setIsProcessing(false);
      }, 1000);
    }
  };

  // Filtrar mapeos según configuración
  const filteredMappings = showOnlyProblems 
    ? fieldMappings.filter(m => !m.isValid || m.confidence < 0.7)
    : fieldMappings;

  // Estadísticas del mapeo
  const stats = {
    total: fieldMappings.length,
    valid: fieldMappings.filter(m => m.isValid).length,
    highConfidence: fieldMappings.filter(m => m.confidence >= 0.8).length,
    lowConfidence: fieldMappings.filter(m => m.confidence < 0.6).length
  };

  if (!isVisible) {
    return (
      <div className="flex justify-center mb-6">
        <button
          onClick={onToggleVisibility}
          className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50' 
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }`}
        >
          <Eye className="w-4 h-4 mr-2" />
          Mostrar panel de mapeo IA
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border mb-6 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* Header del panel */}
      <div className={`p-6 border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDarkMode 
                ? 'bg-gradient-to-br from-purple-700 to-pink-700' 
                : 'bg-gradient-to-br from-purple-600 to-pink-600'
            }`}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Mapeo Automático Azure → Velneo
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Datos extraídos con IA y mapeados automáticamente
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Estadísticas rápidas */}
            <div className="flex items-center space-x-4 mr-4">
              <div className="text-center">
                <div className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {stats.valid}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Válidos
                </div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {stats.highConfidence}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Alta confianza
                </div>
              </div>
            </div>

            {/* Controles */}
            <button
              onClick={() => setShowOnlyProblems(!showOnlyProblems)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showOnlyProblems
                  ? isDarkMode 
                    ? 'bg-orange-900/30 text-orange-300' 
                    : 'bg-orange-100 text-orange-700'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showOnlyProblems ? 'Mostrar todos' : 'Solo problemas'}
            </button>

            <button
              onClick={reprocessMapping}
              disabled={isProcessing}
              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                isDarkMode 
                  ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onToggleVisibility}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de progreso del mapeo */}
        {mappingResult && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Calidad del mapeo
              </span>
              <span className={`text-sm ${
                stats.valid === stats.total 
                  ? isDarkMode ? 'text-green-400' : 'text-green-600'
                  : isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {Math.round((stats.valid / stats.total) * 100)}%
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  stats.valid === stats.total 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                }`}
                style={{ width: `${(stats.valid / stats.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Contenido del panel */}
      <div className="p-6">
        {isProcessing ? (
          <div className="text-center py-12">
            <div className="relative inline-block">
              <div className="w-12 h-12 border-4 border-purple-200 rounded-full animate-spin"></div>
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className={`mt-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Procesando mapeo automático...
            </p>
          </div>
        ) : filteredMappings.length === 0 ? (
          <div className="text-center py-12">
            <Target className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {showOnlyProblems ? 'Sin problemas detectados' : 'Sin datos para mapear'}
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {showOnlyProblems 
                ? 'Todos los campos están correctamente mapeados y validados'
                : 'No se encontraron campos extraídos de Azure AI'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMappings.map((mapping, index) => (
              <FieldMappingCard
                key={`${mapping.azureField}-${index}`}
                mapping={mapping}
                isSelected={selectedField === mapping.velneoField}
                onClick={() => setSelectedField(
                  selectedField === mapping.velneoField ? null : mapping.velneoField
                )}
                onApplySuggestion={(suggestionIndex) => applySuggestion(mapping, suggestionIndex)}
                onValueChange={(value) => updateFieldValue(mapping.velneoField, value)}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}

        {/* Resumen de errores y warnings */}
        {mappingResult && (mappingResult.errors.length > 0 || mappingResult.warnings.length > 0) && (
          <div className="mt-6 space-y-3">
            {mappingResult.errors.length > 0 && (
              <div className={`p-4 rounded-xl border ${
                isDarkMode 
                  ? 'bg-red-900/20 border-red-800' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center mb-2">
                  <XCircle className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                  <h4 className={`font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                    Errores de mapeo ({mappingResult.errors.length})
                  </h4>
                </div>
                <ul className="space-y-1">
                  {mappingResult.errors.map((error, index) => (
                    <li key={index} className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {mappingResult.warnings.length > 0 && (
              <div className={`p-4 rounded-xl border ${
                isDarkMode 
                  ? 'bg-yellow-900/20 border-yellow-800' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center mb-2">
                  <AlertTriangle className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  <h4 className={`font-semibold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                    Advertencias ({mappingResult.warnings.length})
                  </h4>
                </div>
                <ul className="space-y-1">
                  {mappingResult.warnings.map((warning, index) => (
                    <li key={index} className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ Sub-componente: Card de mapeo individual
interface FieldMappingCardProps {
  mapping: FieldMapping;
  isSelected: boolean;
  onClick: () => void;
  onApplySuggestion: (index: number) => void;
  onValueChange: (value: string) => void;
  isDarkMode: boolean;
}

const FieldMappingCard: React.FC<FieldMappingCardProps> = ({
  mapping,
  isSelected,
  onClick,
  onApplySuggestion,
  onValueChange,
  isDarkMode
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(mapping.velneoValue);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return isDarkMode ? 'text-green-400' : 'text-green-600';
    if (confidence >= 0.6) return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
    return isDarkMode ? 'text-red-400' : 'text-red-600';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 0.8) return isDarkMode ? 'bg-green-900/30' : 'bg-green-100';
    if (confidence >= 0.6) return isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100';
    return isDarkMode ? 'bg-red-900/30' : 'bg-red-100';
  };

  const handleSave = () => {
    onValueChange(editValue);
    setIsEditing(false);
  };

  return (
    <div 
      className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
        isSelected
          ? isDarkMode
            ? 'border-purple-600 bg-purple-900/20'
            : 'border-purple-400 bg-purple-50'
          : isDarkMode
            ? 'border-gray-700 hover:border-gray-600'
            : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        {/* Info del campo */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {mapping.azureField}
            </span>
            <ArrowRight className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {mapping.velneoField}
            </span>
          </div>

          {/* Valores */}
          <div className="space-y-2">
            <div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Extraído:
              </span>
              <span className={`ml-2 font-mono text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                "{mapping.azureValue}"
              </span>
            </div>
            
            <div>
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Mapeado:
              </span>
              {isEditing ? (
                <div className="ml-2 inline-flex items-center space-x-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className={`font-mono text-sm px-2 py-1 rounded border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') setIsEditing(false);
                    }}
                    autoFocus
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave();
                    }}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <span 
                  className={`ml-2 font-mono text-sm cursor-pointer hover:underline ${
                    mapping.isValid 
                      ? isDarkMode ? 'text-green-300' : 'text-green-700'
                      : isDarkMode ? 'text-red-300' : 'text-red-700'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  "{mapping.velneoValue}"
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Indicadores */}
        <div className="flex flex-col items-end space-y-2">
          {/* Confianza */}
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${getConfidenceBg(mapping.confidence)}`}>
            <TrendingUp className={`w-3 h-3 inline mr-1 ${getConfidenceColor(mapping.confidence)}`} />
            <span className={getConfidenceColor(mapping.confidence)}>
              {Math.round(mapping.confidence * 100)}%
            </span>
          </div>

          {/* Estado de validación */}
          {mapping.isValid ? (
            <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          ) : (
            <XCircle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          )}
        </div>
      </div>

      {/* Mensaje de validación */}
      {!mapping.isValid && mapping.validationMessage && (
        <div className={`mt-3 p-2 rounded-lg text-sm ${
          isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
        }`}>
          {mapping.validationMessage}
        </div>
      )}

      {/* Sugerencias */}
      {isSelected && mapping.suggestions && mapping.suggestions.length > 0 && (
        <div className="mt-4 space-y-2">
          <h5 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Sugerencias:
          </h5>
          <div className="flex flex-wrap gap-2">
            {mapping.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  onApplySuggestion(index);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                <Zap className="w-3 h-3 inline mr-1" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VelneoMappingPanel;