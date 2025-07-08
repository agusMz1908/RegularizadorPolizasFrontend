import React from 'react';
import { Users, FileText, TrendingUp, AlertCircle } from 'lucide-react';

interface ClienteStatsProps {
  totalClientes: number;
  clientesActivos: number;
  totalPolizas: number;
  polizasPendientes: number;
  className?: string;
}

export const ClienteStats: React.FC<ClienteStatsProps> = ({
  totalClientes,
  clientesActivos,
  totalPolizas,
  polizasPendientes,
  className = '',
}) => {
  const stats = [
    {
      title: 'Total Clientes',
      value: totalClientes,
      icon: Users,
      color: 'blue',
      subtext: `${clientesActivos} activos`,
    },
    {
      title: 'Total Pólizas',
      value: totalPolizas,
      icon: FileText,
      color: 'green',
      subtext: 'Este mes',
    },
    {
      title: 'Crecimiento',
      value: '+12%',
      icon: TrendingUp,
      color: 'purple',
      subtext: 'vs mes anterior',
    },
    {
      title: 'Pendientes',
      value: polizasPendientes,
      icon: AlertCircle,
      color: 'yellow',
      subtext: 'Requieren atención',
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-700';
      case 'green':
        return 'bg-green-50 text-green-700';
      case 'purple':
        return 'bg-purple-50 text-purple-700';
      case 'yellow':
        return 'bg-yellow-50 text-yellow-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
            </div>
            <div className={`p-3 rounded-full ${getColorClasses(stat.color)}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};