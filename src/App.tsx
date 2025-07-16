import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/auth/LoginForm';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import DocumentScanner from './pages/DocumentScanner';
import Settings from './pages/Settings';
import ProtectedRoute from './components/auth/ProtectedRoutes';
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
    const handleAuthLogout = () => {
      console.log('🔐 Auth logout event received, logging out...');
      logout();
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [logout]);

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

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<LoginForm />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/" element={<Layout />}>
        <Route path="dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="scanner" element={
          <ProtectedRoute>
            <DocumentScanner />
          </ProtectedRoute>
        } />

        <Route path="wizard" element={
          <ProtectedRoute>
            <PolizaWizard />
          </ProtectedRoute>
        } />
        
        <Route path="settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
      </Route>

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