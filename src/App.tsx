import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './pages/Dashboard';
import { Loader2, Shield, AlertCircle } from 'lucide-react';

// Componente de debug temporal
const DebugInfo: React.FC = () => {
  const { user, isLoading, isAuthenticated, token, error } = useAuth();
  
  // Solo mostrar en desarrollo
  if (import.meta.env.PROD) return null;
  
  return (
    <div className="fixed top-0 right-0 bg-black bg-opacity-90 text-white p-4 m-4 rounded-lg text-xs z-50 max-w-sm">
      <div className="font-bold mb-2">🐛 DEBUG - API REAL</div>
      
      {/* Estado de autenticación */}
      <div className="mb-3 pb-2 border-b border-gray-600">
        <div className="font-semibold text-green-400">AUTH:</div>
        <div>isLoading: {isLoading ? '🔄' : '✅'}</div>
        <div>isAuthenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>hasToken: {token ? '✅' : '❌'}</div>
        <div>hasUser: {user ? '✅' : '❌'}</div>
        <div>userName: {user?.nombre || 'null'}</div>
        {error && <div className="text-red-400">error: {error}</div>}
      </div>
      
      {/* Configuración de API */}
      <div className="mb-3 pb-2 border-b border-gray-600">
        <div className="font-semibold text-blue-400">API CONFIG:</div>
        <div>baseUrl: {import.meta.env.VITE_API_URL}</div>
        <div>mockMode: {import.meta.env.VITE_ENABLE_MOCK_DATA}</div>
        <div>timeout: {import.meta.env.VITE_VELNEO_TIMEOUT}ms</div>
      </div>
      
      {/* URLs específicas */}
      <div className="mb-3 pb-2 border-b border-gray-600">
        <div className="font-semibold text-yellow-400">ENDPOINTS:</div>
        <div className="text-xs">
          <div>GET Clientes:</div>
          <div className="text-green-300 ml-2">/Clients?page=1&pageSize=1000</div>
          <div>GET Pólizas:</div>
          <div className="text-green-300 ml-2">/Polizas/cliente/{'{id}'}?page=1&pageSize=50</div>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-500">
        <div className="font-bold">localStorage:</div>
        <div>auth: {localStorage.getItem('regularizador_auth') ? '✅' : '❌'}</div>
      </div>
      
      <div className="flex space-x-1 mt-2">
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="bg-red-600 px-2 py-1 rounded text-xs"
        >
          Clear
        </button>
        <button 
          onClick={() => {
            console.log('🔍 Testing API endpoints...');
            fetch(`${import.meta.env.VITE_API_URL}/Clients?page=1&pageSize=5`)
              .then(res => console.log('Clientes endpoint:', res.status))
              .catch(err => console.error('Clientes error:', err));
          }}
          className="bg-blue-600 px-2 py-1 rounded text-xs"
        >
          Test
        </button>
      </div>
    </div>
  );
};

// Componente que maneja el estado de autenticación
const AppContent: React.FC = () => {
  const { user, isLoading, isAuthenticated, error } = useAuth();

  console.log('🔍 AppContent render:', { isLoading, isAuthenticated, hasUser: !!user });

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">RegularizadorPolizas</h2>
          <p className="text-gray-600">Verificando autenticación...</p>
          
          {/* Debug info durante loading */}
          <div className="mt-4 text-xs text-gray-500">
            Verificando localStorage...
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated || !user) {
    console.log('❌ Usuario no autenticado, mostrando login');
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">RegularizadorPolizas</h2>
            <p className="mt-2 text-gray-600">Sistema de Gestión de Pólizas</p>
            
            {/* Mostrar error si existe */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">Error de autenticación</span>
                </div>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            )}
          </div>
          
          <LoginForm />
        </div>
        
        <DebugInfo />
      </div>
    );
  }

  // Usuario autenticado, mostrar Dashboard
  console.log('✅ Usuario autenticado, mostrando Dashboard para:', user.nombre);
  return (
    <>
      <Dashboard />
      <DebugInfo />
    </>
  );
};

// Componente principal de la aplicación
const App: React.FC = () => {
  console.log('🚀 App iniciando...');
  
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;