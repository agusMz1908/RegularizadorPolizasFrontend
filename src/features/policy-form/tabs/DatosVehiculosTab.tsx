import { usePolicyFormContext } from '../PolicyFormProvider';
import { FormField, SelectField, FormSection } from '@/components/wizard/FormComponents';
import type { SelectOption } from '@/types/ui';
import type { DestinoDto, CombustibleDto, CalidadDto, CategoriaDto } from '@/types/masterData';

export function DatosVehiculoTab() {
  const { 
    formData, 
    updateField, 
    errors, 
    touchedFields,
    markFieldTouched,
    masterData,
    isLoading,
    scannedData
  } = usePolicyFormContext();

  // Transformar datos maestros a SelectOption[]
  const destinoOptions: SelectOption[] = masterData?.Destinos?.map((item: DestinoDto) => ({
    id: item.id,
    name: item.desnom
  })) || [];

  const combustibleOptions: SelectOption[] = masterData?.Combustibles?.map((item: CombustibleDto) => ({
    id: item.id,
    name: item.name
  })) || [];

  const calidadOptions: SelectOption[] = masterData?.Calidades?.map((item: CalidadDto) => ({
    id: item.id,
    name: item.caldsc
  })) || [];

  const categoriaOptions: SelectOption[] = masterData?.Categorias?.map((item: CategoriaDto) => ({
    id: item.id,
    name: item.catdsc
  })) || [];

  return (
    <div className="space-y-6">
      {/* Identificación del Vehículo */}
      <FormSection 
        title="Identificación del Vehículo" 
        description="Marca, modelo y año"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="marcaModelo"
            label="Marca y Modelo"
            value={formData.marcaModelo}
            onChange={(value) => updateField('marcaModelo', value)}
            onBlur={() => markFieldTouched('marcaModelo')}
            placeholder="Ej: Toyota Corolla"
            required={true}
            error={errors.marcaModelo}
            touched={touchedFields.has('marcaModelo')}
            icon="Car"
            showDataOrigin={!!scannedData}
            dataOrigin={scannedData ? 'azure' : undefined}
          />
          
          <FormField
            id="anio"
            label="Año"
            value={formData.anio}
            onChange={(value) => updateField('anio', value)}
            onBlur={() => markFieldTouched('anio')}
            type="text"
            placeholder="Ej: 2020"
            required={true}
            error={errors.anio}
            touched={touchedFields.has('anio')}
            icon="Calendar"
            showDataOrigin={!!scannedData}
            dataOrigin={scannedData ? 'azure' : undefined}
          />
        </div>
      </FormSection>

      {/* Datos de Registro */}
      <FormSection 
        title="Datos de Registro" 
        description="Matrícula, motor y chasis"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            id="matricula"
            label="Matrícula"
            value={formData.matricula}
            onChange={(value) => updateField('matricula', value)}
            onBlur={() => markFieldTouched('matricula')}
            placeholder="Ej: ABC-1234"
            error={errors.matricula}
            touched={touchedFields.has('matricula')}
            icon="FileText"
            showDataOrigin={!!scannedData}
            dataOrigin={scannedData ? 'azure' : undefined}
          />
          
          <FormField
            id="motor"
            label="Motor"
            value={formData.motor}
            onChange={(value) => updateField('motor', value)}
            onBlur={() => markFieldTouched('motor')}
            placeholder="Número de motor"
            error={errors.motor}
            touched={touchedFields.has('motor')}
            icon="Car"
            showDataOrigin={!!scannedData}
            dataOrigin={scannedData ? 'azure' : undefined}
          />
          
          <FormField
            id="chasis"
            label="Chasis"
            value={formData.chasis}
            onChange={(value) => updateField('chasis', value)}
            onBlur={() => markFieldTouched('chasis')}
            placeholder="Número de chasis"
            error={errors.chasis}
            touched={touchedFields.has('chasis')}
            icon="FileText"
            showDataOrigin={!!scannedData}
            dataOrigin={scannedData ? 'azure' : undefined}
          />
        </div>
      </FormSection>

      {/* Características del Vehículo */}
      <FormSection 
        title="Características del Vehículo" 
        description="Destino, combustible, calidad y categoría"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            id="destinoId"
            label="Destino"
            value={formData.destinoId}
            onChange={(value) => updateField('destinoId', value)}
            onBlur={() => markFieldTouched('destinoId')}
            options={destinoOptions}
            placeholder="Seleccionar destino"
            required={true}
            error={errors.destinoId}
            touched={touchedFields.has('destinoId')}
            loading={isLoading}
            isNumeric={true}
            icon="Car"
            dataOrigin="master"
            showDataOrigin={true}
            emptyMessage="No hay destinos disponibles"
          />
          
          <SelectField
            id="combustibleId"
            label="Combustible"
            value={formData.combustibleId}
            onChange={(value) => updateField('combustibleId', value)}
            onBlur={() => markFieldTouched('combustibleId')}
            options={combustibleOptions}
            placeholder="Seleccionar combustible"
            required={true}
            error={errors.combustibleId}
            touched={touchedFields.has('combustibleId')}
            loading={isLoading}
            isNumeric={false}  // Combustible usa string
            icon="Zap"
            dataOrigin="master"
            showDataOrigin={true}
            emptyMessage="No hay combustibles disponibles"
          />
          
          <SelectField
            id="calidadId"
            label="Calidad"
            value={formData.calidadId}
            onChange={(value) => updateField('calidadId', value)}
            onBlur={() => markFieldTouched('calidadId')}
            options={calidadOptions}
            placeholder="Seleccionar calidad"
            error={errors.calidadId}
            touched={touchedFields.has('calidadId')}
            loading={isLoading}
            isNumeric={true}
            icon="Shield"
            dataOrigin="master"
            showDataOrigin={true}
            emptyMessage="No hay calidades disponibles"
          />
          
          <SelectField
            id="categoriaId"
            label="Categoría"
            value={formData.categoriaId}
            onChange={(value) => updateField('categoriaId', value)}
            onBlur={() => markFieldTouched('categoriaId')}
            options={categoriaOptions}
            placeholder="Seleccionar categoría"
            error={errors.categoriaId}
            touched={touchedFields.has('categoriaId')}
            loading={isLoading}
            isNumeric={true}
            icon="Car"
            dataOrigin="master"
            showDataOrigin={true}
            emptyMessage="No hay categorías disponibles"
          />
        </div>
      </FormSection>

      {/* Información de ayuda */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-purple-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-purple-900 mb-1">Datos del vehículo</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• La marca y modelo pueden venir juntos del escaneo</li>
              <li>• Los campos de destino, combustible, calidad y categoría son maestros de Velneo</li>
              <li>• El año debe ser un valor válido (entre 1900 y el año actual + 1)</li>
              {isLoading && (
                <li>• Cargando datos maestros...</li>
              )}
              {!isLoading && masterData && (
                <li>• Datos maestros cargados correctamente</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}