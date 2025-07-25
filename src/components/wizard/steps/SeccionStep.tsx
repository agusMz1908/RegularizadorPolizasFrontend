// src/components/wizard/steps/SeccionStep.tsx

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../hooks/useTheme'; // ✅ RUTA CORREGIDA
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

// ============================================================================
// 🎯 TIPOS
// ============================================================================

export interface Seccion {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  activa: boolean;
  requiereDocumentos: boolean;
  tipoVehiculo?: boolean;
  tipoHogar?: boolean;
  tipoVida?: boolean;
  tipoComercial?: boolean;
}

interface SeccionStepProps {
  onNext: () => Promise<boolean>;
  onBack: () => void;
  onComplete: (data: any) => Promise<boolean>;
  wizardData: any;
  isTransitioning?: boolean;
}

// ============================================================================
// 🎨 DATOS MOCK (En producción vendrían de API)
// ============================================================================

const SECCIONES_MOCK: Seccion[] = [
  {
    id: 1,
    codigo: 'AUTO',
    nombre: 'Automóviles',
    descripcion: 'Seguros para vehículos particulares, motos y camionetas',
    icono: 'car',
    activa: true,
    requiereDocumentos: true,
    tipoVehiculo: true
  },
  {
    id: 2,
    codigo: 'HOGAR',
    nombre: 'Hogar',
    descripcion: 'Protección integral para tu hogar y contenido',
    icono: 'home',
    activa: true,
    requiereDocumentos: true,
    tipoHogar: true
  },
  {
    id: 3,
    codigo: 'VIDA',
    nombre: 'Vida',
    descripcion: 'Seguros de vida individual y familiar',
    icono: 'heart',
    activa: true,
    requiereDocumentos: false,
    tipoVida: true
  },
  {
    id: 4,
    codigo: 'COMERCIAL',
    nombre: 'Comercial',
    descripcion: 'Seguros para empresas y comercios',
    icono: 'briefcase',
    activa: true,
    requiereDocumentos: true,
    tipoComercial: true
  },
  {
    id: 5,
    codigo: 'ACCIDENTES',
    nombre: 'Accidentes Personales',
    descripcion: 'Cobertura por accidentes personales',
    icono: 'shield',
    activa: true,
    requiereDocumentos: false
  }
];

// ============================================================================
// 🎯 ICONOS POR TIPO
// ============================================================================

const SECCION_ICONS = {
  car: Car,
  home: Home,
  heart: Heart,
  briefcase: Briefcase,
  shield: Shield,
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
  const { effectiveTheme } = useTheme(); // ✅ CAMBIADO
  const isDarkMode = effectiveTheme === 'dark'; // ✅ DERIVADO

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
   * Carga las secciones disponibles
   */
  const loadSecciones = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular carga desde API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // En producción, hacer fetch a /api/secciones
      const seccionesActivas = SECCIONES_MOCK.filter(s => s.activa);
      setSecciones(seccionesActivas);
      
    } catch (error) {
      console.error('Error cargando secciones:', error);
      setError('Error al cargar las secciones disponibles');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Selecciona una sección
   */
  const selectSeccion = async (seccion: Seccion) => {
    setSelectedSeccion(seccion);
    
    // Completar paso automáticamente
    const stepData = {
      seccion,
      timestamp: new Date().toISOString()
    };

    try {
      await onComplete(stepData);
      console.log('✅ Sección seleccionada:', seccion.nombre);
    } catch (error) {
      console.error('❌ Error completando paso:', error);
    }
  };

  /**
   * Continúa al siguiente paso
   */
  const handleContinue = async () => {
    if (!selectedSeccion) return;

    try {
      await onNext();
    } catch (error) {
      console.error('Error navegando al siguiente paso:', error);
    }
  };

  /**
   * Obtiene el icono de una sección
   */
  const getSeccionIcon = (iconName: string) => {
    return SECCION_ICONS[iconName as keyof typeof SECCION_ICONS] || SECCION_ICONS.default;
  };

  // ============================================================================
  // 🎨 RENDER
  // ============================================================================

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isTransitioning ? 'opacity-50' : 'opacity-100'
    }`}>
      <div className="max-w-4xl mx-auto p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-purple-600 to-indigo-700' 
              : 'bg-gradient-to-br from-purple-100 to-indigo-100'
          }`}>
            <Navigation className={`w-8 h-8 ${
              isDarkMode ? 'text-purple-300' : 'text-purple-600'
            }`} />
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

        {/* Estado de Carga */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Cargando secciones...
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Obteniendo las secciones disponibles
            </p>
          </div>
        )}

        {/* Estado de Error */}
        {error && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className={`text-xl font-semibold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Error cargando secciones
            </h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {error}
            </p>
            <button
              onClick={loadSecciones}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <Zap className="w-5 h-5 mr-2" />
              Reintentar
            </button>
          </div>
        )}

        {/* Lista de Secciones */}
        {!isLoading && !error && secciones.length > 0 && (
          <div>
            {/* Header de la lista */}
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-semibold ${
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
                const Icon = getSeccionIcon(seccion.icono);
                const isSelected = selectedSeccion?.id === seccion.id;

                return (
                  <div
                    key={seccion.id}
                    onClick={() => selectSeccion(seccion)}
                    className={`
                      relative p-6 border rounded-2xl cursor-pointer
                      transition-all duration-200 hover:shadow-lg group
                      ${isDarkMode 
                        ? 'border-gray-600 bg-gray-700 hover:border-purple-500 hover:bg-gray-650' 
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                      }
                      ${isSelected 
                        ? (isDarkMode 
                            ? 'border-purple-500 bg-purple-900/20 shadow-lg' 
                            : 'border-purple-400 bg-purple-50 shadow-lg')
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
                        {seccion.nombre}
                      </h4>
                      
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {seccion.descripcion}
                      </p>

                      {/* Badges informativos */}
                      <div className="flex items-center space-x-2 pt-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          isDarkMode 
                            ? 'bg-gray-800 text-gray-300' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {seccion.codigo}
                        </span>
                        
                        {seccion.requiereDocumentos && (
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                            isDarkMode 
                              ? 'bg-yellow-900 text-yellow-300' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            Req. docs
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
        <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
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

          <button
            onClick={handleContinue}
            disabled={!selectedSeccion || isTransitioning}
            className={`inline-flex items-center px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg ${
              selectedSeccion && !isTransitioning
                ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 hover:shadow-xl'
                : isDarkMode
                ? 'bg-gray-600 text-gray-400'
                : 'bg-gray-300 text-gray-500'
            }`}
          >
            Continuar a operación
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeccionStep;