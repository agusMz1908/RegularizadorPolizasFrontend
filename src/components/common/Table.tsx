import React from 'react';
import { ChevronUp, ChevronDown, Filter } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  onRowClick?: (row: T, index: number) => void;
  selectedRows?: T[];
  onRowSelect?: (row: T, selected: boolean) => void;
  emptyMessage?: string;
  className?: string;
  rowClassName?: (row: T, index: number) => string;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  selectedRows = [],
  onRowSelect,
  emptyMessage = 'No hay datos para mostrar',
  className = '',
  rowClassName,
}: TableProps<T>) {
  const handleSort = (column: Column<T>) => {
    if (column.sortable && onSort) {
      onSort(column.key as string);
    }
  };

  const getValue = (row: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], row);
    }
    return row[key as keyof T];
  };

  const isSelected = (row: T): boolean => {
    return selectedRows.some(selected => selected === row);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.width ? `w-${column.width}` : ''}`}
                  style={{ textAlign: column.align || 'left' }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={`w-3 h-3 ${
                            sortBy === column.key && sortOrder === 'asc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        />
                        <ChevronDown
                          className={`w-3 h-3 -mt-1 ${
                            sortBy === column.key && sortOrder === 'desc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`${
                    onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                  } ${
                    isSelected(row) ? 'bg-blue-50' : ''
                  } ${
                    rowClassName ? rowClassName(row, rowIndex) : ''
                  }`}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {columns.map((column, colIndex) => {
                    const value = getValue(row, column.key);
                    const cellContent = column.render
                      ? column.render(value, row, rowIndex)
                      : value?.toString() || '';

                    return (
                      <td
                        key={colIndex}
                        className="px-4 py-3 text-sm text-gray-900"
                        style={{ textAlign: column.align || 'left' }}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}