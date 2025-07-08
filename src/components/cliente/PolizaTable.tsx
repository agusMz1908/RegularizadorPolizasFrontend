import React from 'react';
import { Poliza } from '../../types/poliza';
import { Table } from '../common/Table';

interface PolizaTableProps {
  polizas: Poliza[];
  loading?: boolean;
  onPolizaSelect?: (poliza: Poliza) => void;
  className?: string;
}

export const PolizaTable: React.FC<PolizaTableProps> = ({
  polizas,
  loading = false,
  onPolizaSelect,
  className = '',
}) => {
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Vigente':
        return 'bg-green-100 text-green-800';
      case 'Vencida':
        return 'bg-red-100 text-red-800';
      case 'Cancelada':
        return 'bg-gray-100 text-gray-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'UYU') => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: currency === 'UYU' ? 'UYU' : 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      key: 'fechaDesde',
      title: 'Desde',
      sortable: true,
      width: '100px',
      render: (value: string) => (
        <span className="text-sm text-gray-900">{value}</span>
      ),
    },
    {
      key: 'fechaHasta',
      title: 'Hasta',
      sortable: true,
      width: '100px',
      render: (value: string) => (
        <span className="text-sm text-gray-900">{value}</span>
      ),
    },
    {
      key: 'compania',
      title: 'Compañía',
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-blue-600">{value}</span>
      ),
    },
    {
      key: 'ramo',
      title: 'Ramo',
      sortable: true,
      render: (value: string) => (
        <span className="text-gray-900">{value}</span>
      ),
    },
    {
      key: 'numero',
      title: 'Póliza',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm text-gray-900">{value}</span>
      ),
    },
    {
      key: 'estado',
      title: 'Estado',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'prima',
      title: 'Prima',
      align: 'right' as const,
      render: (value: number, row: Poliza) => (
        <span className="text-sm text-gray-900">
          {value > 0 ? formatCurrency(value, row.moneda) : '-'}
        </span>
      ),
    },
  ];

  return (
    <Table
      data={polizas}
      columns={columns}
      loading={loading}
      onRowClick={onPolizaSelect}
      rowClassName={() => 'hover:bg-gray-50'}
      emptyMessage="No hay pólizas para mostrar"
      className={className}
    />
  );
};