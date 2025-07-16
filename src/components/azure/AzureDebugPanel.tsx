// src/components/AzureDebugPanel.tsx
import React, { useState } from 'react';
import { Play, AlertCircle, CheckCircle, Clock, Info } from 'lucide-react';
import { azureDocumentService } from '../../services/azureDocumentService';

// Definir interfaces localmente para evitar dependencias
interface TestResult {
  test: string;
  success: boolean;
  message: string;
  duration?: number;
}

interface AzureDebugPanelProps {
  isVisible?: boolean;
  onClose?: () => void;
}

const AzureDebugPanel: React.FC<AzureDebugPanelProps> = ({ 
  isVisible = false, 
  onClose 
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      const results: TestResult[] = [];
      
      // Test 1: Configuración
      const startTime1 = Date.now();
      try {
        const config = azureDocumentService.validateConfiguration();
        results.push({
          test: 'Configuración Frontend',
          success: config.isValid,
          message: config.isValid 
            ? 'Todas las variables de entorno están configuradas correctamente'
            : `Errores de configuración: ${config.errors.join(', ')}`,
          duration: Date.now() - startTime1
        });
      } catch (error: any) {
        results.push({
          test: 'Configuración Frontend',
          success: false,
          message: `Error verificando configuración: ${error.message}`,
          duration: Date.now() - startTime1
        });
      }

      // Test 2: Backend
      const startTime2 = Date.now();
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/health`);
        if (response.ok) {
          const data = await response.json();
          results.push({
            test: 'Conexión Backend',
            success: true,
            message: `Backend respondiendo correctamente. Status: ${data.Status}`,
            duration: Date.now() - startTime2
          });
        } else {
          results.push({
            test: 'Conexión Backend',
            success: false,
            message: `Backend no disponible. Status: ${response.status}`,
            duration: Date.now() - startTime2
          });
        }
      } catch (error: any) {
        results.push({
          test: 'Conexión Backend',
          success: false,
          message: `Error conectando al backend: ${error.message}`,
          duration: Date.now() - startTime2
        });
      }

      // Test 3: Azure Connection
      const startTime3 = Date.now();
      try {
        const isConnected = await azureDocumentService.testConnection();
        results.push({
          test: 'Conexión Azure (via Backend)',
          success: isConnected,
          message: isConnected 
            ? 'Azure Document Intelligence responde correctamente'
            : 'Azure Document Intelligence no responde o configuración incorrecta',
          duration: Date.now() - startTime3
        });
      } catch (error: any) {
        results.push({
          test: 'Conexión Azure (via Backend)',
          success: false,
          message: `Error probando Azure: ${error.message}`,
          duration: Date.now() - startTime3
        });
      }

      // Test 4: Model Info
      const startTime4 = Date.now();
      try {
        const modelInfo = await azureDocumentService.getModelInfo();
        results.push({
          test: 'Información del Modelo',
          success: !!(modelInfo && modelInfo.ModelId),
          message: (modelInfo && modelInfo.ModelId) 
            ? `Modelo encontrado: ${modelInfo.ModelId}. Status: ${modelInfo.Status}`
            : 'No se pudo obtener información del modelo Azure',
          duration: Date.now() - startTime4
        });
      } catch (error: any) {
        results.push({
          test: 'Información del Modelo',
          success: false,
          message: `Error obteniendo modelo: ${error.message}`,
          duration: Date.now() - startTime4
        });
      }

      setTestResults(results);
    } catch (error) {
      console.error('Error ejecutando tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runDocumentProcessingTest = async () => {
    setIsRunning(true);
    
    try {
      // Crear archivo de prueba
      const content = new Blob(['Test PDF content for Azure Document Intelligence'], { 
        type: 'application/pdf' 
      });
      const testFile = new File([content], 'test-poliza.pdf', { 
        type: 'application/pdf',
        lastModified: Date.now()
      });

      const result = await azureDocumentService.processDocument(testFile);
      
      const testResult: TestResult = {
        test: 'Procesamiento de Documento',
        success: !!(result && result.documentId),
        message: result?.documentId 
          ? `Documento procesado exitosamente. ID: ${result.documentId}`
          : 'No se recibió respuesta válida del procesamiento',
        duration: Date.now() - Date.now()
      };
      
      setTestResults(prev => [...prev, testResult]);
    } catch (error: any) {
      const testResult: TestResult = {
        test: 'Procesamiento de Documento',
        success: false,
        message: `Error procesando documento: ${error.message}`,
        duration: Date.now() - Date.now()
      };
      setTestResults(prev => [...prev, testResult]);
    } finally {
      setIsRunning(false);
    }
  };

  const loadDebugInfo = async () => {
    try {
      setShowDebugInfo(true);
      const info = await azureDocumentService.debugAllModels();
      setDebugInfo(info);
    } catch (error: any) {
      setDebugInfo(`Error obteniendo debug info: ${error.message}`);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Azure Document Intelligence - Panel de Debug
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          )}
        </div>

        {/* Información de configuración */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-2">
            <Info className="w-4 h-4 text-blue-500 mr-2" />
            <h3 className="font-semibold text-blue-800">Configuración Actual</h3>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <div><strong>API URL:</strong> {import.meta.env.VITE_API_URL}</div>
            <div><strong>Azure Endpoint:</strong> {import.meta.env.VITE_AZURE_DOC_ENDPOINT}</div>
            <div><strong>Timeout:</strong> {import.meta.env.VITE_AZURE_DOC_TIMEOUT || '60000'}ms</div>
            <div><strong>Environment:</strong> {import.meta.env.VITE_ENV}</div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={runTests}
            disabled={isRunning}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Ejecutando...' : 'Ejecutar Tests Básicos'}
          </button>
          
          <button
            onClick={runDocumentProcessingTest}
            disabled={isRunning}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Test Procesamiento
          </button>
          
          <button
            onClick={loadDebugInfo}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
          >
            <Info className="w-4 h-4" />
            Debug Completo
          </button>
        </div>

        {/* Resultados de tests */}
        {testResults.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Resultados de Tests</h3>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg ${getStatusColor(result.success)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.success)}
                      <span className="font-medium">{result.test}</span>
                      {result.duration && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {result.duration}ms
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{result.message}</p>
                </div>
              ))}
            </div>
            
            {/* Resumen */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  Tests Exitosos: {testResults.filter(r => r.success).length} / {testResults.length}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  testResults.every(r => r.success) 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {testResults.every(r => r.success) ? 'TODOS EXITOSOS' : 'HAY FALLOS'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Información de debug detallada */}
        {showDebugInfo && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Debug Detallado</h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto whitespace-pre-wrap">
              {debugInfo || 'Cargando información de debug...'}
            </div>
          </div>
        )}

        {/* Comandos de consola */}
        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Comandos de Consola</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <div>
              <code className="bg-gray-200 px-2 py-1 rounded">await testAzureIntegration()</code>
              - Ejecutar todos los tests
            </div>
            <div>
              <code className="bg-gray-200 px-2 py-1 rounded">await testAzureDocumentProcessing()</code>
              - Test de procesamiento
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Abre las DevTools (F12) y ejecuta estos comandos en la consola
            </div>
          </div>
        </div>

        {/* Loader */}
        {isRunning && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span>Ejecutando tests...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AzureDebugPanel;