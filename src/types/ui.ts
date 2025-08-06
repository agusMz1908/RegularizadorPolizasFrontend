// src/types/ui.ts - VERSIÓN UNIFICADA Y DEFINITIVA
// ⚠️ ESTE ES EL ÚNICO ARCHIVO DONDE DEBEN DEFINIRSE LOS TIPOS DE UI

/**
 * 🎨 OPCIÓN PARA SELECT COMPONENTS
 * Esta es la ÚNICA definición de SelectOption en todo el proyecto
 */
export interface SelectOption {
  id: string | number;
  name: string;
  description?: string;
  disabled?: boolean;
  group?: string;  // Para agrupar opciones
}

/**
 * 📝 PROPS DE CAMPO DE FORMULARIO BASE
 */
export interface FormFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;  // Agregado para manejar el evento blur
  type?: 'text' | 'number' | 'date' | 'email' | 'tel';
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  icon?: string;  // Nombre del icono de Lucide
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  showDataOrigin?: boolean;
  dataOrigin?: 'azure' | 'manual' | 'client' | 'master';
}

/**
 * 🔽 PROPS DE SELECT FIELD
 */
export interface SelectFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;  // Agregado para manejar el evento blur
  options: SelectOption[];  // ← Usa SelectOption de aquí
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;  // Nombre del icono de Lucide
  isNumeric?: boolean;  // Si devuelve number o string
  className?: string;
  showDataOrigin?: boolean;
  dataOrigin?: 'azure' | 'manual' | 'master';
  emptyMessage?: string;
  searchable?: boolean;
}

/**
 * 📄 PROPS DE TEXTAREA FIELD
 */
export interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
  showDataOrigin?: boolean;
  dataOrigin?: 'azure' | 'manual' | 'client';
}

/**
 * ℹ️ PROPS DE INFO FIELD (solo lectura)
 */
export interface InfoFieldProps {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ReactNode;
  className?: string;
  emptyText?: string;
}

/**
 * 📦 PROPS DE FORM SECTION
 */
export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

/**
 * ✅ RESULTADO DE VALIDACIÓN
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * 🎯 PROPS DE MASTER SELECT FIELD
 * Wrapper específico para selects que vienen de la base de datos
 */
export interface MasterSelectFieldProps extends Omit<SelectFieldProps, 'options' | 'loading' | 'dataOrigin'> {
  masterData: any[] | null;
  masterType: 'categoria' | 'destino' | 'calidad' | 'combustible' | 'moneda';
  loading?: boolean;
}