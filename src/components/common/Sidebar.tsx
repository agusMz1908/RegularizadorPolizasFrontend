import React from 'react';
import { 
  Users, 
  FileText, 
  Building2, 
  Menu, 
  X, 
  Home,
  Settings,
  HelpCircle 
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string | number;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPath?: string;
  items?: SidebarItem[];
}

const defaultItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className="w-5 h-5" />,
    href: '/',
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: <Users className="w-5 h-5" />,
    href: '/clientes',
  },
  {
    id: 'polizas',
    label: 'Pólizas',
    icon: <FileText className="w-5 h-5" />,
    href: '/polizas',
  },
  {
    id: 'companias',
    label: 'Compañías',
    icon: <Building2 className="w-5 h-5" />,
    href: '/companias',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  currentPath = '/',
  items = defaultItems,
}) => {
  return (
    <div className={`${isOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {isOpen && (
            <h1 className="text-xl font-bold text-gray-800">
              RegularizadorPólizas
            </h1>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {items.map((item) => {
            const isActive = currentPath === item.href || item.active;
            
            return (
              <div key={item.id}>
                {item.href ? (
                  <a
                    href={item.href}
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    {isOpen && (
                      <div className="ml-3 flex-1 flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </a>
                ) : (
                  <button
                    onClick={item.onClick}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    {isOpen && (
                      <div className="ml-3 flex-1 flex items-center justify-between">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          <button className="w-full flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            {isOpen && <span className="ml-3 font-medium">Configuración</span>}
          </button>
          
          <button className="w-full flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <HelpCircle className="w-5 h-5" />
            {isOpen && <span className="ml-3 font-medium">Ayuda</span>}
          </button>
        </div>
      </div>
    </div>
  );
};