import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { CompanyStats } from '../types/companyStats';
import { RecentActivity } from '../types/recentActivity';
import { 
  FileText, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Clock,
  Building2,
  Activity,
  BarChart3,
  Home,
  Scan,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  Loader2
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  
  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'scanner' | 'settings'>('dashboard');

  useEffect(() => {
    const mockStats: CompanyStats[] = [
      {
        companyId: 'bse',
        companyName: 'Banco de Seguros del Estado',
        companyCode: 'BSE',
        documentsToday: 12,
        documentsMonth: 145,
        costToday: 24,
        costMonth: 290,
        successRate: 94.5,
        avgProcessingTime: 45,
        lastProcessed: '2025-07-14T10:30:00Z'
      }
      // Solo BSE por ahora - se agregarán dinámicamente
    ];

    const mockActivity: RecentActivity[] = [
      {
        id: '1',
        documentName: 'poliza_vehiculo_123456.pdf',
        companyName: 'BSE',
        status: 'sent_to_velneo',
        timestamp: '2025-07-14T10:15:00Z',
        processingTime: 42
      },
      {
        id: '2',
        documentName: 'renovacion_789012.pdf',
        companyName: 'BSE',
        status: 'processing',
        timestamp: '2025-07-14T10:10:00Z'
      },
      {
        id: '3',
        documentName: 'endoso_345678.pdf',
        companyName: 'BSE',
        status: 'completed',
        timestamp: '2025-07-14T09:45:00Z',
        processingTime: 38
      },
      {
        id: '4',
        documentName: 'poliza_error_111222.pdf',
        companyName: 'BSE',
        status: 'error',
        timestamp: '2025-07-14T09:30:00Z'
      }
    ];

    setCompanyStats(mockStats);
    setRecentActivity(mockActivity);
    setLoading(false);
  }, []);

  // Datos consolidados de todas las compañías activas
  const totalStats = companyStats.reduce((acc, company) => ({
    documentsToday: acc.documentsToday + company.documentsToday,
    documentsMonth: acc.documentsMonth + company.documentsMonth,
    costToday: acc.costToday + company.costToday,
    costMonth: acc.costMonth + company.costMonth,
    avgSuccessRate: companyStats.length > 0 ? 
      companyStats.reduce((sum, c) => sum + c.successRate, 0) / companyStats.length : 0,
    avgProcessingTime: companyStats.length > 0 ? 
      companyStats.reduce((sum, c) => sum + c.avgProcessingTime, 0) / companyStats.length : 0
  }), {
    documentsToday: 0,
    documentsMonth: 0,
    costToday: 0,
    costMonth: 0,
    avgSuccessRate: 0,
    avgProcessingTime: 0
  });

  // Función para obtener color del estado
  const getStatusColor = (status: RecentActivity['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'sent_to_velneo': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: RecentActivity['status']) => {
    switch (status) {
      case 'completed': return 'Procesado';
      case 'sent_to_velneo': return 'Enviado a Velneo';
      case 'processing': return 'Procesando';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-UY', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col fixed h-full z-10`}>
        {/* Header del Sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-lg font-bold text-gray-800">
                RegularizadorPólizas
              </h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <div 
              className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                currentPage === 'dashboard' 
                  ? 'bg-blue-50 border-r-4 border-blue-500' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setCurrentPage('dashboard')}
            >
              <Home className={`w-5 h-5 ${currentPage === 'dashboard' ? 'text-blue-600' : 'text-gray-600'}`} />
              {sidebarOpen && (
                <span className={`ml-3 font-medium ${
                  currentPage === 'dashboard' ? 'text-blue-900' : 'text-gray-700'
                }`}>Dashboard</span>
              )}
            </div>
            
            <div 
              className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                currentPage === 'scanner' 
                  ? 'bg-green-50 border-r-4 border-green-500' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setCurrentPage('scanner')}
            >
              <Scan className={`w-5 h-5 ${currentPage === 'scanner' ? 'text-green-600' : 'text-gray-600'}`} />
              {sidebarOpen && (
                <span className={`ml-3 font-medium ${
                  currentPage === 'scanner' ? 'text-green-900' : 'text-gray-700'
                }`}>Escanear Documentos</span>
              )}
            </div>
            
            <div 
              className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                currentPage === 'settings' 
                  ? 'bg-gray-50 border-r-4 border-gray-500' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setCurrentPage('settings')}
            >
              <Settings className={`w-5 h-5 ${currentPage === 'settings' ? 'text-gray-700' : 'text-gray-600'}`} />
              {sidebarOpen && (
                <span className={`ml-3 font-medium ${
                  currentPage === 'settings' ? 'text-gray-900' : 'text-gray-700'
                }`}>Configuración</span>
              )}
            </div>
          </div>
        </nav>
        
        {/* Footer del Sidebar con Usuario y Logout */}
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <div className="space-y-2">
              {/* Info del usuario */}
              <div className="flex items-center p-2 text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span className="truncate">{user?.nombre || 'Usuario'}</span>
              </div>
              
              {/* Botón Logout */}
              <button
                onClick={logout}
                className="w-full flex items-center p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              {/* Usuario colapsado */}
              <div className="flex items-center justify-center p-2 text-gray-600" title={user?.nombre || 'Usuario'}>
                <User className="w-5 h-5" />
              </div>
              
              {/* Logout colapsado */}
              <button
                onClick={logout}
                className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Procesamiento inteligente de documentos de seguros</p>
              </div>
            </div>
          </div>
        </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Stats Cards - Compactas */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Documentos Hoy</p>
                  <p className="text-xl font-bold text-gray-900">{totalStats.documentsToday}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{totalStats.documentsMonth}</p>
                <p className="text-xs text-gray-400">este mes</p>
              </div>
            </div>
          </div>

          {/* Costo */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Costo Hoy</p>
                  <p className="text-xl font-bold text-gray-900">${totalStats.costToday}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">${totalStats.costMonth}</p>
                <p className="text-xs text-gray-400">este mes</p>
              </div>
            </div>
          </div>

          {/* Tasa de Éxito */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-emerald-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Tasa de Éxito</p>
                  <p className="text-xl font-bold text-gray-900">{totalStats.avgSuccessRate.toFixed(1)}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">30 días</p>
              </div>
            </div>
          </div>

          {/* Tiempo Promedio */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Tiempo Promedio</p>
                  <p className="text-xl font-bold text-gray-900">{Math.round(totalStats.avgProcessingTime)}s</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">por doc</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Acción Principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
              <div className="text-center">
                <Upload className="mx-auto h-16 w-16 text-blue-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Procesar Documento de Póliza
                </h3>
                <p className="text-gray-600 mb-6">
                  Arrastra un PDF o haz clic para seleccionar un documento de póliza
                </p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 hover:border-blue-400 transition-colors cursor-pointer">
                  <div className="space-y-4">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-700">Arrastra tu archivo PDF aquí</p>
                      <p className="text-sm text-gray-500">o haz clic para seleccionar</p>
                    </div>
                    <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                      <Upload className="w-5 h-5 mr-2" />
                      Seleccionar Archivo
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  Costo: $2 USD por documento procesado
                </div>
              </div>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {activity.status === 'sent_to_velneo' && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {activity.status === 'completed' && <CheckCircle className="h-5 w-5 text-blue-500" />}
                          {activity.status === 'processing' && (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
                          )}
                          {activity.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.documentName}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(activity.status)}`}>
                              {getStatusText(activity.status)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(activity.timestamp)}
                            </span>
                          </div>
                          {activity.processingTime && (
                            <p className="text-xs text-gray-500 mt-1">
                              Procesado en {activity.processingTime}s
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500">No hay actividad reciente</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Resumen por Compañía - Dinámico */}
        {companyStats.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Resumen por Compañía</h3>
                </div>
              </div>
              <div className="p-6">
                <div className={`grid gap-4 ${
                  companyStats.length === 1 ? 'grid-cols-1' :
                  companyStats.length === 2 ? 'grid-cols-2' :
                  companyStats.length === 3 ? 'grid-cols-3' :
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                }`}>
                  {companyStats.map((company) => (
                    <div 
                      key={company.companyId}
                      className="border rounded-lg p-3 hover:border-gray-300 transition-colors"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2 text-center">{company.companyCode}</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Docs:</span>
                          <span className="font-medium">{company.documentsMonth}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Costo:</span>
                          <span className="font-medium">${company.costMonth}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Éxito:</span>
                          <span className="font-medium">{company.successRate}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
};

export default Dashboard;