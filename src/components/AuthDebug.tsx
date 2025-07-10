// src/components/AuthDebug.tsx - COMPONENTE TEMPORAL PARA DEBUG
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Settings, Key, Server } from 'lucide-react';

interface AuthDebugProps {
  onClose: () => void;
}

export const AuthDebug: React.FC<AuthDebugProps> = ({ onClose }) => {
  const [baseUrl, setBaseUrl] = useState(
    localStorage.getItem('apiBaseUrl') || import.meta.env.VITE_API_URL || 'https://localhost:7191/api'
  );
  const [authToken, setAuthToken] = useState(
    localStorage.getItem('authToken') || localStorage.getItem('token') || ''
  );
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const handleSaveConfig = () => {
    localStorage.setItem('apiBaseUrl', baseUrl);
    if (authToken) {
      localStorage.setItem('authToken', authToken);
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
    }
    
    // Recargar la página para aplicar cambios
    window.location.reload();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const response = await fetch(`${baseUrl}/clients`, {
        method: 'GET',
        headers,
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ Conexión exitosa! Se obtuvieron ${Array.isArray(data) ? data.length : '?'} clientes.`);
      } else {
        setTestResult(`❌ Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setTestResult(`❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setTesting(false);
    }
  };

  const currentConfig = {
    baseUrl: import.meta.env.VITE_API_URL,
    hasToken: !!authToken,
    corsMode: import.meta.env.VITE_ENABLE_CORS_FOR_DEVELOPMENT,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configuración de API y Autenticación
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Configuración actual */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
              <Server className="w-4 h-4 mr-2" />
              Configuración Actual
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Base URL:</span> 
                <code className="ml-2 bg-white px-2 py-1 rounded">{currentConfig.baseUrl}</code>
              </div>
              <div>
                <span className="font-medium">Token:</span> 
                <span className={`ml-2 ${currentConfig.hasToken ? 'text-green-600' : 'text-red-600'}`}>
                  {currentConfig.hasToken ? '✅ Configurado' : '❌ No configurado'}
                </span>
              </div>
            </div>
          </div>

          {/* URL de la API */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Base de la API
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://localhost:7191/api"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              La URL base de tu API .NET (sin /clients al final)
            </p>
          </div>

          {/* Token de autenticación */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Key className="w-4 h-4 mr-1" />
              Token de Autenticación (opcional)
            </label>
            <input
              type="password"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Bearer token o API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si tu API requiere autenticación, ingresa el token aquí
            </p>
          </div>

          {/* Test de conexión */}
          <div>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {testing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Probando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Probar Conexión</span>
                </>
              )}
            </button>
            
            {testResult && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${
                testResult.includes('✅') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {testResult}
              </div>
            )}
          </div>

          {/* Soluciones comunes */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Soluciones para Error 401
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Verifica que la URL de la API sea correcta</li>
              <li>• Asegúrate de que el backend esté ejecutándose</li>
              <li>• Revisa si tu API requiere autenticación</li>
              <li>• Verifica la configuración de CORS en el backend</li>
              <li>• Comprueba que el endpoint /api/clients existe</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Guardar y Recargar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};