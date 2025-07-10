// src/App.tsx
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import LoginForm from './components/auth/LoginForm';

// ✅ Componente interno que usa el contexto
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  // ✅ Debug: Log del estado de auth
  useEffect(() => {
    console.log('🏠 App.tsx - Auth state changed:', {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      userName: user?.nombre
    });
  }, [isAuthenticated, isLoading, user]);

  // ✅ Escuchar eventos de logout desde apiService
  useEffect(() => {
    const handleAuthLogout = () => {
      console.log('🔐 Auth logout event received, logging out...');
      logout();
    };

    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [logout]);

  // ✅ Mostrar loading mientras se verifica autenticación
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

  // ✅ Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    console.log('🔐 Not authenticated, showing login form');
    return <LoginForm />;
  }

  // ✅ Si está autenticado, mostrar dashboard
  console.log('✅ Authenticated, showing dashboard for user:', user?.nombre);
  return <Dashboard />;
};

// ✅ Componente principal con Provider
function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;