// src/constants/formTabs.ts - ✅ COMPLETAMENTE ACTUALIZADO
import type { FormTabId } from '../types/policyForm';
import type { PolicyFormData } from '@/types/poliza';
import { User, FileText, Car, Shield, CreditCard, MessageSquare } from 'lucide-react';

export interface FormTab {
  id: FormTabId;
  label: string;
  description: string;
  icon: any; // Lucide icon component
  fields: (keyof PolicyFormData)[];
  required: boolean;
  order: number;
}

export const FORM_TABS: FormTab[] = [
  {
    id: 'datos_basicos',
    label: 'Datos Básicos',
    description: 'Información del cliente y trámite',
    icon: User,
    fields: ['corredor', 'asegurado', 'tomador', 'domicilio', 'dirCobro', 'estadoTramite', 'tramite', 'tipo', 'estadoPoliza', 'fecha', 'asignado'],
    required: true,
    order: 1
  },
  {
    id: 'datos_poliza',
    label: 'Datos Póliza',
    description: 'Información de la póliza',
    icon: FileText,
    fields: ['poliza', 'certificado', 'desde', 'hasta'],
    required: true,
    order: 2
  },
  {
    id: 'datos_vehiculo',
    label: 'Datos Vehículo',
    description: 'Información del vehículo',
    icon: Car,
    fields: ['marcaModelo', 'anio', 'matricula', 'motor', 'chasis', 'destinoId', 'combustibleId', 'calidadId', 'categoriaId'],
    required: true,
    order: 3
  },
  {
    id: 'datos_cobertura',
    label: 'Datos Cobertura',
    description: 'Cobertura y zona',
    icon: Shield,
    fields: ['zonaCirculacion', 'monedaId', 'tarifaId'], // AGREGAR tarifaId
    required: true,
    order: 4
  },
  {
    id: 'condiciones_pago',
    label: 'Condiciones Pago',
    description: 'Condiciones financieras',
    icon: CreditCard,
    fields: ['formaPago', 'premio', 'total', 'cuotas', 'valorCuota'],
    required: true,
    order: 5
  },
  {
    id: 'observaciones',
    label: 'Observaciones',
    description: 'Notas adicionales',
    icon: MessageSquare,
    fields: ['observaciones'],
    required: false,
    order: 6
  }
];

export class TabsUtils {
  static getTab(tabId: FormTabId): FormTab | null {
    return FORM_TABS.find(tab => tab.id === tabId) || null;
  }

  static getFieldsForTab(tabId: FormTabId): (keyof PolicyFormData)[] {
    const tab = this.getTab(tabId);
    return tab?.fields || [];
  }

  static getTabForField(fieldName: keyof PolicyFormData): FormTabId | null {
    const tab = FORM_TABS.find(tab => tab.fields.includes(fieldName));
    return tab?.id || null;
  }

  static getNextTab(currentTabId: FormTabId): FormTab | null {
    const currentTab = this.getTab(currentTabId);
    if (!currentTab) return null;
    
    const nextTab = FORM_TABS.find(tab => tab.order === currentTab.order + 1);
    return nextTab || null;
  }

  static getPreviousTab(currentTabId: FormTabId): FormTab | null {
    const currentTab = this.getTab(currentTabId);
    if (!currentTab) return null;
    
    const prevTab = FORM_TABS.find(tab => tab.order === currentTab.order - 1);
    return prevTab || null;
  }

  static isFirstTab(tabId: FormTabId): boolean {
    const tab = this.getTab(tabId);
    return tab?.order === 1;
  }

  static isLastTab(tabId: FormTabId): boolean {
    const tab = this.getTab(tabId);
    const maxOrder = Math.max(...FORM_TABS.map(t => t.order));
    return tab?.order === maxOrder;
  }

  static getRequiredTabs(): FormTab[] {
    return FORM_TABS.filter(tab => tab.required);
  }

  static getAllTabIds(): FormTabId[] {
    return FORM_TABS.map(tab => tab.id);
  }
}