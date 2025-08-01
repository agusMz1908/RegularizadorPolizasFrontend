// src/hooks/useCompaniesAndSections.ts
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';

/**
 * Hook para obtener compañías disponibles (filtradas para alcance inicial)
 */
export const useAvailableCompanies = () => {
  return useQuery({
    queryKey: ['companies', 'available'],
    queryFn: () => apiService.getAvailableCompanies(),
    staleTime: 10 * 60 * 1000, // 10 minutos - los maestros no cambian frecuentemente
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook para obtener secciones disponibles (filtradas para alcance inicial)
 */
export const useAvailableSections = () => {
  return useQuery({
    queryKey: ['sections', 'available'],
    queryFn: () => apiService.getAvailableSections(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook para obtener todas las compañías (sin filtro)
 */
export const useAllCompanies = () => {
  return useQuery({
    queryKey: ['companies', 'all'],
    queryFn: () => apiService.getCompanies(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook para obtener todas las secciones (sin filtro)
 */
export const useAllSections = () => {
  return useQuery({
    queryKey: ['sections', 'all'],
    queryFn: () => apiService.getSecciones(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};