// src/components/wizard/steps/FormStep/components/TabNavigation.tsx

import React from 'react';
import { User, FileText, Car, CreditCard, FileCheck, CheckCircle, AlertTriangle } from 'lucide-react';
import { UseFormValidationReturn } from '../../../hooks/wizard/useFormValidation';

interface Tab {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  validation: UseFormValidationReturn;
  isDarkMode: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  validation,
  isDarkMode
}) => {
  const getIcon = (iconName: string) => {
    const icons = {
      User,
      FileText,
      Car,
      CreditCard,
      FileCheck
    };
    return icons[iconName as keyof typeof icons] || User;
  };

  const getTabErrors = (tabId: string) => {
    const tabFieldMap: { [key: string]: string[] } = {
      'basicos': ['asegurado', 'documento', 'email', 'telefono', 'direccion'],
      'poliza': ['numeroPoliza', 'vigenciaDesde', 'vigenciaHasta', 'cobertura', 'compania', 'seccionId'],
      'vehiculo': ['vehiculo', 'marca', 'modelo', 'matricula', 'motor', 'chasis'],
      'pago': ['prima', 'moneda', 'formaPago', 'cantidadCuotas', 'valorCuota'],
      'observaciones': ['observaciones']
    };

    const fields = tabFieldMap[tabId] || [];
    return validation.validation.errors.filter(error => fields.includes(error.field));
  };

  const getTabColorClasses = (color: string, isActive: boolean, hasErrors: boolean) => {
    if (hasErrors) {
      return isActive 
        ? 'bg-red-600 text-white shadow-lg border-red-600'
        : isDarkMode 
          ? 'bg-red-900/30 text-red-300 hover:bg-red-800/50 border-red-700'
          : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200';
    }

    if (isDarkMode) {
      if (isActive) {
        const colors = {
          blue: 'bg-blue-700 text-white shadow-lg border-blue-600',
          purple: 'bg-purple-700 text-white shadow-lg border-purple-600',
          green: 'bg-green-700 text-white shadow-lg border-green-600',
          orange: 'bg-orange-700 text-white shadow-lg border-orange-600',
          indigo: 'bg-indigo-700 text-white shadow-lg border-indigo-600',
        };
        return colors[color as keyof typeof colors] || colors.blue;
      } else {
        return 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700';
      }
    } else {
      const colors = {
        blue: isActive ? 'bg-blue-500 text-white shadow-lg' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
        purple: isActive ? 'bg-purple-500 text-white shadow-lg' : 'bg-purple-50 text-purple-700 hover:bg-purple-100',
        green: isActive ? 'bg-green-500 text-white shadow-lg' : 'bg-green-50 text-green-700 hover:bg-green-100',
        orange: isActive ? 'bg-orange-500 text-white shadow-lg' : 'bg-orange-50 text-orange-700 hover:bg-orange-100',
        indigo: isActive ? 'bg-indigo-500 text-white shadow-lg' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
      };
      return colors[color as keyof typeof colors] || colors.blue;
    }
  };

  return (
    <div className="mb-8">
      <div className={`flex flex-wrap justify-center gap-3 p-2 rounded-2xl ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'
      }`}>
        {tabs.map((tab) => {
          const Icon = getIcon(tab.icon);
          const isActive = activeTab === tab.id;
          const tabErrors = getTabErrors(tab.id);
          const hasErrors = tabErrors.length > 0;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 border-2 ${
                getTabColorClasses(tab.color, isActive, hasErrors)
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
              
              {/* Indicadores */}
              {hasErrors ? (
                <div className="flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs">{tabErrors.length}</span>
                </div>
              ) : isActive ? (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              ) : (
                <CheckCircle className="w-4 h-4 opacity-50" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation;