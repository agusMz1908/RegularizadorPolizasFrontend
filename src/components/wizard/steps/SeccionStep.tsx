// src/components/wizard/steps/SeccionStep.tsx - CORREGIDO PARA USAR BACKEND REAL

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

// Servicios reales
import { seccionService } from '../../../services/seccionService';
import { Seccion } from '../../../types/core/seccion';

// ============================================================================
// 🎯 INTERFACE
// ============================================================================

interface SeccionStepProps {
  onNext: () => Promise<boolean>;
  onBack: () => void;
  onComplete: (data: any) => Promise<boolean>;
  wizardData: any;
  isTransitioning?: boolean;
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
  onNext,
  onBack,
  onComplete,
  wizardData,
  isTransitioning = false
}) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  // ============================================================================
  // 📊 ESTADO LOCAL
  // ============================================================================

  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [selectedSeccion, setSelectedSeccion] = useState<Seccion | null>(
    wizardData?.seccion || null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // 🔄 EFECTOS
  // ============================================================================

  // Cargar secciones al montar
  useEffect(() => {
    loadSecciones();
  }, []);

  // Cargar desde datos del wizard
  useEffect(() => {
    if (wizardData?.seccion && !selectedSeccion) {
      setSelectedSeccion(wizardData.seccion);
    }
  }, [wizardData?.seccion, selectedSeccion]);

  // ============================================================================
  // 🔧 FUNCIONES
  // ============================================================================

  /**
   * ✅ Carga las secciones desde el backend real
   */
  const loadSecciones = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 SeccionStep: Cargando secciones desde backend...');
      
      // ✅ USAR EL SERVICIO REAL EN LUGAR DE MOCK
      const seccionesData = await seccionService.getActiveSecciones();
      
      console.log('🔍 SeccionStep: Secciones recibidas:', seccionesData);
      setSecciones(seccionesData);
      
      if (seccionesData.length === 0) {
        setError('No se encontraron secciones activas');
      }
      
    } catch (error: any) {
      console.error('❌ SeccionStep: Error cargando secciones:', error);
      setError('Error al cargar las secciones disponibles');
      
      // ✅ FALLBACK: En caso de error con el backend, usar algunas secciones básicas
      setSecciones([
        {
          id: 1,
          codigo: 'AUTO',
          seccion: 'Automóviles',
          descripcion: 'Seguros para vehículos',
          activo: true
        } as Seccion
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Selecciona una sección
   */
  const selectSeccion = async (seccion: Seccion) => {
    console.log('🎯 SeccionStep: Sección seleccionada:', seccion);
    setSelectedSeccion(seccion);
    
    // Completar paso primero
    const stepData = {
      seccion,
      timestamp: new Date().toISOString()
    };

    try {
      // ✅ Solo llamar onComplete, NO navegar automáticamente aquí
      await onComplete(stepData);
      console.log('✅ Sección completada:', seccion.seccion);
      
      // ✅ IMPORTANTE: No llamar onNext() aquí, dejar que el usuario haga clic en "Continuar"
      
    } catch (error) {
      console.error('❌ Error completando paso de sección:', error);
      setError('Error procesando la selección');
    }
  };

  /**
   * Continúa al siguiente paso manualmente
   */
  const handleContinue = async () => {
    if (!selectedSeccion) {
      setError('Debe seleccionar una sección primero');
      return;
    }

    try {
      console.log('🎯 SeccionStep: handleContinue iniciado');
      console.log('🎯 SeccionStep: Sección seleccionada:', selectedSeccion.seccion);
      
      // ✅ Llamar onNext y esperar el resultado
      console.log('🎯 SeccionStep: Llamando onNext...');
      const result = await onNext();
      console.log('🎯 SeccionStep: onNext resultado:', result);
      
      if (result === true) {
        console.log('✅ SeccionStep: Navegación exitosa, el wizard debería cambiar de paso');
      } else {
        console.error('❌ SeccionStep: onNext retornó false');
        setError('Error en la navegación - onNext retornó false');
      }
      
    } catch (error) {
      console.error('❌ SeccionStep: Error en handleContinue:', error);
      setError(`Error navegando al siguiente paso: ${error}`);
    }
  };

  /**
   * Obtiene el icono de una sección basado en el código o nombre
   */
  const getSeccionIcon = (seccion: Seccion) => {
    const nombre = seccion.seccion?.toLowerCase() || '';
      
    // Buscar por palabras clave en el nombre
    if (nombre.includes('auto') || nombre.includes('vehic')) {
      return Car;
    }
    if (nombre.includes('hogar') || nombre.includes('casa')) {
      return Home;
    }
    if (nombre.includes('vida')) {
      return Heart;
    }
    if (nombre.includes('comercial') || nombre.includes('empresa')) {
      return Briefcase;
    }
    if (nombre.includes('accidente') || nombre.includes('personal')) {
      return Shield;
    }
    
    return Navigation;
  };

  // ============================================================================
  // 🎨 RENDER
  // ============================================================================

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isTransitioning ? 'opacity-50' : 'opacity-100'
    } ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      
      {/* ✅ HEADER FIJO Y VISIBLE */}
      <div className={`sticky top-0 z-10 border-b ${
        isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-purple-600 to-indigo-700' 
                : 'bg-gradient-to-br from-purple-500 to-indigo-600'
            }`}>
              <Navigation className="w-8 h-8 text-white" />
            </div>
            
            <h2 className={`text-3xl font-bold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Seleccionar Sección
            </h2>
            
            <p className={`text-lg max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Elige el tipo de seguro que deseas procesar
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        
        {/* Loading */}
        {isLoading && (
          <div className="text-center py-16">
            <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${
              isDarkMode ? 'text-purple-400' : 'text-purple-600'
            }`} />
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Cargando secciones disponibles...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className={`rounded-2xl p-6 border-2 mb-8 ${
            isDarkMode 
              ? 'bg-red-900/20 border-red-800 text-red-300' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Error cargando secciones</h3>
                <p className="text-sm">{error}</p>
                <button
                  onClick={loadSecciones}
                  className="mt-2 inline-flex items-center text-sm font-medium hover:underline"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de secciones */}
        {!isLoading && !error && secciones.length > 0 && (
          <div>
            {/* Header de la lista */}
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Secciones disponibles
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isDarkMode 
                  ? 'bg-purple-900 text-purple-200' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {secciones.length} sección{secciones.length !== 1 ? 'es' : ''}
              </span>
            </div>

            {/* Grid de secciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {secciones.map((seccion) => {
                const Icon = getSeccionIcon(seccion);
                const isSelected = selectedSeccion?.id === seccion.id;

                return (
                  <div
                    key={seccion.id}
                    onClick={() => selectSeccion(seccion)}
                    className={`
                      relative p-6 border rounded-2xl cursor-pointer
                      transition-all duration-200 hover:shadow-lg group
                      ${isDarkMode 
                        ? 'border-gray-600 bg-gray-800 hover:border-purple-500 hover:bg-gray-750' 
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                      }
                      ${isSelected 
                        ? (isDarkMode 
                            ? 'border-purple-500 bg-purple-900/20 shadow-lg ring-2 ring-purple-500/20' 
                            : 'border-purple-400 bg-purple-50 shadow-lg ring-2 ring-purple-500/20')
                        : ''
                      }
                    `}
                  >
                    {/* Indicador de selección */}
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Icono principal */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-700' 
                        : 'bg-gradient-to-br from-purple-100 to-indigo-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isDarkMode ? 'text-purple-300' : 'text-purple-600'
                      }`} />
                    </div>

                    {/* Información */}
                    <div className="space-y-2">
                      <h4 className={`font-bold text-lg ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {seccion.seccion}
                      </h4>
                      
                      {seccion.descripcion && (
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {seccion.descripcion}
                        </p>
                      )}

                      {/* Badges informativos */}
                      <div className="flex items-center space-x-2 pt-2">
                        {seccion.activo && (
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                            isDarkMode 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            Activa
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Flecha de selección */}
                    <div className={`flex justify-end mt-4 ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    } transition-opacity`}>
                      <ArrowRight className={`w-5 h-5 ${
                        isDarkMode ? 'text-purple-400' : 'text-purple-500'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sin secciones */}
        {!isLoading && !error && secciones.length === 0 && (
          <div className="text-center py-16">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Navigation className={`w-12 h-12 ${
                isDarkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Sin secciones disponibles
            </h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No se encontraron secciones activas en el sistema
            </p>
            <button
              onClick={loadSecciones}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <Zap className="w-5 h-5 mr-2" />
              Recargar secciones
            </button>
          </div>
        )}

        {/* Botones de navegación */}
        <div className={`flex justify-between items-center pt-8 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onBack}
            disabled={isTransitioning}
            className={`inline-flex items-center px-6 py-3 rounded-xl transition-colors font-medium ${
              isDarkMode 
                ? 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600' 
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
            Volver a compañías
          </button>

          {selectedSeccion && (
            <button
              onClick={handleContinue}
              disabled={isTransitioning}
              className={`inline-flex items-center px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg ${
                !isTransitioning
                  ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 hover:shadow-xl'
                  : isDarkMode
                  ? 'bg-gray-600 text-gray-400'
                  : 'bg-gray-300 text-gray-500'
              }`}
            >
              Continuar a operación
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeccionStep;