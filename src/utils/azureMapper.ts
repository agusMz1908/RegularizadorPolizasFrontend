// src/utils/mappers/azureMapper.ts

import { DocumentProcessResult } from '../types/ui/wizard';
import { PolizaFormData } from '../types/core/poliza';

// ✅ Tipos para el mapeo de Azure
export interface AzureFieldMapping {
  azureFieldName: string;
  polizaFieldName: keyof PolizaFormData;
  transformer?: (value: any) => any;
  validator?: (value: any) => boolean;
  priority: number; // 1-10, donde 10 es más prioritario
}

export interface AzureExtractedField {
  field: string;
  value: string | number;
  confidence: number;
  boundingBox?: number[];
  page?: number;
}

export interface AzureMappingResult {
  mappedData: Partial<PolizaFormData>;
  unmappedFields: AzureExtractedField[];
  warnings: string[];
  confidence: number;
  fieldsProcessed: number;
  processingTime: number;
}

export interface AzureProcessingMetadata {
  documentId: string;
  fileName: string;
  totalPages: number;
  processingDate: Date;
  azureVersion: string;
  modelVersion?: string;
}

// ✅ Configuración de mapeo de campos Azure -> PolizaFormData
const AZURE_FIELD_MAPPINGS: AzureFieldMapping[] = [
  // Campos básicos de póliza
  {
    azureFieldName: 'numeroPoliza',
    polizaFieldName: 'numeroPoliza',
    transformer: (value) => String(value).trim().toUpperCase(),
    validator: (value) => Boolean(value && String(value).length >= 3),
    priority: 10
  },
  {
    azureFieldName: 'numero_poliza',
    polizaFieldName: 'numeroPoliza',
    transformer: (value) => String(value).trim().toUpperCase(),
    validator: (value) => Boolean(value && String(value).length >= 3),
    priority: 9
  },
  {
    azureFieldName: 'policy_number',
    polizaFieldName: 'numeroPoliza',
    transformer: (value) => String(value).trim().toUpperCase(),
    validator: (value) => Boolean(value && String(value).length >= 3),
    priority: 8
  },

  // Información del asegurado
  {
    azureFieldName: 'asegurado',
    polizaFieldName: 'asegurado',
    transformer: (value) => String(value).trim().replace(/\s+/g, ' '),
    validator: (value) => Boolean(value && String(value).length >= 2),
    priority: 10
  },
  {
    azureFieldName: 'nombreAsegurado',
    polizaFieldName: 'asegurado',
    transformer: (value) => String(value).trim().replace(/\s+/g, ' '),
    validator: (value) => Boolean(value && String(value).length >= 2),
    priority: 9
  },
  {
    azureFieldName: 'nombre_asegurado',
    polizaFieldName: 'asegurado',
    transformer: (value) => String(value).trim().replace(/\s+/g, ' '),
    validator: (value) => Boolean(value && String(value).length >= 2),
    priority: 8
  },

  // Fechas de vigencia
  {
    azureFieldName: 'vigenciaDesde',
    polizaFieldName: 'vigenciaDesde',
    transformer: (value) => formatDateForForm(value),
    validator: (value) => isValidDate(value),
    priority: 10
  },
  {
    azureFieldName: 'fechaInicio',
    polizaFieldName: 'vigenciaDesde',
    transformer: (value) => formatDateForForm(value),
    validator: (value) => isValidDate(value),
    priority: 9
  },
  {
    azureFieldName: 'vigenciaHasta',
    polizaFieldName: 'vigenciaHasta',
    transformer: (value) => formatDateForForm(value),
    validator: (value) => isValidDate(value),
    priority: 10
  },
  {
    azureFieldName: 'fechaFin',
    polizaFieldName: 'vigenciaHasta',
    transformer: (value) => formatDateForForm(value),
    validator: (value) => isValidDate(value),
    priority: 9
  },

  // Información financiera
  {
    azureFieldName: 'prima',
    polizaFieldName: 'prima',
    transformer: (value) => parseFinancialValue(value),
    validator: (value) => !isNaN(Number(value)) && Number(value) > 0,
    priority: 10
  },
  {
    azureFieldName: 'primaComercial',
    polizaFieldName: 'primaComercial',
    transformer: (value) => parseFinancialValue(value),
    validator: (value) => !isNaN(Number(value)) && Number(value) >= 0,
    priority: 10
  },
  {
    azureFieldName: 'premioTotal',
    polizaFieldName: 'premioTotal',
    transformer: (value) => parseFinancialValue(value),
    validator: (value) => !isNaN(Number(value)) && Number(value) >= 0,
    priority: 10
  },

  // Moneda
  {
    azureFieldName: 'moneda',
    polizaFieldName: 'moneda',
    transformer: (value) => String(value).trim().toUpperCase(),
    validator: (value) => ['PES', 'USD', 'EUR'].includes(String(value).toUpperCase()),
    priority: 10
  },

  // Información del vehículo
  {
    azureFieldName: 'vehiculo',
    polizaFieldName: 'vehiculo',
    transformer: (value) => String(value).trim(),
    validator: (value) => Boolean(value && String(value).length >= 3),
    priority: 10
  },
  {
    azureFieldName: 'marca',
    polizaFieldName: 'marca',
    transformer: (value) => String(value).trim().toUpperCase(),
    validator: (value) => Boolean(value && String(value).length >= 2),
    priority: 10
  },
  {
    azureFieldName: 'modelo',
    polizaFieldName: 'modelo',
    transformer: (value) => String(value).trim(),
    validator: (value) => Boolean(value && String(value).length >= 1),
    priority: 10
  },
  {
    azureFieldName: 'anio',
    polizaFieldName: 'anio',
    transformer: (value) => String(value).trim(),
    validator: (value) => {
      const year = parseInt(String(value));
      return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 2;
    },
    priority: 10
  },
  {
    azureFieldName: 'matricula',
    polizaFieldName: 'matricula',
    transformer: (value) => String(value).trim().toUpperCase().replace(/[^A-Z0-9]/g, ''),
    validator: (value) => {
      const matricula = String(value).trim();
      return matricula.length === 0 || /^[A-Z]{2,3}\d{4}$|^\d{4}[A-Z]{2}$/.test(matricula);
    },
    priority: 10
  },
  {
    azureFieldName: 'chapa',
    polizaFieldName: 'matricula',
    transformer: (value) => String(value).trim().toUpperCase().replace(/[^A-Z0-9]/g, ''),
    validator: (value) => {
      const matricula = String(value).trim();
      return matricula.length === 0 || /^[A-Z]{2,3}\d{4}$|^\d{4}[A-Z]{2}$/.test(matricula);
    },
    priority: 9
  },

  // Información de contacto
  {
    azureFieldName: 'documento',
    polizaFieldName: 'documento',
    transformer: (value) => String(value).trim().replace(/[^0-9]/g, ''),
    validator: (value) => {
      const doc = String(value).replace(/[^0-9]/g, '');
      return doc.length === 0 || (doc.length >= 7 && doc.length <= 9);
    },
    priority: 10
  },
  {
    azureFieldName: 'email',
    polizaFieldName: 'email',
    transformer: (value) => String(value).trim().toLowerCase(),
    validator: (value) => {
      const email = String(value).trim();
      return email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    priority: 10
  },
  {
    azureFieldName: 'telefono',
    polizaFieldName: 'telefono',
    transformer: (value) => String(value).trim().replace(/[^0-9+]/g, ''),
    validator: (value) => {
      const tel = String(value).replace(/[^0-9]/g, '');
      return tel.length === 0 || (tel.length >= 8 && tel.length <= 12);
    },
    priority: 10
  },

  // Información adicional
  {
    azureFieldName: 'motor',
    polizaFieldName: 'motor',
    transformer: (value) => String(value).trim().toUpperCase(),
    validator: (value) => Boolean(value),
    priority: 8
  },
  {
    azureFieldName: 'chasis',
    polizaFieldName: 'chasis',
    transformer: (value) => String(value).trim().toUpperCase(),
    validator: (value) => Boolean(value),
    priority: 8
  },
  {
    azureFieldName: 'combustible',
    polizaFieldName: 'combustible',
    transformer: (value) => String(value).trim().toUpperCase(),
    validator: (value) => ['NAFTA', 'GASOIL', 'GNC', 'ELECTRICO', 'HIBRIDO'].includes(String(value).toUpperCase()),
    priority: 8
  }
];

// ✅ Clase principal del mapper
export class AzureMapper {
  
  /**
   * Mapear datos extraídos de Azure Document Intelligence a PolizaFormData
   */
  static mapAzureToPolizaForm(
    azureResult: DocumentProcessResult,
    metadata?: Partial<AzureProcessingMetadata>
  ): AzureMappingResult {
    const startTime = Date.now();
    const mappedData: Partial<PolizaFormData> = {};
    const unmappedFields: AzureExtractedField[] = [];
    const warnings: string[] = [];
    let totalConfidence = 0;
    let fieldsProcessed = 0;

    // Extraer campos desde diferentes fuentes del resultado de Azure
    const extractedFields = this.extractFieldsFromAzureResult(azureResult);
    
    console.log('🔍 Campos extraídos de Azure:', extractedFields);

    // Procesar cada mapeo
    AZURE_FIELD_MAPPINGS.forEach(mapping => {
      const azureField = extractedFields.find(field => 
        field.field.toLowerCase() === mapping.azureFieldName.toLowerCase()
      );

      if (azureField) {
        try {
          // Transformar valor
          const transformedValue = mapping.transformer 
            ? mapping.transformer(azureField.value)
            : azureField.value;

          // Validar valor transformado
          const isValid = mapping.validator 
            ? mapping.validator(transformedValue)
            : true;

          if (isValid) {
            // Solo mapear si no existe ya un valor con mayor prioridad
            const existingMapping = AZURE_FIELD_MAPPINGS.find(m => 
              m.polizaFieldName === mapping.polizaFieldName && 
              m.priority > mapping.priority &&
              mappedData[m.polizaFieldName] !== undefined
            );

            if (!existingMapping) {
              mappedData[mapping.polizaFieldName] = transformedValue;
              totalConfidence += azureField.confidence;
              fieldsProcessed++;
              
              console.log(`✅ Mapeado: ${mapping.azureFieldName} -> ${mapping.polizaFieldName} = ${transformedValue}`);
            }
          } else {
            warnings.push(`Valor inválido para ${mapping.azureFieldName}: ${azureField.value}`);
          }
        } catch (error) {
          warnings.push(`Error transformando ${mapping.azureFieldName}: ${error}`);
        }
      }
    });

    // Identificar campos no mapeados
    extractedFields.forEach(field => {
      const isMapped = AZURE_FIELD_MAPPINGS.some(mapping => 
        mapping.azureFieldName.toLowerCase() === field.field.toLowerCase()
      );
      
      if (!isMapped) {
        unmappedFields.push(field);
      }
    });

    // Aplicar post-procesamiento
    this.applyPostProcessing(mappedData, warnings);

    // Calcular estadísticas
    const averageConfidence = fieldsProcessed > 0 ? totalConfidence / fieldsProcessed : 0;
    const processingTime = Date.now() - startTime;

    console.log(`🎯 Mapeo completado: ${fieldsProcessed} campos procesados con confianza promedio ${averageConfidence.toFixed(2)}`);

    return {
      mappedData,
      unmappedFields,
      warnings,
      confidence: averageConfidence,
      fieldsProcessed,
      processingTime
    };
  }

  /**
   * Extraer campos desde el resultado de Azure
   */
  private static extractFieldsFromAzureResult(azureResult: DocumentProcessResult): AzureExtractedField[] {
    const fields: AzureExtractedField[] = [];

    // Extraer desde extractedFields si existe
    if (azureResult.extractedFields) {
      if (Array.isArray(azureResult.extractedFields)) {
        // Formato array
        azureResult.extractedFields.forEach(field => {
          if (typeof field === 'object' && field.field && field.value !== undefined) {
            fields.push({
              field: field.field,
              value: field.value,
              confidence: field.confidence || 0.8
            });
          }
        });
      } else if (typeof azureResult.extractedFields === 'object') {
        // Formato objeto
        Object.entries(azureResult.extractedFields).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            fields.push({
              field: key,
              value: value,
              confidence: 0.8 // Confianza por defecto para campos de objeto
            });
          }
        });
      }
    }

    // Extraer desde campos directos del resultado
    const directFields = [
      'numeroPoliza', 'asegurado', 'vigenciaDesde', 'vigenciaHasta', 
      'prima', 'vehiculo', 'marca', 'modelo', 'anio', 'matricula',
      'documento', 'email', 'telefono', 'moneda', 'primaComercial', 
      'premioTotal', 'motor', 'chasis', 'combustible'
    ];

    directFields.forEach(fieldName => {
      if (azureResult[fieldName as keyof DocumentProcessResult] !== undefined) {
        const value = azureResult[fieldName as keyof DocumentProcessResult];
        
        // Evitar duplicados
        const exists = fields.some(f => f.field.toLowerCase() === fieldName.toLowerCase());
        if (!exists) {
          fields.push({
            field: fieldName,
            value: value,
            confidence: azureResult.confidence || 0.8
          });
        }
      }
    });

    return fields;
  }

  /**
   * Post-procesamiento para ajustar datos mapeados
   */
  private static applyPostProcessing(mappedData: Partial<PolizaFormData>, warnings: string[]): void {
    // Ajustar fechas si están en formato incorrecto
    if (mappedData.vigenciaDesde && mappedData.vigenciaHasta) {
      const fechaInicio = new Date(mappedData.vigenciaDesde);
      const fechaFin = new Date(mappedData.vigenciaHasta);
      
      if (fechaInicio > fechaFin) {
        warnings.push('Fecha de inicio es posterior a fecha de fin - verificar manualmente');
      }
    }

    // Validar coherencia de montos
    if (mappedData.prima && mappedData.premioTotal) {
      if (mappedData.prima > mappedData.premioTotal) {
        warnings.push('Prima mayor que premio total - verificar cálculos');
      }
    }

    // Asegurar que la moneda tenga un valor por defecto
    if (!mappedData.moneda) {
      mappedData.moneda = 'PES'; // Peso uruguayo por defecto
      warnings.push('Moneda no detectada - asignado PES por defecto');
    }

    // Normalizar año del vehículo
    if (mappedData.anio) {
      const year = parseInt(String(mappedData.anio));
      if (!isNaN(year) && year > 50 && year < 100) {
        // Convertir años de 2 dígitos (ej: 20 -> 2020)
        mappedData.anio = String(2000 + year);
        warnings.push(`Año del vehículo convertido a formato completo: ${mappedData.anio}`);
      }
    }
  }

  /**
   * Crear observaciones automáticas basadas en el mapeo
   */
  static generateMappingObservations(result: AzureMappingResult, metadata?: AzureProcessingMetadata): string {
    const observations = [];
    
    observations.push('📄 PROCESADO CON AZURE DOCUMENT INTELLIGENCE');
    observations.push('─'.repeat(50));
    
    if (metadata) {
      observations.push(`📁 Archivo: ${metadata.fileName}`);
      observations.push(`📅 Procesado: ${metadata.processingDate.toLocaleString('es-UY')}`);
      if (metadata.totalPages > 1) {
        observations.push(`📄 Páginas: ${metadata.totalPages}`);
      }
    }
    
    observations.push(`🎯 Campos mapeados: ${result.fieldsProcessed}`);
    observations.push(`📊 Confianza promedio: ${(result.confidence * 100).toFixed(1)}%`);
    observations.push(`⏱️ Tiempo de procesamiento: ${result.processingTime}ms`);
    
    if (result.warnings.length > 0) {
      observations.push('');
      observations.push('⚠️ ADVERTENCIAS:');
      result.warnings.forEach(warning => {
        observations.push(`• ${warning}`);
      });
    }
    
    if (result.unmappedFields.length > 0) {
      observations.push('');
      observations.push('📋 CAMPOS NO MAPEADOS:');
      result.unmappedFields.slice(0, 5).forEach(field => {
        observations.push(`• ${field.field}: ${field.value}`);
      });
      
      if (result.unmappedFields.length > 5) {
        observations.push(`• ... y ${result.unmappedFields.length - 5} campos más`);
      }
    }
    
    observations.push('');
    observations.push('✅ Revisar y validar datos antes de procesar');
    
    return observations.join('\n');
  }
}

// ✅ Funciones de utilidad
function formatDateForForm(value: any): string {
  if (!value) return '';
  
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    
    // Formato YYYY-MM-DD para inputs de fecha
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

function isValidDate(value: any): boolean {
  if (!value) return false;
  
  try {
    const date = new Date(value);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

function parseFinancialValue(value: any): number {
  if (typeof value === 'number') return value;
  
  // Limpiar string: remover todo excepto números, puntos y comas
  const cleaned = String(value)
    .replace(/[^\d.,]/g, '')
    .replace(',', '.'); // Convertir coma decimal a punto
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export default AzureMapper;