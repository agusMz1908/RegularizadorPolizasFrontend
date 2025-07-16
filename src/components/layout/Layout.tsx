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
  User
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/scanner')) return 'scanner';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

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
    scanner: {
      title: 'Escanear Documentos', 
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
            {/* Dashboard */}
            <div 
              className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
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
            </div>
            
            {/* Scanner */}
            <div 
              className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                currentPage === 'scanner' 
                  ? 'bg-green-50 border-r-4 border-green-500' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => navigateTo('scanner')}
            >
              <Scan className={`w-5 h-5 ${currentPage === 'scanner' ? 'text-green-600' : 'text-gray-600'}`} />
              {sidebarOpen && (
                <span className={`ml-3 font-medium ${
                  currentPage === 'scanner' ? 'text-green-900' : 'text-gray-700'
                }`}>Escanear Documentos</span>
              )}
            </div>
            
            {/* Settings */}
            <div 
              className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
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
            </div>
          </div>
        </nav>
        
        {/* Footer del Sidebar con Usuario y Logout */}
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <div className="space-y-2">
              {/* Info del usuario */}
              <div className="flex items-center p-2 text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span className="truncate">{user?.nombre || 'Usuario'}</span>
              </div>
              
              {/* Botón Logout */}
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
              {/* Usuario colapsado */}
              <div className="flex items-center justify-center p-2 text-gray-600" title={user?.nombre || 'Usuario'}>
                <User className="w-5 h-5" />
              </div>
              
              {/* Logout colapsado */}
              <button
                onClick={logout}
                className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {pages[currentPage as keyof typeof pages]?.title}
                </h1>
                <p className="text-gray-600 mt-1">
                  {pages[currentPage as keyof typeof pages]?.subtitle}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area - Aquí se renderizan las páginas con Outlet */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;