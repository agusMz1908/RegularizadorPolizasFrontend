import React, { useState, useEffect } from 'react';
import { FileText, DollarSign, TrendingUp, Clock, Building2, Activity } from 'lucide-react';

interface DashboardStats {
  documentsToday: number;
  costToday: number;
  successRate: number;
  avgTime: number;
}

interface CompanyStats {
  company: string;
  documents: number;
  maxDocuments: number;
  cost: number;
  avgTime: number;
  successRate: number;
}

interface RecentActivity {
  id: string;
  fileName: string;
  company: string;
  status: 'Procesado' | 'Procesando' | 'Error' | 'Enviado a Velneo';
  time: string;
  processingTime?: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    documentsToday: 25,
    costToday: 3.00,
    successRate: 92.0,
    avgTime: 2.7
  });

  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([
    {
      company: 'BSE',
      documents: 12,
      maxDocuments: 340,
      cost: 40.80,
      avgTime: 2.3,
      successRate: 94.2
    },
    {
      company: 'SUR',
      documents: 8,
      maxDocuments: 220,
      cost: 26.40,
      avgTime: 3.1,
      successRate: 89.1
    },
    {
      company: 'SOS',
      documents: 5,
      maxDocuments: 145,
      cost: 17.40,
      avgTime: 2.8,
      successRate: 92.8
    }
  ]);

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      fileName: 'poliza_bse_001.pdf',
      company: 'BSE',
      status: 'Procesado',
      time: '00:02 p. m.',
      processingTime: 2.1
    },
    {
      id: '2',
      fileName: 'poliza_sur_045.pdf',
      company: 'SUR',
      status: 'Enviado a Velneo',
      time: '04:35 p. m.',
      processingTime: 3.4
    },
    {
      id: '3',
      fileName: 'poliza_sos_023.pdf',
      company: 'SOS',
      status: 'Procesando',
      time: '05:30 p. m.'
    },
    {
      id: '4',
      fileName: 'poliza_bse_002.pdf',
      company: 'BSE',
      status: 'Error',
      time: '04:50 p. m.'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Procesado':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'Procesando':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'Error':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'Enviado a Velneo':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const totalStats = companyStats.reduce((acc, company) => ({
    totalDocs: acc.totalDocs + company.documents,
    totalCost: acc.totalCost + company.cost,
    avgSuccessRate: (acc.avgSuccessRate + company.successRate) / 2,
    avgProcessingTime: (acc.avgProcessingTime + company.avgTime) / 2
  }), {
    totalDocs: 0,
    totalCost: 0,
    avgSuccessRate: 0,
    avgProcessingTime: 0
  });

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Resumen de actividad y estadísticas del sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Documentos Hoy */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Documentos Hoy</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.documentsToday}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 dark:text-gray-500">+12%</p>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">desde ayer</p>
            </div>
          </div>
        </div>

        {/* Costo Hoy */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Costo Hoy</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.costToday.toFixed(2)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 dark:text-gray-500">$84.60</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">este mes</p>
            </div>
          </div>
        </div>

        {/* Tasa de Éxito */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 dark:text-gray-500">promedio</p>
            </div>
          </div>
        </div>

        {/* Tiempo Promedio */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgTime.toFixed(1)}s</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 dark:text-gray-500">por documento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Estadísticas por Compañía */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estadísticas por Compañía</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Rendimiento de cada compañía aseguradora</p>
          </div>
          <div className="p-6">
            {companyStats.length > 0 ? (
              <div className={`grid gap-6 ${
                companyStats.length === 1 ? 'grid-cols-1' :
                companyStats.length === 2 ? 'grid-cols-2' :
                companyStats.length === 3 ? 'grid-cols-1 lg:grid-cols-1' :
                'grid-cols-1 lg:grid-cols-2'
              }`}>
                {companyStats.map((company, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <h4 className="font-bold text-gray-900 dark:text-white">{company.company}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Compañía</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{company.documents}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">docs hoy</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Docs mes:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{company.maxDocuments}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Costo mes:</span>
                        <span className="font-medium text-gray-900 dark:text-white">${company.cost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Éxito:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">{company.successRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Tiempo avg:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{company.avgTime.toFixed(1)}s</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No hay estadísticas disponibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actividad Reciente</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Últimos documentos procesados</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {activity.fileName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                      {activity.processingTime && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {activity.processingTime}s
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;