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
  Building2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/enhanced/ThemeToggle';

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
    <div className="flex flex-col h-full bg-background border-r">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-6 border-b gradient-primary relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/10 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),rgba(255,255,255,0))]" />
        
        <div className="flex items-center space-x-3 relative z-10">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg">
            <Car className="h-5 w-5 text-white" />
          </div>
          <div className="text-white">
            <h1 className="font-bold text-lg">RegularizadorPolizas</h1>
            <p className="text-xs text-white/80">V2 - BSE Automóviles</p>
          </div>
        </div>
        
        {/* Theme Toggle + Close button */}
        <div className="flex items-center space-x-2 relative z-10">
          <ThemeToggle className="text-white hover:bg-white/10" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Enhanced User Info */}
      <div className="p-4 border-b bg-gradient-to-br from-muted/30 to-background">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-secondary rounded-full flex items-center justify-center shadow-lg">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.nombre}
            </p>
            <div className="flex items-center space-x-2">
              <Building2 className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground truncate">
                {user?.tenantId}
              </p>
            </div>
          </div>
          {/* Status indicator */}
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Enhanced Navigation */}
      <nav className="flex-1 p-4 space-y-1 bg-gradient-to-b from-background to-muted/20">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const isDisabled = item.badge?.text === 'Próximamente';
          
          const getButtonColors = () => {
            if (isActive) {
              switch (item.id) {
                case 'dashboard': 
                  return "gradient-primary text-white shadow-lg";
                case 'wizard': 
                  return "gradient-secondary text-white shadow-lg";
                case 'analytics': 
                  return "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg";
                case 'billing': 
                  return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg";
                case 'history': 
                  return "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg";
                case 'settings': 
                  return "bg-gradient-to-r from-gray-500 to-slate-600 text-white shadow-lg";
                default: 
                  return "gradient-primary text-white shadow-lg";
              }
            }
            if (isDisabled) return "text-muted-foreground cursor-not-allowed";
            return "text-foreground hover:bg-accent hover:text-accent-foreground hover-lift";
          };
          
          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onNavigate(item.id)}
              disabled={isDisabled}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-left transition-all duration-300",
                getButtonColors()
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-white/20 backdrop-blur-sm" 
                  : isDisabled
                  ? "bg-muted"
                  : "bg-muted hover:bg-background hover:shadow-sm"
              )}>
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isActive ? "text-white" : isDisabled ? "text-muted-foreground" : "text-foreground"
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
                  isActive ? "text-white/80" : isDisabled ? "text-muted-foreground" : "text-muted-foreground"
                )}>
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Enhanced Bottom Section */}
      <div className="p-4 border-t bg-gradient-to-br from-background to-muted/20">
        {/* Scope Info with better styling */}
        <div className="mb-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl shadow-sm">
          <div className="flex items-center space-x-2 mb-1">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Car className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm font-medium text-primary">Alcance Inicial</span>
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
          </div>
          <p className="text-xs text-foreground">
            Solo <strong>BSE - AUTOMÓVILES</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Próximamente más compañías
          </p>
        </div>

        <Separator className="my-3" />
        
        {/* Enhanced Logout */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 hover:shadow-lg transition-all duration-300"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-80 bg-card border-r shadow-soft">
          <SidebarContent />
        </div>
      </div>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-80 bg-card shadow-xl">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Enhanced Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Mobile Header */}
        <header className="lg:hidden bg-card border-b px-4 py-3 shadow-soft">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-accent"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">RegularizadorPolizas V2</span>
            </div>
            
            <ThemeToggle />
          </div>
        </header>

        {/* Enhanced Main Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-muted/30 w-full">
          <div className="h-full w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;