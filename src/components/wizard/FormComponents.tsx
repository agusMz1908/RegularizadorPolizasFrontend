// src/components/wizard/FormComponents.tsx - VERSIÓN UNIFICADA
// ⚠️ ESTE ARCHIVO AHORA USA COMPONENTES CENTRALIZADOS

import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// ✅ IMPORTAR TIPOS CENTRALIZADOS
import type { 
  FormFieldProps,
  SelectFieldProps,
  TextareaFieldProps,
  InfoFieldProps,
  FormSectionProps,
  SelectOption 
} from '@/types/ui';

/**
 * 📝 CAMPO DE FORMULARIO REUTILIZABLE
 * Input de texto, número, fecha, etc.
 */
export function FormField({
  id,
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder,
  required = false,
  error,
  touched = false,
  disabled = false,
  readonly = false,
  icon,
  min,
  max,
  step,
  className = '',
  showDataOrigin = false,
  dataOrigin
}: FormFieldProps) {
  const hasError = error && touched;
  const isValid = touched && !error && value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
    onChange(newValue);
  };

  // Renderizar el icono si es un string (nombre de Lucide icon)
  const IconComponent = icon ? require('lucide-react')[icon] : null;

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {showDataOrigin && dataOrigin && (
          <span className={cn(
            "ml-2 text-xs px-2 py-0.5 rounded-full",
            dataOrigin === 'azure' && "bg-blue-100 text-blue-700",
            dataOrigin === 'manual' && "bg-yellow-100 text-yellow-700",
            dataOrigin === 'client' && "bg-green-100 text-green-700",
            dataOrigin === 'master' && "bg-purple-100 text-purple-700"
          )}>
            {dataOrigin}
          </span>
        )}
      </label>
      
      <div className="relative">
        {IconComponent && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <IconComponent className="w-4 h-4 text-gray-400" />
          </div>
        )}
        
        <input
          id={id}
          type={type}
          value={value || ''}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readonly}
          min={min}
          max={max}
          step={step}
          className={cn(
            "block w-full rounded-lg border-2 px-3 py-2 text-sm transition-colors",
            IconComponent && "pl-10",
            hasError && "border-red-300 bg-red-50 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-red-500",
            isValid && "border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500",
            !hasError && !isValid && "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500",
            (readonly || disabled) && "bg-gray-50 text-gray-500 cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-opacity-50"
          )}
        />
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {hasError && <AlertCircle className="w-5 h-5 text-red-500" />}
          {isValid && <CheckCircle2 className="w-5 h-5 text-green-500" />}
        </div>
      </div>
      
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * 🔽 SELECT FIELD REUTILIZABLE
 */
export function SelectField({
  id,
  label,
  value,
  onChange,
  onBlur,
  options,
  placeholder = 'Seleccionar...',
  required = false,
  error,
  touched = false,
  disabled = false,
  loading = false,
  icon,
  isNumeric = false,
  className = '',
  showDataOrigin = false,
  dataOrigin,
  emptyMessage = "No hay opciones disponibles"
}: SelectFieldProps) {
  const hasError = error && touched;
  const isValid = touched && !error && value;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = isNumeric ? Number(e.target.value) : e.target.value;
    onChange(newValue);
  };

  // Renderizar el icono si es un string (nombre de Lucide icon)
  const IconComponent = icon ? require('lucide-react')[icon] : null;

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {showDataOrigin && dataOrigin && (
          <span className={cn(
            "ml-2 text-xs px-2 py-0.5 rounded-full",
            dataOrigin === 'azure' && "bg-blue-100 text-blue-700",
            dataOrigin === 'manual' && "bg-yellow-100 text-yellow-700",
            dataOrigin === 'master' && "bg-purple-100 text-purple-700"
          )}>
            {dataOrigin}
          </span>
        )}
      </label>
      
      <div className="relative">
        {IconComponent && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <IconComponent className="w-4 h-4 text-gray-400" />
          </div>
        )}
        
        <select
          id={id}
          value={value || ''}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled || loading}
          className={cn(
            "block w-full rounded-lg border-2 px-3 py-2 text-sm transition-colors appearance-none",
            IconComponent && "pl-10",
            hasError && "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500",
            isValid && "border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500",
            !hasError && !isValid && "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500",
            (disabled || loading) && "bg-gray-50 text-gray-500 cursor-not-allowed",
            !disabled && !loading && "cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-opacity-50"
          )}
        >
          <option value="" disabled>
            {loading ? 'Cargando...' : placeholder}
          </option>
          
          {/* Agrupar opciones si tienen grupos */}
          {options.filter(opt => !opt.group).map((option) => (
            <option 
              key={option.id} 
              value={option.id}
              disabled={option.disabled}
              className={option.disabled ? 'text-gray-400' : ''}
            >
              {option.name}
              {option.description && ` - ${option.description}`}
            </option>
          ))}
          
          {/* Opciones agrupadas */}
          {Object.entries(
            options.reduce((groups, option) => {
              if (option.group) {
                if (!groups[option.group]) groups[option.group] = [];
                groups[option.group].push(option);
              }
              return groups;
            }, {} as Record<string, SelectOption[]>)
          ).map(([groupName, groupOptions]) => (
            <optgroup key={groupName} label={groupName}>
              {groupOptions.map((option) => (
                <option 
                  key={option.id} 
                  value={option.id}
                  disabled={option.disabled}
                >
                  {option.name}
                  {option.description && ` - ${option.description}`}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : hasError ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : isValid ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
      
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      
      {!loading && options.length === 0 && !hasError && (
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <Info className="w-4 h-4" />
          {emptyMessage}
        </p>
      )}
    </div>
  );
}

/**
 * 📄 TEXTAREA FIELD
 */
export function TextareaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  touched = false,
  disabled = false,
  readonly = false,
  rows = 4,
  maxLength,
  className = '',
  showDataOrigin = false,
  dataOrigin
}: TextareaFieldProps) {
  const hasError = error && touched;
  const isValid = touched && !error && value;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {showDataOrigin && dataOrigin && (
          <span className={cn(
            "ml-2 text-xs px-2 py-0.5 rounded-full",
            dataOrigin === 'azure' && "bg-blue-100 text-blue-700",
            dataOrigin === 'manual' && "bg-yellow-100 text-yellow-700",
            dataOrigin === 'client' && "bg-green-100 text-green-700"
          )}>
            {dataOrigin}
          </span>
        )}
      </label>
      
      <div className="relative">
        <textarea
          id={id}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readonly}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            "block w-full rounded-lg border-2 px-3 py-2 text-sm transition-colors resize-none",
            hasError && "border-red-300 bg-red-50 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-red-500",
            isValid && "border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500",
            !hasError && !isValid && "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500",
            (readonly || disabled) && "bg-gray-50 text-gray-500 cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-opacity-50"
          )}
        />
        
        {maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {value?.length || 0}/{maxLength}
          </div>
        )}
      </div>
      
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * ℹ️ INFO FIELD (solo lectura)
 */
export function InfoField({
  label,
  value,
  icon,
  className = '',
  emptyText = 'No especificado'
}: InfoFieldProps) {
  const displayValue = value || emptyText;
  
  return (
    <div className={cn("space-y-1", className)}>
      <label className="block text-sm font-medium text-gray-500">
        {label}
      </label>
      <div className="flex items-center gap-2 text-sm text-gray-900">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span className={!value ? 'text-gray-400 italic' : ''}>
          {displayValue}
        </span>
      </div>
    </div>
  );
}

/**
 * 📦 FORM SECTION
 */
export function FormSection({
  title,
  description,
  children,
  className = '',
  collapsible = false,
  defaultExpanded = true
}: FormSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 p-6", className)}>
      <div 
        className={cn(
          "mb-4",
          collapsible && "cursor-pointer select-none"
        )}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          {collapsible && (
            <svg 
              className={cn(
                "w-5 h-5 text-gray-400 transition-transform",
                isExpanded && "rotate-180"
              )} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
      
      {(!collapsible || isExpanded) && (
        <div>{children}</div>
      )}
    </div>
  );
}

// Re-exportar tipos para conveniencia
export type { SelectOption };