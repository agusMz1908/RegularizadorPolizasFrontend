import React, { useState } from 'react';
import { 
  Settings as SettingsIcon,  // Renombrado para evitar conflicto
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            <p className="text-gray-600">Gestiona la configuración de la aplicación</p>
          </div>
        </div>
        <button
          onClick={saveSettings}
          disabled={saveStatus === 'saving'}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saveStatus === 'saving' ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : saveStatus === 'saved' ? (
            <CheckCircle className="h-4 w-4" />
          ) : saveStatus === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>
            {saveStatus === 'saving' ? 'Guardando...' : 
             saveStatus === 'saved' ? 'Guardado' : 
             saveStatus === 'error' ? 'Error' : 'Guardar'}
          </span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', label: 'General', icon: SettingsIcon },
            { id: 'azure', label: 'Azure Cognitive Services', icon: Cloud },
            { id: 'velneo', label: 'Velneo Integration', icon: Database },
            { id: 'security', label: 'Seguridad', icon: Shield }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Tab Content será implementado aquí */}
        <div className="p-6">
          <p className="text-gray-600">
            Contenido de la pestaña "{activeTab}" será implementado próximamente.
          </p>
          
          {/* Preview de configuraciones actuales */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Configuración actual:</h4>
            <pre className="text-sm text-gray-600 overflow-auto">
              {JSON.stringify(settings[activeTab], null, 2)}
            </pre>
          </div>
          
          {/* Botones de test para Azure y Velneo */}
          {(activeTab === 'azure' || activeTab === 'velneo') && (
            <div className="mt-4">
              <button
                onClick={() => testConnection(activeTab as 'azure' | 'velneo')}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Probar Conexión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;