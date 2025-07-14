import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Database, 
  Cloud, 
  Users, 
  Bell,
  Lock,
  Eye,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'azure' | 'velneo' | 'security'>('general');
  const [settings, setSettings] = useState({
    general: {
      companyName: 'RegularizadorPólizas',
      defaultPageSize: 25,
      autoSave: true,
      notifications: true
    },
    azure: {
      endpoint: 'https://extraccion-polizas.cognitiveservices.azure.com/',
      modelId: 'poliza-vehiculo-bse',
      confidenceThreshold: 0.85,
      autoProcess: false
    },
    velneo: {
      timeout: 300,
      retryAttempts: 3,
      autoSend: false,
      validateBeforeSend: true
    },
    security: {
      sessionTimeout: 30,
      requireTwoFactor: false,
      logLevel: 'info'
    }
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSettingChange = (category: keyof typeof settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const saveSettings = async () => {
    setSaveStatus('saving');
    
    try {
      // TODO: Implementar guardado real
      // await fetch('/api/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const testConnection = async (service: 'azure' | 'velneo') => {
    console.log(`Testing ${service} connection...`);
    // TODO: Implementar test de conexión real
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'azure', label: 'Azure AI', icon: Cloud },
    { id: 'velneo', label: 'Velneo', icon: Database },
    { id: 'security', label: 'Seguridad', icon: Lock }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
              <p className="text-gray-600 mt-1">Administra las configuraciones del sistema</p>
            </div>
            <button
              onClick={saveSettings}
              disabled={saveStatus === 'saving'}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                saveStatus === 'saved' 
                  ? 'bg-green-600 text-white' 
                  : saveStatus === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saveStatus === 'saving' && <RefreshCw className="w-4 h-4 animate-spin" />}
              {saveStatus === 'saved' && <CheckCircle className="w-4 h-4" />}
              {saveStatus === 'error' && <AlertCircle className="w-4 h-4" />}
              {saveStatus === 'idle' && <Save className="w-4 h-4" />}
              <span>
                {saveStatus === 'saving' && 'Guardando...'}
                {saveStatus === 'saved' && 'Guardado'}
                {saveStatus === 'error' && 'Error'}
                {saveStatus === 'idle' && 'Guardar Cambios'}
              </span>
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar de Tabs */}
          <div className="w-64 p-6 border-r border-gray-200">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración General</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Compañía
                      </label>
                      <input
                        type="text"
                        value={settings.general.companyName}
                        onChange={(e) => handleSettingChange('general', 'companyName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Elementos por página
                      </label>
                      <select
                        value={settings.general.defaultPageSize}
                        onChange={(e) => handleSettingChange('general', 'defaultPageSize', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="autoSave"
                        checked={settings.general.autoSave}
                        onChange={(e) => handleSettingChange('general', 'autoSave', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="autoSave" className="text-sm font-medium text-gray-700">
                        Guardado automático
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="notifications"
                        checked={settings.general.notifications}
                        onChange={(e) => handleSettingChange('general', 'notifications', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                        Notificaciones habilitadas
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Azure AI Settings */}
            {activeTab === 'azure' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Azure Document Intelligence</h3>
                  <button
                    onClick={() => testConnection('azure')}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Probar Conexión</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endpoint de Azure
                    </label>
                    <input
                      type="url"
                      value={settings.azure.endpoint}
                      onChange={(e) => handleSettingChange('azure', 'endpoint', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model ID
                    </label>
                    <input
                      type="text"
                      value={settings.azure.modelId}
                      onChange={(e) => handleSettingChange('azure', 'modelId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Umbral de Confianza ({settings.azure.confidenceThreshold})
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="1"
                      step="0.05"
                      value={settings.azure.confidenceThreshold}
                      onChange={(e) => handleSettingChange('azure', 'confidenceThreshold', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="autoProcess"
                      checked={settings.azure.autoProcess}
                      onChange={(e) => handleSettingChange('azure', 'autoProcess', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="autoProcess" className="text-sm font-medium text-gray-700">
                      Procesamiento automático
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Velneo Settings */}
            {activeTab === 'velneo' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Integración con Velneo</h3>
                  <button
                    onClick={() => testConnection('velneo')}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Database className="w-4 h-4" />
                    <span>Probar Conexión</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeout (segundos)
                    </label>
                    <input
                      type="number"
                      value={settings.velneo.timeout}
                      onChange={(e) => handleSettingChange('velneo', 'timeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="30"
                      max="600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Intentos de reintento
                    </label>
                    <input
                      type="number"
                      value={settings.velneo.retryAttempts}
                      onChange={(e) => handleSettingChange('velneo', 'retryAttempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="10"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="autoSend"
                      checked={settings.velneo.autoSend}
                      onChange={(e) => handleSettingChange('velneo', 'autoSend', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="autoSend" className="text-sm font-medium text-gray-700">
                      Envío automático a Velneo
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="validateBeforeSend"
                      checked={settings.velneo.validateBeforeSend}
                      onChange={(e) => handleSettingChange('velneo', 'validateBeforeSend', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="validateBeforeSend" className="text-sm font-medium text-gray-700">
                      Validar antes de enviar
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Seguridad</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timeout de sesión (minutos)
                      </label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="5"
                        max="480"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nivel de logging
                      </label>
                      <select
                        value={settings.security.logLevel}
                        onChange={(e) => handleSettingChange('security', 'logLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="error">Error</option>
                        <option value="warn">Warning</option>
                        <option value="info">Info</option>
                        <option value="debug">Debug</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="requireTwoFactor"
                        checked={settings.security.requireTwoFactor}
                        onChange={(e) => handleSettingChange('security', 'requireTwoFactor', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="requireTwoFactor" className="text-sm font-medium text-gray-700">
                        Autenticación de dos factores
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;