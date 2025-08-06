import { usePolicyFormContext } from '../PolicyFormProvider';
import { TextareaField, FormSection } from '@/components/wizard/FormComponents';
import { MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ObservacionesTab() {
  const { 
    formData, 
    updateField, 
    errors, 
    touchedFields,
    scannedData,
    progress
  } = usePolicyFormContext();

  // Calcular resumen de completitud
  const totalFields = Object.keys(formData).length;
  const completedFields = Object.entries(formData).filter(([_, value]) => 
    value !== '' && value !== null && value !== undefined && value !== 0
  ).length;

  return (
    <div className="space-y-6">
      {/* Campo de Observaciones */}
      <FormSection 
        title="Observaciones y Notas" 
        description="Información adicional relevante para la póliza"
      >
        <TextareaField
          id="observaciones"
          label="Observaciones"
          value={formData.observaciones}
          onChange={(value) => updateField('observaciones', value)}
          placeholder="Ingrese cualquier observación o nota adicional sobre la póliza, el cliente, condiciones especiales, etc."
          rows={8}
          maxLength={1000}
          error={errors.observaciones}
          touched={touchedFields.has('observaciones')}
          showDataOrigin={!!scannedData && !!formData.observaciones}
          dataOrigin={scannedData && formData.observaciones ? 'azure' : undefined}
        />
      </FormSection>

      {/* Resumen del Formulario */}
      <FormSection 
        title="Resumen del Formulario" 
        description="Estado de completitud del formulario"
      >
        <div className="space-y-4">
          {/* Barra de progreso general */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Progreso General</span>
            <span className="text-sm font-semibold text-gray-900">{progress.overall}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.overall}%` }}
            />
          </div>

          {/* Estadísticas por pestaña */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {Object.entries(progress.byTab).map(([tabId, tabProgress]) => {
              const tabName = {
                'datos_basicos': 'Datos Básicos',
                'datos_poliza': 'Datos Póliza',
                'datos_vehiculo': 'Vehículo',
                'datos_cobertura': 'Cobertura',
                'condiciones_pago': 'Pago',
                'observaciones': 'Observaciones'
              }[tabId] || tabId;

              const isComplete = tabProgress.completion === 100;
              const hasErrors = tabProgress.errors > 0;

              return (
                <div 
                  key={tabId}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${hasErrors 
                      ? 'border-red-300 bg-red-50' 
                      : isComplete 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">{tabName}</span>
                    {hasErrors ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : null}
                  </div>
                  <div className="text-lg font-bold">
                    {tabProgress.completion}%
                  </div>
                  {hasErrors && (
                    <div className="text-xs text-red-600 mt-1">
                      {tabProgress.errors} error{tabProgress.errors > 1 ? 'es' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Campos completados */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Campos completados</span>
              <span className="text-sm font-semibold text-gray-900">
                {completedFields} de {totalFields}
              </span>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Información de ayuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 mt-0.5">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Acerca de las observaciones</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use este campo para agregar cualquier información relevante que no esté en otros campos</li>
              <li>• Puede incluir condiciones especiales, descuentos, bonificaciones, etc.</li>
              <li>• Las observaciones se incluirán en el registro de Velneo</li>
              <li>• Máximo 1000 caracteres</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mensaje de finalización */}
      {progress.overall === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-900 mb-1">¡Formulario completo!</h4>
              <p className="text-sm text-green-700">
                Todos los campos requeridos han sido completados. Puede revisar los datos y enviar el formulario a Velneo.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}