// src/components/form/ProgressIndicator.tsx - Indicador de progreso

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import type { FormTabId } from '../../types/policyForm';

export interface TabProgress {
  id: FormTabId;
  label: string;
  icon: keyof typeof LucideIcons;
  completion: number;
  errors: number;
  isActive: boolean;
  isCompleted: boolean;
}

export interface ProgressIndicatorProps {
  tabs: TabProgress[];
  overallProgress: number;
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'minimal';
  showLabels?: boolean;
  showErrors?: boolean;
  onTabClick?: (tabId: FormTabId) => void;
}

/**
 * 📊 INDICADOR DE PROGRESO PRINCIPAL
 * Muestra el progreso general y por pestañas del formulario
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  tabs,
  overallProgress,
  className,
  variant = 'horizontal',
  showLabels = true,
  showErrors = true,
  onTabClick
}) => {
  const completedTabs = tabs.filter(tab => tab.isCompleted).length;
  const tabsWithErrors = tabs.filter(tab => tab.errors > 0).length;

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Progress value={overallProgress} className="flex-1 h-2" />
        <Badge variant={overallProgress === 100 ? "default" : "secondary"}>
          {overallProgress}%
        </Badge>
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <Card className={cn("w-64", className)}>
        <CardContent className="p-4 space-y-4">
          {/* Header con progreso general */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Progreso del Formulario</h3>
              <Badge variant={overallProgress === 100 ? "default" : "secondary"}>
                {overallProgress}%
              </Badge>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completedTabs}/{tabs.length} pestañas completadas</span>
              {tabsWithErrors > 0 && (
                <span className="text-red-600">{tabsWithErrors} con errores</span>
              )}
            </div>
          </div>

          {/* Lista de pestañas */}
          <div className="space-y-2">
            {tabs.map((tab) => {
              const IconComponent = LucideIcons[tab.icon] as React.ComponentType<any>;
              
              return (
                <div
                  key={tab.id}
                  onClick={() => onTabClick?.(tab.id)}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer",
                    tab.isActive && "bg-primary/10 border border-primary/20",
                    tab.isCompleted && "bg-green-50 border border-green-200",
                    tab.errors > 0 && "bg-red-50 border border-red-200",
                    !tab.isActive && !tab.isCompleted && tab.errors === 0 && "hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "p-1 rounded",
                    tab.isCompleted && "bg-green-100",
                    tab.errors > 0 && "bg-red-100",
                    tab.isActive && !tab.isCompleted && tab.errors === 0 && "bg-primary/20"
                  )}>
                    <IconComponent className={cn(
                      "h-4 w-4",
                      tab.isCompleted && "text-green-600",
                      tab.errors > 0 && "text-red-600",
                      tab.isActive && "text-primary",
                      !tab.isActive && !tab.isCompleted && tab.errors === 0 && "text-muted-foreground"
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-sm font-medium truncate",
                        tab.isCompleted && "text-green-700",
                        tab.errors > 0 && "text-red-700"
                      )}>
                        {tab.label}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {tab.completion}%
                      </span>
                    </div>
                    
                    {/* Mini progress bar */}
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className={cn(
                            "h-1 rounded-full transition-all duration-300",
                            tab.errors > 0 ? "bg-red-500" : 
                            tab.completion === 100 ? "bg-green-500" : "bg-primary"
                          )}
                          style={{ width: `${tab.completion}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Badges de estado */}
                  <div className="flex items-center gap-1">
                    {tab.isCompleted && (
                      <LucideIcons.CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {tab.errors > 0 && (
                      <Badge variant="destructive" className="text-xs h-5">
                        {tab.errors}
                      </Badge>
                    )}
                    {tab.isActive && !tab.isCompleted && (
                      <LucideIcons.Clock className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Variant horizontal (default)
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        {/* Header con estadísticas generales */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold">Progreso del Formulario</h3>
            <Badge variant={overallProgress === 100 ? "default" : "secondary"} className="text-sm">
              {overallProgress}% Completado
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <LucideIcons.CheckCircle className="h-4 w-4 text-green-500" />
              {completedTabs} completadas
            </span>
            {tabsWithErrors > 0 && (
              <span className="flex items-center gap-1">
                <LucideIcons.AlertCircle className="h-4 w-4 text-red-500" />
                {tabsWithErrors} con errores
              </span>
            )}
          </div>
        </div>

        {/* Progress bar general */}
        <div className="mb-6">
          <Progress value={overallProgress} className="h-3" />
        </div>

        {/* Grid de pestañas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {tabs.map((tab) => {
            const IconComponent = LucideIcons[tab.icon] as React.ComponentType<any>;
            
            return (
              <div
                key={tab.id}
                onClick={() => onTabClick?.(tab.id)}
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg border transition-all cursor-pointer",
                  tab.isActive && "border-primary bg-primary/5 shadow-sm",
                  tab.isCompleted && "border-green-200 bg-green-50",
                  tab.errors > 0 && "border-red-200 bg-red-50",
                  !tab.isActive && !tab.isCompleted && tab.errors === 0 && "border-border hover:bg-muted/50"
                )}
              >
                {/* Icono con estado */}
                <div className={cn(
                  "p-2 rounded-full mb-2 transition-colors",
                  tab.isCompleted && "bg-green-100",
                  tab.errors > 0 && "bg-red-100",
                  tab.isActive && !tab.isCompleted && tab.errors === 0 && "bg-primary/20",
                  !tab.isActive && !tab.isCompleted && tab.errors === 0 && "bg-muted"
                )}>
                  <IconComponent className={cn(
                    "h-4 w-4",
                    tab.isCompleted && "text-green-600",
                    tab.errors > 0 && "text-red-600",
                    tab.isActive && "text-primary",
                    !tab.isActive && !tab.isCompleted && tab.errors === 0 && "text-muted-foreground"
                  )} />
                </div>

                {/* Label */}
                {showLabels && (
                  <span className={cn(
                    "text-xs font-medium text-center mb-1",
                    tab.isCompleted && "text-green-700",
                    tab.errors > 0 && "text-red-700"
                  )}>
                    {tab.label}
                  </span>
                )}

                {/* Progress y badges */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {tab.completion}%
                  </span>
                  
                  {showErrors && tab.errors > 0 && (
                    <Badge variant="destructive" className="text-xs h-4 px-1">
                      {tab.errors}
                    </Badge>
                  )}
                  
                  {tab.isCompleted && (
                    <LucideIcons.CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                </div>

                {/* Mini progress bar */}
                <div className="w-full mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        tab.errors > 0 ? "bg-red-500" : 
                        tab.completion === 100 ? "bg-green-500" : "bg-primary"
                      )}
                      style={{ width: `${tab.completion}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * 📈 PROGRESS RING SIMPLE
 * Indicador circular de progreso minimalista
 */
export interface ProgressRingProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 'md',
  showPercentage = true,
  className
}) => {
  const sizeMap = {
    sm: { width: 40, height: 40, strokeWidth: 3, fontSize: 'text-xs' },
    md: { width: 60, height: 60, strokeWidth: 4, fontSize: 'text-sm' },
    lg: { width: 80, height: 80, strokeWidth: 5, fontSize: 'text-base' }
  };

  const { width, height, strokeWidth, fontSize } = sizeMap[size];
  const radius = (width - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={width} height={height} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          className="text-muted-foreground/20"
        />
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-500 ease-in-out",
            progress === 100 ? "text-green-500" : "text-primary"
          )}
        />
      </svg>
      
      {showPercentage && (
        <span className={cn(
          "absolute inset-0 flex items-center justify-center font-semibold",
          fontSize,
          progress === 100 ? "text-green-600" : "text-foreground"
        )}>
          {progress}%
        </span>
      )}
    </div>
  );
};

export default ProgressIndicator;