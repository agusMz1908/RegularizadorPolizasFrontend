import React from 'react';
import { Check, AlertCircle, Clock, Zap } from 'lucide-react';

interface ProgressStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'pending' | 'error';
  completion: number;
  errors: number;
}

interface AdvancedProgressProps {
  steps: ProgressStep[];
  onStepClick: (stepId: string) => void;
  className?: string;
}

export const AdvancedProgress: React.FC<AdvancedProgressProps> = ({
  steps,
  onStepClick,
  className = ''
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* Línea de conexión */}
      <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 rounded"
          style={{ 
            width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
          }}
        />
      </div>
      
      {/* Pasos */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={`
              flex flex-col items-center gap-2 p-2 rounded-lg transition-all duration-200
              hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              ${step.status === 'current' ? 'bg-blue-50' : ''}
            `}
          >
            {/* Indicador circular */}
            <div className={`
              relative w-12 h-12 rounded-full flex items-center justify-center
              border-2 transition-all duration-200
              ${step.status === 'completed' 
                ? 'bg-green-500 border-green-500 text-white' 
                : step.status === 'current'
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : step.status === 'error'
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'bg-white border-gray-300 text-gray-500'
              }
            `}>
              {step.status === 'completed' && <Check className="w-5 h-5" />}
              {step.status === 'current' && <Zap className="w-5 h-5" />}
              {step.status === 'error' && <AlertCircle className="w-5 h-5" />}
              {step.status === 'pending' && <Clock className="w-5 h-5" />}
              
              {/* Indicador de progreso circular */}
              {step.status === 'current' && step.completion > 0 && (
                <div className="absolute inset-0 rounded-full">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - step.completion / 100)}`}
                      className="transition-all duration-300"
                    />
                  </svg>
                </div>
              )}
              
              {/* Badge de errores */}
              {step.errors > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {step.errors}
                </div>
              )}
            </div>
            
            {/* Label y porcentaje */}
            <div className="text-center">
              <div className={`text-xs font-medium ${
                step.status === 'current' ? 'text-blue-700' : 
                step.status === 'completed' ? 'text-green-700' :
                step.status === 'error' ? 'text-red-700' : 'text-gray-600'
              }`}>
                {step.label}
              </div>
              {step.completion > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {step.completion}%
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};