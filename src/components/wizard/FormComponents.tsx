import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

// Componente base para inputs de texto/número/fecha
export interface FormFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number' | 'date' | 'email' | 'tel';
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  icon?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function FormField({
  id,
  label,
  value,
  onChange,
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
  className = ''
}: FormFieldProps) {
  const hasError = error && touched;
  const isValid = touched && !error && value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
    onChange(newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400">{icon}</div>
          </div>
        )}
        
        <input
          id={id}
          type={type}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readonly}
          min={min}
          max={max}
          step={step}
          className={`
            block w-full rounded-lg border-2 px-3 py-2 text-sm transition-colors
            ${icon ? 'pl-10' : ''}
            ${hasError 
              ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-red-500' 
              : isValid
                ? 'border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500'
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
            }
            ${readonly || disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
        />
        
        {/* Indicador de estado */}
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

// Componente para selects
export interface SelectOption {
  id: string | number;
  name: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  isNumeric?: boolean;
  className?: string;
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  required = false,
  error,
  touched = false,
  disabled = false,
  loading = false,
  icon,
  isNumeric = false,
  className = ''
}: SelectFieldProps) {
  const hasError = error && touched;
  const isValid = touched && !error && value;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = isNumeric ? Number(e.target.value) : e.target.value;
    onChange(newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <div className="text-gray-400">{icon}</div>
          </div>
        )}
        
        <select
          id={id}
          value={value || ''}
          onChange={handleChange}
          disabled={disabled || loading}
          className={`
            block w-full rounded-lg border-2 px-3 py-2 text-sm transition-colors
            ${icon ? 'pl-10' : ''}
            ${hasError 
              ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500' 
              : isValid
                ? 'border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500'
                : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
            }
            ${disabled || loading ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'cursor-pointer'}
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            appearance-none
          `}
        >
          <option value="" disabled>
            {loading ? 'Cargando...' : placeholder}
          </option>
          {options.map((option) => (
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
        </select>
        
        {/* Flecha personalizada para select */}
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
    </div>
  );
}

// Componente para textarea
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
}

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
  className = ''
}: TextareaFieldProps) {
  const hasError = error && touched;
  const isValid = touched && !error && value;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
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
          className={`
            block w-full rounded-lg border-2 px-3 py-2 text-sm transition-colors resize-vertical
            ${hasError 
              ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-red-500' 
              : isValid
                ? 'border-green-300 bg-green-50 text-green-900 focus:border-green-500 focus:ring-green-500'
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500'
            }
            ${readonly || disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
        />
        
        {/* Indicador de estado */}
        <div className="absolute top-2 right-2">
          {hasError && <AlertCircle className="w-5 h-5 text-red-500" />}
          {isValid && <CheckCircle2 className="w-5 h-5 text-green-500" />}
        </div>
      </div>
      
      {maxLength && (
        <div className="text-xs text-gray-500 text-right">
          {(value || '').length}/{maxLength}
        </div>
      )}
      
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

// Componente wrapper para secciones del formulario
export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

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
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div 
        className={`px-6 py-4 border-b border-gray-200 ${collapsible ? 'cursor-pointer' : ''}`}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          
          {collapsible && (
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg 
                className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {(!collapsible || isExpanded) && (
        <div className="px-6 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

// Componente para mostrar información de solo lectura
export interface InfoFieldProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export function InfoField({ label, value, icon, className = '' }: InfoFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
        {icon && <div className="text-gray-400">{icon}</div>}
        <span className="text-sm text-gray-900">{value || 'No especificado'}</span>
      </div>
    </div>
  );
}