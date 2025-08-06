// src/constants/fieldConfig.ts - ✅ CORREGIDO
import type { MasterDataOptionsDto } from '../types/masterData'; // ✅ CAMBIO PRINCIPAL

export interface FieldConfig {
  id: string;
  label: string;
  category: 'basicos' | 'poliza' | 'vehiculo' | 'cobertura';
  masterDataKey?: keyof MasterDataOptionsDto; // ✅ CAMBIO PRINCIPAL
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
    placeholder: 'Nombre del corredor',
    required: true
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
      pattern: '^[0-9]{1,8}[-]?[0-9]$',
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
    id: 'poliza', 
    label: 'Número de Póliza', 
    category: 'poliza', 
    required: true,
    type: 'text',
    placeholder: 'Número de póliza'
  },
  { 
    id: 'desde', 
    label: 'Vigencia Desde', 
    category: 'poliza',
    type: 'date',
    required: true
  },
  { 
    id: 'hasta', 
    label: 'Vigencia Hasta', 
    category: 'poliza',
    type: 'date',
    required: true
  },
  { 
    id: 'certificado', 
    label: 'Certificado', 
    category: 'poliza',
    type: 'text',
    placeholder: 'Número de certificado'
  },
  
  // Datos Vehículo
  { 
    id: 'marcaModelo', 
    label: 'Marca y Modelo', 
    category: 'vehiculo',
    type: 'text',
    placeholder: 'Ej: Toyota Corolla',
    required: true
  },
  { 
    id: 'anio', 
    label: 'Año', 
    category: 'vehiculo',
    type: 'number',
    placeholder: 'Año del vehículo'
  },
  { 
    id: 'combustibleId', 
    label: 'Combustible', 
    category: 'vehiculo', 
    type: 'select',
    required: true
  },
  { 
    id: 'categoriaId', 
    label: 'Categoría', 
    category: 'vehiculo', 
    type: 'select',
    required: true
  },
  { 
    id: 'destinoId', 
    label: 'Destino', 
    category: 'vehiculo', 
    type: 'select',
    required: true
  },
  { 
    id: 'calidadId', 
    label: 'Calidad', 
    category: 'vehiculo', 
    type: 'select',
    required: true
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
    id: 'monedaId', 
    label: 'Moneda', 
    category: 'cobertura', 
    type: 'select',
    required: true
  },
  { 
    id: 'premio', 
    label: 'Premio', 
    category: 'cobertura',
    type: 'number',
    placeholder: '0.00',
    required: true
  },
  { 
    id: 'total', 
    label: 'Total', 
    category: 'cobertura',
    type: 'number',
    placeholder: '0.00',
    required: true
  },
  { 
    id: 'formaPago', 
    label: 'Forma de Pago', 
    category: 'cobertura',
    type: 'select',
    required: true
  },
  { 
    id: 'cuotas', 
    label: 'Cuotas', 
    category: 'cobertura',
    type: 'number',
    placeholder: '1'
  }
];

// ✅ HELPER: Obtener campos por categoría
export const getFieldsByCategory = (category: FieldConfig['category']): FieldConfig[] => {
  return FIELD_CONFIGS.filter(field => field.category === category);
};

// ✅ HELPER: Obtener campos requeridos
export const getRequiredFields = (): FieldConfig[] => {
  return FIELD_CONFIGS.filter(field => field.required);
};

// ✅ HELPER: Obtener campos con datos maestros
export const getMasterDataFields = (): FieldConfig[] => {
  return FIELD_CONFIGS.filter(field => field.masterDataKey);
};