// src/components/wizard/OperationSelector.tsx - ADAPTATIVO CON SISTEMA DE TEMAS
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, RotateCcw, Edit3, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type OperationType = 'EMISION' | 'RENOVACION' | 'CAMBIO';

interface OperationSelectorProps {
  onSelect: (operation: OperationType) => void;
  selected?: OperationType;
}

interface OperationOption {
  id: OperationType;
  title: string;
  description: string;
  detailedDescription: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  selectedBorderColor: string;
}

const operations: OperationOption[] = [
  {
    id: 'EMISION',
    title: 'Nueva Póliza',
    description: 'Crear una póliza completamente nueva',
    detailedDescription: 'Proceso completo de emisión de una nueva póliza de seguro para vehículos. Incluye selección de cliente, compañía, sección y escaneo del documento.',
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50',
    borderColor: 'border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700',
    selectedBorderColor: 'border-blue-500 dark:border-blue-400'
  },
  {
    id: 'RENOVACION',
    title: 'Renovar Póliza',
    description: 'Renovar una póliza existente que está por vencer',
    detailedDescription: 'Renovación de pólizas que vencen en los próximos 30 días. Se selecciona la póliza original y se procesa la renovación con la nueva documentación.',
    icon: RotateCcw,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50',
    borderColor: 'border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700',
    selectedBorderColor: 'border-green-500 dark:border-green-400'
  },
  {
    id: 'CAMBIO',
    title: 'Modificar Póliza',
    description: 'Realizar cambios en una póliza vigente',
    detailedDescription: 'Modificación de pólizas vigentes de vehículos. Permite cambios de vehículo, cobertura u otros aspectos de la póliza actual.',
    icon: Edit3,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-950/50',
    borderColor: 'border-orange-200 hover:border-orange-300 dark:border-orange-800 dark:hover:border-orange-700',
    selectedBorderColor: 'border-orange-500 dark:border-orange-400'
  }
];

const OperationSelector: React.FC<OperationSelectorProps> = ({ onSelect, selected }) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          RegularizadorPolizas V2
        </h1>
        <p className="text-lg text-muted-foreground">
          ¿Qué operación deseas realizar?
        </p>
        <p className="text-sm text-muted-foreground">
          Selecciona el tipo de operación para continuar con el proceso
        </p>
      </div>

      {/* Operation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {operations.map((operation) => {
          const Icon = operation.icon;
          const isSelected = selected === operation.id;
          
          return (
            <Card
              key={operation.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-card hover-lift",
                "border-2",
                isSelected 
                  ? operation.selectedBorderColor 
                  : operation.borderColor,
                operation.bgColor,
                isSelected && "shadow-lg scale-105"
              )}
              onClick={() => onSelect(operation.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={cn("p-2 rounded-lg", operation.bgColor)}>
                    <Icon className={cn("h-6 w-6", operation.color)} />
                  </div>
                  {isSelected && (
                    <div className="flex items-center text-primary">
                      <span className="text-sm font-medium">Seleccionado</span>
                    </div>
                  )}
                </div>
                <CardTitle className={cn("text-xl", operation.color)}>
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
                    <span>BSE • AUTOMÓVILES</span>
                  </div>
                  <ChevronRight className={cn("h-4 w-4", operation.color)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center pt-6">
        <Button
          size="lg"
          disabled={!selected}
          onClick={() => selected && onSelect(selected)}
          className="min-w-[200px]"
        >
          Continuar
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Info Footer */}
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>
          🚗 <strong>Alcance inicial:</strong> Solo pólizas de AUTOMÓVILES de BSE
        </p>
        <p>
          📄 <strong>Proceso:</strong> Escaneo automático con Azure Document Intelligence
        </p>
      </div>
    </div>
  );
};

export default OperationSelector;