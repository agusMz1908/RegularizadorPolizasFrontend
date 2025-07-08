import { useState, useEffect, useCallback } from 'react';
import { Cliente } from '../types/cliente';
import { Poliza } from '../types/poliza';
import { FilterParams } from '../types/common';
import { clienteService } from '../services/clienteService';

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [polizasCliente, setPolizasCliente] = useState<Poliza[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FilterParams>({});

  const loadClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await clienteService.getClientes(
        { page: 1, limit: 100 },
        filtros
      );
      setClientes(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  const loadPolizasCliente = useCallback(async (clienteId: number) => {
    try {
      const polizas = await clienteService.getPolizasByCliente(clienteId);
      setPolizasCliente(polizas);
    } catch (err: any) {
      console.error('Error loading client policies:', err);
      setPolizasCliente([]);
    }
  }, []);

  const selectCliente = useCallback((cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    loadPolizasCliente(cliente.id);
  }, [loadPolizasCliente]);

  const clearClienteSeleccionado = useCallback(() => {
    setClienteSeleccionado(null);
    setPolizasCliente([]);
  }, []);

  const searchClientes = useCallback(async (query: string) => {
    if (!query.trim()) {
      loadClientes();
      return;
    }

    setLoading(true);
    try {
      const resultados = await clienteService.searchClientes(query);
      setClientes(resultados);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadClientes]);

  const updateFiltros = useCallback((newFiltros: FilterParams) => {
    setFiltros(newFiltros);
  }, []);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  return {
    clientes,
    clienteSeleccionado,
    polizasCliente,
    loading,
    error,
    filtros,
    selectCliente,
    clearClienteSeleccionado,
    searchClientes,
    updateFiltros,
    refreshClientes: loadClientes,
  };
};