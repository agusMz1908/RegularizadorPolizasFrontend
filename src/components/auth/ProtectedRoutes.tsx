// src/components/auth/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { useAuth, usePermissions } from '../../context/AuthContext';
import LoginForm from './LoginForm';

interface ProtectedRouteProps {
  children: ReactNode;
  requirePermission?: string;
  requireRole?: string;
  requireAnyRole?: string[];
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  requirePermission,
  requireRole,
  requireAnyRole,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { hasPermission, hasRole, hasAnyRole } = usePermissions();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="processing-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Verificar permisos específicos
  if (requirePermission && !hasPermission(requirePermission)) {
    return (
      <UnauthorizedAccess 
        message={`No tienes permisos para acceder a esta sección. Permiso requerido: ${requirePermission}`}
        fallback={fallback}
      />
    );
  }

  // Verificar rol específico
  if (requireRole && !hasRole(requireRole)) {
    return (
      <UnauthorizedAccess 
        message={`No tienes el rol necesario para acceder a esta sección. Rol requerido: ${requireRole}`}
        fallback={fallback}
      />
    );
  }

  // Verificar cualquiera de los roles especificados
  if (requireAnyRole && !hasAnyRole(requireAnyRole)) {
    return (
      <UnauthorizedAccess 
        message={`No tienes ninguno de los roles necesarios para acceder a esta sección. Roles requeridos: ${requireAnyRole.join(', ')}`}
        fallback={fallback}
      />
    );
  }

  // Si todas las verificaciones pasan, mostrar el contenido
  return <>{children}</>;
}

// Componente para acceso no autorizado
interface UnauthorizedAccessProps {
  message: string;
  fallback?: ReactNode;
}

function UnauthorizedAccess({ message, fallback }: UnauthorizedAccessProps) {
  const { user, logout } = useAuth();

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="poliza-card">
          {/* Icono de acceso denegado */}
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-6">
            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>

          {/* Mensaje */}
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* Información del usuario */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Usuario actual:</span> {user?.nombre}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-medium">Roles:</span> {user?.roles.map(role => role.name).join(', ') || 'Sin roles'}
            </p>
          </div>

          {/* Acciones */}
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Volver Atrás
            </button>
            <button
              onClick={logout}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>

          {/* Contacto */}
          <p className="text-xs text-gray-500 mt-4">
            Si crees que esto es un error, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}