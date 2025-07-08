import React from 'react';
import { Cliente } from '../../types/cliente';
import { Table } from '../common/Table';

interface ClienteTableProps {
  clientes: Cliente[];
  clienteSeleccionado?: Cliente | null;
  onClienteSelect: (cliente: Cliente) => void;
  loading?: boolean;
  className?: string;
}

export const ClienteTable: React.FC<ClienteTableProps> = ({
  clientes,
  clienteSeleccionado,
  onClienteSelect,
  loading = false,
  className = '',
}) => {
  const columns = [
    {
      key: 'nombre',
      title: 'Nombre',
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'documento',
      title: 'Documento',
      sortable: true,
      render: (value: string) => (
        <span className="text-gray-600">{value}</span>
      ),
    },
    {
      key: 'telefono',
      title: 'Teléfono',
      render: (value: string) => (
        <span className="text-gray-600">{value || '-'}</span>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      render: (value: string) => (
        <span className="text-gray-600">{value || '-'}</span>
      ),
    },
    {
      key: 'direccion',
      title: 'Dirección',
      render: (value: string) => (
        <span className="text-gray-600 truncate max-w-xs" title={value}>
          {value}
        </span>
      ),
    },
    {
      key: 'activo',
      title: 'Estado',
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <Table
      data={clientes}
      columns={columns}
      loading={loading}
      onRowClick={onClienteSelect}
      rowClassName={(cliente) => 
        clienteSeleccionado?.id === cliente.id ? 'bg-blue-100' : 'hover:bg-blue-50'
      }
      emptyMessage="No se encontraron clientes"
      className={className}
    />
  );
};