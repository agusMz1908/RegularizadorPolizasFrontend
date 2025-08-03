// src/components/layout/MainLayout.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  DollarSign, 
  History, 
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Plus,
  Home,
  Car,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

// Tipo que debe coincidir exactamente con App.tsx
type CurrentPage = 'dashboard' | 'wizard' | 'analytics' | 'billing' | 'history' | 'settings';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: CurrentPage;
  onNavigate: (page: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  currentPage, 
  onNavigate 
}) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Resumen general',
      badge: null
    },
    {
      id: 'wizard',
      label: 'Nueva Póliza',
      icon: Plus,
      description: 'Wizard principal',
      badge: { text: 'BSE', variant: 'default' as const }
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Métricas y análisis',
      badge: { text: 'Próximamente', variant: 'secondary' as const }
    },
    {
      id: 'billing',
      label: 'Facturación',
      icon: DollarSign,
      description: 'Cobros mensuales',
      badge: { text: 'Próximamente', variant: 'secondary' as const }
    },
    {
      id: 'history',
      label: 'Historial',
      icon: History,
      description: 'Pólizas procesadas',
      badge: null
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      description: 'Configuración del sistema',
      badge: null
    }
  ];

  const handleLogout = () => {
    logout();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo and Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-600/80"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        
        <div className="flex items-center space-x-3 relative z-10">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg">
            <Car className="h-5 w-5 text-white" />
          </div>
          <div className="text-white">
            <h1 className="font-bold text-lg">RegularizadorPolizas</h1>
            <p className="text-xs text-blue-100">V2 - BSE Automóviles</p>
          </div>
        </div>
        
        {/* Close button on mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-white hover:bg-white/10 relative z-10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.nombre}
            </p>
            <div className="flex items-center space-x-2">
              <Building2 className="h-3 w-3 text-gray-500" />
              <p className="text-xs text-gray-500 truncate">
                {user?.tenantId}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 bg-gradient-to-b from-white to-gray-50">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const isDisabled = item.badge?.text === 'Próximamente';
          
          const getButtonColors = () => {
            if (isActive) {
              switch (item.id) {
                case 'dashboard': return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25";
                case 'wizard': return "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25";
                case 'analytics': return "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25";
                case 'billing': return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25";
                case 'history': return "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25";
                case 'settings': return "bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg shadow-gray-500/25";
                default: return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25";
              }
            }
            if (isDisabled) return "text-gray-400 cursor-not-allowed";
            return "text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 hover:text-gray-900 hover:shadow-md";
          };
          
          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onNavigate(item.id)}
              disabled={isDisabled}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left transition-all duration-300 transform hover:scale-105",
                getButtonColors()
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-white/20 backdrop-blur-sm" 
                  : isDisabled
                  ? "bg-gray-100"
                  : "bg-gray-100 group-hover:bg-white group-hover:shadow-sm"
              )}>
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-white" : isDisabled ? "text-gray-400" : "text-gray-600"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant={isActive ? "secondary" : item.badge.variant} 
                      className={cn(
                        "ml-2 text-xs",
                        isActive ? "bg-white/20 text-white border-white/30" : ""
                      )}
                    >
                      {item.badge.text}
                    </Badge>
                  )}
                </div>
                <p className={cn(
                  "text-xs truncate",
                  isActive ? "text-white/80" : "text-gray-500"
                )}>
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t bg-gradient-to-br from-white to-gray-50">
        {/* Current Scope Info */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 mb-1">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Car className="h-3 w-3 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-900">Alcance Inicial</span>
          </div>
          <p className="text-xs text-blue-700">
            Solo <strong>BSE - AUTOMÓVILES</strong>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Próximamente más compañías
          </p>
        </div>

        <Separator className="my-3" />
        
        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 hover:shadow-lg transition-all duration-300"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-80 bg-white border-r border-gray-200 shadow-sm">
          <SidebarContent />
        </div>
      </div>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header - Mobile */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">RegularizadorPolizas V2</span>
            </div>
            
            <div className="w-8" /> {/* Spacer */}
          </div>
        </header>

        {/* Page Content - SIN RESTRICCIONES DE ANCHO */}
        <main className="flex-1 overflow-auto bg-gray-50 w-full">
          <div className="h-full w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;