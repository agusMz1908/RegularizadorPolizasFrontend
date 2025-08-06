// src/utils/mappingHelper.ts - ✅ CORREGIDO PARA ESTRUCTURA REAL DE AZURE

import type { PolicyFormData } from '../types/poliza';
import type { MasterDataOptionsDto, CategoriaDto, DestinoDto, CalidadDto, CombustibleDto, MonedaDto } from '../types/masterData';
import type { AzureProcessResponse } from '../types/azureDocumentResult';

/**
 * 🔄 MAPEO INTELIGENTE DE AZURE A FORMULARIO - ESTRUCTURA CORRECTA
 */
export class MappingHelper {
  
  /**
   * Mapear datos de Azure al formulario
   * ✅ CORREGIDO: Ahora usa la estructura real azureData.datosVelneo.xxx
   */
  static mapAzureToFormData(
    azureData: AzureProcessResponse, 
    masterOptions?: MasterDataOptionsDto | null
  ): Partial<PolicyFormData> {
    const mappedData: Partial<PolicyFormData> = {};

    try {
      // ✅ VERIFICAR QUE EXISTAN LOS DATOS PRINCIPALES
      if (!azureData.datosVelneo) {
        console.warn('⚠️ [MappingHelper] No hay datosVelneo en la respuesta de Azure');
        return mappedData;
      }

      const { datosVelneo } = azureData;

      // ✅ DATOS BÁSICOS - ESTRUCTURA CORRECTA
      if (datosVelneo.datosBasicos) {
        const basicos = datosVelneo.datosBasicos;
        mappedData.asegurado = basicos.asegurado || '';
        mappedData.corredor = basicos.corredor || '';
        mappedData.domicilio = basicos.domicilio || '';
        mappedData.tramite = basicos.tramite || '';
        mappedData.asignado = basicos.asignado || '';
        mappedData.tipo = basicos.tipo || '';
        
        // Mapear fecha si existe
        if (basicos.fecha) {
          mappedData.fecha = this.formatDateForForm(basicos.fecha);
        }
      }

      // ✅ DATOS PÓLIZA - ESTRUCTURA CORRECTA  
      if (datosVelneo.datosPoliza) {
        const poliza = datosVelneo.datosPoliza;
        mappedData.poliza = poliza.numeroPoliza || '';
        mappedData.certificado = poliza.certificado || '';
        
        // Formatear fechas de vigencia
        if (poliza.desde) {
          mappedData.desde = this.formatDateForForm(poliza.desde);
        }
        if (poliza.hasta) {
          mappedData.hasta = this.formatDateForForm(poliza.hasta);
        }
      }

      // ✅ DATOS VEHÍCULO - ESTRUCTURA CORRECTA
      if (datosVelneo.datosVehiculo) {
        const vehiculo = datosVelneo.datosVehiculo;
        mappedData.marcaModelo = vehiculo.marcaModelo || '';
        mappedData.anio = vehiculo.anio || '';
        mappedData.matricula = vehiculo.matricula || '';
        mappedData.motor = vehiculo.motor || '';
        mappedData.chasis = vehiculo.chasis || '';
        
        // ✅ MAPEAR MAESTROS DE VEHÍCULO (si están disponibles)
        if (masterOptions) {
          mappedData.combustibleId = this.mapCombustible(vehiculo.combustible, masterOptions.combustibles);
          mappedData.destinoId = this.mapDestino(vehiculo.destino, masterOptions.destinos);
          mappedData.categoriaId = this.mapCategoria(vehiculo.categoria, masterOptions.categorias);
          mappedData.calidadId = this.mapCalidad(vehiculo.calidad, masterOptions.calidades);
        }
      }

      // ✅ CONDICIONES PAGO - ESTRUCTURA CORRECTA
      if (datosVelneo.condicionesPago) {
        const pago = datosVelneo.condicionesPago;
        mappedData.premio = this.parseNumber(pago.premio);
        mappedData.total = this.parseNumber(pago.total);
        mappedData.cuotas = this.parseNumber(pago.cuotas) || 1;
        mappedData.valorCuota = this.parseNumber(pago.valorCuota);
        mappedData.formaPago = pago.formaPago || '';
      }

      // ✅ DATOS COBERTURA - ESTRUCTURA CORRECTA
      if (datosVelneo.datosCobertura) {
        const cobertura = datosVelneo.datosCobertura;
        mappedData.zonaCirculacion = cobertura.zonaCirculacion || '';
        
        // Mapear moneda si está disponible
        if (masterOptions && cobertura.moneda) {
          mappedData.monedaId = this.mapMoneda(cobertura.moneda, masterOptions.monedas);
        }
      }

      console.log('✅ [MappingHelper] Mapeo de Azure completado:', {
        camposMapeados: Object.keys(mappedData).length,
        porcentajeCompletitud: azureData.porcentajeCompletitud,
        datosCompletos: this.countCompletedFields(mappedData),
        datos: process.env.NODE_ENV === 'development' ? mappedData : '[hidden in production]'
      });

    } catch (error) {
      console.error('❌ [MappingHelper] Error en mapeo:', error);
    }

    return mappedData;
  }

  // ===== MÉTODOS DE MAPEO ESPECÍFICOS =====

  /**
   * ✅ Mapear combustible de texto a ID
   */
  private static mapCombustible(combustibleTexto: string | undefined, combustibles: CombustibleDto[] = []): string | undefined {
    if (!combustibleTexto || !combustibles.length) return undefined;

    const texto = combustibleTexto.toLowerCase().trim();
    
    // Mapeo directo por patrones conocidos
    const mapeoDirecto = {
      'gasolina': ['GAS'],
      'diesel': ['DIS'],
      'electrico': ['ELE'],
      'hibrido': ['HYB'],
      'gas': ['GAS'],
      'nafta': ['GAS']
    };

    // Buscar coincidencia directa
    for (const [patron, ids] of Object.entries(mapeoDirecto)) {
      if (texto.includes(patron)) {
        const found = combustibles.find(c => ids.includes(c.id));
        if (found) return found.id;
      }
    }

    // Buscar en la lista de combustibles disponibles
    const exactMatch = combustibles.find(c => 
      c.name.toLowerCase().includes(texto) || 
      texto.includes(c.name.toLowerCase())
    );
    
    if (exactMatch) return exactMatch.id;

    // Fallback: primer combustible disponible
    return combustibles[0]?.id;
  }

  /**
   * ✅ Mapear destino de texto a ID
   */
  private static mapDestino(destinoTexto: string | undefined, destinos: DestinoDto[] = []): number | undefined {
    if (!destinoTexto || !destinos.length) return undefined;

    const texto = destinoTexto.toLowerCase().trim();
    
    // Buscar coincidencia exacta
    const exacto = destinos.find(d => 
      d.desnom.toLowerCase().includes(texto) || 
      texto.includes(d.desnom.toLowerCase())
    );
    
    if (exacto) return exacto.id;

    // Mapeo por patrones comunes
    const patrones = {
      'particular': ['particular', 'personal', 'privado'],
      'comercial': ['comercial', 'trabajo', 'empresa', 'negocio'],
      'taxi': ['taxi', 'remise'],
      'carga': ['carga', 'transporte']
    };

    for (const [categoria, keywords] of Object.entries(patrones)) {
      if (keywords.some(keyword => texto.includes(keyword))) {
        const found = destinos.find(d => d.desnom.toLowerCase().includes(categoria));
        if (found) return found.id;
      }
    }

    // Fallback: primer destino disponible
    return destinos[0]?.id;
  }

  /**
   * ✅ Mapear categoría de texto a ID
   */
  private static mapCategoria(categoriaTexto: string | undefined, categorias: CategoriaDto[] = []): number | undefined {
    if (!categoriaTexto || !categorias.length) return undefined;

    const texto = categoriaTexto.toLowerCase().trim();
    
    // Buscar coincidencia exacta
    const exacto = categorias.find(c => 
      c.catdsc.toLowerCase().includes(texto) || 
      texto.includes(c.catdsc.toLowerCase())
    );
    
    if (exacto) return exacto.id;

    // Mapeo por patrones
    const patrones = {
      'auto': ['auto', 'sedan', 'hatchback', 'coupe'],
      'camion': ['camion', 'truck', 'carga'],
      'moto': ['moto', 'motocicleta', 'scooter'],
      'pick': ['pickup', 'pick-up', 'camioneta']
    };

    for (const [categoria, keywords] of Object.entries(patrones)) {
      if (keywords.some(keyword => texto.includes(keyword))) {
        const found = categorias.find(c => c.catdsc.toLowerCase().includes(categoria));
        if (found) return found.id;
      }
    }

    // Fallback: primera categoría disponible
    return categorias[0]?.id;
  }

  /**
   * ✅ Mapear calidad de texto a ID
   */
  private static mapCalidad(calidadTexto: string | undefined, calidades: CalidadDto[] = []): number | undefined {
    if (!calidadTexto || !calidades.length) return undefined;

    const texto = calidadTexto.toLowerCase().trim();
    
    // Buscar coincidencia exacta
    const exacto = calidades.find(c => 
      c.caldsc.toLowerCase().includes(texto) || 
      texto.includes(c.caldsc.toLowerCase())
    );
    
    if (exacto) return exacto.id;

    // Patrones comunes de calidad
    const patrones = {
      'propietario': ['propietario', 'dueño', 'titular'],
      'conductor': ['conductor', 'chofer', 'maneja'],
      'otros': ['otros', 'terceros', 'familiar']
    };

    for (const [categoria, keywords] of Object.entries(patrones)) {
      if (keywords.some(keyword => texto.includes(keyword))) {
        const found = calidades.find(c => c.caldsc.toLowerCase().includes(categoria));
        if (found) return found.id;
      }
    }

    // Fallback: primera calidad disponible
    return calidades[0]?.id;
  }

  /**
   * ✅ Mapear moneda de texto a ID
   */
  private static mapMoneda(monedaTexto: string | undefined, monedas: MonedaDto[] = []): number | undefined {
    if (!monedaTexto || !monedas.length) return undefined;

    const texto = monedaTexto.toLowerCase().trim();
    
    // Buscar por código, símbolo o nombre
    const porCodigo = monedas.find(m => 
      m.codigo?.toLowerCase() === texto ||
      m.simbolo?.toLowerCase() === texto ||
      m.nombre.toLowerCase().includes(texto)
    );
    
    if (porCodigo) return porCodigo.id;

    // Mapeo por patrones comunes
    const patrones = {
      'peso': ['peso', '$u', 'uyu', 'pes'],
      'dolar': ['dolar', 'dollar', 'usd', '$'],
      'euro': ['euro', 'eur', '€'],
      'real': ['real', 'brl', 'r$']
    };

    for (const [moneda, keywords] of Object.entries(patrones)) {
      if (keywords.some(keyword => texto.includes(keyword))) {
        const found = monedas.find(m => 
          m.nombre.toLowerCase().includes(moneda) || 
          (m.codigo && keywords.includes(m.codigo.toLowerCase()))
        );
        if (found) return found.id;
      }
    }

    // Fallback: primera moneda disponible
    return monedas[0]?.id;
  }

  // ===== MÉTODOS UTILITARIOS =====

  /**
   * ✅ Formatear fecha para el formulario (YYYY-MM-DD)
   */
  private static formatDateForForm(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.warn('⚠️ [MappingHelper] Error formateando fecha:', dateString);
      return '';
    }
  }

  /**
   * ✅ Convertir string/number a number seguro
   */
  private static parseNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }

  /**
   * ✅ Contar campos completados
   */
  private static countCompletedFields(formData: Partial<PolicyFormData>): number {
    return Object.values(formData).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
  }

  // ===== MÉTODO DE VALIDACIÓN =====

  /**
   * ✅ Validar si un mapeo es confiable
   */
  static validateMapping(
    formData: Partial<PolicyFormData>, 
    masterOptions?: MasterDataOptionsDto | null
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    confidence: number;
    completeness: number;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    let confidence = 100;
    
    // Campos obligatorios básicos
    const requiredFields: (keyof PolicyFormData)[] = ['poliza', 'desde', 'hasta', 'asegurado'];
    const missingRequired = requiredFields.filter(field => !formData[field]);
    
    errors.push(...missingRequired.map(field => `Campo obligatorio faltante: ${field}`));
    confidence -= missingRequired.length * 20;

    // Validar maestros si están disponibles
    if (masterOptions) {
      if (formData.combustibleId && !masterOptions.combustibles?.find(c => c.id === formData.combustibleId)) {
        warnings.push('Combustible seleccionado no válido');
        confidence -= 10;
      }
      
      if (formData.categoriaId && !masterOptions.categorias?.find(c => c.id === formData.categoriaId)) {
        warnings.push('Categoría seleccionada no válida');
        confidence -= 10;
      }

      if (formData.destinoId && !masterOptions.destinos?.find(d => d.id === formData.destinoId)) {
        warnings.push('Destino seleccionado no válido');
        confidence -= 10;
      }
    }

    // Validar coherencia de fechas
    if (formData.desde && formData.hasta) {
      const desde = new Date(formData.desde);
      const hasta = new Date(formData.hasta);
      
      if (hasta <= desde) {
        errors.push('La fecha hasta debe ser posterior a la fecha desde');
        confidence -= 15;
      }
    }

    // Validar valores numéricos
    if (formData.premio !== undefined && (isNaN(Number(formData.premio)) || Number(formData.premio) <= 0)) {
      errors.push('Premio debe ser un número mayor a 0');
      confidence -= 10;
    }

    if (formData.cuotas !== undefined && (isNaN(Number(formData.cuotas)) || Number(formData.cuotas) < 1)) {
      errors.push('Cuotas debe ser un número mayor o igual a 1');
      confidence -= 5;
    }

    // Calcular completeness
    const totalFields = Object.keys(formData).length;
    const completedFields = this.countCompletedFields(formData);
    const completeness = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      confidence: Math.max(0, confidence),
      completeness
    };
  }

  /**
   * ✅ Obtener resumen del mapeo para debugging
   */
static getMappingSummary(azureData: AzureProcessResponse): {
    hasData: boolean;
    sections: Record<string, boolean>;
    completeness: number;
    errors: string[];
  } {
    const errors: string[] = []; // ✅ CORRECCIÓN: Declarar explícitamente como string[]

    const summary = {
      hasData: !!azureData.datosVelneo,
      sections: {
        datosBasicos: !!azureData.datosVelneo?.datosBasicos,
        datosPoliza: !!azureData.datosVelneo?.datosPoliza,
        datosVehiculo: !!azureData.datosVelneo?.datosVehiculo,
        datosCobertura: !!azureData.datosVelneo?.datosCobertura,
        condicionesPago: !!azureData.datosVelneo?.condicionesPago
      },
      completeness: azureData.porcentajeCompletitud || 0,
      errors // ✅ USAR LA VARIABLE TIPADA EXPLÍCITAMENTE
    };

    if (!summary.hasData) {
      errors.push('No se encontraron datosVelneo en la respuesta');
    }

    return summary;
  }
}