// src/hooks/useClientesReal.ts
import { useState, useEffect, useCallback } from 'react';
import { Cliente } from '../types/cliente';
import { Poliza } from '../types/poliza';
import { velneoClienteService } from '../services/velneoClienteService';

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [polizasCliente, setPolizasCliente] = useState<Poliza[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPolizas, setLoadingPolizas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Cargando clientes desde Velneo...');
      const clientesData = await velneoClienteService.getClientes();
      console.log('✅ Clientes cargados:', clientesData.length);
      setClientes(clientesData);
    } catch (err: any) {
      console.error('❌ Error cargando clientes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPolizasCliente = useCallback(async (clienteId: number) => {
    setLoadingPolizas(true);
    setError(null);
    try {
      console.log('🔄 Cargando pólizas para cliente:', clienteId);
      const polizasData = await velneoClienteService.getPolizasByCliente(clienteId);
      console.log('✅ Pólizas cargadas:', polizasData.length);
      setPolizasCliente(polizasData);
    } catch (err: any) {
      console.error('❌ Error cargando pólizas:', err);
      setError(err.message);
      setPolizasCliente([]); 
    } finally {
      setLoadingPolizas(false);
    }
  }, []);

  const selectCliente = useCallback((cliente: Cliente) => {
    console.log('👤 Cliente seleccionado:', cliente.nombre);
    setClienteSeleccionado(cliente);
    loadPolizasCliente(cliente.id);
  }, [loadPolizasCliente]);


  const clearClienteSeleccionado = useCallback(() => {
    console.log('🧹 Limpiando selección de cliente');
    setClienteSeleccionado(null);
    setPolizasCliente([]);
  }, []);

  const searchClientes = useCallback(async (query: string) => {
    if (!query.trim()) {
      loadClientes();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Buscando clientes:', query);
      const resultados = await velneoClienteService.searchClientes(query);
      console.log('✅ Resultados encontrados:', resultados.length);
      setClientes(resultados);
    } catch (err: any) {
      console.error('❌ Error buscando clientes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadClientes]);

  const refreshClientes = useCallback(() => {
    console.log('🔄 Refrescando lista de clientes...');
    loadClientes();
  }, [loadClientes]);

  const refreshPolizas = useCallback(() => {
    if (clienteSeleccionado) {
      console.log('🔄 Refrescando pólizas del cliente seleccionado...');
      loadPolizasCliente(clienteSeleccionado.id);
    }
  }, [clienteSeleccionado, loadPolizasCliente]);

  const getClienteById = useCallback(async (id: number): Promise<Cliente | null> => {
    try {
      console.log('🔍 Obteniendo cliente por ID:', id);
      return await velneoClienteService.getClienteById(id);
    } catch (err: any) {
      console.error('❌ Error obteniendo cliente:', err);
      setError(err.message);
      return null;
    }
  }, []);

  const stats = {
    totalClientes: clientes.length,
    clientesActivos: clientes.filter(c => c.activo).length,
    totalPolizas: polizasCliente.length,
    polizasVigentes: polizasCliente.filter(p => p.estado === 'Vigente').length,
    polizasPendientes: polizasCliente.filter(p => p.estado === 'Pendiente').length,
  };

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  useEffect(() => {
    if (clientes.length > 0) {
      setError(null);
    }
  }, [clientes]);

  return {
    clientes,
    clienteSeleccionado,
    polizasCliente,
    stats,
    
    loading,
    loadingPolizas,
    error,
    
    selectCliente,
    clearClienteSeleccionado,
    searchClientes,
    refreshClientes,
    refreshPolizas,
    getClienteById,
    
    hasClientes: clientes.length > 0,
    hasPolizas: polizasCliente.length > 0,
    isClienteSelected: !!clienteSeleccionado,
  };
};