import { usePolicyFormContext } from '../PolicyFormProvider';
import { FormField, SelectField, FormSection } from '@/components/wizard/FormComponents';
import type { SelectOption } from '@/types/ui';
import type { MonedaDto } from '@/types/masterData';
import { DEPARTAMENTOS_URUGUAY } from '@/constants/textPlainOptions';

export function DatosCoberturaTab() {
  const { 
    formData, 
    updateField, 
    errors, 
    touchedFields,
    markFieldTouched,
    masterData,
    isLoading
  } = usePolicyFormContext();

  // Transformar monedas a SelectOption[]
  const monedaOptions: SelectOption[] = masterData?.Monedas?.map((item: MonedaDto) => ({
    id: item.id,
    name: item.nombre,
    description: item.simbolo
  })) || [];

  // Convertir departamentos a SelectOption[]
  const departamentosOptions: SelectOption[] = DEPARTAMENTOS_URUGUAY.map(dept => ({
    id: dept.id,
    name: dept.name,
    description: dept.description
  }));

  // Por ahora, coberturas dummy hasta que tengamos el maestro
  const coberturaOptions: SelectOption[] = [
    { id: 1, name: 'Terceros Completo', description: 'Cobertura contra terceros' },
    { id: 2, name: 'Todo Riesgo', description: 'Cobertura total' },
    { id: 3, name: 'Responsabilidad Civil', description: 'RC únicamente' }
  ];

  return (
    <div className="space-y-6">
      {/* Tipo de Cobertura */}
      <FormSection 
        title="Tipo de Cobertura" 
        description="Seleccione el tipo de cobertura y moneda"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            id="coberturaId"
            label="Cobertura"
            value={formData.coberturaId}
            onChange={(value) => updateField('coberturaId', value)}
            onBlur={() => markFieldTouched('coberturaId')}
            options={coberturaOptions}
            placeholder="Seleccionar cobertura"
            error={errors.coberturaId}
            touched={touchedFields.has('coberturaId')}
            isNumeric={true}
            icon="Shield"
          />
          
          <SelectField
            id="monedaId"
            label="Moneda"
            value={formData.monedaId}
            onChange={(value) => updateField('monedaId', value)}
            onBlur={() => markFieldTouched('monedaId')}
            options={monedaOptions}
            placeholder="Seleccionar moneda"
            required={true}
            error={errors.monedaId}
            touched={touchedFields.has('monedaId')}
            loading={isLoading}
            isNumeric={true}
            icon="DollarSign"
            dataOrigin="master"
            showDataOrigin={true}
            emptyMessage="No hay monedas disponibles"
          />
        </div>
      </FormSection>

      {/* Zona de Circulación */}
      <FormSection 
        title="Zona de Circulación" 
        description="Departamento principal de circulación"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="zonaCirculacion"
            label="Zona de Circulación"
            value={formData.zonaCirculacion}
            onChange={(value) => updateField('zonaCirculacion', value)}
            onBlur={() => markFieldTouched('zonaCirculacion')}
            placeholder="Ej: Montevideo, Nacional, etc."
            error={errors.zonaCirculacion}
            touched={touchedFields.has('zonaCirculacion')}
            icon="MapPin"
          />
          
          <FormField
            id="moneda"
            label="Código de Moneda"
            value={formData.moneda}
            onChange={(value) => updateField('moneda', value)}
            onBlur={() => markFieldTouched('moneda')}
            placeholder="Código de moneda (opcional)"
            error={errors.moneda}
            touched={touchedFields.has('moneda')}
            icon="DollarSign"
          />
        </div>
      </FormSection>

      {/* Información de ayuda */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-orange-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-orange-900 mb-1">Información de cobertura</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• La cobertura define el tipo de protección del seguro</li>
              <li>• La moneda es obligatoria para los cálculos de premio</li>
              <li>• La zona de circulación puede afectar el costo del seguro</li>
              <li>• Los departamentos disponibles son los de Uruguay</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}