// src/components/wizard/PolicyFormComponents.tsx

import { memo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== TIPOS =====
interface BaseComponentProps {
  isDark: boolean;
  className?: string;
}

// ===== FORM SECTION =====
interface FormSectionProps extends BaseComponentProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const FormSection = memo<FormSectionProps>(({ 
  title, 
  description, 
  children, 
  icon, 
  isDark 
}) => (
  <div className={cn(
    "rounded-xl p-5 mb-6 border transition-all",
    isDark 
      ? "bg-gray-900/50 border-gray-800 hover:border-gray-700" 
      : "bg-gray-50/50 border-gray-200 hover:border-gray-300"
  )}>
    <div className="mb-4 flex items-start gap-3">
      {icon && (
        <div className={cn(
          "p-2 rounded-lg",
          isDark ? "bg-gray-800" : "bg-white shadow-sm"
        )}>
          <span className="text-primary">{icon}</span>
        </div>
      )}
      <div className="flex-1">
        <h4 className={cn(
          "text-sm font-semibold",
          isDark ? "text-gray-200" : "text-gray-700"
        )}>{title}</h4>
        {description && (
          <p className={cn(
            "text-xs mt-1",
            isDark ? "text-gray-400" : "text-gray-500"
          )}>{description}</p>
        )}
      </div>
    </div>
    {children}
  </div>
));
FormSection.displayName = 'FormSection';

// ===== INFO FIELD =====
interface InfoFieldProps extends BaseComponentProps {
  label: string;
  value: string | number | undefined;
  icon?: React.ReactNode;
}

export const InfoField = memo<InfoFieldProps>(({ 
  label, 
  value, 
  icon, 
  className = "", 
  isDark 
}) => (
  <div className={cn("flex items-start gap-3", className)}>
    {icon && (
      <span className={cn(
        "mt-1",
        isDark ? "text-gray-500" : "text-gray-400"
      )}>{icon}</span>
    )}
    <div className="flex-1">
      <Label className={cn(
        "text-xs",
        isDark ? "text-gray-400" : "text-gray-500"
      )}>{label}</Label>
      <p className={cn(
        "text-sm font-medium mt-1",
        isDark ? "text-gray-100" : "text-gray-900"
      )}>{value || '-'}</p>
    </div>
  </div>
));
InfoField.displayName = 'InfoField';

// ===== FORM FIELD =====
interface FormFieldProps extends BaseComponentProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  type?: 'text' | 'number' | 'date' | 'email' | 'password' | 'tel' | 'url';
  icon?: React.ReactNode;
  disabled?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  helperText?: string;
  hasError: boolean;
}

export const FormField = memo<FormFieldProps>(({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error, 
  type = "text", 
  icon,
  disabled = false,
  min,
  max,
  step,
  helperText,
  isDark,
  hasError
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (type === 'number') {
      onChange(parseFloat(newValue) || 0);
    } else {
      onChange(newValue);
    }
  }, [onChange, type]);
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={cn(
        "text-sm font-medium flex items-center gap-2",
        isDark ? "text-gray-200" : "text-gray-700"
      )}>
        {icon && <span className="text-primary">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={cn(
          "w-full transition-all",
          hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
          isDark && "bg-gray-900/50 border-gray-700 focus:border-primary",
          !isDark && "bg-white border-gray-300 focus:border-primary"
        )}
      />
      {helperText && !hasError && (
        <p className={cn(
          "text-xs",
          isDark ? "text-gray-400" : "text-gray-500"
        )}>{helperText}</p>
      )}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
});
FormField.displayName = 'FormField';

// ===== SELECT FIELD =====
interface OptionType {
  id: string | number;
  name?: string;
  label?: string;
}

interface SelectFieldProps extends BaseComponentProps {
  id: string;
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  options: OptionType[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  helperText?: string;
  hasError: boolean;
}

export const SelectField = memo<SelectFieldProps>(({ 
  id, 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = "Seleccione una opción", 
  required = false, 
  error,
  loading = false,
  icon,
  disabled = false,
  helperText,
  isDark,
  hasError
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className={cn(
        "text-sm font-medium flex items-center gap-2",
        isDark ? "text-gray-200" : "text-gray-700"
      )}>
        {icon && <span className="text-primary">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select 
        value={value?.toString() || ''} 
        onValueChange={onChange}
        disabled={disabled || loading || !options?.length}
      >
        <SelectTrigger className={cn(
          "w-full transition-all",
          hasError && "border-red-500 focus:border-red-500",
          isDark && "bg-gray-900/50 border-gray-700 hover:border-gray-600",
          !isDark && "bg-white border-gray-300 hover:border-gray-400"
        )}>
          <SelectValue placeholder={loading ? "Cargando..." : placeholder} />
        </SelectTrigger>
        <SelectContent className={cn(
          isDark && "bg-gray-900 border-gray-700",
          !isDark && "bg-white border-gray-200"
        )}>
          {options.map((option) => (
            <SelectItem 
              key={option.id} 
              value={option.id.toString()}
              className={cn(
                isDark && "focus:bg-gray-800",
                !isDark && "focus:bg-gray-100"
              )}
            >
              {option.name || option.label || option.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {helperText && !hasError && (
        <p className={cn(
          "text-xs",
          isDark ? "text-gray-400" : "text-gray-500"
        )}>{helperText}</p>
      )}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
});
SelectField.displayName = 'SelectField';