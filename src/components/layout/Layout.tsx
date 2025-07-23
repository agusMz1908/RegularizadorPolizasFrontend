import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Wand2, 
  Scan, 
  BarChart3, 
  Settings as SettingsIcon, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Sparkles,
  Moon,
  Sun,
  Monitor,
  Palette
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, effectiveTheme, setTheme } = useTheme();

  const navigateTo = (path: string) => {
    navigate(`/${path}`);
  };

  const getCurrentPage = () => {
    const path = location.pathname.split('/')[1];
    return path || 'dashboard';
  };

  const currentPage = getCurrentPage();

  // Opciones de tema
  const themeOptions = [
    { 
      value: 'light' as const, 
      label: 'Claro', 
      icon: Sun, 
      description: 'Tema claro siempre' 
    },
    { 
      value: 'dark' as const, 
      label: 'Oscuro', 
      icon: Moon, 
      description: 'Tema oscuro siempre' 
    },
    { 
      value: 'system' as const, 
      label: 'Sistema', 
      icon: Monitor, 
      description: 'Seguir preferencia del sistema' 
    }
  ];

  const ThemeToggle = () => (
    <div className="relative">
      <button
        onClick={() => setShowThemeMenu(!showThemeMenu)}
        className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${
          sidebarOpen 
            ? 'justify-start hover:bg-gray-100 dark:hover:bg-gray-700' 
            : 'justify-center hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title={sidebarOpen ? 'Cambiar tema' : 'Tema'}
      >
        <div className="flex items-center justify-center w-5 h-5">
          {effectiveTheme === 'dark' ? (
            <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-600" />
          )}
        </div>
        {sidebarOpen && (
          <div className="ml-3 flex items-center justify-between flex-1">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Tema</span>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {theme === 'system' ? `Sistema (${effectiveTheme})` : theme}
              </div>
            </div>
            <Palette className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </button>

      {/* Menú desplegable de temas */}
      {showThemeMenu && (
        <>
          {/* Overlay para cerrar el menú */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowThemeMenu(false)}
          />
          
          {/* Menú */}
          <div className={`absolute z-20 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${
            sidebarOpen ? 'left-0' : 'left-12'
          }`}>
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Seleccionar Tema
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Personaliza la apariencia de la aplicación
              </p>
            </div>
            
            <div className="p-2">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTheme(option.value);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700' 
                        : 'border-2 border-transparent'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                      isSelected 
                        ? 'bg-blue-100 dark:bg-blue-800' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        isSelected 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div className="ml-3 text-left flex-1">
                      <div className={`font-medium text-sm ${
                        isSelected 
                          ? 'text-blue-900 dark:text-blue-100' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 El tema se guarda automáticamente
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 shadow-lg ${
        sidebarOpen ? 'w-72' : 'w-16'
      }`}>
        
        {/* Header del Sidebar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  RegularizadorPólizas
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Sistema de gestión inteligente
                </p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>
        
        {/* Navegación principal */}
        <nav className="flex-1 p-4 space-y-2">
          {/* Dashboard */}
          <div 
            className={`group flex items-center p-3 rounded-xl transition-all duration-200 cursor-pointer ${
              currentPage === 'dashboard' 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-r-4 border-blue-500 dark:border-blue-400' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => navigateTo('dashboard')}
          >
            <Home className={`w-5 h-5 ${currentPage === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
            {sidebarOpen && (
              <span className={`ml-3 font-medium ${
                currentPage === 'dashboard' ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'
              }`}>Dashboard</span>
            )}
          </div>
          
          {/* Wizard Principal */}
          <div 
            className={`group flex items-center p-3 rounded-xl transition-all duration-200 cursor-pointer ${
              currentPage === 'wizard' 
                ? 'bg-purple-50 dark:bg-purple-900/20 border-r-4 border-purple-500 dark:border-purple-400' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => navigateTo('wizard')}
          >
            <Wand2 className={`w-5 h-5 ${currentPage === 'wizard' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`} />
            {sidebarOpen && (
              <div className="ml-3 flex-1">
                <div className="flex items-center">
                  <span className={`font-medium ${
                    currentPage === 'wizard' ? 'text-purple-900 dark:text-purple-100' : 'text-gray-700 dark:text-gray-300'
                  }`}>Asistente IA</span>
                  <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded-full font-medium">
                    PRINCIPAL
                  </span>
                </div>
                {currentPage !== 'wizard' && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Creación guiada de pólizas
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Acceso rápido al procesamiento */}
          <div 
            className="group flex items-center p-3 rounded-xl transition-all duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={() => navigateTo('wizard')}
          >
            <Scan className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {sidebarOpen && (
              <div className="ml-3">
                <span className="font-medium text-gray-700 dark:text-gray-300">Procesamiento</span>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Acceso rápido al asistente
                </div>
              </div>
            )}
          </div>
          
          {/* Settings */}
          <div 
            className={`group flex items-center p-3 rounded-xl transition-all duration-200 cursor-pointer ${
              currentPage === 'settings' 
                ? 'bg-gray-50 dark:bg-gray-700 border-r-4 border-gray-500 dark:border-gray-400' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => navigateTo('settings')}
          >
            <SettingsIcon className={`w-5 h-5 ${currentPage === 'settings' ? 'text-gray-700 dark:text-gray-300' : 'text-gray-600 dark:text-gray-400'}`} />
            {sidebarOpen && (
              <span className={`ml-3 font-medium ${
                currentPage === 'settings' ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
              }`}>Configuración</span>
            )}
          </div>

          {/* Separador */}
          <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>

          {/* Toggle de Tema */}
          <ThemeToggle />

          {/* Promoción del Wizard */}
          {sidebarOpen && currentPage !== 'wizard' && (
            <>
              <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>
              
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4">
                <div className="flex items-center mb-3">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" />
                  <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">Herramienta Principal</span>
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed mb-3">
                  Crea pólizas completas en 30 segundos con nuestro asistente guiado paso a paso.
                </p>
                <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 mb-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span>95% menos tiempo de procesamiento</span>
                </div>
                <button
                  onClick={() => navigateTo('wizard')}
                  className="w-full text-xs bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-md transition-colors flex items-center justify-center"
                >
                  <Wand2 className="w-3 h-3 mr-1" />
                  Usar Asistente
                </button>
              </div>
            </>
          )}
        </nav>
        
        {/* Footer del Sidebar - Usuario */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.nombre || 'Usuario'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Conectado</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <User className="w-4 h-4 text-white" />
              </div>
              <button
                onClick={logout}
                className="w-full p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4 mx-auto" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 min-h-screen overflow-hidden ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
        <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;