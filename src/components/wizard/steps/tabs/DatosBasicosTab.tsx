// src/components/wizard/steps/FormStep/tabs/DatosBasicosTab.tsx

import React from 'react';
import { User, Phone, Mail, MapPin } from 'lucide-react';
import { PolizaFormData } from '../../../../../types/core/poliza';
import { UseFormValidationReturn } from '../../../../../hooks/wizard/useFormValidation';
import { DocumentProcessResult } from '../../../../../types/ui/wizard';

interface DatosBasicosTabProps {
  formData: PolizaFormData;
  onFormChange: (field: keyof PolizaFormData, value: any) => void;
  validation: UseFormValidationReturn;
  extractedData: DocumentProcessResult | null;
  isDarkMode: boolean;
}

export const DatosBasicosTab: React.FC<DatosBasicosTabProps> = ({
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
    required: boolean = false
  ) => {
    const error = getFieldError(field);
    const hasError = hasFieldError(field);

    return (
      <div>
        <label className={`block text-sm font-bold ${
          isDarkMode ? 'text-blue-300' : 'text-blue-800'
        } mb-2`}>
          {icon && <span className="mr-2">{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type={type}
          value={formData[field] as string || ''}
          onChange={(e) => onFormChange(field, e.target.value)}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
              : isDarkMode 
                ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                : 'bg-white border-blue-200 focus:ring-blue-100'
          }`}
          placeholder={placeholder}
          required={required}
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

  return (
    <div className="space-y-8">
      <div className={`rounded-2xl p-6 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 to-blue-900/20 border border-blue-800/50' 
          : 'bg-gradient-to-r from-blue-50 to-cyan-100'
      }`}>
        <h3 className={`text-xl font-bold flex items-center ${
          isDarkMode ? 'text-blue-300' : 'text-blue-900'
        } mb-6`}>
          <User className="w-6 h-6 mr-3" />
          Datos Básicos
        </h3>

        <div className="space-y-6">
          {/* Primera fila: Corredor y Asegurado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput(
              'corredor',
              'Corredor',
              'Nombre del corredor'
            )}
            {renderInput(
              'asegurado',
              'Asegurado',
              'Nombre del asegurado',
              'text',
              undefined,
              true
            )}
          </div>

          {/* Segunda fila: Documento y Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput(
              'documento',
              'Documento',
              'CI o RUC'
            )}
            
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              } mb-2`}>Tipo</label>
              <select
                value={formData.tipo || ''}
                onChange={(e) => onFormChange('tipo', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                    : 'bg-white border-blue-200 focus:ring-blue-100'
                }`}
              >
                <option value="" disabled>Seleccionar tipo</option>
                <option value="PERSONA">Líneas personales</option>
                <option value="EMPRESA">Líneas comerciales</option>
              </select>
            </div>
          </div>

          {/* Tercera fila: Dirección completa */}
          {renderInput(
            'direccion',
            'Dirección',
            'Dirección completa',
            'text',
            <MapPin className="w-4 h-4 inline" />
          )}

          {/* Cuarta fila: Departamento y Localidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput(
              'departamento',
              'Departamento',
              'Departamento'
            )}
            {renderInput(
              'localidad',
              'Localidad',
              'Localidad'
            )}
          </div>

          {/* Quinta fila: Teléfono y Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput(
              'telefono',
              'Teléfono',
              'Número de teléfono',
              'tel',
              <Phone className="w-4 h-4 inline" />
            )}
            {renderInput(
              'email',
              'Email',
              'Correo electrónico',
              'email',
              <Mail className="w-4 h-4 inline" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatosBasicosTab;