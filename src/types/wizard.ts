import type { AzureDocumentResult } from "./azureDocumentResult";
import type { ClientDto } from "./cliente";
import type { CompanyDto, SeccionDto } from "./maestros";
import type { PolizaDto } from "./poliza";

export type OperationType = 'EMISION' | 'RENOVACION' | 'CAMBIO';

export interface WizardStep {
  id: number;
  name: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export interface WizardState {
  operation?: OperationType;
  clienteSeleccionado?: ClientDto;
  companiaSeleccionada?: CompanyDto;
  seccionSeleccionada?: SeccionDto;
  polizaExistente?: PolizaDto;
  documentoEscaneado?: AzureDocumentResult;
  formData: Partial<PolizaDto>;
  validated: boolean;
  currentStep: number;
  steps: WizardStep[];
}