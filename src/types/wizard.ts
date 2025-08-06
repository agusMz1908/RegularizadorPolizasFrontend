import type { AzureProcessResponse } from "./azureDocumentResult"; // ✅ CORREGIDO
import type { ClientDto } from "./cliente"; // ✅ CORREGIDO
import type { CompanyDto, SeccionDto } from "./masterData"; // ✅ CORREGIDO
import type { PolicyFormData } from "./poliza"; // ✅ CORREGIDO

export type OperationType = 'EMISION' | 'RENOVACION' | 'CAMBIO';

export interface WizardStep {
  id: number;
  name: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  disabled?: boolean;
  optional?: boolean;
}

export interface WizardState {
  operation?: OperationType;
  clienteSeleccionado?: ClientDto;
  companiaSeleccionada?: CompanyDto;
  seccionSeleccionada?: SeccionDto;
  polizaExistente?: any; // Para renovaciones y cambios
  documentoEscaneado?: AzureProcessResponse;
  formData: Partial<PolicyFormData>; // ✅ CORREGIDO
  validated: boolean;
  currentStep: number;
  steps: WizardStep[];
  errors: Record<string, string>;
  warnings: string[];
}

export interface WizardProgress {
  current: number;
  total: number;
  percentage: number;
  stepName: string;
  canGoNext: boolean;
  canGoBack: boolean;
}

export class WizardUtils {
  static createInitialState(): WizardState {
    return {
      formData: {},
      validated: false,
      currentStep: 1,
      steps: [
        {
          id: 1,
          name: 'operation',
          title: 'Seleccionar Operación',
          description: 'Tipo de trámite a realizar',
          completed: false,
          current: true
        },
        {
          id: 2,
          name: 'client',
          title: 'Cliente',
          description: 'Seleccionar cliente',
          completed: false,
          current: false
        },
        {
          id: 3,
          name: 'company',
          title: 'Compañía y Sección',
          description: 'Seleccionar aseguradora',
          completed: false,
          current: false
        },
        {
          id: 4,
          name: 'document',
          title: 'Documento',
          description: 'Escanear o cargar documento',
          completed: false,
          current: false,
          optional: true
        },
        {
          id: 5,
          name: 'form',
          title: 'Formulario',
          description: 'Completar datos de la póliza',
          completed: false,
          current: false
        },
        {
          id: 6,
          name: 'review',
          title: 'Revisión',
          description: 'Verificar y enviar',
          completed: false,
          current: false
        }
      ],
      errors: {},
      warnings: []
    };
  }

  static getProgress(state: WizardState): WizardProgress {
    const current = state.currentStep;
    const total = state.steps.length;
    const percentage = Math.round((current / total) * 100);
    const currentStepData = state.steps.find(s => s.id === current);
    
    return {
      current,
      total,
      percentage,
      stepName: currentStepData?.name || '',
      canGoNext: current < total && currentStepData?.completed === true,
      canGoBack: current > 1
    };
  }

  static validateStep(step: number, state: WizardState): boolean {
    switch (step) {
      case 1: // Operation
        return !!state.operation;
      
      case 2: // Client
        return !!state.clienteSeleccionado;
      
      case 3: // Company & Section
        return !!state.companiaSeleccionada && !!state.seccionSeleccionada;
      
      case 4: // Document (optional)
        return true; // Siempre válido porque es opcional
      
      case 5: // Form
        const requiredFields = ['poliza', 'desde', 'hasta', 'asegurado'];
        return requiredFields.every(field => !!state.formData[field as keyof PolicyFormData]);
      
      case 6: // Review
        return state.validated && Object.keys(state.errors).length === 0;
      
      default:
        return false;
    }
  }
}