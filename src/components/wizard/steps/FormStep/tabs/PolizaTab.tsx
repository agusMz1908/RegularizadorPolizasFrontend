import React from 'react';
import { FileText, Calendar, Building, CheckCircle } from 'lucide-react';
import { PolizaFormData } from '../../../../../types/core/poliza';
import { UseFormValidationReturn } from '../../../../../hooks/wizard/useFormValidation';
import { DocumentProcessResult } from '../../../../../types/ui/wizard';

interface PolizaTabProps {
  formData: PolizaFormData;
  onFormChange: (field: keyof PolizaFormData, value: any) => void;
  validation: UseFormValidationReturn;
  extractedData: DocumentProcessResult | null;
  isDarkMode: boolean;
}

export const PolizaTab: React.FC<PolizaTabProps> = ({
  formData,
  onFormChange,
  validation,
  isDarkMode
}) => {
  const getFieldError = (field: keyof PolizaFormData) => {
    return validation.getFieldError(field);
  };

  const hasFieldError = (field: keyof PolizaFormData) => {
    return validation.hasFieldError(field);
  };

  const renderInput = (
    field: keyof PolizaFormData,
    label: string,
    placeholder: string,
    type: string = 'text',
    icon?: React.ReactNode,
    required: boolean = false,
    readOnly: boolean = false
  ) => {
    const error = getFieldError(field);
    const hasError = hasFieldError(field);

    return (
      <div>
        <label className={`block text-sm font-bold ${
          isDarkMode ? 'text-purple-300' : 'text-purple-800'
        } mb-2`}>
          {icon && <span className="mr-2">{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type={type}
          value={formData[field] as string || ''}
          onChange={(e) => onFormChange(field, e.target.value)}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-purple-500 transition-all duration-200 shadow-sm ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
              : isDarkMode 
                ? 'bg-gray-700/50 border-purple-700/30 text-gray-100 focus:ring-purple-500/30' 
                : 'bg-white border-purple-200 focus:ring-purple-100'
          } ${readOnly ? 'bg-green-50 cursor-not-allowed' : ''}`}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
        />
        {error && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <span className="mr-1">⚠️</span>
            {error.message}
          </p>
        )}
      </div>
    );
  };

  const renderSelect = (
    field: keyof PolizaFormData,
    label: string,
    options: { value: string; label: string }[],
    icon?: React.ReactNode,
    required: boolean = false
  ) => {
    const error = getFieldError(field);
    const hasError = hasFieldError(field);

    return (
      <div>
        <label className={`block text-sm font-bold ${
          isDarkMode ? 'text-purple-300' : 'text-purple-800'
        } mb-2`}>
          {icon && <span className="mr-2">{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          value={formData[field] as string || ''}
          onChange={(e) => onFormChange(field, e.target.value)}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-purple-500 transition-all duration-200 shadow-sm ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
              : isDarkMode 
                ? 'bg-gray-700/50 border-purple-700/30 text-gray-100 focus:ring-purple-500/30' 
                : 'bg-white border-purple-200 focus:ring-purple-100'
          }`}
          required={required}
        >
          <option value="" disabled>Seleccionar {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <span className="mr-1">⚠️</span>
            {error.message}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className={`rounded-2xl p-6 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 to-purple-900/20 border border-purple-800/50' 
          : 'bg-gradient-to-r from-purple-50 to-indigo-100'
      }`}>
        <h3 className={`text-xl font-bold flex items-center ${
          isDarkMode ? 'text-purple-300' : 'text-purple-900'
        } mb-6`}>
          <FileText className="w-6 h-6 mr-3" />
          Datos de la Póliza
        </h3>

        <div className="space-y-6">
          {/* Primera fila: Número de Póliza, Certificado, Estado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInput(
              'numeroPoliza',
              'Número de Póliza',
              'Número de póliza',
              'text',
              undefined,
              true
            )}
            
            {renderInput(
              'certificado',
              'Certificado',
              'Nº certificado'
            )}

            {renderInput(
              'estadoPoliza',
              'Estado Póliza',
              'Estado de la póliza'
            )}
          </div>

          {/* Segunda fila: Ramo, Plan/Cobertura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput(
              'ramo',
              'Ramo (Sección)',
              'Ramo de seguro'
            )}
            
            {renderInput(
              'cobertura',
              'Plan/Cobertura',
              'Plan o tipo de cobertura',
              'text',
              undefined,
              true
            )}
          </div>

          {/* Tercera fila: Corredor y Trámite */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput(
              'corredor',
              'Corredor',
              'Corredor de seguros'
            )}
            
            {renderSelect(
              'tramite',
              'Trámite',
              [
                { value: 'Nuevo', label: 'Nuevo' },
                { value: 'Renovación', label: 'Renovación' },
                { value: 'Endoso', label: 'Endoso' },
                { value: 'Anulación', label: 'Anulación' }
              ]
            )}
          </div>

          {/* Cuarta fila: Vigencias y Compañía */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInput(
              'vigenciaDesde',
              'Vigencia Desde',
              '',
              'date',
              <Calendar className="w-4 h-4 inline" />,
              true
            )}
            
            {renderInput(
              'vigenciaHasta',
              'Vigencia Hasta',
              '',
              'date',
              <Calendar className="w-4 h-4 inline" />,
              true
            )}

            {renderInput(
              'compania',
              'Compañía de Seguros',
              'Selecciona una compañía en el paso anterior',
              'text',
              <Building className="w-4 h-4 inline" />,
              true,
              true
            )}
          </div>
        </div>
      </div>

      {/* 🎯 NUEVA SECCIÓN: CAMPOS MAPEADOS PARA VELNEO */}
      <div className={`rounded-xl p-6 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-700 to-green-900/20 border border-green-800/50' 
          : 'bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-200'
      }`}>
        <h4 className={`text-lg font-bold flex items-center ${
          isDarkMode ? 'text-green-300' : 'text-green-900'
        } mb-4`}>
          <CheckCircle className="w-5 h-5 mr-2" />
          Campos Mapeados para Velneo
          <span className="ml-2 text-sm font-normal opacity-75">
            (Detectados automáticamente)
          </span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Trámite Velneo */}
          {renderSelect(
            'tramiteVelneo',
            'Trámite (CONTRA)',
            [
              { value: 'Nuevo', label: 'Nuevo (Emisión)' },
              { value: 'Renovacion', label: 'Renovación' },
              { value: 'Cambio', label: 'Cambio/Modificación' },
              { value: 'Endoso', label: 'Endoso' },
              { value: 'No Renueva', label: 'No Renueva' },
              { value: 'Cancelacion', label: 'Cancelación' }
            ]
          )}

          {/* Estado Póliza Velneo */}
          {renderSelect(
            'estadoPolizaVelneo',
            'Estado Póliza (CONVIG)',
            [
              { value: 'VIG', label: 'VIG - Vigente' },
              { value: 'VEN', label: 'VEN - Vencida' },
              { value: 'END', label: 'END - Endosada' },
              { value: 'CAN', label: 'CAN - Cancelada' },
              { value: 'ANT', label: 'ANT - Antecedente' }
            ]
          )}

          {/* Forma de Pago Velneo */}
          {renderSelect(
            'formaPagoVelneo',
            'Forma de Pago (CONSTA)',
            [
              { value: 'Efectivo', label: 'Efectivo' },
              { value: 'Tarjeta Cred.', label: 'Tarjeta de Crédito' },
              { value: 'Débito Banc.', label: 'Débito Bancario' },
              { value: 'Transferencia bancaria', label: 'Transferencia Bancaria' },
              { value: 'Cheque directo', label: 'Cheque Directo' },
              { value: 'Cobrador', label: 'Cobrador' },
              { value: 'Conforme', label: 'Conforme' },
              { value: 'Pass Card', label: 'Pass Card' }
            ]
          )}

          {/* Moneda Velneo */}
          {renderSelect(
            'monedaVelneo',
            'Moneda (MONCOD)',
            [
              { value: 'PES', label: 'PES - Pesos Uruguayos' },
              { value: 'DOL', label: 'DOL - Dólares' },
              { value: 'EU', label: 'EU - Euros' },
              { value: 'RS', label: 'RS - Reales' },
              { value: 'UF', label: 'UF - Unidad de Fomento' }
            ]
          )}
        </div>

        {/* Indicador de Mapeo Automático */}
        <div className={`mt-4 p-3 rounded-lg ${
          isDarkMode 
            ? 'bg-green-900/30 border border-green-800/50' 
            : 'bg-green-100 border border-green-300'
        }`}>
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            <span className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
              Campos mapeados automáticamente desde Azure Document Intelligence. 
              Puedes modificarlos si es necesario antes de enviar a Velneo.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolizaTab;