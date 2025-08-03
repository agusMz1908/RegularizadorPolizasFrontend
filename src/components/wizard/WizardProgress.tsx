// src/components/wizard/WizardProgress.tsx - CORREGIDO
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ✅ Tipo exacto que coincide con App.tsx - SIN "review"
type WizardStep = 'operation' | 'client' | 'company-section' | 'document-scan' | 'form';

interface WizardProgressProps {
  currentStep: WizardStep;
  completedSteps?: string[];
}

const WizardProgress: React.FC<WizardProgressProps> = ({ 
  currentStep, 
  completedSteps = [] 
}) => {
  const steps = [
    {
      id: 'operation',
      label: 'Operación',
      description: 'Tipo de trámite'
    },
    {
      id: 'client',
      label: 'Cliente',
      description: 'Seleccionar cliente'
    },
    {
      id: 'company-section',
      label: 'Compañía',
      description: 'BSE - AUTOMÓVILES'
    },
    {
      id: 'document-scan',
      label: 'Escaneo',
      description: 'Procesar PDF'
    },
    {
      id: 'form',
      label: 'Formulario',
      description: 'Validar y enviar'
    }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const isStepCompleted = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = getCurrentStepIndex();
    return stepIndex < currentIndex || completedSteps.includes(stepId);
  };

  const isStepCurrent = (stepId: string) => {
    return stepId === currentStep;
  };

  const getStepIcon = (stepId: string) => {
    if (isStepCompleted(stepId)) {
      return (
        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg">
          <CheckCircle className="h-4 w-4 text-white" />
        </div>
      );
    }
    if (isStepCurrent(stepId)) {
      return (
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
          <Circle className="h-4 w-4 text-white" />
        </div>
      );
    }
    return (
      <div className="p-2 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full shadow-md">
        <Circle className="h-4 w-4 text-gray-600" />
      </div>
    );
  };

  const getStepNumber = (index: number) => {
    const stepId = steps[index].id;
    if (isStepCompleted(stepId)) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg relative z-10">
          <CheckCircle className="h-5 w-5 text-white" />
        </div>
      );
    }
    
    if (isStepCurrent(stepId)) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg relative z-10">
          {index + 1}
        </div>
      );
    }
    
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-sm font-medium text-gray-600 shadow-md">
        {index + 1}
      </div>
    );
  };

  const progressPercentage = ((getCurrentStepIndex() + 1) / steps.length) * 100;

  return (
    <Card className="mb-6 w-full border-0 shadow-lg bg-gradient-to-r from-white via-blue-50 to-indigo-50">
      <CardContent className="p-4 lg:p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-700 mb-2">
            <span className="font-medium">Progreso del Wizard</span>
            <span className="text-blue-600 font-bold">{getCurrentStepIndex() + 1} de {steps.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-lg relative overflow-hidden"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center text-center flex-1">
                <div className="relative mb-3">
                  {getStepNumber(index)}
                  {isStepCompleted(step.id) && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur opacity-30"></div>
                  )}
                  {isStepCurrent(step.id) && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-40 animate-pulse"></div>
                  )}
                </div>
                <div className="mt-2">
                  <p className={cn(
                    "text-sm font-medium",
                    isStepCurrent(step.id) 
                      ? "text-blue-600" 
                      : isStepCompleted(step.id)
                      ? "text-green-600"
                      : "text-gray-500"
                  )}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </p>
                  {isStepCurrent(step.id) && (
                    <Badge variant="default" className="mt-2 text-xs bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-sm">
                      Actual
                    </Badge>
                  )}
                  {isStepCompleted(step.id) && (
                    <Badge variant="default" className="mt-2 text-xs bg-gradient-to-r from-green-500 to-emerald-600 border-0 shadow-sm">
                      ✓ Completado
                    </Badge>
                  )}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-shrink-0 mx-4">
                  <ArrowRight className={cn(
                    "h-4 w-4 transition-colors duration-200",
                    index < getCurrentStepIndex() ? "text-green-500" : "text-gray-400"
                  )} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile Version - Current Step Only */}
        <div className="md:hidden">
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="relative">
              {getStepIcon(currentStep)}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-30 animate-pulse"></div>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {steps.find(s => s.id === currentStep)?.label}
              </p>
              <p className="text-sm text-gray-600">
                {steps.find(s => s.id === currentStep)?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Step Summary */}
        <div className="mt-6 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <span className="flex items-center bg-green-100 px-3 py-1 rounded-full">
              <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-green-700 font-medium">
                {completedSteps.length + (getCurrentStepIndex() > 0 ? getCurrentStepIndex() : 0)} completados
              </span>
            </span>
            <span className="flex items-center bg-blue-100 px-3 py-1 rounded-full">
              <Circle className="h-3 w-3 text-blue-600 mr-1" />
              <span className="text-blue-700 font-medium">1 actual</span>
            </span>
            <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
              <Circle className="h-3 w-3 text-gray-500 mr-1" />
              <span className="text-gray-600 font-medium">
                {steps.length - getCurrentStepIndex() - 1} pendientes
              </span>
            </span>
          </div>
          
          <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 shadow-sm">
            BSE - AUTOMÓVILES
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default WizardProgress;