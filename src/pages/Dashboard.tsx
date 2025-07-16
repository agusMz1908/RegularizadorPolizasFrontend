import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  RefreshCw 
} from 'lucide-react';

// Interfaces para los datos
interface CompanyStats {
  companyId: string;
  companyCode: string;
  documentsToday: number;
  documentsMonth: number;
  costToday: number;
  costMonth: number;
  successRate: number;
  avgProcessingTime: number;
}

interface RecentActivity {
  id: string;
  documentName: string;
  companyCode: string;
  status: 'completed' | 'processing' | 'error' | 'sent_to_velneo';
  timestamp: string;
  processingTime?: number;
}

// Mock data para desarrollo
const mockCompanyStats: CompanyStats[] = [
  {
    companyId: '1',
    companyCode: 'BSE',
    documentsToday: 12,
    documentsMonth: 340,
    costToday: 1.44,
    costMonth: 40.80,
    successRate: 94.2,
    avgProcessingTime: 2.3
  },
  {
    companyId: '2', 
    companyCode: 'SUR',
    documentsToday: 8,
    documentsMonth: 220,
    costToday: 0.96,
    costMonth: 26.40,
    successRate: 89.1,
    avgProcessingTime: 3.1
  },
  {
    companyId: '3',
    companyCode: 'SOS',
    documentsToday: 5,
    documentsMonth: 145,
    costToday: 0.60,
    costMonth: 17.40,
    successRate: 92.8,
    avgProcessingTime: 2.8
  }
];

const mockRecentActivity: RecentActivity[] = [
  {
    id: '1',
    documentName: 'poliza_bse_001.pdf',
    companyCode: 'BSE',
    status: 'completed',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    processingTime: 2.1
  },
  {
    id: '2',
    documentName: 'poliza_sur_045.pdf', 
    companyCode: 'SUR',
    status: 'sent_to_velneo',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    processingTime: 3.4
  },
  {
    id: '3',
    documentName: 'poliza_sos_023.pdf',
    companyCode: 'SOS',
    status: 'processing',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    documentName: 'poliza_bse_002.pdf',
    companyCode: 'BSE',
    status: 'error',
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString()
  }
];

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // TODO: Reemplazar con llamadas reales a la API
        // const [statsResponse, activityResponse] = await Promise.all([
        //   fetch('/api/dashboard/stats'),
        //   fetch('/api/dashboard/recent-activity')
        // ]);
        
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCompanyStats(mockCompanyStats);
        setRecentActivity(mockRecentActivity);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Calcular estadísticas totales
  const totalStats = companyStats.reduce((totals, company) => ({
    documentsToday: totals.documentsToday + company.documentsToday,
    documentsMonth: totals.documentsMonth + company.documentsMonth,
    costToday: totals.costToday + company.costToday,
    costMonth: totals.costMonth + company.costMonth,
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
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Documentos Hoy */}
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
                <p className="text-xl font-bold text-gray-900">${totalStats.costToday.toFixed(2)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">${totalStats.costMonth.toFixed(2)}</p>
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
              <p className="text-xs text-gray-400">promedio</p>
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
                <p className="text-xl font-bold text-gray-900">{totalStats.avgProcessingTime.toFixed(1)}s</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">por documento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Estadísticas por Compañía */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Estadísticas por Compañía</h3>
            <p className="text-sm text-gray-600">Rendimiento de cada compañía aseguradora</p>
          </div>
          <div className="p-6">
            {companyStats.length > 0 ? (
              <div className={`grid gap-4 ${
                companyStats.length === 1 ? 'grid-cols-1' :
                companyStats.length === 2 ? 'grid-cols-2' :
                companyStats.length === 3 ? 'grid-cols-3' :
                'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}>
                {companyStats.map((company) => (
                  <div 
                    key={company.companyId}
                    className="border rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <h4 className="font-semibold text-gray-900 mb-3 text-center">{company.companyCode}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Docs hoy:</span>
                        <span className="font-medium">{company.documentsToday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Docs mes:</span>
                        <span className="font-medium">{company.documentsMonth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Costo mes:</span>
                        <span className="font-medium">${company.costMonth.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Éxito:</span>
                        <span className="font-medium">{company.successRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tiempo avg:</span>
                        <span className="font-medium">{company.avgProcessingTime}s</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay datos disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            <p className="text-sm text-gray-600">Últimos documentos procesados</p>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.documentName}
                        </p>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          {activity.companyCode}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {getStatusText(activity.status)}
                        </span>
                      </div>
                      {activity.processingTime && (
                        <p className="text-xs text-gray-500 mt-1">
                          Procesado en {activity.processingTime}s
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;