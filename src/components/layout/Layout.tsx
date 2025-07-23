import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Users, 
  FileText, 
  Building2, 
  Settings as SettingsIcon, 
  Menu, 
  X, 
  Wand2,
  Bell,
  User,
  ChevronDown,
  TrendingUp,
  ScanLine,
  LogOut,
  HelpCircle,
  Activity
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string | number;
  children?: SidebarItem[];
}

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>(['gestion']);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const navigateTo = (page: string) => {
    const routes: { [key: string]: string } = {
      dashboard: '/',
      scanner: '/wizard',
      settings: '/settings',
      clientes: '/clientes',
      polizas: '/polizas',
      companias: '/companias'
    };
    navigate(routes[page] || '/');
  };

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    if (path === '/wizard') return 'scanner';
    if (path === '/settings') return 'settings';
    if (path === '/clientes') return 'clientes';
    if (path === '/polizas') return 'polizas';
    if (path === '/companias') return 'companias';
    return 'dashboard';
  };

  const currentPage = getCurrentPage();

  // Datos de ejemplo para estadísticas
  const todayStats = {
    documents: 95,
    successRate: 92.0
  };

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-6 h-6" />,
      active: currentPage === 'dashboard',
      onClick: () => navigateTo('dashboard')
    },
    {
      id: 'scanner',
      label: 'Scanner Pólizas',
      icon: <ScanLine className="w-6 h-6" />,
      active: currentPage === 'scanner',
      onClick: () => navigateTo('scanner'),
      badge: 'PRINCIPAL'
    },
    {
      id: 'gestion',
      label: 'Gestión Principal',
      icon: <TrendingUp className="w-6 h-6" />,
      children: [
        {
          id: 'clientes',
          label: 'Clientes',
          icon: <Users className="w-5 h-5" />,
          active: currentPage === 'clientes',
          onClick: () => navigateTo('clientes'),
          badge: 27
        },
        {
          id: 'polizas',
          label: 'Pólizas',
          icon: <FileText className="w-5 h-5" />,
          active: currentPage === 'polizas',
          onClick: () => navigateTo('polizas')
        },
        {
          id: 'companias',
          label: 'Compañías',
          icon: <Building2 className="w-5 h-5" />,
          active: currentPage === 'companias',
          onClick: () => navigateTo('companias')
        }
      ]
    }
  ];

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const paddingLeft = level === 0 ? 'pl-4' : 'pl-10';

    return (
      <div key={item.id}>
        {/* Item principal */}
        <div
          className={`group flex items-center p-4 mx-2 rounded-xl transition-all duration-200 cursor-pointer ${paddingLeft} ${
            item.active
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else if (item.onClick) {
              item.onClick();
            }
          }}
        >
          {/* Icono */}
          <div className="flex-shrink-0">
            {item.icon}
          </div>
          
          {/* Contenido cuando el sidebar está abierto */}
          {sidebarOpen && (
            <>
              <div className="ml-4 flex-1 flex items-center justify-between">
                <span className={`font-medium ${level === 0 ? 'text-base' : 'text-sm'}`}>{item.label}</span>
                <div className="flex items-center space-x-2">
                  {/* Badge */}
                  {item.badge && (
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      item.active
                        ? 'bg-white/20 text-white'
                        : typeof item.badge === 'string'
                          ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                          : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  
                  {/* Flecha para expandir */}
                  {hasChildren && (
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`} 
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Subitems */}
        {hasChildren && isExpanded && sidebarOpen && (
          <div className="mt-2 space-y-2">
            {item.children?.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-18'} bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 flex flex-col border-r border-gray-200 dark:border-gray-700`}>
        
        {/* Header del Sidebar */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  RegularizadorPólizas
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Sistema de gestión inteligente
                </p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Estado/Stats rápidos */}
        {sidebarOpen && (
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Hoy</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{todayStats.documents}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Documentos</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Éxito</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{todayStats.successRate}%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Tasa</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Navegación principal */}
        <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
          {sidebarItems.map(item => renderSidebarItem(item))}

          {/* Separador */}
          <div className="my-6 border-t border-gray-200 dark:border-gray-700 mx-4"></div>

          {/* Configuración */}
          <div 
            className={`group flex items-center p-4 mx-2 rounded-xl transition-all duration-200 cursor-pointer pl-4 ${
              currentPage === 'settings' 
                ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => navigateTo('settings')}
          >
            <SettingsIcon className="w-6 h-6" />
            {sidebarOpen && (
              <span className="ml-4 font-medium text-base">Configuración</span>
            )}
          </div>
        </nav>

        {/* Footer con usuario y configuración */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="space-y-3">
            {/* Usuario */}
            {sidebarOpen ? (
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <div className="text-base font-medium text-gray-900 dark:text-white">
                      {user?.nombre || 'Usuario'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Conectado</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <User className="w-5 h-5 text-white" />
                </div>
                <button
                  onClick={logout}
                  className="w-full p-3 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5 mx-auto" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen overflow-hidden">
        <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;