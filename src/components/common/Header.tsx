import React from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { User as UserType } from '../../types/user';

interface HeaderProps {
  title: string;
  subtitle?: string;
  user?: UserType | null;
  onLogout?: () => void;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  user,
  onLogout,
  actions,
}) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {actions}
          
          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
              </div>
              
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      className="p-1 text-gray-500 hover:text-gray-700 rounded"
                      title="Configuración"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    
                    {onLogout && (
                      <button
                        onClick={onLogout}
                        className="p-1 text-gray-500 hover:text-red-600 rounded"
                        title="Cerrar sesión"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
