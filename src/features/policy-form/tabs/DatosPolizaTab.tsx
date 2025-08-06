import { usePolicyFormContext } from '../PolicyFormProvider';
import { FormField, InfoField, FormSection } from '@/components/wizard/FormComponents';
import { Building2, FileText } from 'lucide-react';

export function DatosPolizaTab() {
  const { 
    formData, 
    updateField, 
    errors, 
    touchedFields,
    markFieldTouched,
    selectedCompany,
    scannedData
  } = usePolicyFormContext();

  return (
    <div className="space-y-6">
      {/* Información de la Compañía */}
      <FormSection 
        title="Compañía Aseguradora" 
        description="Información de la compañía seleccionada"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField
            label="Compañía"
            value={selectedCompany?.comalias || 'No seleccionada'}
            icon={<Building2 className="w-4 h-4" />}
          />
          
          <InfoField
            label="Código"
            value={selectedCompany?.comcod || 'N/A'}
            icon={<FileText className="w-4 h-4" />}
          />
        </div>
      </FormSection>

      {/* Identificación de la Póliza */}
      <FormSection 
        title="Identificación de la Póliza" 
        description="Números de póliza y certificado"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="poliza"
            label="Número de Póliza"
            value={formData.poliza}
            onChange={(value) => updateField('poliza', value)}
            onBlur={() => markFieldTouched('poliza')}
            placeholder="Número de póliza"
            required={true}
            error={errors.poliza}
            touched={touchedFields.has('poliza')}
            icon="FileText"
            showDataOrigin={!!scannedData}
            dataOrigin={scannedData ? 'azure' : undefined}
          />
          
          <FormField
            id="certificado"
            label="Certificado"
            value={formData.certificado}
            onChange={(value) => updateField('certificado', value)}
            onBlur={() => markFieldTouched('certificado')}
            placeholder="Número de certificado (opcional)"
            error={errors.certificado}
            touched={touchedFields.has('certificado')}
            icon="FileText"
            showDataOrigin={!!scannedData}
            dataOrigin={scannedData ? 'azure' : undefined}
          />
        </div>
      </FormSection>

      {/* Vigencia de la Póliza */}
      <FormSection 
        title="Vigencia de la Póliza" 
        description="Fechas de inicio y fin de vigencia"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            id="desde"
            label="Vigencia Desde"
            value={formData.desde}
            onChange={(value) => updateField('desde', value)}
            onBlur={() => markFieldTouched('desde')}
            type="date"
            required={true}
            error={errors.desde}
            touched={touchedFields.has('desde')}
            icon="Calendar"
            showDataOrigin={!!scannedData}
            dataOrigin={scannedData ? 'azure' : undefined}
          />
          
          <FormField
            id="hasta"
            label="Vigencia Hasta"
            value={formData.hasta}
            onChange={(value) => updateField('hasta', value)}
            onBlur={() => markFieldTouched('hasta')}
            type="date"
            required={true}
            error={errors.hasta}
            touched={touchedFields.has('hasta')}
            icon="Calendar"
            showDataOrigin={!!scannedData}
            dataOrigin={scannedData ? 'azure' : undefined}
          />
        </div>
      </FormSection>

      {/* Información de ayuda */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-green-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-green-900 mb-1">Datos de la póliza</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• El número de póliza puede ser extraído automáticamente del documento</li>
              <li>• Las fechas de vigencia definen el período de cobertura</li>
              <li>• El certificado es opcional pero puede ser requerido por algunas compañías</li>
              <li>• La fecha hasta debe ser posterior a la fecha desde</li>
              {scannedData && (
                <li>• Los campos con etiqueta "azure" fueron extraídos del documento escaneado</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}