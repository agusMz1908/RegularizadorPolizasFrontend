import { FORM_TABS, usePolicyFormContext } from '../PolicyFormProvider';
import { ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onBack?: () => void;
}

export function FormActions({ onBack }: FormActionsProps) {
  const { 
    activeTab, 
    setActiveTab, 
    submitForm, 
    isSubmitting,
    validateForm,
    progress 
  } = usePolicyFormContext();

  const currentTabIndex = FORM_TABS.findIndex(tab => tab.id === activeTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === FORM_TABS.length - 1;
  const canSubmit = progress.overall === 100;

  const handlePrevious = () => {
    if (isFirstTab && onBack) {
      onBack();
    } else if (currentTabIndex > 0) {
      setActiveTab(FORM_TABS[currentTabIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentTabIndex < FORM_TABS.length - 1) {
      setActiveTab(FORM_TABS[currentTabIndex + 1].id);
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      await submitForm();
    }
  };

  return (
    <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
      {/* Botón Anterior/Volver */}
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={isSubmitting}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        {isFirstTab && onBack ? 'Volver' : 'Anterior'}
      </Button>

      {/* Información de progreso en móvil */}
      <div className="lg:hidden text-sm text-gray-600">
        {currentTabIndex + 1} de {FORM_TABS.length}
      </div>

      {/* Botón Siguiente/Enviar */}
      {!isLastTab ? (
        <Button
          onClick={handleNext}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </Button>
      ) : (
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          variant={canSubmit ? "default" : "secondary"}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Enviar a Velneo
            </>
          )}
        </Button>
      )}
    </div>
  );
}