import { useCallback } from 'react';
import type { FormTabId } from '../types/policyForm';
import type { PolicyFormData } from '../types/poliza';
import { TabsUtils } from '../constants/formTabs';

export const useErrorNavigation = (
  setActiveTab: (tab: FormTabId) => void,
  errors: Record<keyof PolicyFormData, string> // ✅ CORREGIDO: tipado más específico
) => {
  const goToFirstError = useCallback(() => {
    const errorFields = Object.keys(errors) as (keyof PolicyFormData)[];
    if (errorFields.length === 0) return;

    const firstErrorField = errorFields[0];
    const tabWithError = TabsUtils.getTabForField(firstErrorField);
    
    if (tabWithError) {
      setActiveTab(tabWithError);
      
      // Scroll al campo con error después de un breve delay
      setTimeout(() => {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          element.focus();
        }
      }, 300);
    }
  }, [errors, setActiveTab]);

  const goToTabErrors = useCallback((tabId: FormTabId) => {
    const tabFields = TabsUtils.getFieldsForTab(tabId);
    const tabErrorFields = tabFields.filter(field => errors[field]);
    
    if (tabErrorFields.length > 0) {
      setActiveTab(tabId);
      
      setTimeout(() => {
        const element = document.getElementById(tabErrorFields[0]);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          element.focus();
        }
      }, 300);
    }
  }, [errors, setActiveTab]);

  return {
    goToFirstError,
    goToTabErrors,
    hasErrors: Object.keys(errors).length > 0,
    errorCount: Object.keys(errors).length
  };
};