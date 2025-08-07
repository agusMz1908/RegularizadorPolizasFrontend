// src/services/velneoMapping.ts - VERSIÓN COMPLETA CORREGIDA

import type { PolicyFormData } from '../types/poliza';
import type { MasterDataOptionsDto } from '../types/masterData';
import type { AzureProcessResponse } from '../types/azureDocumentResult';
import { VELNEO_DEFAULTS } from '../constants/velneoDefault';

// ✅ TIPO CORRECTO BASADO EN TU BACKEND
interface PolizaCreateRequest {
  // ===== CAMPOS PRINCIPALES OBLIGATORIOS =====
  Clinro: number;                    // ID Cliente
  Clinom?: string;                   // Nombre cliente
  Comcod: number;                    // ID Compañía
  Conpremio: number;                 // Premio (OBLIGATORIO)
  
  // ===== CAMPOS OPCIONALES =====
  Seccod?: number;                   // ID Sección
  SeccionId?: number;                // ID Sección alternativo
  Conpol?: string;                   // Número de póliza
  Concar?: string;                   // Certificado
  Conend?: string;                   // Endoso
  Confchdes?: string;                // Fecha desde
  Confchhas?: string;                // Fecha hasta
  Convig?: string;                   // Estado vigencia
  Contra?: string;                   // Tipo trámite
  Consta?: string;                   // Forma de pago
  Congesti?: string;                 // Tipo gestión
  Congeses?: string;                 // Estado gestión
  Congesfi?: string;                 // Fecha gestión
  Asegurado?: string;                // Nombre asegurado
  Direccion?: string;                // Dirección
  Condom?: string;                   // Domicilio
  Marca?: string;                    // Marca
  Modelo?: string;                   // Modelo
  Conmaraut?: string;                // Marca + modelo completo
  Anio?: number;                     // Año
  Conanioaut?: number;               // Año (campo Velneo)
  Matricula?: string;                // Matrícula
  Conmataut?: string;                // Matrícula (campo Velneo)
  Motor?: string;                    // Motor
  Conmotor?: string;                 // Motor (campo Velneo)
  Chasis?: string;                   // Chasis
  Conchasis?: string;                // Chasis (campo Velneo)
  CombustibleId?: number;            // ID Combustible
  CombustibleNombre?: string;        // Nombre combustible
  CategoriaId?: number;              // ID Categoría
  CategoriaNombre?: string;          // Nombre categoría
  DestinoId?: number;                // ID Destino
  DestinoNombre?: string;            // Nombre destino
  CalidadId?: number;                // ID Calidad
  CalidadNombre?: string;            // Nombre calidad
  PremioTotal?: number;              // Premio total
  Contot?: number;                   // Total
  CantidadCuotas?: number;           // Cantidad de cuotas
  Concuo?: number;                   // Cuotas (campo Velneo)
  Moneda?: string;                   // Moneda como string
  Moncod?: number;                   // Moneda ID
  FormaPago?: string;                // Forma de pago como string
  CoberturaId?: number;              // ID Cobertura
  Cobertura?: string;                // Nombre cobertura
  ZonaCirculacion?: string;          // Zona de circulación
  DepartamentoId?: number;           // ID Departamento
  Ramo?: string;                     // Ramo (ej: "AUTOMOVILES")
  EstadoPoliza?: string;             // Estado de la póliza
  Tramite?: string;                  // Tipo de trámite
  Observaciones?: string;            // Observaciones generales
  ProcesadoConIA?: boolean;          // Flag de procesamiento con IA
  
  // ===== CAMPOS FLEXIBLES =====
  [key: string]: any;                // Para campos adicionales
}

export class VelneoMappingService {
  
  /**
   * 🔄 MÉTODO PRINCIPAL: Mapear datos del formulario al formato correcto del backend
   * ✅ CORREGIDO: Ahora devuelve PolizaCreateRequest con todos los campos obligatorios
   */
static mapFormDataToVelneoRequest(
  formData: PolicyFormData,
  selectedClient: any,
  selectedCompany: any,
  selectedSection: any,
  masterOptions?: MasterDataOptionsDto,
  scannedData?: any  // 🆕 Agregar parámetro opcional para datos del escaneo
): PolizaCreateRequest {

  // 🆕 Construir las observaciones con toda la información
  let observacionesCompletas = formData.observaciones || '';
  
  // Agregar información de procesamiento con IA si existe
  if (scannedData) {
    observacionesCompletas += '\n\n========== PROCESADO CON INTELIGENCIA ARTIFICIAL ==========';
    observacionesCompletas += `\nArchivo: ${scannedData.archivo || 'Documento PDF'}`;
    observacionesCompletas += `\nFecha procesamiento: ${new Date().toLocaleDateString('es-UY')} ${new Date().toLocaleTimeString('es-UY')}`;
    observacionesCompletas += `\nPrecisión del escaneo: ${Math.round(scannedData.porcentajeCompletitud || 0)}%`;
    observacionesCompletas += `\nEstado: ${scannedData.estado || 'PROCESADO'}`;
  }

  // Agregar desglose de cuotas si hay más de una
  if (formData.cuotas > 1) {
    observacionesCompletas += '\n\n========== PLAN DE PAGOS ==========';
    observacionesCompletas += `\nForma de pago: ${formData.formaPago}`;
    observacionesCompletas += `\nTotal de cuotas: ${formData.cuotas}`;
    observacionesCompletas += `\nPremio: $${this.formatNumber(formData.premio)}`;
    observacionesCompletas += `\nTotal a pagar: $${this.formatNumber(formData.total)}`;
    observacionesCompletas += `\nValor por cuota: $${this.formatNumber(formData.valorCuota)}`;
    
    // Si tenemos el detalle de cuotas del escaneo
    const cuotasDetalle = scannedData?.datosVelneo?.condicionesPago?.detalleCuotas?.cuotas;
    
    if (cuotasDetalle && cuotasDetalle.length > 0) {
      observacionesCompletas += '\n\n--- CRONOGRAMA DE PAGOS ---';
      
      cuotasDetalle.forEach((cuota: any) => {
        const fecha = this.formatDateForDisplay(cuota.fechaVencimiento);
        const monto = this.formatNumber(cuota.monto);
        observacionesCompletas += `\nCuota ${cuota.numero}: Vence ${fecha} - $${monto} - ${cuota.estado || 'PENDIENTE'}`;
      });
    } else {
      // Si no hay detalle, generar un cronograma estimado
      observacionesCompletas += '\n\n--- CRONOGRAMA ESTIMADO ---';
      
      for (let i = 0; i < formData.cuotas; i++) {
        const fecha = this.calcularFechaVencimientoEstimada(i);
        observacionesCompletas += `\nCuota ${i + 1}: Vence ${fecha} - $${this.formatNumber(formData.valorCuota)} - PENDIENTE`;
      }
    }
  }

  // Agregar información adicional
  observacionesCompletas += '\n\n========== INFORMACIÓN ADICIONAL ==========';
  observacionesCompletas += `\nOperación: ${formData.tramite || 'EMISIÓN'}`;
  observacionesCompletas += `\nUsuario: ${formData.asignado || 'Sistema Automático'}`;
  observacionesCompletas += `\nCliente: ${selectedClient?.clinom || formData.asegurado}`;
  observacionesCompletas += `\nCompañía: ${selectedCompany?.comalias || 'BSE'}`;
  observacionesCompletas += `\nSección: ${selectedSection?.seccion || 'AUTOMÓVILES'}`;

  const request: PolizaCreateRequest = {
    Comcod: selectedCompany?.id || selectedCompany?.comcod || VELNEO_DEFAULTS.COMPANIA_BSE,
    Seccod: selectedSection?.id || selectedSection?.seccod || VELNEO_DEFAULTS.SECCION_AUTOMOVILES,
    Clinro: selectedClient?.id || selectedClient?.clinro || 0,
    Conpol: formData.poliza || '',
    Confchdes: this.formatDateForBackend(formData.desde),
    Confchhas: this.formatDateForBackend(formData.hasta),
    Conpremio: Number(formData.premio) || 0,
    Asegurado: selectedClient?.clinom || selectedClient?.nombre || formData.asegurado || '',

    // ===== DATOS BÁSICOS =====
    Clinom: selectedClient?.clinom || selectedClient?.nombre || formData.asegurado || '',
    Concar: formData.certificado || formData.poliza || '',
    Conend: '0',
    Convig: this.mapEstadoPolizaParaBackend(formData.estadoPoliza),
    Contra: this.mapTramiteParaBackend(formData.tramite),
    Congesti: this.mapEstadoTramiteParaBackend(formData.estadoTramite),
    Congeses: '1',

    // ===== DATOS DEL CLIENTE =====
    Condom: formData.dirCobro || formData.domicilio || selectedClient?.clidir || '',

    // ===== DATOS DEL VEHÍCULO =====
    Marca: this.extractMarcaFromMarcaModelo(formData.marcaModelo),
    Modelo: this.extractModeloFromMarcaModelo(formData.marcaModelo),
    Conmaraut: formData.marcaModelo || '',
    Anio: formData.anio ? Number(formData.anio) : undefined,
    Conanioaut: formData.anio ? Number(formData.anio) : undefined,
    Matricula: formData.matricula || '',
    Conmataut: formData.matricula || '',
    Motor: formData.motor || '',
    Conmotor: formData.motor || '',
    Chasis: formData.chasis || '',
    Conchasis: formData.chasis || '',

    // ===== MAESTROS DEL VEHÍCULO =====
    Combustibles: this.resolveMaestroId(formData.combustibleId, 'combustible'),
    CategoriaId: this.resolveMaestroId(formData.categoriaId, 'categoria'),
    DestinoId: this.resolveMaestroId(formData.destinoId, 'destino'),
    CalidadId: this.resolveMaestroId(formData.calidadId, 'calidad'),
    
    // ===== NOMBRES PARA LOGGING/DEBUG =====
    Categoria: this.resolveCategoriaNombre(
      this.resolveMaestroId(formData.categoriaId, 'categoria'),
      masterOptions?.categorias
    ),
    Destino: this.resolveDestinoNombre(
      this.resolveMaestroId(formData.destinoId, 'destino'),
      masterOptions?.destinos
    ),
    Calidad: this.resolveCalidadNombre(
      this.resolveMaestroId(formData.calidadId, 'calidad'),
      masterOptions?.calidades
    ),

    // ===== DATOS FINANCIEROS =====
    Contot: Number(formData.total) || Number(formData.premio) || 0,
    CantidadCuotas: Number(formData.cuotas) || 1,
    Concuo: Number(formData.cuotas) || 1,
    Moneda: this.mapMonedaIdToString(formData.monedaId),
    Moncod: Number(formData.monedaId) || VELNEO_DEFAULTS.MONEDA_DEFAULT,
    FormaPago: formData.formaPago || 'Efectivo',
    Consta: this.mapFormaPagoParaBackend(formData.formaPago),

    // ===== OTROS CAMPOS =====
    Ramo: 'AUTOMOVILES',
    Cobertura: 'Responsabilidad Civil',
    Observaciones: observacionesCompletas,  // 🆕 Usar las observaciones formateadas
    ProcesadoConIA: true
  };

  const cleanRequest = this.cleanUndefinedValues(request);
  return cleanRequest;
}

// 🆕 Métodos auxiliares nuevos que necesitarás agregar:
private static formatNumber(num: number): string {
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0);
}

private static formatDateForDisplay(dateString: string): string {
  if (!dateString) return 'Por definir';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

private static calcularFechaVencimientoEstimada(indiceCuota: number): string {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() + indiceCuota + 1);
  fecha.setDate(5); // Día 5 de cada mes por defecto
  return fecha.toLocaleDateString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

  /**
   * ✅ MÉTODO CORREGIDO: Mapear datos de Azure a formulario con estructura real
   */
  static mapAzureToFormData(
    azureData: AzureProcessResponse,
    selectedClient: any,
    selectedCompany: any,
    masterOptions?: MasterDataOptionsDto
  ): Partial<PolicyFormData> {
    console.log('🔄 [VelneoMappingService] Mapeando datos de Azure a formulario');
    
    if (!azureData?.datosVelneo) {
      console.warn('⚠️ [VelneoMappingService] No hay datosVelneo en la respuesta de Azure');
      return {};
    }

    const { datosVelneo } = azureData;
    
    try {
      const mappedData: Partial<PolicyFormData> = {
        // ===== DATOS BÁSICOS =====
        corredor: datosVelneo.datosBasicos?.corredor || '',
        asegurado: selectedClient?.clinom || datosVelneo.datosBasicos?.asegurado || '',
        dirCobro: selectedClient?.clidircob || selectedClient?.clidir || datosVelneo.datosBasicos?.domicilio || '',
        tramite: this.mapTramiteFromAzure(datosVelneo.datosPoliza?.tipoMovimiento),
        fecha: datosVelneo.datosBasicos?.fecha ? this.formatDateForInput(datosVelneo.datosBasicos.fecha) : new Date().toISOString().split('T')[0],
        estadoPoliza: 'VIG',

        // ===== DATOS PÓLIZA =====
        compania: selectedCompany?.id || VELNEO_DEFAULTS.COMPANIA_BSE,
        desde: this.formatDateForInput(datosVelneo.datosPoliza?.desde),
        hasta: this.formatDateForInput(datosVelneo.datosPoliza?.hasta),
        poliza: datosVelneo.datosPoliza?.numeroPoliza || '', // ✅ CORREGIDO: numeroPoliza
        certificado: datosVelneo.datosPoliza?.certificado || '',

        // ===== DATOS VEHÍCULO =====
        marcaModelo: datosVelneo.datosVehiculo?.marcaModelo || 
                     `${datosVelneo.datosVehiculo?.marca || ''} ${datosVelneo.datosVehiculo?.modelo || ''}`.trim(),
        anio: datosVelneo.datosVehiculo?.anio || '',
        matricula: datosVelneo.datosVehiculo?.matricula || '',
        motor: datosVelneo.datosVehiculo?.motor || '',
        chasis: datosVelneo.datosVehiculo?.chasis || '',

        // ===== DATOS FINANCIEROS =====
        premio: Number(datosVelneo.condicionesPago?.premio) || 0, // ✅ CORREGIDO: condicionesPago.premio
        total: Number(datosVelneo.condicionesPago?.total) || Number(datosVelneo.condicionesPago?.premio) || 0,
        cuotas: Number(datosVelneo.condicionesPago?.cuotas) || 1, // ✅ CORREGIDO: cuotas
        valorCuota: Number(datosVelneo.condicionesPago?.valorCuota) || 0,
        formaPago: datosVelneo.condicionesPago?.formaPago || 'Efectivo',

        // ===== DATOS DE COBERTURA =====
        monedaId: datosVelneo.datosCobertura?.codigoMoneda || VELNEO_DEFAULTS.MONEDA_DEFAULT,
        zonaCirculacion: datosVelneo.datosCobertura?.zonaCirculacion || 'MONTEVIDEO'
      };

      console.log('✅ [VelneoMappingService] Mapeo de Azure completado:', {
        camposMapeados: Object.keys(mappedData).filter(key => {
          const value = mappedData[key as keyof PolicyFormData];
          return value !== '' && value !== null && value !== undefined;
        }).length,
        completitud: azureData.porcentajeCompletitud || 0,
        datosExtraidos: {
          poliza: mappedData.poliza,
          marca: datosVelneo.datosVehiculo?.marca,
          premio: mappedData.premio
        }
      });

      return mappedData;
      
    } catch (error) {
      console.error('❌ [VelneoMappingService] Error mapeando datos de Azure:', error);
      return {};
    }
  }

  // ===== MÉTODOS DE UTILIDAD PRIVADOS =====

  /**
   * 📅 Formatear fecha para el backend (.NET)
   */
  private static formatDateForBackend(dateString: string): string {
    if (!dateString) return new Date().toISOString();
    
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  /**
   * 📅 Formatear fecha para input HTML
   */
  private static formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  /**
   * 🚗 Extraer marca de marcaModelo
   */
  private static extractMarcaFromMarcaModelo(marcaModelo: string): string {
    if (!marcaModelo) return '';
    return marcaModelo.split(' ')[0] || '';
  }

  /**
   * 🚗 Extraer modelo de marcaModelo  
   */
  private static extractModeloFromMarcaModelo(marcaModelo: string): string {
    if (!marcaModelo) return '';
    const parts = marcaModelo.split(' ');
    return parts.slice(1).join(' ') || '';
  }

  /**
   * 🏷️ Resolver ID de maestro - CORREGIDO para manejar combustibles como STRING
   */
  private static resolveMaestroId(value: any, tipo: string): any {
    // ✅ CASO ESPECIAL: Combustibles son STRING, no number
    if (tipo === 'combustible') {
      if (typeof value === 'string' && value.length > 0) return value;
      return VELNEO_DEFAULTS.COMBUSTIBLE_DEFAULT; // 'GAS'
    }
    
    // Para otros maestros: convertir a number
    if (typeof value === 'number' && value > 0) return value;
    if (typeof value === 'string' && !isNaN(Number(value)) && Number(value) > 0) return Number(value);
    
    // Defaults según tipo
    const defaults: Record<string, number> = {
      categoria: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      destino: VELNEO_DEFAULTS.DESTINO_DEFAULT,
      calidad: VELNEO_DEFAULTS.CALIDAD_DEFAULT
    };
    
    return defaults[tipo] || 1;
  }

  private static resolveCategoriaNombre(id: any, categorias?: any[]): string {
    if (!categorias || !Array.isArray(categorias) || !id) return '';
    const categoria = categorias.find(c => c.id === id);
    return categoria?.catdsc || '';
  }

  private static resolveDestinoNombre(id: any, destinos?: any[]): string {
    if (!destinos || !Array.isArray(destinos) || !id) return '';
    const destino = destinos.find(d => d.id === id);
    return destino?.desnom || '';
  }

  private static resolveCalidadNombre(id: any, calidades?: any[]): string {
    if (!calidades || !Array.isArray(calidades) || !id) return '';
    const calidad = calidades.find(c => c.id === id);
    return calidad?.caldsc || '';
  }

  private static mapMonedaIdToString(monedaId: any): string {
    const id = Number(monedaId) || VELNEO_DEFAULTS.MONEDA_DEFAULT;
    
    switch (id) {
      case 1: return 'UYU';
      case 2: return 'USD';
      case 3: return 'UI';
      default: return 'UYU';
    }
  }

  /**
   * 🔄 Mapear estado de póliza para backend
   */
  private static mapEstadoPolizaParaBackend(estado: string): string {
    const mapeo: Record<string, string> = {
      'VIG': 'VIG',
      'Vigente': 'VIG', 
      'ANT': 'ANT',
      'Anulada': 'ANT',
      'VEN': 'VEN',
      'Vencida': 'VEN',
      'FIN': 'FIN',
      'Finalizada': 'FIN'
    };
    
    return mapeo[estado] || 'VIG';
  }

  /**
   * 🔄 Mapear trámite para backend
   */
  private static mapTramiteParaBackend(tramite: string): string {
    const mapeo: Record<string, string> = {
      'Nuevo': 'Nuevo',
      'Renovación': 'Renovacion', 
      'Cambio': 'Cambio',
      'Endoso': 'Endoso'
    };
    
    return mapeo[tramite] || 'Nuevo';
  }

  /**
   * 🔄 Mapear estado de trámite para backend
   */
  private static mapEstadoTramiteParaBackend(estado: string): string {
    const mapeo: Record<string, string> = {
      'Pendiente': '1',
      'En proceso': '2',
      'Terminado': '3',
      'Modificaciones': '4'
    };
    
    return mapeo[estado] || '1';
  }

  /**
   * 💳 Mapear forma de pago para backend
   */
  private static mapFormaPagoParaBackend(formaPago: string): string {
    const mapeo: Record<string, string> = {
      'Efectivo': '1',
      'Transferencia': '2', 
      'Débito automático': '3',
      'Tarjeta': '4'
    };
    
    return mapeo[formaPago] || '1';
  }

  /**
   * 🔄 Mapear trámite desde Azure
   */
  private static mapTramiteFromAzure(tipoMovimiento: string): string {
    if (!tipoMovimiento) return 'Nuevo';
    
    const mapeo: Record<string, string> = {
      'ALTA': 'Nuevo',
      'RENOVACION': 'Renovación',
      'MODIFICACION': 'Cambio',
      'ENDOSO': 'Endoso'
    };
    
    return mapeo[tipoMovimiento.toUpperCase()] || 'Nuevo';
  }

  /**
   * 🧹 Limpiar valores undefined del objeto
   */
  private static cleanUndefinedValues<T extends Record<string, any>>(obj: T): T {
    const cleaned = { ...obj };
    
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });
    
    return cleaned;
  }

  /**
   * 🔄 Mapear estado de vigencia (método para compatibilidad)
   */
  static mapEstadoVigencia(estado: string): string {
    return this.mapEstadoPolizaParaBackend(estado);
  }

  /**
   * 🔄 Mapear tipo de trámite (método para compatibilidad)
   */
  static mapTipoTramite(tramite: string): string {
    return this.mapTramiteParaBackend(tramite);
  }

  /**
   * 🔄 Mapear estado de gestión (método para compatibilidad)
   */
  static mapEstadoGestion(estado: string): string {
    return this.mapEstadoTramiteParaBackend(estado);
  }
}

export default VelneoMappingService;