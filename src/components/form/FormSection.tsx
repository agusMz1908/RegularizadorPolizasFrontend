// src/components/form/FormSection.tsx - Wrapper de secciones

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

export interface FormSectionProps {
  title: string;
  description?: string;
  icon?: keyof typeof LucideIcons;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'elevated';
  
  // Estados y progreso
  isActive?: boolean;
  isCompleted?: boolean;
  hasErrors?: boolean;
  completionPercentage?: number;
  
  // Badges informativos
  requiredFields?: number;
  completedFields?: number;
  errorCount?: number;
  
  // Acciones
  onHeaderClick?: () => void;
  collapsible?: boolean;
  collapsed?: boolean;
}

/**
 * 📦 SECCIÓN DE FORMULARIO REUTILIZABLE
 * Wrapper para agrupar campos relacionados con header informativo
 */
export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  icon,
  children,
  className,
  variant = 'default',
  isActive = false,
  isCompleted = false,
  hasErrors = false,
  completionPercentage,
  requiredFields,
  completedFields,
  errorCount,
  onHeaderClick,
  collapsible = false,
  collapsed = false
}) => {
  const IconComponent = icon ? LucideIcons[icon] as React.ComponentType<any> : null;

  // Calcular estado y colores
  const progress = completionPercentage || 
    (requiredFields && completedFields ? Math.round((completedFields / requiredFields) * 100) : 0);

  const getStatusColor = () => {
    if (hasErrors) return 'border-red-200 bg-red-50/50';
    if (isCompleted || progress === 100) return 'border-green-200 bg-green-50/50';
    if (isActive) return 'border-primary bg-primary/5';
    return 'border-border';
  };

  const getIconColor = () => {
    if (hasErrors) return 'text-red-500';
    if (isCompleted || progress === 100) return 'text-green-500';
    if (isActive) return 'text-primary';
    return 'text-muted-foreground';
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-300",
        getStatusColor(),
        variant === 'elevated' && "shadow-lg",
        variant === 'compact' && "border-0 shadow-none bg-transparent",
        isActive && "ring-2 ring-primary/20",
        className
      )}
    >
      <CardHeader 
        className={cn(
          "transition-all duration-200",
          variant === 'compact' && "px-0 py-4",
          collapsible && "cursor-pointer hover:bg-muted/50",
          onHeaderClick && "cursor-pointer hover:bg-muted/50",
          collapsed && "border-b-0"
        )}
        onClick={onHeaderClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icono principal */}
            {IconComponent && (
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                hasErrors && "bg-red-100",
                (isCompleted || progress === 100) && "bg-green-100",
                isActive && "bg-primary/10",
                !hasErrors && !isCompleted && !isActive && "bg-muted"
              )}>
                <IconComponent className={cn("h-5 w-5", getIconColor())} />
              </div>
            )}

            {/* Título y descripción */}
            <div className="space-y-1">
              <CardTitle className={cn(
                "text-lg flex items-center gap-2",
                hasErrors && "text-red-700",
                (isCompleted || progress === 100) && "text-green-700"
              )}>
                {title}
                
                {/* Indicador de estado */}
                {isCompleted || progress === 100 ? (
                  <LucideIcons.CheckCircle className="h-4 w-4 text-green-500" />
                ) : hasErrors ? (
                  <LucideIcons.AlertCircle className="h-4 w-4 text-red-500" />
                ) : isActive ? (
                  <LucideIcons.Clock className="h-4 w-4 text-primary" />
                ) : null}
              </CardTitle>
              
              {description && (
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Badges y estadísticas */}
          <div className="flex items-center gap-2">
            {/* Progress badge */}
            {(requiredFields || completionPercentage !== undefined) && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  progress === 100 && "border-green-200 text-green-700 bg-green-50",
                  progress < 50 && "border-orange-200 text-orange-700 bg-orange-50",
                  progress >= 50 && progress < 100 && "border-blue-200 text-blue-700 bg-blue-50"
                )}
              >
                {progress}% completo
              </Badge>
            )}

            {/* Error count */}
            {errorCount && errorCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errorCount} error{errorCount > 1 ? 'es' : ''}
              </Badge>
            )}

            {/* Fields completion */}
            {requiredFields && (
              <Badge variant="secondary" className="text-xs">
                {completedFields || 0}/{requiredFields} campos
              </Badge>
            )}

            {/* Collapse indicator */}
            {collapsible && (
              <LucideIcons.ChevronDown 
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  collapsed && "transform rotate-180"
                )}
              />
            )}
          </div>
        </div>

        {/* Progress bar */}
        {(completionPercentage !== undefined || (requiredFields && completedFields !== undefined)) && (
          <div className="mt-3">
            <Progress 
              value={progress} 
              className={cn(
                "h-2 transition-all duration-500",
                hasErrors && "[&>div]:bg-red-500",
                progress === 100 && "[&>div]:bg-green-500"
              )}
            />
          </div>
        )}
      </CardHeader>

      {/* Contenido colapsible */}
      {!collapsed && (
        <CardContent 
          className={cn(
            "transition-all duration-300",
            variant === 'compact' && "px-0 py-4"
          )}
        >
          {children}
        </CardContent>
      )}
    </Card>
  );
};

/**
 * 📋 SECCIÓN SIMPLE SIN CARD
 * Para casos donde no necesitamos el wrapper de Card
 */
export interface SimpleSectionProps {
  title: string;
  description?: string;
  icon?: keyof typeof LucideIcons;
  children: React.ReactNode;
  className?: string;
}

export const SimpleSection: React.FC<SimpleSectionProps> = ({
  title,
  description,
  icon,
  children,
  className
}) => {
  const IconComponent = icon ? LucideIcons[icon] as React.ComponentType<any> : null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header simple */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
          {IconComponent && <IconComponent className="h-5 w-5 text-primary" />}
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Contenido */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

/**
 * 📊 SECCIÓN CON GRID AUTOMÁTICO
 * Organiza automáticamente los campos en grid responsivo
 */
export interface GridSectionProps extends Omit<FormSectionProps, 'children'> {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
}

export const GridSection: React.FC<GridSectionProps> = ({
  children,
  columns = 3,
  gap = 'md',
  responsive = true,
  ...sectionProps
}) => {
  const getGridClass = () => {
    const baseClass = 'grid';
    const gapClass = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8'
    }[gap];

    if (responsive) {
      // Grid responsivo
      const responsiveClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      }[columns];

      return cn(baseClass, gapClass, responsiveClass);
    } else {
      // Grid fijo
      const fixedClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4'
      }[columns];

      return cn(baseClass, gapClass, fixedClass);
    }
  };

  return (
    <FormSection {...sectionProps}>
      <div className={getGridClass()}>
        {children}
      </div>
    </FormSection>
  );
};

export default FormSection;