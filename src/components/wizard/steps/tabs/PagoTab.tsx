// src/components/wizard/steps/FormStep/tabs/PagoTab.tsx

import React from 'react';
import { DollarSign, CreditCard, Calendar } from 'lucide-react';
import { PolizaFormData } from '../../../../../types/core/poliza';
import { UseFormValidationReturn } from '../../../../../hooks/wizard/useFormValidation';
import { DocumentProcessResult } from '../../../../../types/ui/wizard';

interface PagoTabProps {
  formData: PolizaFormData;
  onFormChange: (field: keyof PolizaFormData, value: any) => void;
  validation: UseFormValidationReturn;
  extractedData: DocumentProcessResult | null;
  isDarkMode: boolean;
}

export const PagoTab: React.FC<PagoTabProps> = ({
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

  const renderNumberInput = (
    field: keyof PolizaFormData,
    label: string,
    placeholder: string,
    required: boolean = false,
    isCurrency: boolean = true
  ) => {
    const error = getFieldError(field);
    const hasError = hasFieldError(field);

    return (
      <div>
        <label className={`block text-sm font-bold ${
          isDarkMode ? 'text-orange-300' : 'text-orange-800'
        } mb-2`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          {isCurrency && (
            <span className={`absolute left-4 top-3 font-bold text-lg ${
              isDarkMode ? 'text-orange-400' : 'text-orange-600'
            }`}>$</span>
          )}
          <input
            type="number"
            step="0.01"
            value={formData[field] as number || ''}
            onChange={(e) => onFormChange(field, parseFloat(e.target.value) || 0)}
            className={`w-full ${isCurrency ? 'pl-8' : 'pl-4'} pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-orange-500 transition-all duration-200 shadow-sm text-lg font-bold ${
              hasError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                : isDarkMode 
                  ? 'bg-gray-700/50 border-orange-700/30 text-gray-100 focus:ring-orange-500/30' 
                  : 'bg-white border-orange-200 focus:ring-orange-100'
            }`}
            placeholder={placeholder}
            required={required}
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <span className="mr-1">⚠️</span>
            {error.message}
          </p>
        )}
      </div>
    );
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
          isDarkMode ? 'text-orange-300' : 'text-orange-800'
        } mb-2`}>
          {icon && <span className="mr-2">{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type={type}
          value={formData[field] as string || ''}
          onChange={(e) => onFormChange(field, e.target.value)}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-orange-500 transition-all duration-200 shadow-sm ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
              : isDarkMode 
                ? 'bg-gray-700/50 border-orange-700/30 text-gray-100 focus:ring-orange-500/30' 
                : 'bg-white border-orange-200 focus:ring-orange-100'
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
          isDarkMode ? 'text-orange-300' : 'text-orange-800'
        } mb-2`}>
          {icon && <span className="mr-2">{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          value={formData[field] as string || ''}
          onChange={(e) => onFormChange(field, e.target.value)}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-orange-500 transition-all duration-200 shadow-sm font-bold ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
              : isDarkMode 
                ? 'bg-gray-700/50 border-orange-700/30 text-gray-100 focus:ring-orange-500/30' 
                : 'bg-white border-orange-200 focus:ring-orange-100'
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
          ? 'bg-gradient-to-br from-gray-800 to-orange-900/20 border border-orange-800/50' 
          : 'bg-gradient-to-r from-orange-50 to-yellow-100'
      }`}>
        <h3 className={`text-xl font-bold flex items-center ${
          isDarkMode ? 'text-orange-300' : 'text-orange-900'
        } mb-6`}>
          <DollarSign className="w-6 h-6 mr-3" />
          Condiciones de Pago
        </h3>

        <div className="space-y-6">
          {/* Primera fila: Importes principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderNumberInput(
              'prima',
              'Prima',
              '0.00',
              true
            )}
            
            {renderNumberInput(
              'primaComercial',
              'Prima Comercial',
              '63812.36'
            )}

            {renderNumberInput(
              'premioTotal',
              'Premio Total',
              '79410.00'
            )}
          </div>

          {/* Segunda fila: Forma de pago, Moneda, Cantidad de cuotas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInput(
              'formaPago',
              'Forma de Pago',
              'Ej: TARJETA DE CRÉDITO',
              'text',
              <CreditCard className="w-4 h-4 inline" />
            )}
            
            {renderSelect(
              'moneda',
              'Moneda',
              [
                { value: 'UYU', label: '🇺🇾 Peso Uruguayo (UYU)' },
                { value: 'USD', label: '🇺🇸 Dólar Americano (USD)' },
                { value: 'UI', label: '📊 Unidades Indexadas (UI)' }
              ],
              undefined,
              true
            )}

            {renderNumberInput(
              'cantidadCuotas',
              'Cantidad de Cuotas',
              '1',
              false,
              false
            )}
          </div>

          {/* Tercera fila: Valor por cuota */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderNumberInput(
              'valorCuota',
              'Valor por Cuota',
              '7941.00'
            )}
            
            {/* Espacios vacíos para mantener la grilla */}
            <div></div>
            <div></div>
          </div>

          {/* Card especial para Primera Cuota */}
          <div className={`rounded-xl p-4 ${
            isDarkMode 
              ? 'bg-gray-700/50 border border-orange-700/30' 
              : 'bg-white border-2 border-orange-200'
          }`}>
            <h4 className={`font-bold mb-4 flex items-center ${
              isDarkMode ? 'text-orange-300' : 'text-orange-800'
            }`}>
              <Calendar className="w-5 h-5 mr-2" />
              Primera Cuota
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput(
                'primeraCuotaFecha',
                'Fecha de Vencimiento',
                '',
                'date'
              )}

              {renderNumberInput(
                'primeraCuotaMonto',
                'Monto',
                '0.00'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoTab;