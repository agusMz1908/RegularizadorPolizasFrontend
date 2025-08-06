import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, RotateCcw, Edit3, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// ✅ CORREGIDO: Tipo exacto esperado por App.tsx
export type OperationType = 'nueva' | 'renovacion' | 'cambio';

interface OperationSelectorProps {
  onSelect: (operation: OperationType) => void;
  selectedOperation?: OperationType; // ✅ CORREGIDO: nombre de prop esperado
}

const operations = [
  {
    type: 'nueva' as OperationType, // ✅ CORREGIDO: valor en minúsculas
    title: 'Nueva Póliza',
    description: 'Crear una nueva póliza desde cero',
    icon: FileText,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    hoverBorderColor: 'hover:border-blue-300 dark:hover:border-blue-700',
    selectedBorderColor: 'border-blue-500 dark:border-blue-400',
    badge: 'Nuevo',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  },
  {
    type: 'renovacion' as OperationType, // ✅ CORREGIDO
    title: 'Renovación',
    description: 'Renovar una póliza existente',
    icon: RotateCcw,
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800',
    hoverBorderColor: 'hover:border-green-300 dark:hover:border-green-700',
    selectedBorderColor: 'border-green-500 dark:border-green-400',
    badge: 'Optimizado',
    badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  },
  {
    type: 'cambio' as OperationType, // ✅ CORREGIDO
    title: 'Cambio/Modificación',
    description: 'Modificar una póliza vigente',
    icon: Edit3,
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    hoverBorderColor: 'hover:border-purple-300 dark:hover:border-purple-700',
    selectedBorderColor: 'border-purple-500 dark:border-purple-400',
    badge: 'Flexible',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
  }
];

const OperationSelector: React.FC<OperationSelectorProps> = ({ 
  onSelect, 
  selectedOperation // ✅ CORREGIDO: usar selectedOperation
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4 animate-in fade-in-0 duration-500">
        <div className="relative inline-block">
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Selecciona el Tipo de Operación
        </h1>
        <p className="text-muted-foreground text-lg">
          Elige qué tipo de gestión deseas realizar con la póliza
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
        {operations.map((operation) => {
          const Icon = operation.icon;
          const isSelected = selectedOperation === operation.type; // ✅ CORREGIDO
          
          return (
            <Card
              key={operation.type}
              className={cn(
                "group cursor-pointer transition-all duration-300 ease-out",
                "border-2 transform",
                "hover:scale-[1.02] hover:shadow-lg",
                isSelected 
                  ? cn("ring-2 ring-primary shadow-lg scale-[1.02]", operation.selectedBorderColor)
                  : cn(operation.borderColor, operation.hoverBorderColor),
                operation.bgColor
              )}
              onClick={() => onSelect(operation.type)}
            >
              <CardHeader className="text-center pb-4">
                <div className={cn(
                  "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4",
                  "transition-transform duration-300 group-hover:scale-110",
                  "bg-gradient-to-br", operation.gradient,
                  isSelected && "scale-110"
                )}>
                  <Icon className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                
                <CardTitle className={cn(
                  "text-xl font-bold transition-colors duration-300",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {operation.title}
                </CardTitle>
                
                <div className="flex justify-center">
                  <Badge className={cn(
                    "transition-all duration-300",
                    operation.badgeColor,
                    isSelected && "bg-primary text-primary-foreground"
                  )}>
                    {operation.badge}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="text-center pb-6">
                <p className={cn(
                  "text-muted-foreground transition-colors duration-300",
                  "group-hover:text-foreground",
                  isSelected && "text-foreground font-medium"
                )}>
                  {operation.description}
                </p>
                
                {isSelected && (
                  <div className="mt-4 flex items-center justify-center space-x-2 animate-in fade-in-0 duration-300">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-primary font-medium text-sm">Seleccionado</span>
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground space-y-2 animate-in fade-in-0 duration-500 delay-500">
        <div className="flex items-center justify-center space-x-6 flex-wrap">
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