// src/components/pages/Dashboard.tsx - CORREGIDO
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus,
  FileText,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Car,
  Building2,
  Calendar,
  Eye,
  BarChart3,
  Users
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface DashboardProps {
  onStartWizard: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartWizard }) => {
  const { user } = useAuth();

  // Datos mock para el dashboard - en producción vendrían del backend
  const mockMetrics = {
    monthlyScans: 23,
    totalRevenue: 57.50,
    averageProcessingTime: 2.3,
    successRate: 95.7,
    currentTier: 'TIER_1',
    nextTierAt: 50,
    recentActivity: [
      { id: 1, document: 'Poliza-9128263-4.pdf', status: 'completed', time: '2 horas', client: 'RAYDORAT SA' },
      { id: 2, document: 'Poliza-8765432-1.pdf', status: 'completed', time: '4 horas', client: 'EMPRESA XYZ' },
      { id: 3, document: 'Poliza-5432187-2.pdf', status: 'error', time: '6 horas', client: 'COMERCIAL ABC' }
    ]
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getTierProgress = () => {
    return (mockMetrics.monthlyScans / mockMetrics.nextTierAt) * 100;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': 
        return (
          <div className="p-1.5 bg-green-100 rounded-full">
            <CheckCircle className="h-3 w-3 text-green-600" />
          </div>
        );
      case 'error': 
        return (
          <div className="p-1.5 bg-red-100 rounded-full">
            <AlertTriangle className="h-3 w-3 text-red-600" />
          </div>
        );
      default: 
        return (
          <div className="p-1.5 bg-yellow-100 rounded-full">
            <Clock className="h-3 w-3 text-yellow-600" />
          </div>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': 
        return (
          <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-600 border-0 shadow-sm">
            ✓ Completado
          </Badge>
        );
      case 'error': 
        return (
          <Badge variant="default" className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 shadow-sm">
            ✗ Error
          </Badge>
        );
      default: 
        return (
          <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0 shadow-sm">
            ⏳ Procesando
          </Badge>
        );
    }
  };

  return (
    <div className="w-full h-full p-4 lg:p-6 space-y-6 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {getGreeting()}, {user?.nombre}
        </h1>
        <p className="text-lg text-gray-700">
          Bienvenido al sistema de procesamiento automático de pólizas
        </p>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full">
            <Building2 className="h-4 w-4 text-blue-500" />
            <span>Tenant: {user?.tenantId}</span>
          </div>
          <div className="flex items-center space-x-1 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full">
            <Car className="h-4 w-4 text-green-500" />
            <span>Alcance: BSE - AUTOMÓVILES</span>
          </div>
          <div className="flex items-center space-x-1 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span>{new Date().toLocaleDateString('es-UY', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">Nueva Póliza</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Escanear documento PDF
                </p>
                <Button 
                  onClick={onStartWizard}
                  variant="secondary"
                  size="sm"
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Iniciar Wizard
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 blur-xl rounded-full"></div>
                <FileText className="relative h-12 w-12 text-blue-200" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Analytics</h3>
                <p className="text-purple-100 text-sm mb-4">
                  Métricas y reportes
                </p>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Próximamente</Badge>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 blur-xl rounded-full"></div>
                <BarChart3 className="relative h-12 w-12 text-purple-200" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Facturación</h3>
                <p className="text-green-100 text-sm mb-4">
                  Cobros por volumen
                </p>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Próximamente</Badge>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 blur-xl rounded-full"></div>
                <DollarSign className="relative h-12 w-12 text-green-200" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Historial</h3>
                <p className="text-orange-100 text-sm mb-4">
                  Pólizas procesadas
                </p>
                <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Todo
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 blur-xl rounded-full"></div>
                <Clock className="relative h-12 w-12 text-orange-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Escaneos del Mes */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Escaneos del Mes
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{mockMetrics.monthlyScans}</p>
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-700 font-medium">+15%</span>
                </div>
                <span className="text-gray-500">vs mes anterior</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Revenue del Mes
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ${mockMetrics.totalRevenue.toFixed(2)}
              </p>
              <div className="text-sm text-gray-500">
                Tier actual: <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">{mockMetrics.currentTier}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tiempo Promedio */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tiempo Promedio
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {mockMetrics.averageProcessingTime}s
              </p>
              <div className="text-sm text-gray-500">
                Procesamiento Azure
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasa de Éxito */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tasa de Éxito
              </CardTitle>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {mockMetrics.successRate}%
              </p>
              <div className="text-sm text-emerald-600 font-medium">
                Excelente performance
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progreso hacia próximo Tier */}
        <Card className="lg:col-span-1 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              Progreso del Tier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Hacia TIER_2</span>
                <span className="text-blue-600 font-bold">{mockMetrics.monthlyScans}/{mockMetrics.nextTierAt}</span>
              </div>
              <div className="relative">
                <Progress value={getTierProgress()} className="h-3 bg-gray-200" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-80" style={{ width: `${getTierProgress()}%` }}></div>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                Te faltan <strong className="text-blue-600">{mockMetrics.nextTierAt - mockMetrics.monthlyScans} escaneos</strong> para
                alcanzar TIER_2
              </p>
              <p className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                <strong className="text-green-800">Beneficio:</strong> Precio reducido de $2.50 → $2.00 por escaneo
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card className="lg:col-span-2 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMetrics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-gradient-to-br from-blue-100 to-purple-100">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.document}</p>
                      <p className="text-sm text-gray-600">{activity.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(activity.status)}
                    <p className="text-xs text-gray-500 mt-1">hace {activity.time}</p>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-200 transition-all duration-200">
                <Eye className="h-4 w-4 mr-2" />
                Ver Historial Completo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Footer */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-emerald-900">Sistema Operativo</p>
                <p className="text-sm text-emerald-700">
                  Todos los servicios funcionando correctamente
                </p>
              </div>
            </div>
            <div className="text-right text-sm space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-emerald-600">Azure Document Intelligence:</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">✅ Activo</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-600">API Velneo:</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">✅ Activo</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-600">Base de Datos:</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">✅ Activo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;