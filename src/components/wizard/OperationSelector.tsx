// src/components/wizard/OperationSelector.tsx
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
  selectedBorderColor: string; // ✅ Nuevo: border más oscuro cuando está seleccionado
}

const operations: OperationOption[] = [
  {
    id: 'EMISION',
    title: 'Nueva Póliza',
    description: 'Crear una póliza completamente nueva',
    detailedDescription: 'Proceso completo de emisión de una nueva póliza de seguro para vehículos. Incluye selección de cliente, compañía, sección y escaneo del documento.',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    borderColor: 'border-blue-200 hover:border-blue-300',
    selectedBorderColor: 'border-blue-500' // ✅ Border más oscuro
  },
  {
    id: 'RENOVACION',
    title: 'Renovar Póliza',
    description: 'Renovar una póliza existente que está por vencer',
    detailedDescription: 'Renovación de pólizas que vencen en los próximos 30 días. Se selecciona la póliza original y se procesa la renovación con la nueva documentación.',
    icon: RotateCcw,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
    borderColor: 'border-green-200 hover:border-green-300',
    selectedBorderColor: 'border-green-500' // ✅ Border más oscuro
  },
  {
    id: 'CAMBIO',
    title: 'Modificar Póliza',
    description: 'Realizar cambios en una póliza vigente',
    detailedDescription: 'Modificación de pólizas vigentes de vehículos. Permite cambios de vehículo, cobertura u otros aspectos de la póliza actual.',
    icon: Edit3,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    borderColor: 'border-orange-200 hover:border-orange-300',
    selectedBorderColor: 'border-orange-500' // ✅ Border más oscuro
  }
];

const OperationSelector: React.FC<OperationSelectorProps> = ({ onSelect, selected }) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          RegularizadorPolizas V2
        </h1>
        <p className="text-lg text-gray-600">
          ¿Qué operación deseas realizar?
        </p>
        <p className="text-sm text-gray-500">
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
                "relative cursor-pointer transition-all duration-200 transform hover:scale-105",
                // ✅ Border dinámico: normal o seleccionado
                isSelected ? operation.selectedBorderColor : operation.borderColor,
                operation.bgColor,
                // ✅ Removido: ring-2 ring-primary, solo usamos border
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
                <CardDescription className="text-base">
                  {operation.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {operation.detailedDescription}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>BSE • AUTOMÓVILES</span>
                  </div>
                  <ChevronRight className={cn("h-4 w-4", operation.color)} />
                </div>
              </CardContent>

              {/* ❌ REMOVIDO: Selected indicator triangular */}
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
      <div className="text-center text-sm text-gray-500 space-y-1">
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