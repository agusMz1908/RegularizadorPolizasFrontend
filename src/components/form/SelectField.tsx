// src/components/form/SelectField.tsx - Select reutilizable

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

export interface SelectOption {
  id: string | number;
  name: string;
  description?: string;
  disabled?: boolean;
  group?: string;
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
  icon?: keyof typeof LucideIcons;
  isNumeric?: boolean; // Si devuelve number o string
  className?: string;
  showDataOrigin?: boolean;
  dataOrigin?: 'azure' | 'manual' | 'master';
  emptyMessage?: string;
  searchable?: boolean; // Para implementar en el futuro
}

/**
 * 🔽 SELECT FIELD REUTILIZABLE
 * Componente base para todos los selects del formulario (maestros y texto plano)
 */
export const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  required = false,
  error,
  touched = false,
  disabled = false,
  loading = false,
  icon,
  isNumeric = false,
  className,
  showDataOrigin = false,
  dataOrigin,
  emptyMessage = "No hay opciones disponibles"
}) => {
  const IconComponent = icon ? LucideIcons[icon] as React.ComponentType<any> : null;
  
  const hasError = error && touched;
  const isSuccess = touched && !error && value !== null && value !== undefined && value !== '';

  // Agrupar opciones si tienen grupos
  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, SelectOption[]> = {};
    const ungrouped: SelectOption[] = [];

    options.forEach(option => {
      if (option.group) {
        if (!groups[option.group]) {
          groups[option.group] = [];
        }
        groups[option.group].push(option);
      } else {
        ungrouped.push(option);
      }
    });

    return { groups, ungrouped };
  }, [options]);

  const handleValueChange = (newValue: string) => {
    const convertedValue = isNumeric ? Number(newValue) : newValue;
    onChange(convertedValue);
  };

  // Obtener el display value para el valor seleccionado
  const getDisplayValue = () => {
    const selectedOption = options.find(opt => opt.id.toString() === value.toString());
    return selectedOption?.name || '';
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label con badges */}
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
                dataOrigin === 'master' && "border-purple-200 text-purple-700 bg-purple-50",
                dataOrigin === 'manual' && "border-orange-200 text-orange-700 bg-orange-50"
              )}
            >
              {dataOrigin === 'azure' && '🤖 AI'}
              {dataOrigin === 'master' && '🏢 BD'}
              {dataOrigin === 'manual' && '✏️ Manual'}
            </Badge>
          )}

          {loading && (
            <Badge variant="secondary" className="text-xs">
              <LucideIcons.Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Cargando...
            </Badge>
          )}

          {options.length > 0 && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {options.length} opciones
            </Badge>
          )}
        </div>
      </div>

      {/* Select principal */}
      {loading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <Select
          value={value.toString()}
          onValueChange={handleValueChange}
          disabled={disabled || options.length === 0}
        >
          <SelectTrigger 
            className={cn(
              "transition-all duration-200",
              hasError && "border-red-500 focus:ring-red-500 focus:border-red-500",
              isSuccess && "border-green-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <SelectValue placeholder={placeholder}>
              {getDisplayValue()}
            </SelectValue>
          </SelectTrigger>
          
          <SelectContent className="max-h-[300px] overflow-y-auto">
            {/* Mensaje si no hay opciones */}
            {options.length === 0 && (
              <div className="px-2 py-6 text-center">
                <LucideIcons.Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              </div>
            )}

            {/* Opciones sin grupo */}
            {groupedOptions.ungrouped.map((option) => (
              <SelectItem
                key={option.id}
                value={option.id.toString()}
                disabled={option.disabled}
                className={cn(
                  "cursor-pointer",
                  option.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option.name}</span>
                  {option.description && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {option.description}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}

            {/* Opciones agrupadas */}
            {Object.entries(groupedOptions.groups).map(([groupName, groupOptions]) => (
              <div key={groupName}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                  {groupName}
                </div>
                {groupOptions.map((option) => (
                  <SelectItem
                    key={option.id}
                    value={option.id.toString()}
                    disabled={option.disabled}
                    className={cn(
                      "cursor-pointer pl-4",
                      option.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{option.name}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Mensaje de error */}
      {hasError && (
        <div className="flex items-center gap-1 text-red-600">
          <LucideIcons.AlertCircle className="h-3 w-3" />
          <span className="text-xs">{error}</span>
        </div>
      )}

      {/* Información adicional */}
      {!hasError && !loading && options.length === 0 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <LucideIcons.AlertTriangle className="h-3 w-3" />
          No se pudieron cargar las opciones
        </p>
      )}
    </div>
  );
};

/**
 * 🔽 SELECT FIELD PARA MAESTROS
 * Wrapper específico para selects que vienen de la base de datos
 */
export interface MasterSelectFieldProps extends Omit<SelectFieldProps, 'options' | 'loading' | 'dataOrigin'> {
  masterData: any[] | null;
  masterType: 'categoria' | 'destino' | 'calidad' | 'combustible' | 'moneda';
  loading?: boolean;
}

export const MasterSelectField: React.FC<MasterSelectFieldProps> = ({
  masterData,
  masterType,
  loading = false,
  ...props
}) => {
  // Mapear los datos del maestro a opciones del select
  const options = React.useMemo(() => {
    if (!masterData) return [];

    return masterData.map(item => {
      let name = '';
      let description = '';

      // Mapear según el tipo de maestro
      switch (masterType) {
        case 'categoria':
          name = item.catdsc || item.name || `ID: ${item.id}`;
          break;
        case 'destino':
          name = item.desnom || item.name || `ID: ${item.id}`;
          break;
        case 'calidad':
          name = item.caldsc || item.name || `ID: ${item.id}`;
          break;
        case 'combustible':
          name = item.name || `ID: ${item.id}`;
          description = item.id; // Mostrar el código como descripción
          break;
        case 'moneda':
          name = item.nombre || item.name || `ID: ${item.id}`;
          description = item.codigo || item.simbolo;
          break;
        default:
          name = item.name || item.nombre || `ID: ${item.id}`;
      }

      return {
        id: item.id,
        name,
        description,
        disabled: item.activo === false
      };
    });
  }, [masterData, masterType]);

  return (
    <SelectField
      {...props}
      options={options}
      loading={loading}
      dataOrigin="master"
      showDataOrigin={true}
      emptyMessage={`No hay ${masterType}s disponibles`}
      isNumeric={masterType !== 'combustible'} // Combustible es string, el resto number
    />
  );
};

export default SelectField;