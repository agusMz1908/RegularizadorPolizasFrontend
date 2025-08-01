// src/hooks/useClientes.ts
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';

/**
 * Hook para búsqueda de clientes con debounce
 * Usa el endpoint /api/clientes/direct?filtro=texto
 */
export const useClientSearch = (searchTerm: string, enabled = true) => {
  return useQuery({
    queryKey: ['clients', 'search', searchTerm],
    queryFn: () => apiService.searchClientes(searchTerm),
    enabled: enabled && searchTerm.trim().length >= 2,
    staleTime: 30 * 1000, // 30 segundos
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook para obtener cliente específico por ID
 */
export const useClientById = (clientId: number, enabled = true) => {
  return useQuery({
    queryKey: ['clients', 'byId', clientId],
    queryFn: () => apiService.getClienteById(clientId),
    enabled: enabled && !!clientId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};