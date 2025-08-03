// src/pages/Dashboard.tsx - ADAPTATIVO CON SISTEMA DE TEMAS
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
          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
            <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
          </div>
        );
      case 'error': 
        return (
          <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
          </div>
        );
      default: 
        return (
          <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
            <Clock className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
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
    <div className="w-full h-full p-4 lg:p-6 space-y-6 bg-background min-h-screen">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gradient-primary">
          {getGreeting()}, {user?.nombre}
        </h1>
        <p className="text-lg text-muted-foreground">
          Bienvenido al sistema de procesamiento automático de pólizas
        </p>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1 bg-card backdrop-blur-sm px-3 py-1 rounded-full border">
            <Building2 className="h-4 w-4 text-primary" />
            <span>Tenant: {user?.tenantId}</span>
          </div>
          <div className="flex items-center space-x-1 bg-card backdrop-blur-sm px-3 py-1 rounded-full border">
            <Car className="h-4 w-4 text-green-500" />
            <span>Alcance: BSE - AUTOMÓVILES</span>
          </div>
          <div className="flex items-center space-x-1 bg-card backdrop-blur-sm px-3 py-1 rounded-full border">
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

      {/* Metrics Cards - ADAPTATIVAS CON SISTEMA DE TEMAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Escaneos del Mes */}
        <Card className="card-enhanced hover-lift">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Escaneos del Mes
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gradient-primary">{mockMetrics.monthlyScans}</p>
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-300 font-medium">+15%</span>
                </div>
                <span className="text-muted-foreground">vs mes anterior</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="card-enhanced hover-lift">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue del Mes
              </CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gradient-secondary">
                ${mockMetrics.totalRevenue.toFixed(2)}
              </p>
              <div className="text-sm text-muted-foreground">
                Tier actual: <Badge variant="outline" className="border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30">{mockMetrics.currentTier}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tiempo Promedio */}
        <Card className="card-enhanced hover-lift">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tiempo Promedio
              </CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">{mockMetrics.averageProcessingTime}s</p>
              <div className="text-sm text-muted-foreground">
                Procesamiento Azure
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasa de Éxito */}
        <Card className="card-enhanced hover-lift">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tasa de Éxito
              </CardTitle>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">{mockMetrics.successRate}%</p>
              <div className="text-sm text-muted-foreground">
                Excelente performance
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress hacia próximo tier */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-foreground">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Progreso del Tier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hasta TIER_2</span>
                <span className="text-foreground">{mockMetrics.monthlyScans}/{mockMetrics.nextTierAt}</span>
              </div>
              <Progress value={getTierProgress()} className="h-2" />
            </div>
            <div className="text-sm text-muted-foreground">
              Te faltan {mockMetrics.nextTierAt - mockMetrics.monthlyScans} escaneos para alcanzar TIER_2
            </div>
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-foreground">
                <strong>Beneficio:</strong> Precio reducido de $2.50 → $2.00 por escaneo
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-foreground">
              <Clock className="h-5 w-5 mr-2 text-primary" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMetrics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.document}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.client}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(activity.status)}
                    <p className="text-xs text-muted-foreground mt-1">hace {activity.time}</p>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full hover-lift">
                <Eye className="h-4 w-4 mr-2" />
                Ver Historial Completo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Footer */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-emerald-900 dark:text-emerald-100">Sistema Operativo</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Todos los servicios funcionando correctamente
                </p>
              </div>
            </div>
            <div className="text-right text-sm space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400">Azure Document Intelligence:</span>
                <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 px-2 py-1 rounded-full text-xs font-medium">✅ Activo</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400">API Velneo:</span>
                <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 px-2 py-1 rounded-full text-xs font-medium">✅ Activo</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400">Base de Datos:</span>
                <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 px-2 py-1 rounded-full text-xs font-medium">✅ Activo</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;