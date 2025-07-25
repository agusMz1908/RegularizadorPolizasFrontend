// src/components/wizard/steps/FormStep/components/VelneoSummary.tsx

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Send,
  FileText,
  User,
  Car,
  CreditCard,
  Building2,
  Calendar,
  DollarSign,
  Sparkles,
  Download,
  Eye,
  EyeOff,
  Clock,
  Shield,
  Target,
  Zap
} from 'lucide-react';
import { PolizaFormData, PolizaCreateRequest } from '../../../types/core/poliza';
import { DocumentProcessResult } from '../../../types/ui/wizard';
import { 
  mapFormDataToVelneo,
  validateFormData,
  defaultPolizaValidationRules,
  MappingContext,
  FormDataMappingResult
} from '../../../utils/formDataMapper';

interface VelneoSummaryProps {
  formData: PolizaFormData;
  extractedData: DocumentProcessResult | null;
  context: MappingContext;
  onSubmit: (velneoData: PolizaCreateRequest) => void;
  isSubmitting: boolean;
  isDarkMode: boolean;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

interface SummarySection {
  id: string;
  title: string;
  icon: React.ElementType;
  fields: SummaryField[];
  isComplete: boolean;
  errorCount: number;
  warningCount: number;
}

interface SummaryField {
  label: string;
  value: string | number;
  originalValue?: string;
  confidence?: number;
  source: 'manual' | 'azure' | 'calculated';
  isValid: boolean;
  errorMessage?: string;
  isRequired: boolean;
  formatted?: string;
}

export const VelneoSummary: React.FC<VelneoSummaryProps> = ({
  formData,
  extractedData,
  context,
  onSubmit,
  isSubmitting,
  isDarkMode,
  isVisible,
  onToggleVisibility
}) => {
  const [velneoMapping, setVelneoMapping] = useState<FormDataMappingResult<PolizaCreateRequest> | null>(null);
  const [summaryData, setSummaryData] = useState<SummarySection[]>([]);
  const [showOnlyProblems, setShowOnlyProblems] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Procesar datos cuando cambia el formulario
  useEffect(() => {
    if (formData) {
      // Generar mapeo a Velneo
      const mapping = mapFormDataToVelneo(formData, context);
      setVelneoMapping(mapping);

      // Validar datos
      const validation = validateFormData(formData, defaultPolizaValidationRules);
      setValidationResult(validation);

      // Generar resumen por secciones
      const summary = generateSummaryData(formData, extractedData, validation);
      setSummaryData(summary);
    }
  }, [formData, extractedData, context]);

  // Generar datos del resumen organizados por secciones
  const generateSummaryData = (
    data: PolizaFormData, 
    azure: DocumentProcessResult | null,
    validation: any
  ): SummarySection[] => {
    const azureFields = azure?.extractedFields || [];
    
    const getFieldSource = (fieldName: string): 'manual' | 'azure' | 'calculated' => {
        const azureField = azureFields.find((f: any) => 
        f.name.toLowerCase().includes(fieldName.toLowerCase()) ||
        fieldName.toLowerCase().includes(f.name.toLowerCase())
        );
      return azureField ? 'azure' : 'manual';
    };

    const getFieldError = (fieldName: string) => {
      return validation?.errors?.find((e: any) => e.field === fieldName);
    };

    const isFieldValid = (fieldName: string) => {
      return !getFieldError(fieldName);
    };

    const sections: SummarySection[] = [
      {
        id: 'cliente',
        title: 'Datos del Cliente',
        icon: User,
        fields: [
          {
            label: 'Nombre/Asegurado',
            value: data.asegurado,
            source: getFieldSource('asegurado'),
            isValid: isFieldValid('asegurado'),
            errorMessage: getFieldError('asegurado')?.message,
            isRequired: true,
            formatted: data.asegurado?.toUpperCase()
          },
          {
            label: 'Documento',
            value: data.documento,
            source: getFieldSource('documento'),
            isValid: isFieldValid('documento'),
            errorMessage: getFieldError('documento')?.message,
            isRequired: true,
            formatted: formatDocumento(data.documento)
          },
          {
            label: 'Teléfono',
            value: data.telefono || 'No especificado',
            source: getFieldSource('telefono'),
            isValid: true,
            isRequired: false,
            formatted: formatTelefono(data.telefono)
          },
          {
            label: 'Email',
            value: data.email || 'No especificado',
            source: getFieldSource('email'),
            isValid: isFieldValid('email'),
            errorMessage: getFieldError('email')?.message,
            isRequired: false
          },
          {
            label: 'Dirección',
            value: data.direccion || 'No especificada',
            source: getFieldSource('direccion'),
            isValid: true,
            isRequired: false
          }
        ],
        isComplete: false,
        errorCount: 0,
        warningCount: 0
      },
      {
        id: 'poliza',
        title: 'Datos de la Póliza',
        icon: FileText,
        fields: [
          {
            label: 'Número de Póliza',
            value: data.numeroPoliza,
            source: getFieldSource('numeroPoliza'),
            isValid: isFieldValid('numeroPoliza'),
            errorMessage: getFieldError('numeroPoliza')?.message,
            isRequired: true
          },
          {
            label: 'Vigencia Desde',
            value: data.vigenciaDesde,
            source: getFieldSource('vigenciaDesde'),
            isValid: isFieldValid('vigenciaDesde'),
            errorMessage: getFieldError('vigenciaDesde')?.message,
            isRequired: true,
            formatted: formatFecha(data.vigenciaDesde)
          },
          {
            label: 'Vigencia Hasta',
            value: data.vigenciaHasta,
            source: getFieldSource('vigenciaHasta'),
            isValid: isFieldValid('vigenciaHasta'),
            errorMessage: getFieldError('vigenciaHasta')?.message,
            isRequired: true,
            formatted: formatFecha(data.vigenciaHasta)
          },
          {
            label: 'Prima',
            value: data.prima || 0,
            source: getFieldSource('prima'),
            isValid: isFieldValid('prima'),
            errorMessage: getFieldError('prima')?.message,
            isRequired: true,
            formatted: formatMoneda(data.prima, data.moneda)
          },
          {
            label: 'Moneda',
            value: data.moneda,
            source: 'manual',
            isValid: true,
            isRequired: true
          },
          {
            label: 'Cobertura',
            value: data.cobertura || 'No especificada',
            source: 'manual',
            isValid: true,
            isRequired: false
          }
        ],
        isComplete: false,
        errorCount: 0,
        warningCount: 0
      },
      {
        id: 'vehiculo',
        title: 'Datos del Vehículo',
        icon: Car,
        fields: [
          {
            label: 'Marca',
            value: data.marca || 'No especificada',
            source: getFieldSource('marca'),
            isValid: true,
            isRequired: false
          },
          {
            label: 'Modelo',
            value: data.modelo || 'No especificado',
            source: getFieldSource('modelo'),
            isValid: true,
            isRequired: false
          },
          {
            label: 'Año',
            value: data.anio || new Date().getFullYear(),
            source: getFieldSource('anio'),
            isValid: true,
            isRequired: false
          },
          {
            label: 'Matrícula',
            value: data.matricula || 'No especificada',
            source: getFieldSource('matricula'),
            isValid: isFieldValid('matricula'),
            errorMessage: getFieldError('matricula')?.message,
            isRequired: false,
            formatted: data.matricula?.toUpperCase()
          },
          {
            label: 'Chasis',
            value: data.chasis || 'No especificado',
            source: getFieldSource('chasis'),
            isValid: true,
            isRequired: false
          },
          {
            label: 'Motor',
            value: data.motor || 'No especificado',
            source: getFieldSource('motor'),
            isValid: true,
            isRequired: false
          }
        ],
        isComplete: false,
        errorCount: 0,
        warningCount: 0
      },
      {
        id: 'comercial',
        title: 'Datos Comerciales',
        icon: DollarSign,
        fields: [
          {
            label: 'Prima Comercial',
            value: data.primaComercial || 0,
            source: 'calculated',
            isValid: true,
            isRequired: false,
            formatted: formatMoneda(data.primaComercial, data.moneda)
          },
          {
            label: 'Premio Total',
            value: data.premioTotal || 0,
            source: 'calculated',
            isValid: true,
            isRequired: false,
            formatted: formatMoneda(data.premioTotal, data.moneda)
          },
          {
            label: 'Forma de Pago',
            value: data.formaPago || 'Contado',
            source: 'manual',
            isValid: true,
            isRequired: false
          },
          {
            label: 'Cantidad de Cuotas',
            value: data.cantidadCuotas || 1,
            source: 'manual',
            isValid: true,
            isRequired: false
          },
          {
            label: 'Valor por Cuota',
            value: data.valorCuota || 0,
            source: 'calculated',
            isValid: true,
            isRequired: false,
            formatted: formatMoneda(data.valorCuota, data.moneda)
          }
        ],
        isComplete: false,
        errorCount: 0,
        warningCount: 0
      }
    ];

    // Calcular estadísticas por sección
    sections.forEach(section => {
      const requiredFields = section.fields.filter(f => f.isRequired);
      const completedRequired = requiredFields.filter(f => f.value && f.value !== '');
      const errors = section.fields.filter(f => !f.isValid);
      
      section.isComplete = completedRequired.length === requiredFields.length && errors.length === 0;
      section.errorCount = errors.length;
      section.warningCount = section.fields.filter(f => 
        f.source === 'azure' && (f.confidence || 1) < 0.7
      ).length;
    });

    return sections;
  };

  // Manejar envío
  const handleSubmit = () => {
    if (velneoMapping && velneoMapping.data && !isSubmitting) {
      onSubmit(velneoMapping.data);
    }
  };

  // Filtrar secciones según configuración
  const filteredSections = showOnlyProblems 
    ? summaryData.filter(s => s.errorCount > 0 || s.warningCount > 0)
    : summaryData;

  // Estadísticas generales
  const stats = {
    totalSections: summaryData.length,
    completeSections: summaryData.filter(s => s.isComplete).length,
    totalErrors: summaryData.reduce((sum, s) => sum + s.errorCount, 0),
    totalWarnings: summaryData.reduce((sum, s) => sum + s.warningCount, 0),
    readyToSubmit: summaryData.every(s => s.errorCount === 0)
  };

  if (!isVisible) {
    return (
      <div className="flex justify-center mb-6">
        <button
          onClick={onToggleVisibility}
          className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          <Eye className="w-4 h-4 mr-2" />
          Mostrar resumen Velneo
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
      {/* Header */}
      <div className={`p-6 border-b ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              stats.readyToSubmit
                ? isDarkMode 
                  ? 'bg-gradient-to-br from-green-700 to-emerald-700' 
                  : 'bg-gradient-to-br from-green-600 to-emerald-600'
                : isDarkMode
                  ? 'bg-gradient-to-br from-orange-700 to-red-700'
                  : 'bg-gradient-to-br from-orange-600 to-red-600'
            }`}>
              {stats.readyToSubmit ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Resumen para Velneo
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {stats.readyToSubmit 
                  ? 'Datos listos para enviar'
                  : `${stats.totalErrors} errores pendientes`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Estadísticas */}
            <div className="flex items-center space-x-4 mr-4">
              <div className="text-center">
                <div className={`text-lg font-bold ${
                  stats.readyToSubmit 
                    ? isDarkMode ? 'text-green-400' : 'text-green-600'
                    : isDarkMode ? 'text-red-400' : 'text-red-600'
                }`}>
                  {stats.completeSections}/{stats.totalSections}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Secciones OK
                </div>
              </div>
              {stats.totalErrors > 0 && (
                <div className="text-center">
                  <div className={`text-lg font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {stats.totalErrors}
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Errores
                  </div>
                </div>
              )}
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
              {showOnlyProblems ? 'Mostrar todo' : 'Solo problemas'}
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

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Completitud
            </span>
            <span className={`text-sm ${
              stats.readyToSubmit 
                ? isDarkMode ? 'text-green-400' : 'text-green-600'
                : isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
            }`}>
              {Math.round((stats.completeSections / stats.totalSections) * 100)}%
            </span>
          </div>
          <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                stats.readyToSubmit 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500'
              }`}
              style={{ width: `${(stats.completeSections / stats.totalSections) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {filteredSections.length === 0 ? (
          <div className="text-center py-12">
            <Target className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {showOnlyProblems ? 'Sin problemas detectados' : 'Sin datos para mostrar'}
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {showOnlyProblems 
                ? 'Todos los datos están correctos y listos para enviar'
                : 'No hay información disponible para mostrar'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSections.map(section => (
              <SummarySection
                key={section.id}
                section={section}
                isSelected={selectedSection === section.id}
                onClick={() => setSelectedSection(
                  selectedSection === section.id ? null : section.id
                )}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}

        {/* Resumen de tiempo de procesamiento */}
        {velneoMapping && (
          <div className={`mt-6 p-4 rounded-xl border ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-800' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    Tiempo de procesamiento
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                    Mapeo completado en {Math.round(velneoMapping.conversionTime)} ms
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {velneoMapping.fieldsProcessed}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                  Campos procesados
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botón de envío */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!stats.readyToSubmit || isSubmitting}
            className={`inline-flex items-center px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              stats.readyToSubmit && !isSubmitting
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                Enviando a Velneo...
              </>
            ) : stats.readyToSubmit ? (
              <>
                <Send className="w-5 h-5 mr-3" />
                Enviar a Velneo
                <Sparkles className="w-5 h-5 ml-3" />
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 mr-3" />
                Corregir errores para continuar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ Sub-componente: Sección del resumen
interface SummarySectionProps {
  section: SummarySection;
  isSelected: boolean;
  onClick: () => void;
  isDarkMode: boolean;
}

const SummarySection: React.FC<SummarySectionProps> = ({
  section,
  isSelected,
  onClick,
  isDarkMode
}) => {
  const IconComponent = section.icon;

  return (
    <div 
      className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
        isSelected
          ? isDarkMode
            ? 'border-blue-600 bg-blue-900/20'
            : 'border-blue-400 bg-blue-50'
          : isDarkMode
            ? 'border-gray-700 hover:border-gray-600'
            : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            section.isComplete
              ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
              : section.errorCount > 0
                ? isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
                : isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
          }`}>
            <IconComponent className="w-4 h-4" />
          </div>
          <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {section.title}
          </h4>
        </div>

        <div className="flex items-center space-x-3">
          {section.errorCount > 0 && (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
            }`}>
              {section.errorCount} error{section.errorCount !== 1 ? 'es' : ''}
            </span>
          )}
          {section.warningCount > 0 && (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
            }`}>
              {section.warningCount} aviso{section.warningCount !== 1 ? 's' : ''}
            </span>
          )}
          {section.isComplete && (
            <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          )}
        </div>
      </div>

      {isSelected && (
        <div className="space-y-2 mt-4">
          {section.fields.map((field, index) => (
            <div key={index} className="flex justify-between items-center py-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {field.label}
                  </span>
                  {field.isRequired && (
                    <span className="text-red-500 text-xs">*</span>
                  )}
                  <SourceIndicator source={field.source} isDarkMode={isDarkMode} />
                </div>
                {field.errorMessage && (
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {field.errorMessage}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className={`text-sm font-mono ${
                  field.isValid 
                    ? isDarkMode ? 'text-green-300' : 'text-green-700'
                    : isDarkMode ? 'text-red-300' : 'text-red-700'
                }`}>
                  {field.formatted || field.value || 'Sin valor'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ✅ Indicador de origen de datos
interface SourceIndicatorProps {
  source: 'manual' | 'azure' | 'calculated';
  isDarkMode: boolean;
}

const SourceIndicator: React.FC<SourceIndicatorProps> = ({ source, isDarkMode }) => {
  const getSourceConfig = (source: string) => {
    switch (source) {
      case 'azure':
        return {
          icon: Sparkles,
          color: isDarkMode ? 'text-purple-400' : 'text-purple-600',
          bg: isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100',
          label: 'IA'
        };
      case 'calculated':
        return {
          icon: Zap,
          color: isDarkMode ? 'text-blue-400' : 'text-blue-600',
          bg: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100',
          label: 'Calc'
        };
      default:
        return {
          icon: User,
          color: isDarkMode ? 'text-gray-400' : 'text-gray-600',
          bg: isDarkMode ? 'bg-gray-700' : 'bg-gray-100',
          label: 'Manual'
        };
    }
  };

  const config = getSourceConfig(source);
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${config.bg} ${config.color}`}>
      <IconComponent className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

// ✅ Funciones de formateo
const formatDocumento = (documento: string): string => {
  if (!documento) return '';
  return documento.replace(/\D/g, '').padStart(8, '0');
};

const formatTelefono = (telefono: string): string => {
  if (!telefono) return '';
  const clean = telefono.replace(/\D/g, '');
  if (clean.length === 8) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  }
  return telefono;
};

const formatFecha = (fecha: string): string => {
  if (!fecha) return '';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-UY');
};

const formatMoneda = (valor: number, moneda: string): string => {
  if (!valor) return `${moneda} 0`;
  return `${moneda} ${valor.toLocaleString('es-UY', { minimumFractionDigits: 2 })}`;
};

export default VelneoSummary;