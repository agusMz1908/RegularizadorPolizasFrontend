// src/components/wizard/OperationSelector.tsx - CON MICRO-INTERACCIONES
import React from 'react';
import { cn } from '@/lib/utils';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, FileText, RotateCcw, Edit3 } from 'lucide-react';
import { EnhancedCard, EnhancedButton, StaggeredList } from '@/components/enhanced/MicroInteractions';

export type OperationType = 'emision' | 'renovacion' | 'cambio';

interface OperationSelectorProps {
  onSelect: (operation: OperationType) => void;
  selected?: OperationType;
}

const operations = [
  {
    id: 'emision' as OperationType,
    title: 'Nueva Emisión',
    description: 'Crear una póliza completamente nueva',
    detailedDescription: 'Proceso completo de emisión desde cero. Incluye alta de cliente, vehículo y configuración de cobertura.',
    icon: FileText,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50',
    borderColor: 'border-emerald-200 hover:border-emerald-300 dark:border-emerald-800 dark:hover:border-emerald-700',
    selectedBorderColor: 'border-emerald-500 dark:border-emerald-400'
  },
  {
    id: 'renovacion' as OperationType,
    title: 'Renovación',
    description: 'Renovar una póliza existente',
    detailedDescription: 'Proceso optimizado para renovar pólizas vencidas o próximas a vencer. Carga datos previos automáticamente.',
    icon: RotateCcw,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50',
    borderColor: 'border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700',
    selectedBorderColor: 'border-blue-500 dark:border-blue-400'
  },
  {
    id: 'cambio' as OperationType,
    title: 'Cambio de Póliza',
    description: 'Modificar una póliza vigente',
    detailedDescription: 'Permite cambios de vehículo, cobertura u otros aspectos de la póliza actual.',
    icon: Edit3,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-950/50',
    borderColor: 'border-orange-200 hover:border-orange-300 dark:border-orange-800 dark:hover:border-orange-700',
    selectedBorderColor: 'border-orange-500 dark:border-orange-400'
  }
];

const OperationSelector: React.FC<OperationSelectorProps> = ({ onSelect, selected }) => {
  const operationCards = operations.map((operation) => {
    const Icon = operation.icon;
    const isSelected = selected === operation.id;
    
    return (
      <EnhancedCard
        key={operation.id}
        variant="interactive"
        hoverEffect="lift"
        clickEffect="ripple"
        onClick={() => onSelect(operation.id)}
        className={cn(
          "border-2 bg-card",
          isSelected 
            ? operation.selectedBorderColor 
            : operation.borderColor,
          operation.bgColor
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className={cn("p-3 rounded-lg transition-transform duration-300 hover:scale-110", operation.bgColor)}>
              <Icon className={cn("h-6 w-6", operation.color)} />
            </div>
            {isSelected && (
              <div className="flex items-center text-primary animate-in fade-in-0 slide-in-from-right-2">
                <span className="text-sm font-medium">Seleccionado</span>
              </div>
            )}
          </div>
          <CardTitle className={cn("text-xl transition-colors", operation.color)}>
            {operation.title}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {operation.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {operation.detailedDescription}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                BSE • AUTOMÓVILES
              </span>
            </div>
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform duration-300",
              operation.color,
              isSelected && "transform rotate-90"
            )} />
          </div>
        </CardContent>
      </EnhancedCard>
    );
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header with enhanced animation */}
      <div className="text-center space-y-3 animate-in fade-in-0 slide-in-from-top-4 duration-700">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          RegularizadorPolizas V2
        </h1>
        <p className="text-lg text-muted-foreground">
          ¿Qué operación deseas realizar?
        </p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Selecciona el tipo de operación para continuar con el proceso automatizado
        </p>
      </div>

      {/* Operation Cards con Staggered Animation */}
      <StaggeredList
        direction="up"
        staggerDelay={0.15}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {operationCards}
      </StaggeredList>

      {/* Enhanced Action Button */}
      <div className="flex justify-center pt-6">
        <EnhancedButton
          variant="gradient"
          size="lg"
          disabled={!selected}
          onClick={() => selected && onSelect(selected)}
          className="min-w-[200px]"
          icon={<ChevronRight className="h-4 w-4" />}
        >
          Continuar
        </EnhancedButton>
      </div>

      {/* Enhanced Info Footer */}
      <div className="text-center text-sm text-muted-foreground space-y-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
        <div className="flex items-center justify-center space-x-4 flex-wrap">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🚗</span>
            <span><strong>Alcance:</strong> Solo AUTOMÓVILES de BSE</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">📄</span>
            <span><strong>Proceso:</strong> Escaneo con Azure AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationSelector;