// src/utils/mappingHelpers.ts
import type { MappedField, PolicyMappingResult } from '../types/mappings';

export const getConfidenceLevel = (confidence: number): 'high' | 'medium' | 'low' | 'failed' => {
  if (confidence >= 90) return 'high';
  if (confidence >= 70) return 'medium';
  if (confidence >= 50) return 'low';
  return 'failed';
};

export const getConfidenceColor = (level: string): string => {
  switch (level) {
    case 'high': return 'text-green-600 bg-green-50 border-green-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'failed': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getConfidenceText = (level: string, confidence: number): string => {
  switch (level) {
    case 'high': return `Alta Confianza (${confidence}%)`;
    case 'medium': return `Media Confianza (${confidence}%)`;
    case 'low': return `Baja Confianza (${confidence}%)`;
    case 'failed': return 'Mapeo Fallido (0%)';
    default: return 'Sin Mapeo';
  }
};

export const getConfidenceReason = (mappedField: MappedField): string => {
  const confidence = mappedField.confianza;
  
  if (confidence >= 95) return 'Coincidencia exacta';
  if (confidence >= 85) return 'Similitud muy alta';
  if (confidence >= 70) return 'Similitud alta';
  if (confidence >= 50) return 'Similitud parcial';
  return 'Sin coincidencias encontradas';
};

export const formatMappedValue = (value: any): string => {
  if (!value) return 'No mapeado';
  
  if (typeof value === 'object' && value !== null) {
    return value.nombre || value.descripcion || value.codigo || JSON.stringify(value);
  }
  
  return String(value);
};

export const isRequiredFieldFailed = (fieldName: string, failedFields: string[], requiredFields: string[]): boolean => {
  return requiredFields.includes(fieldName) && failedFields.includes(fieldName);
};

export const calculateOverallProgress = (mappingResult: PolicyMappingResult, totalFields: number): number => {
  const successfulFields = Object.keys(mappingResult.camposMapeados).length - mappingResult.camposQueFallaronMapeo.length;
  return Math.round((successfulFields / totalFields) * 100);
};