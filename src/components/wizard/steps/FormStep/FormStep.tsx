// src/components/wizard/steps/FormStep/FormStep.tsx

import React, { useState } from 'react';
import { FileText, Save } from 'lucide-react';
import { PolizaFormData } from '../../../../types/core/poliza';
import { DocumentProcessResult } from '../../../../types/ui/wizard';
import { UseFormValidationReturn } from '../../../../hooks/wizard/useFormValidation';
import { StepLayout } from '../../shared/StepLayout';
import { TabNavigation } from './components/TabNavigation';
import { ValidationSummary } from './components/ValidationSummary';

// Importar tabs
import { DatosBasicosTab } from './tabs/DatosBasicosTab';
import { PolizaTab } from './tabs/PolizaTab';
import { VehiculoTab } from './tabs/VehiculoTab';
import { PagoTab } from './tabs/PagoTab';
import { ObservacionesTab } from './tabs/ObservacionesTab';

interface FormStepProps {
  formData: PolizaFormData;
  extractedData: DocumentProcessResult | null;
  validation: UseFormValidationReturn;
  onFormDataChange: (data: PolizaFormData) => void;
  onSubmit: () => void;
  saving: boolean;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export const FormStep: React.FC<FormStepProps> = ({
  formData,
  extractedData,
  validation,
  onFormDataChange,
  onSubmit,
  saving,
  onNext,
  onBack,
  isDarkMode
}) => {
  const [activeTab, setActiveTab] = useState('basicos');

  const tabs = [
    { id: 'basicos', label: 'Datos Básicos', icon: 'User', color: 'blue' },
    { id: 'poliza', label: 'Póliza', icon: 'FileText', color: 'purple' },
    { id: 'vehiculo', label: 'Vehículo', icon: 'Car', color: 'green' },
    { id: 'pago', label: 'Condiciones Pago', icon: 'CreditCard', color: 'orange' },
    { id: 'observaciones', label: 'Observaciones', icon: 'FileCheck', color: 'indigo' }
  ];

  const handleFormChange = (field: keyof PolizaFormData, value: any) => {
    const updatedData = { ...formData, [field]: value };
    onFormDataChange(updatedData);
    
    // Validar campo en tiempo real
    validation.validateField(field, value);
    validation.markFieldTouched(field);
  };

  const handleSubmit = () => {
    // Validar todo el formulario antes de enviar
    const isValid = validation.validateAll(formData);
    if (isValid) {
      onSubmit();
    } else {
      // Ir al primer tab con errores
      const firstErrorField = validation.validation.errors[0]?.field;
      if (firstErrorField) {
        // Mapear campo a tab
        const fieldToTab: { [key: string]: string } = {
          'numeroPoliza': 'poliza',
          'asegurado': 'basicos',
          'vigenciaDesde': 'poliza',
          'vigenciaHasta': 'poliza',
          'prima': 'pago',
          'vehiculo': 'vehiculo',
          'marca': 'vehiculo',
          'modelo': 'vehiculo'
        };
        
        const targetTab = fieldToTab[firstErrorField] || 'basicos';
        setActiveTab(targetTab);
      }
    }
  };

  const renderTabContent = () => {
    const commonProps = {
      formData,
      onFormChange: handleFormChange,
      validation,
      extractedData,
      isDarkMode
    };

    switch (activeTab) {
      case 'basicos':
        return <DatosBasicosTab {...commonProps} />;
      case 'poliza':
        return <PolizaTab {...commonProps} />;
      case 'vehiculo':
        return <VehiculoTab {...commonProps} />;
      case 'pago':
        return <PagoTab {...commonProps} />;
      case 'observaciones':
        return <ObservacionesTab {...commonProps} />;
      default:
        return <DatosBasicosTab {...commonProps} />;
    }
  };

  return (
    <StepLayout
      title="Formulario de Póliza"
      description="Revisa y completa los datos extraídos automáticamente"
      icon={FileText}
      color="orange"
      isDarkMode={isDarkMode}
      onNext={handleSubmit}
      onBack={onBack}
      nextLabel={saving ? "Guardando..." : "Crear Póliza"}
      backLabel="Volver a procesamiento"
      nextDisabled={saving}
      loading={saving}
      maxWidth="7xl"
    >
      <div className="space-y-6">
        {/* Navegación de tabs */}
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          validation={validation}
          isDarkMode={isDarkMode}
        />

        {/* Resumen de validación */}
        <ValidationSummary
          validation={validation}
          isDarkMode={isDarkMode}
        />

        {/* Contenido del tab activo */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

export default FormStep;