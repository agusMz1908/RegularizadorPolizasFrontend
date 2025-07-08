import React from 'react';
import { AlertTriangle, Save, Send } from 'lucide-react';
import { PolizaFormData } from '../../types/poliza';
import { usePolizaForm } from '../../hooks/usePolizaForm';
import { ErrorMessage } from '../common/ErrorMessage';

interface PolizaFormProps {
  initialData: PolizaFormData;
  ramoCode: string;
  confidence?: number;
  requiresVerification?: boolean;
  onSubmit: (data: PolizaFormData) => Promise<void>;
  onSave?: (data: PolizaFormData) => void;
  disabled?: boolean;
  className?: string;
}

export const PolizaForm: React.FC<PolizaFormProps> = ({
  initialData,
  ramoCode,
  confidence = 0,
  requiresVerification = false,
  onSubmit,
  onSave,
  disabled = false,
  className = '',
}) => {
  const {
    formData,
    validationErrors,
    isSubmitting,
    isDirty,
    updateField,
    submitForm,
    getFieldError,
    hasFieldError,
    isValid,
  } = usePolizaForm({
    initialData,
    ramoCode,
    onSubmit,
  });

  const handleSave = () => {
    onSave?.(formData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  const confidencePercentage = Math.round(confidence * 100);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Datos de la Póliza
          </h3>
          <div className="flex items-center space-x-4">
            {confidence > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Confianza: {confidencePercentage}%
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  confidencePercentage >= 80 ? 'bg-green-500' :
                  confidencePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
            )}
            
            {requiresVerification && (
              <div className="flex items-center space-x-1 text-yellow-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Requiere verificación</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Datos básicos de la póliza */}
          <div className="border-b border-gray-100 pb-6">
            <h4 className="font-medium text-gray-700 mb-4">Información General</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Póliza *
                </label>
                <input
                  type="text"
                  value={formData.numeroPoliza || ''}
                  onChange={(e) => updateField('numeroPoliza', e.target.value)}
                  disabled={disabled}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    hasFieldError('numeroPoliza') ? 'border-red-500' : 'border-gray-300'
                  } ${disabled ? 'bg-gray-50' : ''}`}
                  placeholder="Ej: 2542343434-001"
                />
                {hasFieldError('numeroPoliza') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('numeroPoliza')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prima</label>
                <input
                  type="number"
                  value={formData.prima || ''}
                  onChange={(e) => updateField('prima', Number(e.target.value))}
                  disabled={disabled}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    hasFieldError('prima') ? 'border-red-500' : 'border-gray-300'
                  } ${disabled ? 'bg-gray-50' : ''}`}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vigencia Desde *
                </label>
                <input
                  type="date"
                  value={formData.vigenciaDesde || ''}
                  onChange={(e) => updateField('vigenciaDesde', e.target.value)}
                  disabled={disabled}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    hasFieldError('vigenciaDesde') ? 'border-red-500' : 'border-gray-300'
                  } ${disabled ? 'bg-gray-50' : ''}`}
                />
                {hasFieldError('vigenciaDesde') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('vigenciaDesde')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vigencia Hasta *
                </label>
                <input
                  type="date"
                  value={formData.vigenciaHasta || ''}
                  onChange={(e) => updateField('vigenciaHasta', e.target.value)}
                  disabled={disabled}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    hasFieldError('vigenciaHasta') ? 'border-red-500' : 'border-gray-300'
                  } ${disabled ? 'bg-gray-50' : ''}`}
                />
                {hasFieldError('vigenciaHasta') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('vigenciaHasta')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Datos del asegurado */}
          <div className="border-b border-gray-100 pb-6">
            <h4 className="font-medium text-gray-700 mb-4">Datos del Asegurado</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.nombreAsegurado || ''}
                  onChange={(e) => updateField('nombreAsegurado', e.target.value)}
                  disabled={disabled}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    hasFieldError('nombreAsegurado') ? 'border-red-500' : 'border-gray-300'
                  } ${disabled ? 'bg-gray-50' : ''}`}
                  placeholder="Nombre completo del asegurado"
                />
                {hasFieldError('nombreAsegurado') && (
                  <p className="text-red-500 text-sm mt-1">{getFieldError('nombreAsegurado')}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                  <input
                    type="text"
                    value={formData.documentoAsegurado || ''}
                    onChange={(e) => updateField('documentoAsegurado', e.target.value)}
                    disabled={disabled}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-50' : ''}`}
                    placeholder="CI o RUT"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefonoAsegurado || ''}
                    onChange={(e) => updateField('telefonoAsegurado', e.target.value)}
                    disabled={disabled}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-50' : ''}`}
                    placeholder="Teléfono de contacto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.emailAsegurado || ''}
                    onChange={(e) => updateField('emailAsegurado', e.target.value)}
                    disabled={disabled}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-50' : ''}`}
                    placeholder="email@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.direccionAsegurado || ''}
                  onChange={(e) => updateField('direccionAsegurado', e.target.value)}
                  disabled={disabled}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-50' : ''}`}
                  placeholder="Dirección completa"
                />
              </div>
            </div>
          </div>

          {/* Datos del vehículo (solo para automóviles) */}
          {ramoCode === 'AUTO' && (
            <div className="border-b border-gray-100 pb-6">
              <h4 className="font-medium text-gray-700 mb-4">Datos del Vehículo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                  <input
                    type="text"
                    value={formData.marca || ''}
                    onChange={(e) => updateField('marca', e.target.value)}
                    disabled={disabled}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-50' : ''}`}
                    placeholder="Ej: Toyota"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                  <input
                    type="text"
                    value={formData.modelo || ''}
                    onChange={(e) => updateField('modelo', e.target.value)}
                    disabled={disabled}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-50' : ''}`}
                    placeholder="Ej: Corolla"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                  <input
                    type="text"
                    value={formData.año || ''}
                    onChange={(e) => updateField('año', e.target.value)}
                    disabled={disabled}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-50' : ''}`}
                    placeholder="Ej: 2023"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chapa</label>
                  <input
                    type="text"
                    value={formData.chapa || ''}
                    onChange={(e) => updateField('chapa', e.target.value)}
                    disabled={disabled}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-50' : ''}`}
                    placeholder="Ej: SAA1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chasis</label>
                  <input
                    type="text"
                    value={formData.chasis || ''}
                    onChange={(e) => updateField('chasis', e.target.value)}
                    disabled={disabled}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-50' : ''}`}
                    placeholder="Número de chasis"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="text"
                    value={formData.color || ''}
                    onChange={(e) => updateField('color', e.target.value)}
                    disabled={disabled}
                    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-50' : ''}`}
                    placeholder="Ej: Blanco"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Datos financieros */}
          <div className="border-b border-gray-100 pb-6">
            <h4 className="font-medium text-gray-700 mb-4">Información Financiera</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suma Asegurada</label>
                <input
                  type="number"
                  value={formData.sumaAsegurada || ''}
                  onChange={(e) => updateField('sumaAsegurada', Number(e.target.value))}
                  disabled={disabled}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-50' : ''}`}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deducible</label>
                <input
                  type="number"
                  value={formData.deducible || ''}
                  onChange={(e) => updateField('deducible', Number(e.target.value))}
                  disabled={disabled}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-50' : ''}`}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comisión (%)</label>
                <input
                  type="number"
                  value={formData.comision || ''}
                  onChange={(e) => updateField('comision', Number(e.target.value))}
                  disabled={disabled}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-50' : ''}`}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
            <textarea
              value={formData.observaciones || ''}
              onChange={(e) => updateField('observaciones', e.target.value)}
              disabled={disabled}
              rows={4}
              className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-50' : ''}`}
              placeholder="Observaciones adicionales..."
            />
          </div>
        </div>

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <ErrorMessage
            title="Errores de validación"
            message="Por favor corrige los siguientes errores:"
            details={validationErrors.map(e => `${e.field}: ${e.message}`).join('\n')}
            className="mt-6"
          />
        )}

        {/* Form actions */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {isDirty && '• Hay cambios sin guardar'}
          </div>
          
          <div className="flex space-x-3">
            {onSave && (
              <button
                type="button"
                onClick={handleSave}
                disabled={disabled || !isDirty}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>Guardar</span>
              </button>
            )}
            
            <button
              type="submit"
              disabled={disabled || !isValid || isSubmitting}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Enviando...' : 'Enviar a Velneo'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};