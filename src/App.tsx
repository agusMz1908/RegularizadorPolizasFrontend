// src/App.tsx - Actualizado con el PolizaWizard
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/auth/LoginForm';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import DocumentScanner from './pages/DocumentScanner';
import PolizaWizard from './components/wizard/PolizaWizard'; // NUEVO: Importar el wizard
import Settings from './pages/Settings';
import ProtectedRoute from './components/auth/ProtectedRoutes';

// Componente que maneja la autenticación y routing
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

  // Escuchar eventos de logout desde apiService
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

  // Mostrar loading mientras se verifica autenticación
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

  // Si no está autenticado, mostrar solo login
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<LoginForm />} />
      </Routes>
    );
  }

  // Si está autenticado, mostrar rutas protegidas
  return (
    <Routes>
      {/* Ruta raíz redirige al dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Rutas principales con Layout */}
      <Route path="/" element={<Layout />}>
        {/* Dashboard */}
        <Route path="dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* NUEVA RUTA: PolizaWizard */}
        <Route path="wizard" element={
          <ProtectedRoute>
            <PolizaWizard 
              onComplete={(result) => {
                console.log('✅ Póliza creada exitosamente:', result);
                // Navegar al DocumentScanner para ver el resultado
                window.location.href = '/scanner';
              }}
              onCancel={() => {
                // Volver al dashboard si cancela
                window.location.href = '/dashboard';
              }}
            />
          </ProtectedRoute>
        } />
        
        {/* Tu DocumentScanner existente */}
        <Route path="scanner" element={
          <ProtectedRoute>
            <DocumentScanner />
          </ProtectedRoute>
        } />
        
        {/* Settings */}
        <Route path="settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
      </Route>

      {/* Ruta 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Componente principal con Providers
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App">
          <AppContent />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;