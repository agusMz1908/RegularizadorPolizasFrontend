// src/components/layout/Layout.tsx - Actualizado con el PolizaWizard
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home,
  Scan,
  Settings as SettingsIcon,
  Menu,
  X,
  LogOut,
  User,
  Wand2,  // NUEVO: Icono del wizard
  Sparkles // NUEVO: Icono para efectos
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/wizard')) return 'wizard'; // NUEVO
    if (path.includes('/scanner')) return 'scanner';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const currentPage = getCurrentPage();

  // Navegación con React Router
  const navigateTo = (page: string) => {
    navigate(`/${page}`);
  };

  // Datos de las páginas - ACTUALIZADO
  const pages = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Procesamiento inteligente de documentos de seguros'
    },
    wizard: { // NUEVO
      title: 'Asistente de Pólizas IA',
      subtitle: 'Creación automatizada paso a paso con Azure Document Intelligence'
    },
    scanner: {
      title: 'Procesamiento de Documentos', 
      subtitle: 'Sube documentos PDF para procesamiento automático'
    },
    settings: {
      title: 'Configuración',
      subtitle: 'Configuración del sistema'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
            {/* Dashboard - MANTENER */}
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

            {/* NUEVO: Asistente IA Wizard */}
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
                      NUEVO
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
            
            {/* Scanner/Procesamiento - MANTENER pero renombrar */}
            <div 
              className={`group flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                currentPage === 'scanner' 
                  ? 'bg-green-50 border-r-4 border-green-500' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => navigateTo('scanner')}
            >
              <Scan className={`w-5 h-5 ${currentPage === 'scanner' ? 'text-green-600' : 'text-gray-600'}`} />
              {sidebarOpen && (
                <div className="ml-3">
                  <span className={`font-medium ${
                    currentPage === 'scanner' ? 'text-green-900' : 'text-gray-700'
                  }`}>Procesamiento</span>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Análisis directo de documentos
                  </div>
                </div>
              )}
              {!sidebarOpen && (
                <div className="absolute left-16 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Procesamiento
                </div>
              )}
            </div>
            
            {/* Settings - MANTENER */}
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

          {/* NUEVO: Promoción del Wizard */}
          {sidebarOpen && currentPage !== 'wizard' && (
            <>
              <div className="my-6 border-t border-gray-200"></div>
              
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-sm font-semibold text-purple-900">Nuevo Asistente IA</span>
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
                  Probar Asistente
                </button>
              </div>
            </>
          )}
        </nav>
        
        {/* Footer del Sidebar - MANTENER */}
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <div className="space-y-2">
              <div className="flex items-center p-2 text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span className="truncate">{user?.nombre || 'Usuario'}</span>
              </div>
              
              <button
                onClick={logout}
                className="w-full flex items-center p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <div className="group relative flex items-center justify-center p-2 text-gray-600" title={user?.nombre || 'Usuario'}>
                <User className="w-5 h-5" />
                <div className="absolute left-16 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {user?.nombre || 'Usuario'}
                </div>
              </div>
              
              <button
                onClick={logout}
                className="group relative flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
                <div className="absolute left-16 bg-gray-900 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Cerrar Sesión
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        {/* Header - ACTUALIZADO */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Content Area - MANTENER */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;