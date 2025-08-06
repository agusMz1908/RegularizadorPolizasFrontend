import React from 'react';
import { usePolicyFormContext } from '../PolicyFormProvider';
import { FormField, SelectField, FormSection } from '@/components/wizard/FormComponents';
import type { SelectOption } from '@/types/ui';
import { FORMAS_PAGO } from '@/constants/textPlainOptions';

export function CondicionesPagoTab() {
  const { 
    formData, 
    updateField, 
    errors, 
    touchedFields,
    markFieldTouched,
    scannedData
  } = usePolicyFormContext();

  // Convertir formas de pago a SelectOption[]
  const formasPagoOptions: SelectOption[] = FORMAS_PAGO.map(forma => ({
    id: forma.id,
    name: forma.name,
    description: forma.description
  }));

  // Opciones de cuotas
  const cuotasOptions: SelectOption[] = [
    { id: 1, name: '1 cuota (Contado)' },
    { id: 2, name: '2 cuotas' },
    { id: 3, name: '3 cuotas' },
    { id: 4, name: '4 cuotas' },
    { id: 6, name: '6 cuotas' },
    { id: 12, name: '12 cuotas' }
  ];

  // Calcular valor de cuota automáticamente
  React.useEffect(() => {
    if (formData.total && formData.cuotas && formData.cuotas > 0) {
      const valorCuota = formData.total / formData.cuotas;
      updateField('valorCuota', Number(valorCuota.toFixed(2)));
    }
  }, [formData.total, formData.cuotas, updateField]);

  return (
    <div className="space-y-6">
      {/* Forma de Pago */}
      <FormSection 
        title="Forma de Pago" 
        description="Método de pago y financiación"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            id="formaPago"
            label="Forma de Pago"
            value={formData.formaPago}
            onChange={(value) => updateField('formaPago', value)}
            onBlur={() => markFieldTouched('formaPago')}
            options={formasPagoOptions}
            placeholder="Seleccionar forma de pago"
            required={true}
            error={errors.formaPago}
            touched={touchedFields.has('formaPago')}
            icon="CreditCard"
          />
          
          <SelectField
            id="cuotas"
            label="Cantidad de Cuotas"
            value={formData.cuotas}
            onChange={(value) => updateField('cuotas', value)}
            onBlur={() => markFieldTouched('cuotas')}
            options={cuotasOptions}
            placeholder="Seleccionar cuotas"
            error={errors.cuotas}
            touched={touchedFields.has('cuotas')}
            isNumeric={true}
            icon="Calculator"
          />
        </div>
      </FormSection>

      {/* Valores de Prima */}
      <FormSection 
        title="Valores de Prima" 
        description="Premio, total y valor de cuota"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField
            id="premio"
            label="Premio"
            value={formData.premio}
            onChange={(value) => updateField('premio', value)}
            onBlur={() => markFieldTouched('premio')}
            type="number"
            placeholder="0.00"
            required={true}
            error={errors.premio}
            touched={touchedFields.has('premio')}
            icon="DollarSign"
            min={0}
            step={0.01}
            showDataOrigin={!!scannedData}
            dataOrigin={scannedData ? 'azure' : undefined}
          />
          
          <FormField
            id="total"
            label="Total"
            value={formData.total}
            onChange={(value) => updateField('total', value)}
            onBlur={() => markFieldTouched('total')}
            type="number"
            placeholder="0.00"
            required={true}
            error={errors.total}
            touched={touchedFields.has('total')}
            icon="DollarSign"
            min={0}
            step={0.01}
            showDataOrigin={!!scannedData}
            dataOrigin={scannedData ? 'azure' : undefined}
          />
          
          <FormField
            id="valorCuota"
            label="Valor de Cuota"
            value={formData.valorCuota}
            onChange={(value) => updateField('valorCuota', value)}
            onBlur={() => markFieldTouched('valorCuota')}
            type="number"
            placeholder="0.00"
            error={errors.valorCuota}
            touched={touchedFields.has('valorCuota')}
            icon="Calculator"
            min={0}
            step={0.01}
            readonly={formData.cuotas > 0 && formData.total > 0}
          />
        </div>
      </FormSection>

      {/* Resumen de Pago */}
      {formData.total > 0 && formData.cuotas > 0 && (
        <FormSection 
          title="Resumen de Pago" 
          description="Detalle del plan de pagos"
        >
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Forma de pago:</span>
                <p className="font-semibold">{formData.formaPago || 'No especificada'}</p>
              </div>
              <div>
                <span className="text-gray-600">Cantidad de cuotas:</span>
                <p className="font-semibold">{formData.cuotas} {formData.cuotas === 1 ? 'cuota' : 'cuotas'}</p>
              </div>
              <div>
                <span className="text-gray-600">Valor por cuota:</span>
                <p className="font-semibold text-green-600">
                  $ {formData.valorCuota?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total a pagar:</span>
                <p className="text-xl font-bold text-blue-600">
                  $ {formData.total?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        </FormSection>
      )}

      {/* Información de ayuda */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-emerald-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-emerald-900 mb-1">Condiciones de pago</h4>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• El premio y total son valores obligatorios</li>
              <li>• El valor de la cuota se calcula automáticamente</li>
              <li>• La forma de pago puede afectar el precio final</li>
              {scannedData && (
                <li>• Los valores pueden venir del documento escaneado</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}