// src/types/poliza-unified.ts - CORREGIDO PARA INCLUIR TODOS LOS CAMPOS

/**
 * 🔧 INTERFAZ UNIFICADA COMPLETA CON TODOS LOS CAMPOS
 * Esta es la versión definitiva que incluye todos los campos que estás usando
 */
export interface PolizaFormDataComplete {
  // ===== CAMPOS BÁSICOS DE LA PÓLIZA =====
  numeroPoliza: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  anio?: string | number;
  plan?: string;
  ramo?: string;
  
  // ===== DATOS DEL CLIENTE =====
  asegurado: string;
  documento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  localidad?: string;
  departamento?: string;
  
  // ===== DATOS DEL VEHÍCULO (LOS CAMPOS QUE AGREGASTE) =====
  vehiculo?: string;
  marca?: string;
  modelo?: string;
  motor?: string;
  chasis?: string;
  matricula?: string;
  combustible?: string;
  
  // ===== INFORMACIÓN FINANCIERA =====
  prima: number | string;
  primaComercial?: number | string;
  premioTotal?: number | string;
  moneda: string;
  
  // ===== DATOS DEL CORREDOR =====
  corredor?: string;
  
  // ===== CAMPOS DE ESTADO Y METADATOS =====
  estadoTramite?: string;
  estadoPoliza?: string;
  observaciones: string;
  compania?: string;
  
  // ===== CAMPOS TÉCNICOS =====
  documentoId?: string;
  archivoOriginal?: string;
  procesadoConIA?: boolean;
}

/**
 * Mapper para convertir entre diferentes formatos de datos
 */
export class PolizaFormMapper {
  
  /**
   * Convierte datos extraídos de Azure a formulario unificado
   */
  static fromAzureExtracted(azureData: any): PolizaFormDataComplete {
    const result: PolizaFormDataComplete = {
      // Datos básicos
      numeroPoliza: azureData?.numeroPoliza || '',
      vigenciaDesde: this.formatDateForInput(azureData?.vigenciaDesde || ''),
      vigenciaHasta: this.formatDateForInput(azureData?.vigenciaHasta || ''),
      anio: azureData?.anio || '',
      plan: azureData?.plan || '',
      ramo: azureData?.ramo || 'AUTOMOVILES',
      
      // Cliente
      asegurado: azureData?.asegurado || '',
      documento: azureData?.documento || '',
      email: azureData?.email || '',
      telefono: azureData?.telefono || '',
      direccion: azureData?.direccion || '',
      localidad: azureData?.localidad || '',
      departamento: azureData?.departamento || '',
      
      // 🚗 VEHÍCULO (CAMPOS NUEVOS)
      vehiculo: azureData?.vehiculo || '',
      marca: azureData?.marca || '',
      modelo: azureData?.modelo || '',
      motor: azureData?.motor || '',
      chasis: azureData?.chasis || '',
      matricula: azureData?.matricula || '',
      combustible: azureData?.combustible || '',
      
      // 💰 FINANCIERO (CAMPOS NUEVOS)
      prima: azureData?.prima || 0,
      primaComercial: azureData?.primaComercial || 0,
      premioTotal: azureData?.premioTotal || 0,
      moneda: azureData?.moneda || 'UYU',
      
      // Corredor
      corredor: azureData?.corredor || '',
      
      // Estados
      estadoTramite: '1',
      estadoPoliza: '1',
      observaciones: azureData?.observaciones || 'Procesado automáticamente con Azure AI.',
      compania: azureData?.compania || '',
      
      // Técnicos
      documentoId: azureData?.documentId || '',
      archivoOriginal: azureData?.nombreArchivo || '',
      procesadoConIA: true
    };
    
    console.log('🔄 Mapped Azure data to unified form:', result);
    return result;
  }
  
  /**
   * Convierte datos de cliente seleccionado + Azure a formulario
   */
  static fromClienteAndAzure(cliente: any, azureData: any): PolizaFormDataComplete {
    const baseData = this.fromAzureExtracted(azureData);
    
    // Combinar con datos del cliente seleccionado
    return {
      ...baseData,
      asegurado: cliente?.clinom || baseData.asegurado,
      documento: cliente?.cliced || cliente?.cliruc || baseData.documento,
      email: cliente?.cliemail || baseData.email,
      telefono: cliente?.telefono || baseData.telefono,
      direccion: cliente?.clidir || baseData.direccion,
    };
  }
  
  /**
   * Convierte formulario unificado a formato para Velneo
   */
  static toVelneoFormat(formData: PolizaFormDataComplete): any {
    return {
      // IDs se asignan externamente
      conpol: formData.numeroPoliza,
      confchdes: this.formatDateForVelneo(formData.vigenciaDesde),
      confchhas: this.formatDateForVelneo(formData.vigenciaHasta),
      conpremio: typeof formData.prima === 'string' ? parseFloat(formData.prima) : formData.prima,
      asegurado: formData.asegurado,
      observaciones: formData.observaciones,
      moneda: formData.moneda,
      
      // 🔧 CAMPOS EXTENDIDOS DEL VEHÍCULO
      vehiculo: formData.vehiculo,
      marca: formData.marca,
      modelo: formData.modelo,
      motor: formData.motor,
      chasis: formData.chasis,
      matricula: formData.matricula,
      combustible: formData.combustible,
      anio: formData.anio,
      
      // 🔧 CAMPOS FINANCIEROS EXTENDIDOS
      primaComercial: typeof formData.primaComercial === 'string' ? 
        parseFloat(formData.primaComercial || '0') : formData.primaComercial,
      premioTotal: typeof formData.premioTotal === 'string' ? 
        parseFloat(formData.premioTotal || '0') : formData.premioTotal,
      
      // 🔧 OTROS CAMPOS EXTENDIDOS
      corredor: formData.corredor,
      plan: formData.plan,
      ramo: formData.ramo,
      documento: formData.documento,
      email: formData.email,
      telefono: formData.telefono,
      direccion: formData.direccion,
      localidad: formData.localidad,
      departamento: formData.departamento,
      
      // Estados
      estadoTramite: formData.estadoTramite || '1',
      estadoPoliza: formData.estadoPoliza || '1',
      
      // Metadatos
      documentoId: formData.documentoId,
      archivoOriginal: formData.archivoOriginal,
      procesadoConIA: formData.procesadoConIA || true,
    };
  }
  
  /**
   * Formatea fecha para input HTML
   */
  private static formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    
    try {
      // Si viene en formato DD/MM/YYYY, convertir a YYYY-MM-DD
      const ddmmyyyyMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ddmmyyyyMatch) {
        const [, day, month, year] = ddmmyyyyMatch;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Si viene en formato DD/MM/YY, convertir a YYYY-MM-DD
      const ddmmyyMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
      if (ddmmyyMatch) {
        const [, day, month, year] = ddmmyyMatch;
        const fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`;
        return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      return dateString;
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  }
  
  /**
   * Formatea fecha para Velneo (ISO string)
   */
  private static formatDateForVelneo(dateString: string): string {
    if (!dateString) return new Date().toISOString();
    
    try {
      // Si ya está en formato YYYY-MM-DD del input
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(dateString + 'T00:00:00.000Z').toISOString();
      }
      
      return new Date(dateString).toISOString();
    } catch (error) {
      console.error('Error formatting date for Velneo:', error);
      return new Date().toISOString();
    }
  }
  
  /**
   * Mapea moneda a código numérico de Velneo
   */
  private static mapMoneda(moneda: string): number {
    switch (moneda) {
      case 'USD': return 1;
      case 'EUR': return 2;
      case 'UYU':
      default: return 0;
    }
  }
}

// ===== TIPOS DE COMPATIBILIDAD - 🔧 CORREGIDOS =====
// Para que funcione con el código existente
export type PolizaFormData = PolizaFormDataComplete;

// 🔧 IMPORTANTE: Ahora PolizaFormDataExtended ES LO MISMO que PolizaFormDataComplete
// Esto evita la inconsistencia de tipos
export type PolizaFormDataExtended = PolizaFormDataComplete;