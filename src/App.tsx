import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginForm from './components/auth/LoginForm';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import PolizaWizard from './components/wizard/PolizaWizard';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  useEffect(() => {
    console.log('🏠 App.tsx - Auth state changed:', {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      userName: user?.nombre
    });
  }, [isAuthenticated, isLoading, user]);

  useEffect(() => {
    const handleSessionExpired = () => {
      console.log('🚫 Sesión expirada detectada, haciendo logout...');
      logout();
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [logout]);

  // Pantalla de loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Verificando sesión...</p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<LoginForm />} />
      </Routes>
    );
  }

  // Si está autenticado, mostrar la aplicación principal
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/" element={<Layout />}>
        {/* ✅ Ya no necesitas ProtectedRoute aquí porque ya verificaste autenticación arriba */}
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* HERRAMIENTA PRINCIPAL: Wizard */}
        <Route path="wizard" element={<PolizaWizard />} />

        {/* REDIRECCIÓN: /scanner → /wizard para compatibilidad */}
        <Route path="scanner" element={<Navigate to="/wizard" replace />} />
        
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Componente principal con todos los Providers
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <AppContent />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;