// src/components/wizard/steps/SeccionStep.tsx
// ✅ INTERFAZ CORREGIDA - FUNCIONAL Y COMPLETA

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { 
  Navigation, 
  Car, 
  Home, 
  Heart, 
  Shield, 
  Briefcase,
  ArrowRight,
  Check,
  Loader2,
  AlertCircle,
  Zap
} from 'lucide-react';

import { Seccion } from '../../../types/core/seccion';

// ============================================================================
// 🎯 INTERFAZ CORREGIDA - CON TODAS LAS PROPS NECESARIAS
// ============================================================================

interface SeccionStepProps {
  // ✅ Props esenciales para funcionalidad
  secciones?: Seccion[];
  selectedSeccion?: Seccion | null;
  onSeccionSelect?: (seccion: Seccion) => void;
  loadingSecciones?: boolean;
  
  // ✅ Props de navegación (existentes)
  onNext: () => Promise<boolean>;
  onBack: () => void;
  onComplete: (data: any) => Promise<boolean>;
  wizardData: any;
  isTransitioning?: boolean;
  
  // ✅ Props de UI
  isDarkMode?: boolean;
}

// ============================================================================
// 🎯 ICONOS POR TIPO
// ============================================================================

const SECCION_ICONS = {
  car: Car,
  auto: Car,
  automovil: Car,
  vehicle: Car,
  home: Home,
  hogar: Home,
  house: Home,
  heart: Heart,
  vida: Heart,
  life: Heart,
  briefcase: Briefcase,
  comercial: Briefcase,
  business: Briefcase,
  shield: Shield,
  accidentes: Shield,
  accidents: Shield,
  default: Navigation
};

// ============================================================================
// 🎪 COMPONENTE PRINCIPAL
// ============================================================================

export const SeccionStep: React.FC<SeccionStepProps> = ({
  // ✅ Props esenciales
  secciones = [],
  selectedSeccion,
  onSeccionSelect,
  loadingSecciones = false,
  
  // ✅ Props de navegación
  onNext,
  onBack,
  onComplete,
  wizardData,
  isTransitioning = false,
  
  // ✅ Props de UI
  isDarkMode = false
}) => {
  
  // ============================================================================
  // 📊 ESTADO LOCAL
  // ============================================================================

  const [localSecciones, setLocalSecciones] = useState<Seccion[]>(secciones);
  const [localSelectedSeccion, setLocalSelectedSeccion] = useState<Seccion | null>(
    selectedSeccion || wizardData?.seccion || null
  );
  const [isLoading, setIsLoading] = useState(loadingSecciones);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // 🔄 EFECTOS - SINCRONIZACIÓN CON PROPS
  // ============================================================================

  useEffect(() => {
    if (secciones && secciones.length > 0) {
      setLocalSecciones(secciones);
    }
  }, [secciones]);

  useEffect(() => {
    if (selectedSeccion) {
      setLocalSelectedSeccion(selectedSeccion);
    }
  }, [selectedSeccion]);

  useEffect(() => {
    setIsLoading(loadingSecciones);
  }, [loadingSecciones]);

  // ============================================================================
  // 🔧 HANDLERS
  // ============================================================================

  const handleSeccionSelect = (seccion: Seccion) => {
    setLocalSelectedSeccion(seccion);
    
    // ✅ Llamar al handler externo si existe
    if (onSeccionSelect) {
      onSeccionSelect(seccion);
    }
  };

  const handleNext = async () => {
    if (!localSelectedSeccion) {
      setError('Debe seleccionar una sección');
      return false;
    }

    try {
      // ✅ Completar con los datos de la sección
      const result = await onComplete({
        ...wizardData,
        seccion: localSelectedSeccion
      });
      
      if (result) {
        await onNext();
      }
      
      return result;
    } catch (error) {
      console.error('Error en SeccionStep:', error);
      setError('Error al procesar la selección');
      return false;
    }
  };

  // ============================================================================
  // 🎨 FUNCIONES DE UI
  // ============================================================================

  const getSeccionIcon = (seccion: Seccion) => {
    const key = seccion.seccion?.toLowerCase() || '';
    
    // Buscar por palabras clave en el nombre
    for (const [iconKey, IconComponent] of Object.entries(SECCION_ICONS)) {
      if (key.includes(iconKey)) {
        return IconComponent;
      }
    }
    
    return SECCION_ICONS.default;
  };

  const getSeccionColor = (seccion: Seccion, isSelected: boolean) => {
    if (isSelected) {
      return isDarkMode 
        ? 'from-blue-600 to-purple-700 border-blue-500' 
        : 'from-blue-500 to-purple-600 border-blue-400';
    }
    
    return isDarkMode
      ? 'from-slate-700 to-slate-800 border-slate-600 hover:border-slate-500'
      : 'from-gray-50 to-white border-gray-200 hover:border-gray-300';
  };

  // ============================================================================
  // 🎨 RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className={`w-8 h-8 animate-spin mb-4 ${
          isDarkMode ? 'text-blue-400' : 'text-blue-600'
        }`} />
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Cargando secciones...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold mb-3 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Seleccionar Sección
        </h2>
        <p className={`text-lg ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Elija el tipo de seguro para la póliza
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
          isDarkMode 
            ? 'bg-red-900/20 border border-red-800 text-red-300' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Secciones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {localSecciones.map((seccion) => {
          const isSelected = localSelectedSeccion?.id === seccion.id;
          const IconComponent = getSeccionIcon(seccion);
          
          return (
            <button
              key={seccion.id}
              onClick={() => handleSeccionSelect(seccion)}
              className={`
                p-6 rounded-xl border-2 transition-all duration-200 text-left
                bg-gradient-to-br ${getSeccionColor(seccion, isSelected)}
                hover:scale-105 hover:shadow-lg
                ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
              `}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${
                  isSelected
                    ? 'bg-white/20'
                    : isDarkMode 
                      ? 'bg-slate-600' 
                      : 'bg-gray-100'
                }`}>
                  <IconComponent className={`w-6 h-6 ${
                    isSelected 
                      ? 'text-white' 
                      : isDarkMode 
                        ? 'text-gray-300' 
                        : 'text-gray-600'
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-lg mb-1 ${
                    isSelected 
                      ? 'text-white' 
                      : isDarkMode 
                        ? 'text-white' 
                        : 'text-gray-900'
                  }`}>
                    {seccion.seccion}
                  </h3>
                  
                  {seccion.descripcion && (
                    <p className={`text-sm ${
                      isSelected 
                        ? 'text-white/80' 
                        : isDarkMode 
                          ? 'text-gray-400' 
                          : 'text-gray-600'
                    }`}>
                      {seccion.descripcion}
                    </p>
                  )}
                </div>

                {isSelected && (
                  <Check className="w-5 h-5 text-white flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Navegación */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isDarkMode
              ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={isTransitioning}
        >
          Anterior
        </button>

        <button
          onClick={handleNext}
          disabled={!localSelectedSeccion || isTransitioning}
          className={`
            px-6 py-3 rounded-lg font-medium transition-all duration-200
            flex items-center space-x-2
            ${!localSelectedSeccion || isTransitioning
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105'
            }
          `}
        >
          <span>Continuar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};