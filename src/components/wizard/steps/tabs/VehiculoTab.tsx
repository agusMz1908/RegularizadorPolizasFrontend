// src/components/wizard/steps/FormStep/tabs/VehiculoTab.tsx

import React from 'react';
import { Car } from 'lucide-react';
import { PolizaFormData } from '../../../../../types/core/poliza';
import { UseFormValidationReturn } from '../../../../../hooks/wizard/useFormValidation';
import { DocumentProcessResult } from '../../../../../types/ui/wizard';

interface VehiculoTabProps {
  formData: PolizaFormData;
  onFormChange: (field: keyof PolizaFormData, value: any) => void;
  validation: UseFormValidationReturn;
  extractedData: DocumentProcessResult | null;
  isDarkMode: boolean;
}

export const VehiculoTab: React.FC<VehiculoTabProps> = ({
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
    required: boolean = false,
    className: string = ''
  ) => {
    const error = getFieldError(field);
    const hasError = hasFieldError(field);

    return (
      <div>
        <label className={`block text-sm font-bold ${
          isDarkMode ? 'text-emerald-300' : 'text-green-800'
        } mb-2`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type={type}
          value={formData[field] as string || ''}
          onChange={(e) => onFormChange(field, e.target.value)}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${className} ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
              : isDarkMode 
                ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                : 'bg-white border-green-200 focus:ring-green-100'
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
    required: boolean = false
  ) => {
    const error = getFieldError(field);
    const hasError = hasFieldError(field);

    return (
      <div>
        <label className={`block text-sm font-bold ${
          isDarkMode ? 'text-emerald-300' : 'text-green-800'
        } mb-2`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          value={formData[field] as string || ''}
          onChange={(e) => onFormChange(field, e.target.value)}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
              : isDarkMode 
                ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                : 'bg-white border-green-200 focus:ring-green-100'
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
          ? 'bg-gradient-to-br from-gray-800 to-emerald-900/20 border border-emerald-800/50' 
          : 'bg-gradient-to-r from-green-50 to-emerald-100'
      }`}>
        <h3 className={`text-xl font-bold flex items-center ${
          isDarkMode ? 'text-emerald-300' : 'text-green-900'
        } mb-6`}>
          <Car className="w-6 h-6 mr-3" />
          Información del Vehículo
        </h3>

        <div className="space-y-6">
          {/* Descripción completa del vehículo */}
          {renderInput(
            'vehiculo',
            'Vehículo (Descripción Completa)',
            'Descripción completa del vehículo'
          )}

          {/* Primera fila: Marca, Modelo, Año, Matrícula */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderInput(
              'marca',
              'Marca',
              'Marca del vehículo',
              'text',
              true
            )}
            
            {renderInput(
              'modelo',
              'Modelo',
              'Modelo del vehículo',
              'text',
              true
            )}

            {renderInput(
              'anio',
              'Año',
              '2024'
            )}
            
            {renderInput(
              'matricula',
              'Matrícula',
              'ABC1234',
              'text',
              false,
              'font-mono'
            )}
          </div>

          {/* Segunda fila: Motor, Chasis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInput(
              'motor',
              'Motor',
              'Número de motor',
              'text',
              false,
              'font-mono'
            )}
            
            {renderInput(
              'chasis',
              'Chasis',
              'Número de chasis',
              'text',
              false,
              'font-mono'
            )}
          </div>

          {/* Tercera fila: Características del vehículo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderSelect(
              'combustible',
              'Combustible',
              [
                { value: 'NAFTA', label: 'Nafta' },
                { value: 'GASOIL', label: 'Gasoil' },
                { value: 'GNC', label: 'GNC' },
                { value: 'ELECTRICO', label: 'Eléctrico' },
                { value: 'HIBRIDO', label: 'Híbrido' }
              ]
            )}

            {renderSelect(
              'destino',
              'Destino',
              [
                { value: 'PARTICULAR', label: 'Particular' },
                { value: 'COMERCIAL', label: 'Comercial' },
                { value: 'TAXI', label: 'Taxi' },
                { value: 'REMIS', label: 'Remis' },
                { value: 'CARGA', label: 'Carga' }
              ]
            )}

            {renderSelect(
              'categoria',
              'Categoría',
              [
                { value: 'M1', label: 'M1 - Automóvil' },
                { value: 'N1', label: 'N1 - Camioneta' },
                { value: 'L3', label: 'L3 - Motocicleta' },
                { value: 'L6', label: 'L6 - Cuatriciclo' },
                { value: 'O1', label: 'O1 - Remolque' }
              ]
            )}

            {renderSelect(
              'calidad',
              'Calidad',
              [
                { value: '0KM', label: '0 KM' },
                { value: 'USADO', label: 'Usado' },
                { value: 'ANTIGUO', label: 'Antiguo' },
                { value: 'CLASICO', label: 'Clásico' }
              ],
              true
            )}
          </div>

          {/* Cuarta fila: Tipo y Uso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderSelect(
              'tipoVehiculo',
              'Tipo de Vehículo',
              [
                { value: 'SEDAN', label: 'Sedán' },
                { value: 'HATCHBACK', label: 'Hatchback' },
                { value: 'SUV', label: 'SUV' },
                { value: 'PICKUP', label: 'Pickup' },
                { value: 'COUPE', label: 'Coupé' },
                { value: 'CONVERTIBLE', label: 'Convertible' },
                { value: 'WAGON', label: 'Rural' },
                { value: 'VAN', label: 'Van' },
                { value: 'MOTOCICLETA', label: 'Motocicleta' }
              ]
            )}

            {renderSelect(
              'uso',
              'Uso',
              [
                { value: 'FAMILIAR', label: 'Familiar' },
                { value: 'TRABAJO', label: 'Trabajo' },
                { value: 'COMERCIAL', label: 'Comercial' },
                { value: 'PROFESIONAL', label: 'Profesional' },
                { value: 'DEPORTIVO', label: 'Deportivo' }
              ]
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiculoTab;