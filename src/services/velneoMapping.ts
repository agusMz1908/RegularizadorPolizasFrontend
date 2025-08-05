// src/services/velneoMapping.ts - Servicio de mapeo entre formulario y Velneo (CORREGIDO)

import type { PolicyFormData } from '../types/policyForm';
import type { VelneoPolizaRequest, VelneoMasterDataOptions } from '../types/velneo';
import type { AzureProcessResponse } from '../types/azureDocumentResult';
import { VELNEO_DEFAULTS, EMPTY_VELNEO_REQUEST } from '../constants/velneoDefault';

export class VelneoMappingService {
  static mapFormDataToVelneoRequest(
    formData: PolicyFormData,
    selectedClient: any,
    selectedCompany: any,
    selectedSection: any,
    masterOptions?: VelneoMasterDataOptions
  ): VelneoPolizaRequest {
    const now = new Date().toISOString();
    
    // Separar marca y modelo
    const marcaModelo = formData.marcaModelo || '';
    const partes = marcaModelo.split(' ');
    const marca = partes[0] || '';
    const modelo = partes.slice(1).join(' ') || '';

    // Obtener nombres de maestros por ID para campos derivados
    const getDestinoNombre = (id: number) => {
      if (!masterOptions?.Destinos) return '';
      const destino = masterOptions.Destinos.find(d => d.id === id);
      return destino?.desnom || '';
    };

    const getCombustibleNombre = (id: string) => {
      if (!masterOptions?.Combustibles) return '';
      const combustible = masterOptions.Combustibles.find(c => c.id === id);
      return combustible?.name || '';
    };

    const getCalidadNombre = (id: number) => {
      if (!masterOptions?.Calidades) return '';
      const calidad = masterOptions.Calidades.find(c => c.id === id);
      return calidad?.caldsc || '';
    };

    const getCategoriaNombre = (id: number) => {
      if (!masterOptions?.Categorias) return '';
      const categoria = masterOptions.Categorias.find(c => c.id === id);
      return categoria?.catdsc || '';
    };

    const getMonedaNombre = (id: number) => {
      if (!masterOptions?.Monedas) return '';
      const moneda = masterOptions.Monedas.find(m => m.id === id);
      return moneda?.nombre || '';
    };

    return {
      // ===== CAMPOS OBLIGATORIOS BÁSICOS =====
      id: 0,
      comcod: selectedCompany?.id || VELNEO_DEFAULTS.COMPANIA_BSE,
      seccod: selectedSection?.id || VELNEO_DEFAULTS.SECCION_AUTOMOVILES,
      clinro: selectedClient?.id || 0,

      // ===== DATOS BÁSICOS (Pestaña 1) =====
      corrnom: formData.corredor || VELNEO_DEFAULTS.EMPTY_STRING,
      clinom: selectedClient?.clinom || VELNEO_DEFAULTS.EMPTY_STRING,
      condom: formData.dirCobro || VELNEO_DEFAULTS.EMPTY_STRING,
      congeses: formData.estadoTramite || VELNEO_DEFAULTS.ESTADO_TRAMITE_DEFAULT,
      clinro1: selectedClient?.id || 0, // Mismo que clinro (tomador)
      contra: formData.tramite || VELNEO_DEFAULTS.TRAMITE_DEFAULT,
      congesfi: formData.fecha || now,
      convig: formData.estadoPoliza || VELNEO_DEFAULTS.ESTADO_POLIZA_DEFAULT,

      // ===== DATOS PÓLIZA (Pestaña 2) =====
      conpol: formData.poliza || VELNEO_DEFAULTS.EMPTY_STRING,
      confchdes: formData.desde || VELNEO_DEFAULTS.EMPTY_STRING,
      confchhas: formData.hasta || VELNEO_DEFAULTS.EMPTY_STRING,
      concar: formData.certificado || VELNEO_DEFAULTS.EMPTY_STRING,
      conend: VELNEO_DEFAULTS.ENDOSO_DEFAULT,

      // ===== DATOS VEHÍCULO (Pestaña 3) =====
      conmaraut: marcaModelo,
      conanioaut: Number(formData.anio) || VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      conmataut: formData.matricula || VELNEO_DEFAULTS.EMPTY_STRING,
      conmotor: formData.motor || VELNEO_DEFAULTS.EMPTY_STRING,
      conchasis: formData.chasis || VELNEO_DEFAULTS.EMPTY_STRING,

      // ===== MAESTROS VEHÍCULO (Pestaña 3) =====
      desdsc: formData.destinoId || VELNEO_DEFAULTS.DESTINO_DEFAULT,
      combustibles: formData.combustibleId || VELNEO_DEFAULTS.COMBUSTIBLE_DEFAULT, // STRING
      caldsc: formData.calidadId || VELNEO_DEFAULTS.CALIDAD_DEFAULT,
      catdsc: formData.categoriaId || VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,

      // ===== DATOS COBERTURA (Pestaña 4) =====
      tarcod: formData.coberturaId || VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      dptnom: formData.zonaCirculacion || VELNEO_DEFAULTS.DEPARTAMENTO_DEFAULT,
      moncod: formData.monedaId || VELNEO_DEFAULTS.MONEDA_DEFAULT,

      // ===== CONDICIONES PAGO (Pestaña 5) =====
      consta: formData.formaPago || VELNEO_DEFAULTS.FORMA_PAGO_DEFAULT,
      conpremio: Number(formData.premio) || VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      contot: Number(formData.total) || VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      concuo: Number(formData.cuotas) || VELNEO_DEFAULTS.CUOTAS_DEFAULT,

      // ===== CAMPOS ADICIONALES REQUERIDOS =====
      ramo: VELNEO_DEFAULTS.RAMO,
      com_alias: selectedCompany?.nombre || selectedCompany?.alias || 'BSE',
      conpadaut: VELNEO_DEFAULTS.EMPTY_STRING,
      conimp: Number(formData.premio) || VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      flocod: VELNEO_DEFAULTS.FLOCOD_DEFAULT,
      observaciones: formData.observaciones || VELNEO_DEFAULTS.EMPTY_STRING,
      procesadoConIA: true,
      fechaCreacion: now,
      fechaModificacion: now,

      // ===== CAMPOS DE COMPATIBILIDAD =====
      forpagvid: VELNEO_DEFAULTS.EMPTY_STRING,
      conclaaut: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      condedaut: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      conresciv: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      conbonnsin: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      conbonant: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      concaraut: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      concapaut: VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      concesnom: VELNEO_DEFAULTS.EMPTY_STRING,
      concestel: VELNEO_DEFAULTS.EMPTY_STRING,
      conges: VELNEO_DEFAULTS.EMPTY_STRING,

      // ===== CAMPOS DERIVADOS (para logging/compatibilidad) =====
      vehiculo: marcaModelo,
      marca: marca,
      modelo: modelo,
      motor: formData.motor || VELNEO_DEFAULTS.EMPTY_STRING,
      chasis: formData.chasis || VELNEO_DEFAULTS.EMPTY_STRING,
      matricula: formData.matricula || VELNEO_DEFAULTS.EMPTY_STRING,
      combustible: getCombustibleNombre(formData.combustibleId),
      anio: Number(formData.anio) || VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      primaComercial: Number(formData.premio) || VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      premioTotal: Number(formData.total) || VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      corredor: formData.corredor || VELNEO_DEFAULTS.EMPTY_STRING,
      plan: VELNEO_DEFAULTS.EMPTY_STRING,
      documento: selectedClient?.cliced || VELNEO_DEFAULTS.EMPTY_STRING,
      email: selectedClient?.cliemail || VELNEO_DEFAULTS.EMPTY_STRING,
      telefono: selectedClient?.clitelcel || selectedClient?.clitelcorr || VELNEO_DEFAULTS.EMPTY_STRING,
      direccion: selectedClient?.clidir || VELNEO_DEFAULTS.EMPTY_STRING,
      localidad: selectedClient?.clilocnom || VELNEO_DEFAULTS.EMPTY_STRING,
      departamento: selectedClient?.clidptnom || VELNEO_DEFAULTS.DEPARTAMENTO_DEFAULT,
      moneda: getMonedaNombre(formData.monedaId),
      seccionId: selectedSection?.id || VELNEO_DEFAULTS.SECCION_AUTOMOVILES,
      estado: formData.estadoTramite || VELNEO_DEFAULTS.ESTADO_TRAMITE_DEFAULT,
      tramite: formData.tramite || VELNEO_DEFAULTS.TRAMITE_DEFAULT,
      estadoPoliza: formData.estadoPoliza || VELNEO_DEFAULTS.ESTADO_POLIZA_DEFAULT,
      calidadId: formData.calidadId || VELNEO_DEFAULTS.CALIDAD_DEFAULT,
      destinoId: formData.destinoId || VELNEO_DEFAULTS.DESTINO_DEFAULT,
      categoriaId: formData.categoriaId || VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      tipoVehiculo: formData.tipo || VELNEO_DEFAULTS.TIPO_DEFAULT,
      uso: getDestinoNombre(formData.destinoId),
      formaPago: formData.formaPago || VELNEO_DEFAULTS.FORMA_PAGO_DEFAULT,
      cantidadCuotas: Number(formData.cuotas) || VELNEO_DEFAULTS.CUOTAS_DEFAULT,
      valorCuota: Number(formData.valorCuota) || VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      tipo: formData.tipo || VELNEO_DEFAULTS.TIPO_DEFAULT,
      cobertura: getCategoriaNombre(formData.coberturaId),
      certificado: formData.certificado || VELNEO_DEFAULTS.EMPTY_STRING,
      calidad: getCalidadNombre(formData.calidadId),
      categoria: getCategoriaNombre(formData.categoriaId),
      destino: getDestinoNombre(formData.destinoId)
    };
  }

  static mapAzureDataToFormData(
    azureData: AzureProcessResponse,
    selectedClient: any,
    selectedCompany: any,
    masterOptions?: VelneoMasterDataOptions
  ): Partial<PolicyFormData> {
    if (!azureData?.datosVelneo) return {};

    const { datosVelneo } = azureData;

    return {
      // ===== PESTAÑA 1: DATOS BÁSICOS =====
      corredor: datosVelneo.datosBasicos?.corredor || '',
      asegurado: selectedClient?.clinom || '',
      dirCobro: selectedClient?.clidircob || selectedClient?.clidir || '',
      estadoTramite: this.mapEstadoTramiteFromAzure(datosVelneo.datosBasicos?.estado),
      tomador: selectedClient?.clinom || '',
      domicilio: selectedClient?.clidir || '',
      tramite: this.mapTramiteFromAzure(datosVelneo.datosPoliza?.tipoMovimiento),
      fecha: new Date().toISOString().split('T')[0],
      tipo: VELNEO_DEFAULTS.TIPO_DEFAULT,
      estadoPoliza: VELNEO_DEFAULTS.ESTADO_POLIZA_DEFAULT,

      // ===== PESTAÑA 2: DATOS PÓLIZA =====
      compania: selectedCompany?.id || VELNEO_DEFAULTS.COMPANIA_BSE,
      desde: this.formatDateForInput(datosVelneo.datosPoliza?.desde),
      hasta: this.formatDateForInput(datosVelneo.datosPoliza?.hasta),
      poliza: datosVelneo.datosPoliza?.numeroPoliza || '',
      certificado: datosVelneo.datosPoliza?.certificado || '',

      // ===== PESTAÑA 3: DATOS VEHÍCULO =====
      marcaModelo: datosVelneo.datosVehiculo?.marcaModelo || 
        `${datosVelneo.datosVehiculo?.marca || ''} ${datosVelneo.datosVehiculo?.modelo || ''}`.trim(),
      anio: datosVelneo.datosVehiculo?.anio || '',
      matricula: datosVelneo.datosVehiculo?.matricula || '',
      motor: datosVelneo.datosVehiculo?.motor || '',
      destinoId: this.mapDestinoTextoAId(datosVelneo.datosVehiculo?.destino, masterOptions),
      combustibleId: this.mapCombustibleTextoAId(datosVelneo.datosVehiculo?.combustible, masterOptions),
      chasis: datosVelneo.datosVehiculo?.chasis || '',
      calidadId: this.mapCalidadTextoAId(datosVelneo.datosVehiculo?.calidad, masterOptions),
      categoriaId: this.mapCategoriaTextoAId(datosVelneo.datosVehiculo?.categoria, masterOptions),

      // ===== PESTAÑA 4: DATOS COBERTURA =====
      coberturaId: this.mapCoberturaTextoAId(datosVelneo.datosCobertura?.cobertura, masterOptions),
      zonaCirculacion: this.mapZonaCirculacion(
        datosVelneo.datosCobertura?.zonaCirculacion || 
        datosVelneo.datosBasicos?.departamento
      ),
      monedaId: this.mapMonedaTextoAId(datosVelneo.datosCobertura?.moneda, masterOptions),

      // ===== PESTAÑA 5: CONDICIONES PAGO =====
      formaPago: this.mapFormaPagoFromAzure(datosVelneo.condicionesPago?.formaPago),
      premio: datosVelneo.condicionesPago?.premio || 0,
      total: datosVelneo.condicionesPago?.total || 0,
      moneda: this.mapMonedaTextoAId(
        datosVelneo.condicionesPago?.moneda || datosVelneo.datosCobertura?.moneda, 
        masterOptions
      ),
      valorCuota: datosVelneo.condicionesPago?.valorCuota || 0,
      cuotas: datosVelneo.condicionesPago?.cuotas || VELNEO_DEFAULTS.CUOTAS_DEFAULT,

      // ===== PESTAÑA 6: OBSERVACIONES =====
      observaciones: this.buildObservacionesFromAzure(datosVelneo.observaciones)
    };
  }

  // ===== MÉTODOS PRIVADOS DE MAPEO =====

  private static mapEstadoTramiteFromAzure(estado?: string): string {
    if (!estado) return VELNEO_DEFAULTS.ESTADO_TRAMITE_DEFAULT;
    
    // Mapeo simple por ahora
    const estadoUpper = estado.toUpperCase();
    if (estadoUpper.includes('PROCESO')) return 'En proceso';
    if (estadoUpper.includes('PENDIENTE')) return 'Pendiente';
    if (estadoUpper.includes('TERMINADO')) return 'Terminado';
    
    return VELNEO_DEFAULTS.ESTADO_TRAMITE_DEFAULT;
  }

  /**
   * 🔄 Mapear tipo de trámite desde Azure
   */
  private static mapTramiteFromAzure(tipoMovimiento?: string): string {
    if (!tipoMovimiento) return VELNEO_DEFAULTS.TRAMITE_DEFAULT;
    
    const tipoUpper = tipoMovimiento.toUpperCase();
    if (tipoUpper.includes('EMISIÓN') || tipoUpper.includes('EMISION')) return 'Nuevo';
    if (tipoUpper.includes('RENOVACIÓN') || tipoUpper.includes('RENOVACION')) return 'Renovación';
    if (tipoUpper.includes('CAMBIO') || tipoUpper.includes('MODIFICACION')) return 'Cambio';
    if (tipoUpper.includes('ENDOSO')) return 'Endoso';
    
    return VELNEO_DEFAULTS.TRAMITE_DEFAULT;
  }

  /**
   * 🔄 Mapear forma de pago desde Azure
   */
  private static mapFormaPagoFromAzure(formaPago?: string): string {
    if (!formaPago) return VELNEO_DEFAULTS.FORMA_PAGO_DEFAULT;
    
    const pagoUpper = formaPago.toUpperCase();
    if (pagoUpper.includes('CONTADO')) return 'Contado';
    if (pagoUpper.includes('TARJETA') || pagoUpper.includes('CREDITO')) return 'Tarjeta de Crédito';
    if (pagoUpper.includes('DEBITO') || pagoUpper.includes('AUTOMATICO')) return 'Débito Automático';
    if (pagoUpper.includes('CUOTAS')) return 'Cuotas';
    if (pagoUpper.includes('FINANCIADO')) return 'Financiado';
    
    return VELNEO_DEFAULTS.FORMA_PAGO_DEFAULT;
  }

  /**
   * 🗺️ Mapear zona de circulación
   */
  private static mapZonaCirculacion(zona?: string): string {
    if (!zona) return VELNEO_DEFAULTS.DEPARTAMENTO_DEFAULT;
    
    const zonaUpper = zona.toUpperCase();
    if (zonaUpper.includes('MONTEVIDEO')) return 'MONTEVIDEO';
    if (zonaUpper.includes('CANELONES')) return 'CANELONES';
    if (zonaUpper.includes('MALDONADO')) return 'MALDONADO';
    
    return VELNEO_DEFAULTS.DEPARTAMENTO_DEFAULT;
  }

  /**
   * ⛽ Mapear combustible texto a ID
   */
  private static mapCombustibleTextoAId(texto?: string, masterOptions?: VelneoMasterDataOptions): string {
    if (!texto || !masterOptions?.Combustibles) return VELNEO_DEFAULTS.COMBUSTIBLE_DEFAULT;
    
    const textoUpper = texto.toUpperCase();
    
    // Mapeo inteligente común
    if (textoUpper.includes('DIESEL') || textoUpper.includes('DISEL') || textoUpper.includes('GAS-OIL')) {
      return 'DIS';
    }
    if (textoUpper.includes('GASOLINA') || textoUpper.includes('NAFTA')) {
      return 'GAS';
    }
    if (textoUpper.includes('ELECTRICO') || textoUpper.includes('ELECTRIC')) {
      return 'ELE';
    }
    if (textoUpper.includes('HIBRIDO') || textoUpper.includes('HYBRID')) {
      return 'HYB';
    }

    // Buscar en la lista de maestros
    const combustible = masterOptions.Combustibles.find(c => 
      c.name?.toLowerCase().includes(texto.toLowerCase()) ||
      texto.toLowerCase().includes(c.name?.toLowerCase()) ||
      c.id?.toLowerCase() === texto.toLowerCase()
    );
    
    return combustible?.id || VELNEO_DEFAULTS.COMBUSTIBLE_DEFAULT;
  }

  /**
   * 🎯 Mapear destino texto a ID
   */
  private static mapDestinoTextoAId(texto?: string, masterOptions?: VelneoMasterDataOptions): number {
    if (!texto || !masterOptions?.Destinos) return VELNEO_DEFAULTS.DESTINO_DEFAULT;
    
    const destino = masterOptions.Destinos.find(d => 
      d.desnom?.toLowerCase().includes(texto.toLowerCase()) ||
      texto.toLowerCase().includes(d.desnom?.toLowerCase())
    );
    
    return destino?.id || VELNEO_DEFAULTS.DESTINO_DEFAULT;
  }

  /**
   * ⭐ Mapear calidad texto a ID
   */
  private static mapCalidadTextoAId(texto?: string, masterOptions?: VelneoMasterDataOptions): number {
    if (!texto || !masterOptions?.Calidades) return VELNEO_DEFAULTS.CALIDAD_DEFAULT;
    
    const calidad = masterOptions.Calidades.find(c => 
      c.caldsc?.toLowerCase().includes(texto.toLowerCase()) ||
      texto.toLowerCase().includes(c.caldsc?.toLowerCase())
    );
    
    return calidad?.id || VELNEO_DEFAULTS.CALIDAD_DEFAULT;
  }

  /**
   * 🚗 Mapear categoría texto a ID
   */
  private static mapCategoriaTextoAId(texto?: string, masterOptions?: VelneoMasterDataOptions): number {
    if (!texto || !masterOptions?.Categorias) return VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT;
    
    const categoria = masterOptions.Categorias.find(c => 
      c.catdsc?.toLowerCase().includes(texto.toLowerCase()) ||
      texto.toLowerCase().includes(c.catdsc?.toLowerCase())
    );
    
    return categoria?.id || VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT;
  }

  /**
   * 🛡️ Mapear cobertura texto a ID (usando categorías)
   */
  private static mapCoberturaTextoAId(texto?: string, masterOptions?: VelneoMasterDataOptions): number {
    if (!texto || !masterOptions?.Categorias) return VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT;
    
    // Las coberturas suelen estar en las categorías
    const cobertura = masterOptions.Categorias.find(c => 
      c.catdsc?.toLowerCase().includes(texto.toLowerCase()) ||
      texto.toLowerCase().includes(c.catdsc?.toLowerCase()) ||
      (texto.toLowerCase().includes('global') && c.catdsc?.toLowerCase().includes('global'))
    );
    
    return cobertura?.id || VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT;
  }

  /**
   * 💰 Mapear moneda texto a ID
   */
  private static mapMonedaTextoAId(texto?: string, masterOptions?: VelneoMasterDataOptions): number {
    if (!texto || !masterOptions?.Monedas) return VELNEO_DEFAULTS.MONEDA_DEFAULT;
    
    const textoUpper = texto.toUpperCase();
    
    // Mapeo inteligente de monedas
    const mapeoMonedas: Record<string, string[]> = {
      'PES': ['UYU', 'PESOS', 'PESO URUGUAYO', '$U', 'PES'],
      'DOL': ['USD', 'DOLARES', 'DOLLAR', 'DOLAR', '$', 'DOL'],
      'EU': ['EUR', 'EUROS', 'EURO', '€', 'EU']
    };

    for (const [codigoInterno, variantes] of Object.entries(mapeoMonedas)) {
      if (variantes.some(v => textoUpper.includes(v))) {
        const moneda = masterOptions.Monedas.find(m => 
          m.codigo?.toUpperCase() === codigoInterno ||
          m.nombre?.toUpperCase().includes(codigoInterno)
        );
        if (moneda) return moneda.id;
      }
    }

    return VELNEO_DEFAULTS.MONEDA_DEFAULT;
  }

  /**
   * 📝 Construir observaciones desde datos de Azure
   */
  private static buildObservacionesFromAzure(observaciones?: any): string {
    if (!observaciones) return '';

    const parts = [
      observaciones.observacionesGenerales,
      observaciones.notasEscaneado?.join('\n'),
      observaciones.informacionAdicional
    ].filter(Boolean);

    return parts.join('\n\n');
  }

  /**
   * 📅 Formatear fecha para input HTML
   */
  private static formatDateForInput(dateString?: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  /**
   * 🔄 ENVIAR PÓLIZA A VELNEO
   */
  static async enviarPolizaAVelneo(velneoRequest: VelneoPolizaRequest): Promise<any> {
    try {
      const response = await fetch('/api/polizas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(velneoRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error enviando póliza a Velneo:', error);
      throw error;
    }
  }
}