import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Loader2, AlertCircle, FileText, CheckCircle } from 'lucide-react';

// Importa tu hook real
import { useAuth } from '../../context/AuthContext';

const LoginForm: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: 'superadmin',
    password: '1ara1709',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.password.trim()) {
      return;
    }

    try {
      await login(formData);
    } catch (error: any) {
      // Error manejado por AuthContext
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) {
      clearError?.();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Panel Izquierdo - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative p-12 flex-col justify-center">
          <div className="relative z-10">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">RegularizadorPólizas</h1>
                <p className="text-blue-100 text-sm">Procesamiento Inteligente</p>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
              Automatiza el procesamiento de documentos de seguros
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-300 mr-3 flex-shrink-0" />
                <span className="text-blue-100">Extracción automática con IA</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-300 mr-3 flex-shrink-0" />
                <span className="text-blue-100">Integración directa con Velneo</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-300 mr-3 flex-shrink-0" />
                <span className="text-blue-100">Reducción de 45 min a 30 segundos</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-300 mr-3 flex-shrink-0" />
                <span className="text-blue-100">Soporte multi-compañía</span>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm text-blue-100">
                💡 <strong className="text-white">Tip:</strong> Comienza procesando documentos de BSE 
                y expande gradualmente a otras compañías aseguradoras.
              </p>
            </div>
          </div>
          
          {/* Pattern de fondo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute transform rotate-45 -translate-x-1/2 -translate-y-1/2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex">
                  {[...Array(10)].map((_, j) => (
                    <FileText key={j} className="w-8 h-8 m-6 text-white" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Derecho - Formulario */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          
          {/* Header móvil */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">RegularizadorPólizas</h1>
            <p className="text-gray-600 mt-1">Procesamiento inteligente de documentos</p>
          </div>

          <div className="max-w-sm mx-auto w-full">
            {/* Header del formulario */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenido de vuelta
              </h2>
              <p className="text-gray-600">
                Inicia sesión para acceder al sistema
              </p>
            </div>

            {/* Formulario */}
            <div className="space-y-6">
              {/* Campo Usuario */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                  Usuario
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Ingresa tu usuario"
                  disabled={isLoading}
                />
              </div>

              {/* Campo Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmit(e as any);
                      }
                    }}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Ingresa tu contraseña"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">Error de autenticación</p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !formData.nombre.trim() || !formData.password.trim()}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    <span>Iniciando sesión...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    <span>Iniciar Sesión</span>
                  </div>
                )}
              </button>
            </div>

            {/* Información adicional */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-900">Sistema de Procesamiento</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Automatiza el procesamiento de documentos de pólizas con IA y 
                      envío directo a Velneo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © 2025 RegularizadorPólizas. Sistema de procesamiento inteligente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm