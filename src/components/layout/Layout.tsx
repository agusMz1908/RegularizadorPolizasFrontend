import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePolizaWizard } from '../../hooks/usePolizaWizard';

import { 
  Home,
  Scan,
  Settings as SettingsIcon,
  Menu,
  X,
  LogOut,
  User,
  Wand2,
  Sparkles
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/wizard')) return 'wizard';
    // /scanner redirige a /wizard automáticamente
    if (path.includes('/scanner')) return 'wizard';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const wizard = usePolizaWizard();

console.log('🧪 Testing wizard hook:', {
  currentStep: wizard.currentStep,
  hasAuthToken: !!wizard.getAuthToken(),
  companies: wizard.companies.length
});

  const currentPage = getCurrentPage();

  // Navegación con React Router
  const navigateTo = (page: string) => {
    navigate(`/${page}`);
  };

  // Datos de las páginas
  const pages = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Procesamiento inteligente de documentos de seguros'
    },
    wizard: {
      title: 'Asistente de Pólizas IA',
      subtitle: 'Creación automatizada paso a paso con Azure Document Intelligence'
    },
    settings: {
      title: 'Configuración',
      subtitle: 'Configuración del sistema'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col fixed h-full z-10`}>
        {/* Header del Sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-lg font-bold text-gray-800">
                RegularizadorPólizas
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {/* Dashboard */}
            <div 
              className={`group flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                currentPage === 'dashboard' 
                  ? 'bg-blue-50 border-r-4 border-blue-500' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => navigateTo('dashboard')}
            >
              <Home className={`w-5 h-5 ${currentPage === 'dashboard' ? 'text-blue-600' : 'text-gray-600'}`} />
              {sidebarOpen && (
                <span className={`ml-3 font-medium ${
                  currentPage === 'dashboard' ? 'text-blue-900' : 'text-gray-700'
                }`}>Dashboard</span>
              )}
              {!sidebarOpen && (
                <div className="absolute left-16 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Dashboard
                </div>
              )}
            </div>

            {/* WIZARD PRINCIPAL - Herramienta consolidada */}
            <div 
              className={`group flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                currentPage === 'wizard' 
                  ? 'bg-purple-50 border-r-4 border-purple-500' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => navigateTo('wizard')}
            >
              <Wand2 className={`w-5 h-5 ${currentPage === 'wizard' ? 'text-purple-600' : 'text-gray-600'}`} />
              {sidebarOpen && (
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className={`font-medium ${
                      currentPage === 'wizard' ? 'text-purple-900' : 'text-gray-700'
                    }`}>Asistente IA</span>
                    <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
                      PRINCIPAL
                    </span>
                  </div>
                  {currentPage !== 'wizard' && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      Creación guiada de pólizas
                    </div>
                  )}
                </div>
              )}
              {!sidebarOpen && (
                <div className="absolute left-16 bg-purple-600 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  IA
                </div>
              )}
            </div>
            
            {/* ACCESO RÁPIDO AL PROCESAMIENTO - También va al wizard */}
            <div 
              className={`group flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                'hover:bg-gray-50'
              }`}
              onClick={() => navigateTo('wizard')}
            >
              <Scan className="w-5 h-5 text-gray-600" />
              {sidebarOpen && (
                <div className="ml-3">
                  <span className="font-medium text-gray-700">Procesamiento</span>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Acceso rápido al asistente
                  </div>
                </div>
              )}
              {!sidebarOpen && (
                <div className="absolute left-16 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Procesamiento
                </div>
              )}
            </div>
            
            {/* Settings */}
            <div 
              className={`group flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                currentPage === 'settings' 
                  ? 'bg-gray-50 border-r-4 border-gray-500' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => navigateTo('settings')}
            >
              <SettingsIcon className={`w-5 h-5 ${currentPage === 'settings' ? 'text-gray-700' : 'text-gray-600'}`} />
              {sidebarOpen && (
                <span className={`ml-3 font-medium ${
                  currentPage === 'settings' ? 'text-gray-900' : 'text-gray-700'
                }`}>Configuración</span>
              )}
              {!sidebarOpen && (
                <div className="absolute left-16 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Configuración
                </div>
              )}
            </div>
          </div>

          {/* Promoción del Wizard */}
          {sidebarOpen && currentPage !== 'wizard' && (
            <>
              <div className="my-6 border-t border-gray-200"></div>
              
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-sm font-semibold text-purple-900">Herramienta Principal</span>
                </div>
                <p className="text-xs text-purple-700 leading-relaxed mb-3">
                  Crea pólizas completas en 30 segundos con nuestro asistente guiado paso a paso.
                </p>
                <div className="flex items-center text-xs text-purple-600 mb-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span>95% menos tiempo de procesamiento</span>
                </div>
                <button
                  onClick={() => navigateTo('wizard')}
                  className="w-full text-xs bg-purple-600 text-white py-2 px-3 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  <Wand2 className="w-3 h-3 mr-1" />
                  Usar Asistente
                </button>
              </div>
            </>
          )}
        </nav>
        
        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="w-8 h-8 text-gray-600 bg-gray-100 rounded-full p-1" />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{user?.nombre || 'Usuario'}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-full p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mx-auto" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content - CORREGIDO */}
      <div className={`flex-1 min-h-screen ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        {/* Header - ACTUALIZADO */}
        <header className="bg-white shadow-sm border-b">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex-1">
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {pages[currentPage as keyof typeof pages]?.title}
                  </h1>
                  {/* NUEVO: Badge especial para el wizard */}
                  {currentPage === 'wizard' && (
                    <div className="ml-3 flex items-center space-x-2">
                      <span className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full font-medium">
                        ✨ Powered by Azure AI
                      </span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                        BETA
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mt-1">
                  {pages[currentPage as keyof typeof pages]?.subtitle}
                </p>
              </div>
              
              {/* NUEVO: Quick Action Button para el Wizard */}
              {currentPage !== 'wizard' && (
                <div className="hidden md:block">
                  <button
                    onClick={() => navigateTo('wizard')}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Crear con IA
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area - CORREGIDO para ocupar todo el espacio */}
        <main className="flex-1 min-h-[calc(100vh-140px)]">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;