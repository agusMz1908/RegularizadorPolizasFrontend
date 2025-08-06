import { usePolicyFormContext } from '../PolicyFormProvider';
import { FormField, SelectField, FormSection } from '@/components/wizard/FormComponents';
import type { SelectOption } from '@/types/ui';
import { ESTADOS_BASICOS, TIPOS_TRAMITE, ESTADOS_POLIZA, TIPOS_LINEA } from '@/constants/textPlainOptions';

export function ClientDataTab() {
  const { 
    formData, 
    updateField, 
    errors, 
    touchedFields,
    markFieldTouched,
    selectedClient 
  } = usePolicyFormContext();

  // Convertir las constantes importadas a SelectOption[]
  const estadosTramiteOptions: SelectOption[] = ESTADOS_BASICOS.map(estado => ({
    id: estado.id,
    name: estado.name,
    description: estado.description
  }));

  const tiposTramiteOptions: SelectOption[] = TIPOS_TRAMITE.map(tipo => ({
    id: tipo.id,
    name: tipo.name,
    description: tipo.description
  }));

  const estadosPolizaOptions: SelectOption[] = ESTADOS_POLIZA.map(estado => ({
    id: estado.id,
    name: estado.name,
    description: estado.description
  }));

  const tiposOptions: SelectOption[] = TIPOS_LINEA.map(tipo => ({
    id: tipo.id,
    name: tipo.name,
    description: tipo.description
  }));

  return (
    <div className="space-y-6">
      {/* Información del Cliente */}
      <FormSection 
        title="Información del Cliente" 
        description="Datos del asegurado y tomador"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormField
              id="asegurado"
              label="Asegurado"
              value={formData.asegurado}
              onChange={(value) => updateField('asegurado', value)}
              placeholder="Nombre completo del asegurado"
              required={true}
              error={errors.asegurado}
              touched={touchedFields.has('asegurado')}
              icon="User"
              onBlur={() => markFieldTouched('asegurado')}
              showDataOrigin={!!selectedClient}
              dataOrigin={selectedClient ? 'client' : undefined}
            />
          </div>
          
          <div>
            <FormField
              id="tomador"
              label="Tomador"
              value={formData.tomador}
              onChange={(value) => updateField('tomador', value)}
              placeholder="Nombre del tomador (si es diferente)"
              error={errors.tomador}
              touched={touchedFields.has('tomador')}
              icon="UserCheck"
              onBlur={() => markFieldTouched('tomador')}
            />
          </div>
          
          <div>
            <FormField
              id="domicilio"
              label="Domicilio"
              value={formData.domicilio}
              onChange={(value) => updateField('domicilio', value)}
              placeholder="Dirección completa"
              error={errors.domicilio}
              touched={touchedFields.has('domicilio')}
              icon="MapPin"
              onBlur={() => markFieldTouched('domicilio')}
              showDataOrigin={!!selectedClient}
              dataOrigin={selectedClient ? 'client' : undefined}
            />
          </div>
          
          <div>
            <FormField
              id="dirCobro"
              label="Dirección de Cobro"
              value={formData.dirCobro}
              onChange={(value) => updateField('dirCobro', value)}
              placeholder="Dirección para el cobro (opcional)"
              error={errors.dirCobro}
              touched={touchedFields.has('dirCobro')}
              icon="MapPin"
              onBlur={() => markFieldTouched('dirCobro')}
              showDataOrigin={!!selectedClient}
              dataOrigin={selectedClient ? 'client' : undefined}
            />
          </div>
        </div>
      </FormSection>

      {/* Datos del Corredor */}
      <FormSection 
        title="Datos del Corredor" 
        description="Información del corredor responsable"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormField
              id="corredor"
              label="Corredor"
              value={formData.corredor}
              onChange={(value) => updateField('corredor', value)}
              placeholder="Nombre del corredor"
              required={true}
              error={errors.corredor}
              touched={touchedFields.has('corredor')}
              icon="Building2"
              onBlur={() => markFieldTouched('corredor')}
            />
          </div>
          
          <div>
            <FormField
              id="asignado"
              label="Asignado a"
              value={formData.asignado}
              onChange={(value) => updateField('asignado', value)}
              placeholder="Usuario asignado (opcional)"
              error={errors.asignado}
              touched={touchedFields.has('asignado')}
              icon="User"
              onBlur={() => markFieldTouched('asignado')}
            />
          </div>
        </div>
      </FormSection>

      {/* Estado y Tipo de Trámite */}
      <FormSection 
        title="Estado y Tipo de Trámite" 
        description="Configuración del trámite y estado"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <SelectField
              id="estadoTramite"
              label="Estado del Trámite"
              value={formData.estadoTramite}
              onChange={(value) => updateField('estadoTramite', value)}
              options={estadosTramiteOptions}
              required={true}
              error={errors.estadoTramite}
              touched={touchedFields.has('estadoTramite')}
              icon="FileText"
              onBlur={() => markFieldTouched('estadoTramite')}
            />
          </div>
          
          <div>
            <SelectField
              id="tramite"
              label="Tipo de Trámite"
              value={formData.tramite}
              onChange={(value) => updateField('tramite', value)}
              options={tiposTramiteOptions}
              required={true}
              error={errors.tramite}
              touched={touchedFields.has('tramite')}
              icon="Briefcase"
              onBlur={() => markFieldTouched('tramite')}
            />
          </div>
          
          <div>
            <SelectField
              id="estadoPoliza"
              label="Estado de la Póliza"
              value={formData.estadoPoliza}
              onChange={(value) => updateField('estadoPoliza', value)}
              options={estadosPolizaOptions}
              required={true}
              error={errors.estadoPoliza}
              touched={touchedFields.has('estadoPoliza')}
              icon="Shield"
              onBlur={() => markFieldTouched('estadoPoliza')}
            />
          </div>
          
          <div>
            <SelectField
              id="tipo"
              label="Tipo"
              value={formData.tipo}
              onChange={(value) => updateField('tipo', value)}
              options={tiposOptions}
              required={true}
              error={errors.tipo}
              touched={touchedFields.has('tipo')}
              icon="Briefcase"
              onBlur={() => markFieldTouched('tipo')}
            />
          </div>
        </div>
      </FormSection>

      {/* Información de ayuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Información del cliente</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Los datos marcados con asterisco (*) son obligatorios</li>
              <li>• Si el tomador es diferente al asegurado, complete ambos campos</li>
              <li>• La dirección de cobro es opcional si coincide con el domicilio</li>
              {selectedClient && (
                <li>• Los campos con etiqueta "client" provienen del cliente seleccionado</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}