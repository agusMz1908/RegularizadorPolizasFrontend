// src/components/auth/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoginForm from './LoginForm';

interface ProtectedRouteProps {
  children: ReactNode;
  requirePermission?: string;
  requireRole?: string;
  fallback?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requirePermission,
  requireRole,
  fallback,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // TODO: Implementar verificación de permisos/roles si es necesario
  // if (requirePermission && !hasPermission(requirePermission)) {
  //   return <UnauthorizedAccess />;
  // }

  // Si todas las verificaciones pasan, mostrar el contenido
  return <>{children}</>;
};

export default ProtectedRoute;