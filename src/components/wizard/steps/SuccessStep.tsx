import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../hooks/useTheme'; // ✅ RUTA CORREGIDA
import { 
  CheckCircle, 
  Download, 
  Eye, 
  RotateCcw, 
  Home,
  Share2,
  Copy,
  ExternalLink,
  Clock,
  User,
  Building2,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';

// ============================================================================
// 🎯 TIPOS
// ============================================================================

interface SuccessStepProps {
  onNext: () => Promise<boolean>;
  onBack: () => void;
  onComplete: (data: any) => Promise<boolean>;
  wizardData: any;
  isTransitioning?: boolean;
}

interface PolizaCreated {
  id: string;
  numeroPoliza: string;
  cliente: string;
  compania: string;
  seccion: string;
  prima: number;
  moneda: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  fechaCreacion: string;
  procesadoConIA: boolean;
  documentos: string[];
}

// ============================================================================
// 🎪 COMPONENTE PRINCIPAL
// ============================================================================

export const SuccessStep: React.FC<SuccessStepProps> = ({
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

  const [polizaData, setPolizaData] = useState<PolizaCreated | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // ============================================================================
  // 🔄 EFECTOS
  // ============================================================================

  useEffect(() => {
    // Construir datos de la póliza desde el wizard
    if (wizardData) {
      const poliza: PolizaCreated = {
        id: `POL-${Date.now()}`,
        numeroPoliza: wizardData.form?.numeroPoliza || `${Date.now()}`,
        cliente: wizardData.cliente?.nombre || 'Cliente',
        compania: wizardData.company?.nombre || 'Compañía',
        seccion: wizardData.seccion?.nombre || 'Sección',
        prima: wizardData.form?.prima || 0,
        moneda: 'UYU',
        vigenciaDesde: wizardData.form?.vigenciaDesde || new Date().toISOString(),
        vigenciaHasta: wizardData.form?.vigenciaHasta || new Date().toISOString(),
        fechaCreacion: new Date().toISOString(),
        procesadoConIA: !!wizardData.extract,
        documentos: wizardData.upload?.files?.map((f: any) => f.name) || []
      };
      
      setPolizaData(poliza);
    }
  }, [wizardData]);

  // ============================================================================
  // 🔧 FUNCIONES
  // ============================================================================

  /**
   * Copia el número de póliza al portapapeles
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
    }
  };

  /**
   * Descarga el resumen de la póliza
   */
  const downloadSummary = async () => {
    if (!polizaData) return;

    setIsDownloading(true);
    
    try {
      // Simular descarga
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // En producción, esto haría una llamada a la API para generar PDF
      const summaryData = {
        poliza: polizaData,
        timestamp: new Date().toISOString(),
        generatedBy: 'PolizaWizard'
      };
      
      // Crear blob y descargar
      const blob = new Blob([JSON.stringify(summaryData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `poliza-${polizaData.numeroPoliza}-resumen.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error descargando resumen:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Inicia una nueva póliza
   */
  const startNewPoliza = async () => {
    try {
      // Limpiar datos del wizard y reiniciar
      await onComplete({ action: 'new_poliza' });
      await onNext();
    } catch (error) {
      console.error('Error iniciando nueva póliza:', error);
    }
  };

  /**
   * Ir al dashboard
   */
  const goToDashboard = () => {
    window.location.href = '/dashboard';
  };

  /**
   * Formatear fecha para mostrar
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-UY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Formatear moneda
   */
  const formatCurrency = (amount: number, currency: string = 'UYU') => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // ============================================================================
  // 🎨 RENDER
  // ============================================================================

  if (!polizaData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Procesando resultado...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      isTransitioning ? 'opacity-50' : 'opacity-100'
    }`}>
      <div className="max-w-4xl mx-auto p-8">
        
        {/* Header de Éxito */}
        <div className="text-center mb-12">
          {/* Animación de éxito */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            
            {/* Efectos de sparkles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-ping" />
              <Sparkles className="w-4 h-4 text-blue-400 absolute -bottom-2 -left-2 animate-ping delay-75" />
              <Sparkles className="w-5 h-5 text-purple-400 absolute top-2 -left-6 animate-ping delay-150" />
            </div>
          </div>
          
          <h2 className={`text-4xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            ¡Póliza Procesada!
          </h2>
          
          <p className={`text-xl mb-6 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Tu póliza ha sido procesada exitosamente y enviada a Velneo
          </p>

          {/* Número de póliza destacado */}
          <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-2xl ${
            isDarkMode 
              ? 'bg-gradient-to-r from-green-900 to-blue-900 border border-green-700' 
              : 'bg-gradient-to-r from-green-50 to-blue-50 border border-green-200'
          }`}>
            <FileText className={`w-6 h-6 ${
              isDarkMode ? 'text-green-400' : 'text-green-600'
            }`} />
            <div>
              <div className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Número de Póliza
              </div>
              <div className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {polizaData.numeroPoliza}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(polizaData.numeroPoliza)}
              className={`p-2 rounded-lg transition-colors ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : isDarkMode
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
              title="Copiar número de póliza"
            >
              {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Información Resumida */}
        <div className={`rounded-2xl p-6 mb-8 ${
          isDarkMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cliente */}
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
              }`}>
                <User className={`w-5 h-5 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Cliente
                </div>
                <div className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {polizaData.cliente}
                </div>
              </div>
            </div>

            {/* Compañía */}
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-purple-900' : 'bg-purple-100'
              }`}>
                <Building2 className={`w-5 h-5 ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
              <div>
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Compañía
                </div>
                <div className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {polizaData.compania}
                </div>
              </div>
            </div>

            {/* Prima */}
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-green-900' : 'bg-green-100'
              }`}>
                <span className={`text-sm font-bold ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  $
                </span>
              </div>
              <div>
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Prima
                </div>
                <div className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatCurrency(polizaData.prima)}
                </div>
              </div>
            </div>
          </div>

          {/* Botón para mostrar detalles */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`text-sm font-medium transition-colors ${
                isDarkMode 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              {showDetails ? 'Ocultar detalles' : 'Ver todos los detalles'}
              <ArrowRight className={`w-4 h-4 inline ml-1 transition-transform ${
                showDetails ? 'rotate-90' : ''
              }`} />
            </button>
          </div>

          {/* Detalles Expandidos */}
          {showDetails && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Sección:
                  </span>
                  <span className={`ml-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {polizaData.seccion}
                  </span>
                </div>
                
                <div>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Vigencia desde:
                  </span>
                  <span className={`ml-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatDate(polizaData.vigenciaDesde)}
                  </span>
                </div>
                
                <div>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Vigencia hasta:
                  </span>
                  <span className={`ml-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatDate(polizaData.vigenciaHasta)}
                  </span>
                </div>
                
                <div>
                  <span className={`font-medium ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Procesado con IA:
                  </span>
                  <span className={`ml-2 ${
                    polizaData.procesadoConIA 
                      ? 'text-green-600' 
                      : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {polizaData.procesadoConIA ? '✅ Sí' : '❌ No'}
                  </span>
                </div>
              </div>

              {/* Documentos procesados */}
              {polizaData.documentos.length > 0 && (
                <div>
                  <div className={`font-medium mb-2 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Documentos procesados:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {polizaData.documentos.map((doc, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded-lg text-xs ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-300' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Acciones Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          
          {/* Descargar Resumen */}
          <button
            onClick={downloadSummary}
            disabled={isDownloading}
            className={`
              flex items-center justify-center space-x-3 p-4 rounded-xl
              transition-all duration-200 font-medium
              ${isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:scale-105 hover:shadow-lg
            `}
          >
            {isDownloading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generando...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Descargar Resumen</span>
              </>
            )}
          </button>

          {/* Ver en Velneo */}
          <button
            onClick={() => window.open('#', '_blank')}
            className={`
              flex items-center justify-center space-x-3 p-4 rounded-xl
              border-2 transition-all duration-200 font-medium
              ${isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }
              hover:scale-105 hover:shadow-lg
            `}
          >
            <ExternalLink className="w-5 h-5" />
            <span>Ver en Velneo</span>
          </button>
        </div>

        {/* Navegación Final */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
          
          {/* Ir al Dashboard */}
          <button
            onClick={goToDashboard}
            className={`inline-flex items-center px-6 py-3 rounded-xl transition-colors font-medium ${
              isDarkMode 
                ? 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600' 
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Home className="w-5 h-5 mr-2" />
            Ir al Dashboard
          </button>

          {/* Nueva Póliza */}
          <button
            onClick={startNewPoliza}
            disabled={isTransitioning}
            className={`
              inline-flex items-center px-8 py-3 rounded-xl font-medium
              transition-all duration-200 shadow-lg
              ${isTransitioning 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-105 hover:shadow-xl'
              }
              bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white
            `}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Procesar Nueva Póliza
          </button>
        </div>

        {/* Footer informativo */}
        <div className={`mt-8 text-center text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="w-4 h-4" />
            <span>
              Procesado el {formatDate(polizaData.fechaCreacion)} a las{' '}
              {new Date(polizaData.fechaCreacion).toLocaleTimeString('es-UY')}
            </span>
          </div>
          <p>
            🎉 ¡Felicitaciones! Tu póliza ha sido integrada exitosamente en el sistema Velneo
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessStep;