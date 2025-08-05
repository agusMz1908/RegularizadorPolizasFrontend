// src/components/form/FormField.tsx - Campo base reutilizable

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

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
  icon?: keyof typeof LucideIcons;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  showDataOrigin?: boolean;
  dataOrigin?: 'azure' | 'manual' | 'client';
}

/**
 * 📝 CAMPO DE FORMULARIO REUTILIZABLE
 * Componente base para todos los inputs del formulario
 */
export const FormField: React.FC<FormFieldProps> = ({
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
  className,
  showDataOrigin = false,
  dataOrigin
}) => {
  // Obtener el icono dinámicamente
  const IconComponent = icon ? LucideIcons[icon] as React.ComponentType<any> : null;

  // Estados visuales
  const hasError = error && touched;
  const isSuccess = touched && !error && value && !readonly;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label con icono y badges */}
      <div className="flex items-center justify-between">
        <Label 
          htmlFor={id} 
          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors",
            hasError && "text-red-600",
            isSuccess && "text-green-600",
            disabled && "text-muted-foreground"
          )}
        >
          {IconComponent && (
            <IconComponent className={cn(
              "h-4 w-4",
              hasError && "text-red-500",
              isSuccess && "text-green-500",
              disabled && "text-muted-foreground"
            )} />
          )}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>

        {/* Badges informativos */}
        <div className="flex items-center gap-1">
          {showDataOrigin && dataOrigin && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                dataOrigin === 'azure' && "border-blue-200 text-blue-700 bg-blue-50",
                dataOrigin === 'client' && "border-green-200 text-green-700 bg-green-50",
                dataOrigin === 'manual' && "border-orange-200 text-orange-700 bg-orange-50"
              )}
            >
              {dataOrigin === 'azure' && '🤖 AI'}
              {dataOrigin === 'client' && '👤 Cliente'}
              {dataOrigin === 'manual' && '✏️ Manual'}
            </Badge>
          )}
          
          {readonly && (
            <Badge variant="secondary" className="text-xs">
              Solo lectura
            </Badge>
          )}
        </div>
      </div>

      {/* Input principal */}
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => {
            const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
            onChange(newValue);
          }}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readonly}
          min={min}
          max={max}
          step={step}
          className={cn(
            "transition-all duration-200",
            hasError && "border-red-500 focus:ring-red-500 focus:border-red-500",
            isSuccess && "border-green-500 pr-10",
            readonly && "bg-muted cursor-default",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />

        {/* Icono de estado */}
        {isSuccess && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <LucideIcons.CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {hasError && (
        <div className="flex items-center gap-1 text-red-600">
          <LucideIcons.AlertCircle className="h-3 w-3" />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {/* Información adicional para campos readonly */}
      {readonly && !hasError && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <LucideIcons.Info className="h-3 w-3" />
          Este campo se completa automáticamente
        </p>
      )}
    </div>
  );
};

/**
 * 📝 TEXTAREA REUTILIZABLE
 * Para campos de texto largo como observaciones
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
  icon?: keyof typeof LucideIcons;
  className?: string;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
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
  icon,
  className
}) => {
  const IconComponent = icon ? LucideIcons[icon] as React.ComponentType<any> : null;
  const hasError = error && touched;
  const isSuccess = touched && !error && value && !readonly;
  const currentLength = value?.length || 0;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <Label 
          htmlFor={id} 
          className={cn(
            "flex items-center gap-2 text-sm font-medium",
            hasError && "text-red-600",
            isSuccess && "text-green-600"
          )}
        >
          {IconComponent && (
            <IconComponent className={cn(
              "h-4 w-4",
              hasError && "text-red-500",
              isSuccess && "text-green-500"
            )} />
          )}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>

        {maxLength && (
          <span className={cn(
            "text-xs",
            currentLength > maxLength * 0.9 ? "text-orange-600" : "text-muted-foreground",
            currentLength >= maxLength && "text-red-600"
          )}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>

      {/* Textarea */}
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-200",
          hasError && "border-red-500 focus:ring-red-500 focus:border-red-500",
          isSuccess && "border-green-500",
          readonly && "bg-muted cursor-default"
        )}
      />

      {/* Error message */}
      {hasError && (
        <div className="flex items-center gap-1 text-red-600">
          <LucideIcons.AlertCircle className="h-3 w-3" />
          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;