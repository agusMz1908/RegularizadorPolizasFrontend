// src/constants/fieldConfigs.ts
import type { MasterDataOptions } from  '../types/mappings';

export interface FieldConfig {
  id: string;
  label: string;
  category: 'basicos' | 'poliza' | 'vehiculo' | 'cobertura';
  masterDataKey?: keyof MasterDataOptions;
  required?: boolean;
  type?: 'text' | 'number' | 'date' | 'email' | 'select';
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export const FIELD_CONFIGS: FieldConfig[] = [
  // Datos Básicos
  { 
    id: 'corredor', 
    label: 'Corredor', 
    category: 'basicos',
    type: 'text',
    placeholder: 'Nombre del corredor'
  },
  { 
    id: 'asegurado', 
    label: 'Asegurado', 
    category: 'basicos', 
    required: true,
    type: 'text',
    placeholder: 'Nombre completo del asegurado'
  },
  { 
    id: 'documento', 
    label: 'Documento', 
    category: 'basicos', 
    required: true,
    type: 'text',
    placeholder: 'CI o RUT',
    validation: {
      pattern: '^[0-9]{1,8}[-]?[0-9kK]?$',
      message: 'Formato de documento inválido'
    }
  },
  { 
    id: 'domicilio', 
    label: 'Domicilio', 
    category: 'basicos',
    type: 'text',
    placeholder: 'Dirección completa'
  },
  { 
    id: 'telefono', 
    label: 'Teléfono', 
    category: 'basicos',
    type: 'text',
    placeholder: 'Número de teléfono'
  },
  { 
    id: 'email', 
    label: 'Email', 
    category: 'basicos',
    type: 'email',
    placeholder: 'correo@ejemplo.com'
  },
  
  // Datos Póliza
  { 
    id: 'numeroPoliza', 
    label: 'Número de Póliza', 
    category: 'poliza', 
    required: true,
    type: 'text',
    placeholder: 'Número único de póliza'
  },
  { 
    id: 'desde', 
    label: 'Vigencia Desde', 
    category: 'poliza',
    type: 'date'
  },
  { 
    id: 'hasta', 
    label: 'Vigencia Hasta', 
    category: 'poliza',
    type: 'date'
  },
  { 
    id: 'endoso', 
    label: 'Endoso', 
    category: 'poliza',
    type: 'number',
    placeholder: '0'
  },
  
  // Datos Vehículo
  { 
    id: 'marca', 
    label: 'Marca', 
    category: 'vehiculo',
    type: 'text',
    placeholder: 'Marca del vehículo'
  },
  { 
    id: 'modelo', 
    label: 'Modelo', 
    category: 'vehiculo',
    type: 'text',
    placeholder: 'Modelo del vehículo'
  },
  { 
    id: 'anio', 
    label: 'Año', 
    category: 'vehiculo',
    type: 'number',
    validation: {
      min: 1900,
      max: new Date().getFullYear() + 2,
      message: 'Año inválido'
    }
  },
  { 
    id: 'combustible', 
    label: 'Combustible', 
    category: 'vehiculo', 
    masterDataKey: 'combustibles',
    type: 'select'
  },
  { 
    id: 'categoria', 
    label: 'Categoría', 
    category: 'vehiculo', 
    masterDataKey: 'categorias',
    type: 'select'
  },
  { 
    id: 'chasis', 
    label: 'Chasis', 
    category: 'vehiculo',
    type: 'text',
    placeholder: 'Número de chasis'
  },
  { 
    id: 'matricula', 
    label: 'Matrícula', 
    category: 'vehiculo',
    type: 'text',
    placeholder: 'Matrícula del vehículo'
  },
  
  // Datos Cobertura
  { 
    id: 'cobertura', 
    label: 'Cobertura', 
    category: 'cobertura', 
    masterDataKey: 'coberturas',
    type: 'select'
  },
  { 
    id: 'premio', 
    label: 'Premio', 
    category: 'cobertura',
    type: 'number',
    placeholder: '0.00'
  },
  { 
    id: 'total', 
    label: 'Total', 
    category: 'cobertura',
    type: 'number',
    placeholder: '0.00'
  },
  { 
    id: 'formaPago', 
    label: 'Forma de Pago', 
    category: 'cobertura', 
    masterDataKey: 'formasPago',
    type: 'select'
  },
  { 
    id: 'cuotas', 
    label: 'Cuotas', 
    category: 'cobertura',
    type: 'number',
    placeholder: '1'
  }
];

export const REQUIRED_FIELDS = FIELD_CONFIGS
  .filter(config => config.required)
  .map(config => config.id);

export const CATEGORY_LABELS = {
  basicos: 'Datos Básicos',
  poliza: 'Póliza',
  vehiculo: 'Vehículo',
  cobertura: 'Cobertura'
} as const;