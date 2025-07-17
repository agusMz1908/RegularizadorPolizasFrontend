// ===== INTERFACE PRINCIPAL UNIFICADA =====
export interface PolizaFormDataComplete {
  // === INFORMACIÓN BÁSICA DE LA PÓLIZA (campos de Velneo) ===
  numeroPoliza: string;           // conpol
  endoso?: string;                // conend  
  vigenciaDesde: string;          // confchdes
  vigenciaHasta: string;          // confchhas
  compania: string;
  
  // === ESTADOS (nuevos campos) ===
  estadoTramite: string;          // contra (1=Nuevo, 2=Pendiente, etc.)
  estadoPoliza: string;           // convig (1=VIGENTE, 0=NO VIGENTE)
  estadoCancelacion?: string;     // concan
  fechaCancelacion?: string;      // confchcan
  causaCancelacion?: string;      // concaucan
  
  // === DATOS DEL CLIENTE (algunos bloqueados en UI) ===
  asegurado: string;              // clinom - REQUERIDO
  documento?: string;             // cliced
  email?: string;                 // cliemail
  direccion?: string;             // condom (domicilio)
  localidad?: string;
  departamento?: string;
  telefono?: string;
  
  // === DATOS DEL VEHÍCULO ===
  vehiculo?: string;              // Descripción completa
  marca?: string;                 // conmaraut
  modelo?: string;
  anioVehiculo?: number;          // conanioaut
  motor?: string;                 // conmotor
  chasis?: string;                // conchasis
  matricula?: string;             // conmataut
  combustible?: string;
  categoria?: number;             // concaraut
  
  // === INFORMACIÓN FINANCIERA ===
  prima: number | string;         // conpremio - REQUERIDO
  premioTotal?: number | string;  // contot
  primaComercial?: number | string; // Para compatibilidad con Azure
  moneda: string;                 // moncod (UYU, USD, EUR)
  cuotas?: number;                // concuo
  valorCuota?: number;
  formaPago?: string;             // forpagvid
  
  // === COBERTURA Y RIESGO ===
  cobertura?: string;             // Basado en seccod y ramo
  ramo?: string;                  // "AUTOMOVILES" del objeto
  plan?: string;                  // Para compatibilidad
  deducible?: number;             // condedaut
  responsabilidadCivil?: number;  // conresciv
  capitalAsegurado?: number;      // concapaut
  sumaAsegurada?: number;         // Alias de capitalAsegurado
  
  // === BONIFICACIONES Y DESCUENTOS ===
  bonificacionSiniestros?: number; // conbonnsin
  bonificacionAntiguedad?: number; // conbonant
  
  // === DATOS DEL CORREDOR ===
  corredor?: string;              // concomcorr
  corredorNombre?: string;        // corrnom
  
  // === GESTIÓN ===
  gestor?: string;                // conges
  fechaIngreso?: string;          // congesfi
  
  // === OBSERVACIONES ===
  observaciones: string;          // observaciones
  motivoNoRenovacion?: string;    // mot_no_ren
  
  // === CAMPOS ADICIONALES PARA COMPATIBILIDAD ===
  // Compatibilidad con tipos existentes
  nombreAsegurado?: string;       // Alias de asegurado
  documentoAsegurado?: string;    // Alias de documento
  telefonoAsegurado?: string;     // Alias de telefono
  emailAsegurado?: string;        // Alias de email
  direccionAsegurado?: string;    // Alias de direccion
  año?: string;                   // Alias de anioVehiculo
  chapa?: string;                 // Alias de matricula
  color?: string;
  comision?: number;
  
  // === METADATOS (para el wizard) ===
  documentoId?: string;
  archivoOriginal?: string;
  procesadoConIA?: boolean;
  camposCompletos?: number;
  listoParaVelneo?: boolean;
  confianzaExtraccion?: number;
}

// ===== MAPEO PARA VELNEO (estructura exacta del objeto que mostraste) =====
export interface VelneoPolizaRequest {
  // IDs de relaciones (REQUERIDOS)
  comcod: number;                 // ID de la compañía
  clinro: number;                 // ID del cliente
  
  // Datos básicos (mapeo directo con campos Velneo)
  conpol: string;                 // numeroPoliza
  conend?: string;                // endoso
  confchdes: string;              // vigenciaDesde (formato ISO)
  confchhas: string;              // vigenciaHasta (formato ISO)
  contra: string;                 // estadoTramite
  convig: string;                 // estadoPoliza
  concan?: number;                // estadoCancelacion
  confchcan?: string;             // fechaCancelacion
  concaucan?: string;             // causaCancelacion
  
  // Cliente (algunos pueden ser readonly)
  clinom: string;                 // asegurado
  condom?: string;                // direccion
  
  // Vehículo
  conmaraut?: string;             // marca
  conanioaut?: number;            // anioVehiculo
  conmotor?: string;              // motor
  conchasis?: string;             // chasis
  conmataut?: string;             // matricula
  concaraut?: number;             // categoria
  
  // Financiero
  conpremio: number;              // prima
  contot?: number;                // premioTotal
  moncod?: number;                // moneda (0=UYU, 1=USD, 2=EUR?)
  concuo?: number;                // cuotas
  forpagvid?: string;             // formaPago
  
  // Cobertura
  seccod?: number;                // sección/ramo ID
  condedaut?: number;             // deducible
  conresciv?: number;             // responsabilidadCivil
  concapaut?: number;             // capitalAsegurado
  
  // Bonificaciones
  conbonnsin?: number;            // bonificacionSiniestros
  conbonant?: number;             // bonificacionAntiguedad
  
  // Gestión
  conges?: string;                // gestor
  congesfi?: string;              // fechaIngreso
  observaciones?: string;         // observaciones
  mot_no_ren?: string;            // motivoNoRenovacion
  
  // Metadatos del procesamiento
  documentoId?: string;
  archivoOriginal?: string;
  procesadoConIA?: boolean;
  
  // Campos adicionales que vi en el objeto Velneo
  concomcorr?: number;            // corredor ID
  catdsc?: number;
  desdsc?: number;
  caldsc?: number;
  flocod?: number;
  concar?: string;
  conimp?: number;
  connroser?: number;
  rieres?: string;
  congesti?: string;
  congeses?: string;
  conflota?: number;
  // ... agregar más según necesites del objeto original
}

// ===== MAPPERS PARA CONVERSIÓN =====
export class PolizaFormMapper {
  
  /**
   * Convierte datos de Azure Document Intelligence a PolizaFormDataComplete
   */
  static fromAzureResponse(azureData: any): Partial<PolizaFormDataComplete> {
    const datos = azureData.datosFormateados || {};
    
    return {
      // Datos básicos extraídos
      numeroPoliza: datos.numeroPoliza || '',
      asegurado: datos.asegurado || '',
      vigenciaDesde: this.formatDateForInput(datos.vigenciaDesde) || '',
      vigenciaHasta: this.formatDateForInput(datos.vigenciaHasta) || '',
      prima: datos.prima || datos.primaComercial || 0,
      premioTotal: datos.premioTotal || 0,
      compania: datos.compania || '',
      
      // Vehículo
      vehiculo: datos.vehiculo || '',
      marca: datos.marca || '',
      modelo: datos.modelo || '',
      motor: datos.motor || '',
      chasis: datos.chasis || '',
      matricula: datos.matricula || '',
      
      // Otros
      ramo: datos.ramo || 'AUTOMOVILES',
      plan: datos.plan || '',
      direccion: datos.direccion || '',
      departamento: datos.departamento || '',
      localidad: datos.localidad || '',
      telefono: datos.telefono || '',
      email: datos.email || '',
      corredor: datos.corredor || '',
      
      // Estados por defecto
      estadoTramite: '1', // Nuevo
      estadoPoliza: '1',  // Vigente
      moneda: 'UYU',
      observaciones: 'Procesado automáticamente con Azure AI.',
      
      // Metadatos
      camposCompletos: datos.camposCompletos || 0,
      listoParaVelneo: datos.listoParaVelneo || false,
      procesadoConIA: true
    };
  }
  
  /**
   * Convierte PolizaFormDataComplete a VelneoPolizaRequest
   */
  static toVelneoRequest(
    formData: PolizaFormDataComplete, 
    clienteId: number, 
    companiaId: number
  ): VelneoPolizaRequest {
    return {
      // IDs requeridos
      comcod: companiaId,
      clinro: clienteId,
      
      // Datos básicos
      conpol: formData.numeroPoliza,
      conend: formData.endoso || '',
      confchdes: this.formatDateForVelneo(formData.vigenciaDesde),
      confchhas: this.formatDateForVelneo(formData.vigenciaHasta),
      contra: formData.estadoTramite || '1',
      convig: formData.estadoPoliza || '1',
      
      // Cliente
      clinom: formData.asegurado,
      condom: formData.direccion || '',
      
      // Vehículo
      conmaraut: formData.marca || '',
      conanioaut: formData.anioVehiculo || 0,
      conmotor: formData.motor || '',
      conchasis: formData.chasis || '',
      conmataut: formData.matricula || '',
      concaraut: formData.categoria || 0,
      
      // Financiero
      conpremio: Number(formData.prima) || 0,
      contot: Number(formData.premioTotal) || Number(formData.prima) || 0,
      moncod: this.mapMoneda(formData.moneda),
      concuo: formData.cuotas || 1,
      forpagvid: formData.formaPago || 'CONTADO',
      
      // Cobertura
      condedaut: Number(formData.deducible) || 0,
      conresciv: Number(formData.responsabilidadCivil) || 0,
      concapaut: Number(formData.capitalAsegurado || formData.sumaAsegurada) || 0,
      
      // Bonificaciones
      conbonnsin: Number(formData.bonificacionSiniestros) || 0,
      conbonant: Number(formData.bonificacionAntiguedad) || 0,
      
      // Gestión
      conges: formData.gestor || '',
      congesfi: formData.fechaIngreso || new Date().toISOString(),
      observaciones: formData.observaciones || '',
      mot_no_ren: formData.motivoNoRenovacion || '',
      
      // Metadatos
      documentoId: formData.documentoId,
      archivoOriginal: formData.archivoOriginal,
      procesadoConIA: formData.procesadoConIA || true
    };
  }
  
  /**
   * Formatea fecha para input[type="date"] (YYYY-MM-DD)
   */
  private static formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    
    try {
      if (dateString.includes('T')) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
      
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        const fullYear = year.length === 2 ? `20${year}` : year;
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

// ===== TIPOS DE COMPATIBILIDAD =====
// Para que funcione con el código existente
export type PolizaFormData = PolizaFormDataComplete;
export type PolizaFormDataExtended = PolizaFormDataComplete;