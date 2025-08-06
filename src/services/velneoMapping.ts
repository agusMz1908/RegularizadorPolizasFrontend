// src/services/velneoMapping.ts - VERSIÓN COMPLETA CON ESTRUCTURA REAL DE VELNEO

import type { PolicyFormData } from '../types/poliza';
import type { MasterDataOptionsDto } from '../types/masterData';
import type { AzureProcessResponse } from '../types/azureDocumentResult';
import { VELNEO_DEFAULTS } from '../constants/velneoDefault';

// ✅ TIPO COMPLETO PARA REQUEST A VELNEO (basado en tu objeto real)
interface VelneoPolizaRequest {
  // ===== CAMPOS OBLIGATORIOS PRINCIPALES =====
  id?: number;                    // 0 para nuevo
  comcod: number;                 // ID compañía
  seccod: number;                 // ID sección
  clinro: number;                 // ID cliente
  clinro1: number;               // ID tomador (mismo que clinro)
  
  // ===== DATOS BÁSICOS DEL CLIENTE =====
  clinom: string;                // Nombre cliente
  condom: string;                // Domicilio
  
  // ===== DATOS DE LA PÓLIZA =====
  conpol: string;                // Número póliza
  concar: string;                // Certificado (mismo que conpol)
  conend: string;                // Endoso
  confchdes: string;             // Fecha desde (ISO format)
  confchhas: string;             // Fecha hasta (ISO format)
  convig: string;                // Estado vigencia
  contra: string;                // Tipo trámite
  congeses: string;              // Estado gestión
  congesfi: string;              // Fecha gestión (ISO format)
  
  // ===== DATOS DEL VEHÍCULO =====
  conmaraut: string;             // Marca + modelo
  conanioaut: number;            // Año
  conmataut: string;             // Matrícula
  conmotor: string;              // Motor
  conchasis: string;             // Chasis
  combustibles: string;          // Combustible (string)
  
  // ===== MAESTROS DEL VEHÍCULO =====
  catdsc: number;                // Categoría ID
  desdsc: number;                // Destino ID  
  caldsc: number;                // Calidad ID
  
  // ===== DATOS FINANCIEROS =====
  conpremio: number;             // Premio
  contot: number;                // Total
  concuo: number;                // Cuotas
  moncod: number;                // Moneda ID
  consta: string;                // Forma de pago
  conimp: number;                // Importe (mismo que premio)
  
  // ===== DATOS DE COBERTURA =====
  tarcod: number;                // Tarifa/Cobertura ID
  dptnom: number;                // Departamento ID
  
  // ===== CORREDOR =====
  corrnom: number;               // Corredor ID (convertir de string a number)
  concomcorr: number;            // Comisión corredor
  
  // ===== CAMPOS NUMÉRICOS CON DEFAULTS =====
  concodrev: number;             // 0
  conficto: number;              // 0
  conclaaut: number;             // 0
  condedaut: number;             // 17537 (deducible default)
  conresciv: number;             // 40 (responsabilidad civil)
  conbonnsin: number;            // 0
  conbonant: number;             // 0
  concaraut: number;             // 0
  concapaut: number;             // 0
  connroser: number;             // 0
  concan: number;                // 0
  concapla: number;              // 0
  conflota: number;              // 0
  condednum: number;             // 1
  conpadre: number;              // 0 (para renovaciones)
  conobjtot: number;             // 0
  convalacr: number;             // 0
  convallet: number;             // 0
  conviakb: number;              // 0
  conviakn: number;              // 0
  conviacos: number;             // 0
  conviafle: number;             // 0
  conedaret: number;             // 0
  congar: number;                // 0
  condecpri: number;             // 0
  condecpro: number;             // 0
  condecptj: number;             // 0
  conviagas: number;             // 0
  conviarec: number;             // 0
  conviapri: number;             // 0
  linobs: number;                // 0
  tpoconcod: number;             // 0
  tpovivcod: number;             // 0
  tporiecod: number;             // 0
  modcod: number;                // 0
  concapase: number;             // 0
  conpricap: number;             // 0
  conriecod: number;             // 0
  conrecfin: number;             // 0
  conimprf: number;              // 0
  conafesin: number;             // 0
  conautcor: number;             // 0
  conlinrie: number;             // 0
  conconesp: number;             // 0
  lincarta: number;              // 0
  cancecod: number;              // 0
  concomotr: number;             // 0
  conviamon: number;             // 0
  connroint: number;             // 0
  conpadend: number;             // 0
  contotpri: number;             // 0
  padreaux: number;              // 0
  conlinflot: number;            // 0
  conflotimp: number;            // 0
  conflottotal: number;          // 0
  conflotsaldo: number;          // 0
  otrcorrcod: number;            // 0
  clipcupfia: number;            // 0
  conviatot: number;             // 0
  consumsal: number;             // 0
  com_sub_corr: number;          // 0
  tipos_de_alarma: number;       // 0
  coberturas_bicicleta: number;  // 0
  com_bro: number;               // 0
  com_bo: number;                // 0
  contotant: number;             // 0
  motivos_no_renovacion: number; // 0
  max_aereo: number;             // 0
  max_mar: number;               // 0
  max_terrestre: number;         // 0
  tasa: number;                  // 0
  cat_cli: number;               // 0
  comcod1: number;               // 0
  comcod2: number;               // 0
  pagos_efectivo: number;        // 0
  productos_de_vida: number;     // 0
  app_id: number;                // 0
  asignado: number;              // 0
  conidpad: number;              // 0
  flocod: number;                // 0
  
  // ===== CAMPOS STRING CON DEFAULTS =====
  conpadaut: string;             // ""
  concesnom: string;             // ""
  concestel: string;             // ""
  rieres: string;                // ""
  conges: string;                // Usuario gestor
  congesti: string;              // "1"
  congrucon: string;             // ""
  contipoemp: string;            // ""
  conmatpar: string;             // ""
  conmatte: string;              // ""
  conconf: string;               // ""
  concaucan: string;             // ""
  contpoact: string;             // ""
  conesp: string;                // ""
  condecram: string;             // ""
  conmedtra: string;             // ""
  conviades: string;             // ""
  conviaa: string;               // ""
  conviaenb: string;             // ""
  conviatra: string;             // ""
  conubi: string;                // ""
  concaudsc: string;             // ""
  conincuno: string;             // ""
  concalcom: string;             // ""
  tposegdsc: string;             // ""
  conriedsc: string;             // ""
  conlimnav: string;             // ""
  contpocob: string;             // ""
  connomemb: string;             // ""
  contpoemb: string;             // ""
  conautcome: string;            // ""
  conviafac: string;             // ""
  conviatpo: string;             // ""
  connrorc: string;              // ""
  condedurc: string;             // ""
  forpagvid: string;             // ""
  conautnd: string;              // "NAF"
  conaccicer: string;            // ""
  condetemb: string;             // ""
  conclaemb: string;             // ""
  confabemb: string;             // ""
  conbanemb: string;             // ""
  conmatemb: string;             // ""
  convelemb: string;             // ""
  conmatriemb: string;           // ""
  conptoemb: string;             // ""
  condeta: string;               // ""
  observaciones: string;         // Del formulario
  conclieda: string;             // ""
  condecrea: string;             // ""
  condecaju: string;             // ""
  contpoemp: string;             // ""
  congaran: string;              // ""
  congarantel: string;           // ""
  mot_no_ren: string;            // ""
  condetrc: string;              // ""
  condetail: string;             // Resumen automático
  conespbon: string;             // ""
  sublistas: string;             // ""
  cotizacion: string;            // ""
  clausula: string;              // ""
  facturacion: string;           // ""
  coning: string;                // ""
  idorden: string;               // ""
  gestion: string;               // ""
  
  // ===== CAMPOS BOOLEAN =====
  tiene_alarma: boolean;         // false
  conautcort: boolean;           // false
  leer: boolean;                 // false
  enviado: boolean;              // false
  sob_recib: boolean;            // false
  leer_obs: boolean;             // false
  aereo: boolean;                // false
  maritimo: boolean;             // false
  terrestre: boolean;            // false
  importacion: boolean;          // false
  exportacion: boolean;          // false
  offshore: boolean;             // false
  transito_interno: boolean;     // false
  llamar: boolean;               // false
  granizo: boolean;              // false
  var_ubi: boolean;              // false
  mis_rie: boolean;              // false
  
  // ===== CAMPOS FIJOS =====
  com_alias: string;             // "BSE"
  ramo: string;                  // "AUTOMOVILES"
  
  // ===== CAMPOS DE FECHA (ISO strings) =====
  confchcan?: string;            // "Invalid Date" en ejemplo
  concomdes?: string;            // "Invalid Date" en ejemplo
  concerfin?: string;            // "Invalid Date" en ejemplo
  ingresado?: string;            // "Invalid Date" en ejemplo
  last_update?: string;          // Fecha actual
  update_date?: string;          // "Invalid Date" en ejemplo
}

export class VelneoMappingService {
  /**
   * 🔄 MAPEAR DATOS DEL FORMULARIO A REQUEST COMPLETO DE VELNEO
   */
  static mapFormDataToVelneoRequest(
    formData: PolicyFormData,
    selectedClient: any,
    selectedCompany: any,
    selectedSection: any,
    masterOptions?: MasterDataOptionsDto
  ): VelneoPolizaRequest {
    const now = new Date().toISOString();
    
    // Separar marca y modelo
    const marcaModelo = formData.marcaModelo || '';
    
    // Convertir corredor string a number (buscar en maestros o usar default)
    const corredorId = this.convertCorredorToId(formData.corredor);
    
    // Formatear fechas para Velneo
    const formatearFecha = (fecha: string) => {
      if (!fecha) return now;
      try {
        return new Date(fecha).toISOString();
      } catch {
        return now;
      }
    };
    
    // Construir detalle automático
    const detalle = `${marcaModelo}   ${formData.matricula}   ${formData.anio}    TAR.GLOBAL   DEP.${selectedClient?.clidptnom || 'MONTEVIDEO'}   CUOTAS:  ${formData.cuotas || 1}     TOTAL: ${formData.total || 0}.00`;
    
    return {
      // ===== CAMPOS OBLIGATORIOS PRINCIPALES =====
      id: 0,
      comcod: selectedCompany?.id || VELNEO_DEFAULTS.COMPANIA_BSE,
      seccod: selectedSection?.id || VELNEO_DEFAULTS.SECCION_AUTOMOVILES,
      clinro: selectedClient?.id || 0,
      clinro1: selectedClient?.id || 0,
      
      // ===== DATOS BÁSICOS DEL CLIENTE =====
      clinom: selectedClient?.clinom || VELNEO_DEFAULTS.EMPTY_STRING,
      condom: selectedClient?.clidir || formData.dirCobro || VELNEO_DEFAULTS.EMPTY_STRING,
      
      // ===== DATOS DE LA PÓLIZA =====
      conpol: formData.poliza || VELNEO_DEFAULTS.EMPTY_STRING,
      concar: formData.certificado || formData.poliza || VELNEO_DEFAULTS.EMPTY_STRING,
      conend: VELNEO_DEFAULTS.EMPTY_STRING,
      confchdes: formatearFecha(formData.desde),
      confchhas: formatearFecha(formData.hasta),
      convig: this.mapEstadoVigencia(formData.estadoPoliza),
      contra: this.mapTipoTramite(formData.tramite),
      congeses: this.mapEstadoGestion(formData.estadoTramite),
      congesfi: formatearFecha(formData.fecha),
      
      // ===== DATOS DEL VEHÍCULO =====
      conmaraut: marcaModelo,
      conanioaut: Number(formData.anio) || 0,
      conmataut: formData.matricula || VELNEO_DEFAULTS.EMPTY_STRING,
      conmotor: formData.motor || VELNEO_DEFAULTS.EMPTY_STRING,
      conchasis: formData.chasis || VELNEO_DEFAULTS.EMPTY_STRING,
      combustibles: formData.combustibleId || VELNEO_DEFAULTS.COMBUSTIBLE_DEFAULT,
      
      // ===== MAESTROS DEL VEHÍCULO =====
      catdsc: formData.categoriaId || VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT,
      desdsc: formData.destinoId || VELNEO_DEFAULTS.DESTINO_DEFAULT,
      caldsc: formData.calidadId || VELNEO_DEFAULTS.CALIDAD_DEFAULT,
      
      // ===== DATOS FINANCIEROS =====
      conpremio: Number(formData.premio) || 0,
      contot: Number(formData.total) || 0,
      concuo: Number(formData.cuotas) || 1,
      moncod: formData.monedaId || VELNEO_DEFAULTS.MONEDA_DEFAULT,
      consta: this.mapFormaPago(formData.formaPago),
      conimp: Number(formData.premio) || 0,
      
      // ===== DATOS DE COBERTURA =====
      tarcod: formData.coberturaId || 3, // Default: Tarifa Global
      dptnom: this.mapDepartamento(formData.zonaCirculacion || selectedClient?.clidptnom),
      
      // ===== CORREDOR =====
      corrnom: corredorId,
      concomcorr: 13, // Default comisión corredor
      
      // ===== CAMPOS NUMÉRICOS CON DEFAULTS =====
      concodrev: 0,
      conficto: 0,
      conclaaut: 0,
      condedaut: 17537, // Deducible default
      conresciv: 40,    // Responsabilidad civil default
      conbonnsin: 0,
      conbonant: 0,
      concaraut: 0,
      concapaut: 0,
      connroser: 0,
      concan: 0,
      concapla: 0,
      conflota: 0,
      condednum: 1,
      conpadre: 0,
      conobjtot: 0,
      convalacr: 0,
      convallet: 0,
      conviakb: 0,
      conviakn: 0,
      conviacos: 0,
      conviafle: 0,
      conedaret: 0,
      congar: 0,
      condecpri: 0,
      condecpro: 0,
      condecptj: 0,
      conviagas: 0,
      conviarec: 0,
      conviapri: 0,
      linobs: 0,
      tpoconcod: 0,
      tpovivcod: 0,
      tporiecod: 0,
      modcod: 0,
      concapase: 0,
      conpricap: 0,
      conriecod: 0,
      conrecfin: 0,
      conimprf: 0,
      conafesin: 0,
      conautcor: 0,
      conlinrie: 0,
      conconesp: 0,
      lincarta: 0,
      cancecod: 0,
      concomotr: 0,
      conviamon: 0,
      connroint: 0,
      conpadend: 0,
      contotpri: 0,
      padreaux: 0,
      conlinflot: 0,
      conflotimp: 0,
      conflottotal: 0,
      conflotsaldo: 0,
      otrcorrcod: 0,
      clipcupfia: 0,
      conviatot: 0,
      consumsal: 0,
      com_sub_corr: 0,
      tipos_de_alarma: 0,
      coberturas_bicicleta: 0,
      com_bro: 0,
      com_bo: 0,
      contotant: 0,
      motivos_no_renovacion: 0,
      max_aereo: 0,
      max_mar: 0,
      max_terrestre: 0,
      tasa: 0,
      cat_cli: 0,
      comcod1: 0,
      comcod2: 0,
      pagos_efectivo: 0,
      productos_de_vida: 0,
      app_id: 0,
      asignado: 0,
      conidpad: 0,
      flocod: 0,
      
      // ===== CAMPOS STRING CON DEFAULTS =====
      conpadaut: VELNEO_DEFAULTS.EMPTY_STRING,
      concesnom: VELNEO_DEFAULTS.EMPTY_STRING,
      concestel: VELNEO_DEFAULTS.EMPTY_STRING,
      rieres: VELNEO_DEFAULTS.EMPTY_STRING,
      conges: "SYSTEM.USER", // Usuario del sistema
      congesti: "1",
      congrucon: VELNEO_DEFAULTS.EMPTY_STRING,
      contipoemp: VELNEO_DEFAULTS.EMPTY_STRING,
      conmatpar: VELNEO_DEFAULTS.EMPTY_STRING,
      conmatte: VELNEO_DEFAULTS.EMPTY_STRING,
      conconf: VELNEO_DEFAULTS.EMPTY_STRING,
      concaucan: VELNEO_DEFAULTS.EMPTY_STRING,
      contpoact: VELNEO_DEFAULTS.EMPTY_STRING,
      conesp: VELNEO_DEFAULTS.EMPTY_STRING,
      condecram: VELNEO_DEFAULTS.EMPTY_STRING,
      conmedtra: VELNEO_DEFAULTS.EMPTY_STRING,
      conviades: VELNEO_DEFAULTS.EMPTY_STRING,
      conviaa: VELNEO_DEFAULTS.EMPTY_STRING,
      conviaenb: VELNEO_DEFAULTS.EMPTY_STRING,
      conviatra: VELNEO_DEFAULTS.EMPTY_STRING,
      conubi: VELNEO_DEFAULTS.EMPTY_STRING,
      concaudsc: VELNEO_DEFAULTS.EMPTY_STRING,
      conincuno: VELNEO_DEFAULTS.EMPTY_STRING,
      concalcom: VELNEO_DEFAULTS.EMPTY_STRING,
      tposegdsc: VELNEO_DEFAULTS.EMPTY_STRING,
      conriedsc: VELNEO_DEFAULTS.EMPTY_STRING,
      conlimnav: VELNEO_DEFAULTS.EMPTY_STRING,
      contpocob: VELNEO_DEFAULTS.EMPTY_STRING,
      connomemb: VELNEO_DEFAULTS.EMPTY_STRING,
      contpoemb: VELNEO_DEFAULTS.EMPTY_STRING,
      conautcome: VELNEO_DEFAULTS.EMPTY_STRING,
      conviafac: VELNEO_DEFAULTS.EMPTY_STRING,
      conviatpo: VELNEO_DEFAULTS.EMPTY_STRING,
      connrorc: VELNEO_DEFAULTS.EMPTY_STRING,
      condedurc: VELNEO_DEFAULTS.EMPTY_STRING,
      forpagvid: VELNEO_DEFAULTS.EMPTY_STRING,
      conautnd: "NAF", // Valor fijo del ejemplo
      conaccicer: VELNEO_DEFAULTS.EMPTY_STRING,
      condetemb: VELNEO_DEFAULTS.EMPTY_STRING,
      conclaemb: VELNEO_DEFAULTS.EMPTY_STRING,
      confabemb: VELNEO_DEFAULTS.EMPTY_STRING,
      conbanemb: VELNEO_DEFAULTS.EMPTY_STRING,
      conmatemb: VELNEO_DEFAULTS.EMPTY_STRING,
      convelemb: VELNEO_DEFAULTS.EMPTY_STRING,
      conmatriemb: VELNEO_DEFAULTS.EMPTY_STRING,
      conptoemb: VELNEO_DEFAULTS.EMPTY_STRING,
      condeta: VELNEO_DEFAULTS.EMPTY_STRING,
      observaciones: formData.observaciones || VELNEO_DEFAULTS.EMPTY_STRING,
      conclieda: VELNEO_DEFAULTS.EMPTY_STRING,
      condecrea: VELNEO_DEFAULTS.EMPTY_STRING,
      condecaju: VELNEO_DEFAULTS.EMPTY_STRING,
      contpoemp: VELNEO_DEFAULTS.EMPTY_STRING,
      congaran: VELNEO_DEFAULTS.EMPTY_STRING,
      congarantel: VELNEO_DEFAULTS.EMPTY_STRING,
      mot_no_ren: VELNEO_DEFAULTS.EMPTY_STRING,
      condetrc: VELNEO_DEFAULTS.EMPTY_STRING,
      condetail: detalle,
      conespbon: VELNEO_DEFAULTS.EMPTY_STRING,
      sublistas: VELNEO_DEFAULTS.EMPTY_STRING,
      cotizacion: VELNEO_DEFAULTS.EMPTY_STRING,
      clausula: VELNEO_DEFAULTS.EMPTY_STRING,
      facturacion: VELNEO_DEFAULTS.EMPTY_STRING,
      coning: VELNEO_DEFAULTS.EMPTY_STRING,
      idorden: VELNEO_DEFAULTS.EMPTY_STRING,
      gestion: VELNEO_DEFAULTS.EMPTY_STRING,
      
      // ===== CAMPOS BOOLEAN =====
      tiene_alarma: false,
      conautcort: false,
      leer: false,
      enviado: false,
      sob_recib: false,
      leer_obs: false,
      aereo: false,
      maritimo: false,
      terrestre: false,
      importacion: false,
      exportacion: false,
      offshore: false,
      transito_interno: false,
      llamar: false,
      granizo: false,
      var_ubi: false,
      mis_rie: false,
      
      // ===== CAMPOS FIJOS =====
      com_alias: selectedCompany?.comalias || selectedCompany?.alias || "BSE",
      ramo: "AUTOMOVILES",
      
      // ===== CAMPOS DE FECHA =====
      last_update: now,
      // Los demás campos de fecha se omiten o se dejan como "Invalid Date" como en el ejemplo
    };
  }
  
  // ===== MÉTODOS PRIVADOS DE MAPEO =====
  
  private static convertCorredorToId(corredor: string): number {
    // Convertir nombre de corredor a ID
    // Por ahora usar un default, después se puede hacer lookup en maestros
    if (!corredor) return 2; // Default
    
    // Buscar por nombre común
    const corredoresComunes: Record<string, number> = {
      'AGUSTIN.MUNIZ': 2,
      'DEFAULT': 2
    };
    
    return corredoresComunes[corredor.toUpperCase()] || 2;
  }
  
  private static mapEstadoVigencia(estado: string): string {
    const mapeo: Record<string, string> = {
      'VIG': '2',      // Vigente
      'ANT': '1',      // Anterior
      'VEN': '3',      // Vencida
      'END': '4',      // Endosada
      'ELIM': '5',     // Eliminada
      'FIN': '6'       // Finalizada
    };
    
    return mapeo[estado] || '2'; // Default: Vigente
  }
  
  private static mapTipoTramite(tramite: string): string {
    const mapeo: Record<string, string> = {
      'Nuevo': '1',
      'Renovación': '2', 
      'Cambio': '3',
      'Endoso': '4'
    };
    
    return mapeo[tramite] || '1'; // Default: Nuevo
  }
  
  private static mapEstadoGestion(estado: string): string {
    const mapeo: Record<string, string> = {
      'Pendiente': '1',
      'En proceso': '2',
      'Terminado': '3',
      'Modificaciones': '4'
    };
    
    return mapeo[estado] || '4'; // Default: Modificaciones
  }
  
  private static mapFormaPago(formaPago: string): string {
    const mapeo: Record<string, string> = {
      'Contado': '1',
      'Tarjeta de Crédito': '2',
      'Débito Automático': '3',
      'Cuotas': '1',
      'Financiado': '2'
    };
    
    return mapeo[formaPago] || '1'; // Default: Contado
  }
  
  private static mapDepartamento(departamento?: string): number {
    const mapeo: Record<string, number> = {
      'MONTEVIDEO': 1,
      'CANELONES': 2,
      'MALDONADO': 3,
      'COLONIA': 4,
      'SAN JOSE': 5
    };
    
    if (!departamento) return 1; // Default: Montevideo
    
    const deptoUpper = departamento.toUpperCase();
    return mapeo[deptoUpper] || 1;
  }

  // ===== MANTENER MÉTODO EXISTENTE PARA MAPEO DESDE AZURE =====
  static mapAzureToFormData(
    azureData: AzureProcessResponse,
    selectedClient: any,
    selectedCompany: any,
    masterOptions?: MasterDataOptionsDto
  ): Partial<PolicyFormData> {
    console.log('🔄 [VelneoMappingService] Mapeando datos de Azure:', azureData);
    
    if (!azureData?.datosVelneo) {
      console.warn('⚠️ [VelneoMappingService] No hay datosVelneo en la respuesta de Azure');
      return {};
    }

    const { datosVelneo } = azureData;
    
    try {
      const mappedData: Partial<PolicyFormData> = {
        // ===== PESTAÑA 1: DATOS BÁSICOS =====
        corredor: datosVelneo.datosBasicos?.corredor || '',
        asegurado: selectedClient?.clinom || '',
        dirCobro: selectedClient?.clidircob || selectedClient?.clidir || '',
        estadoTramite: VelneoMappingService.mapEstadoTramiteFromAzure(datosVelneo.datosBasicos?.estado),
        tomador: selectedClient?.clinom || '',
        domicilio: selectedClient?.clidir || '',
        tramite: VelneoMappingService.mapTramiteFromAzure(datosVelneo.datosPoliza?.tipoMovimiento),
        fecha: new Date().toISOString().split('T')[0],
        tipo: VELNEO_DEFAULTS.TIPO_DEFAULT,
        estadoPoliza: VELNEO_DEFAULTS.ESTADO_POLIZA_DEFAULT,

        // ===== PESTAÑA 2: DATOS PÓLIZA =====
        compania: selectedCompany?.id || VELNEO_DEFAULTS.COMPANIA_BSE,
        desde: VelneoMappingService.formatDateForInput(datosVelneo.datosPoliza?.desde),
        hasta: VelneoMappingService.formatDateForInput(datosVelneo.datosPoliza?.hasta),
        poliza: datosVelneo.datosPoliza?.numeroPoliza || '',
        certificado: datosVelneo.datosPoliza?.certificado || '',

        // ===== PESTAÑA 3: DATOS VEHÍCULO =====
        marcaModelo: datosVelneo.datosVehiculo?.marcaModelo || 
          `${datosVelneo.datosVehiculo?.marca || ''} ${datosVelneo.datosVehiculo?.modelo || ''}`.trim(),
        anio: datosVelneo.datosVehiculo?.anio || '',
        matricula: datosVelneo.datosVehiculo?.matricula || '',
        motor: datosVelneo.datosVehiculo?.motor || '',
        destinoId: VelneoMappingService.mapDestinoTextoAId(datosVelneo.datosVehiculo?.destino, masterOptions),
        combustibleId: VelneoMappingService.mapCombustibleTextoAId(datosVelneo.datosVehiculo?.combustible, masterOptions),
        chasis: datosVelneo.datosVehiculo?.chasis || '',
        calidadId: VelneoMappingService.mapCalidadTextoAId(datosVelneo.datosVehiculo?.calidad, masterOptions),
        categoriaId: VelneoMappingService.mapCategoriaTextoAId(datosVelneo.datosVehiculo?.categoria, masterOptions),

        // ===== PESTAÑA 4: DATOS COBERTURA =====
        coberturaId: VelneoMappingService.mapCoberturaTextoAId(datosVelneo.datosCobertura?.cobertura, masterOptions),
        zonaCirculacion: VelneoMappingService.mapZonaCirculacion(
          datosVelneo.datosCobertura?.zonaCirculacion || 
          datosVelneo.datosBasicos?.departamento
        ),
        monedaId: VelneoMappingService.mapMonedaTextoAId(datosVelneo.datosCobertura?.moneda, masterOptions),

        // ===== PESTAÑA 5: CONDICIONES PAGO =====
        formaPago: VelneoMappingService.mapFormaPagoFromAzure(datosVelneo.condicionesPago?.formaPago),
        premio: datosVelneo.condicionesPago?.premio || 0,
        total: datosVelneo.condicionesPago?.total || 0,
        moneda: VelneoMappingService.mapMonedaTextoAId(
          datosVelneo.condicionesPago?.moneda || datosVelneo.datosCobertura?.moneda, 
          masterOptions
        ),
        valorCuota: datosVelneo.condicionesPago?.valorCuota || 0,
        cuotas: datosVelneo.condicionesPago?.cuotas || VELNEO_DEFAULTS.CUOTAS_DEFAULT,

        // ===== PESTAÑA 6: OBSERVACIONES =====
        observaciones: VelneoMappingService.buildObservacionesFromAzure(datosVelneo.observaciones)
      };
      
      console.log('✅ [VelneoMappingService] Datos mapeados exitosamente:', Object.keys(mappedData));
      return mappedData;
      
    } catch (error) {
      console.error('❌ [VelneoMappingService] Error mapeando datos de Azure:', error);
      return {};
    }
  }

  // ===== MÉTODOS AUXILIARES (mantener los existentes) =====
  
  private static mapEstadoTramiteFromAzure(estado?: string): string {
    if (!estado) return VELNEO_DEFAULTS.ESTADO_TRAMITE_DEFAULT;
    
    const estadoUpper = estado.toUpperCase();
    if (estadoUpper.includes('PROCESO')) return 'En proceso';
    if (estadoUpper.includes('PENDIENTE')) return 'Pendiente';
    if (estadoUpper.includes('TERMINADO')) return 'Terminado';
    
    return VELNEO_DEFAULTS.ESTADO_TRAMITE_DEFAULT;
  }

  private static mapTramiteFromAzure(tipoMovimiento?: string): string {
    if (!tipoMovimiento) return VELNEO_DEFAULTS.TRAMITE_DEFAULT;
    
    const tipoUpper = tipoMovimiento.toUpperCase();
    if (tipoUpper.includes('EMISIÓN') || tipoUpper.includes('EMISION')) return 'Nuevo';
    if (tipoUpper.includes('RENOVACIÓN') || tipoUpper.includes('RENOVACION')) return 'Renovación';
    if (tipoUpper.includes('CAMBIO') || tipoUpper.includes('MODIFICACION')) return 'Cambio';
    if (tipoUpper.includes('ENDOSO')) return 'Endoso';
    
    return VELNEO_DEFAULTS.TRAMITE_DEFAULT;
  }

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

  private static mapZonaCirculacion(zona?: string): string {
    if (!zona) return VELNEO_DEFAULTS.DEPARTAMENTO_DEFAULT;
    
    const zonaUpper = zona.toUpperCase();
    if (zonaUpper.includes('MONTEVIDEO')) return 'MONTEVIDEO';
    if (zonaUpper.includes('CANELONES')) return 'CANELONES';
    if (zonaUpper.includes('MALDONADO')) return 'MALDONADO';
    
    return VELNEO_DEFAULTS.DEPARTAMENTO_DEFAULT;
  }

  private static mapCombustibleTextoAId(texto?: string, masterOptions?: MasterDataOptionsDto): string {
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
      texto.toLowerCase().includes(c.name?.toLowerCase() || '') ||
      c.id?.toLowerCase() === texto.toLowerCase()
    );
    
    return combustible?.id || VELNEO_DEFAULTS.COMBUSTIBLE_DEFAULT;
  }

  private static mapDestinoTextoAId(texto?: string, masterOptions?: MasterDataOptionsDto): number {
    if (!texto || !masterOptions?.Destinos) return VELNEO_DEFAULTS.DESTINO_DEFAULT;
    
    const destino = masterOptions.Destinos.find(d => 
      d.desnom?.toLowerCase().includes(texto.toLowerCase()) ||
      texto.toLowerCase().includes(d.desnom?.toLowerCase() || '')
    );
    
    return destino?.id || VELNEO_DEFAULTS.DESTINO_DEFAULT;
  }

  private static mapCalidadTextoAId(texto?: string, masterOptions?: MasterDataOptionsDto): number {
    if (!texto || !masterOptions?.Calidades) return VELNEO_DEFAULTS.CALIDAD_DEFAULT;
    
    const calidad = masterOptions.Calidades.find(c => 
      c.caldsc?.toLowerCase().includes(texto.toLowerCase()) ||
      texto.toLowerCase().includes(c.caldsc?.toLowerCase() || '')
    );
    
    return calidad?.id || VELNEO_DEFAULTS.CALIDAD_DEFAULT;
  }

  private static mapCategoriaTextoAId(texto?: string, masterOptions?: MasterDataOptionsDto): number {
    if (!texto || !masterOptions?.Categorias) return VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT;
    
    const categoria = masterOptions.Categorias.find(c => 
      c.catdsc?.toLowerCase().includes(texto.toLowerCase()) ||
      texto.toLowerCase().includes(c.catdsc?.toLowerCase() || '')
    );
    
    return categoria?.id || VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT;
  }

  private static mapCoberturaTextoAId(texto?: string, masterOptions?: MasterDataOptionsDto): number {
    if (!texto || !masterOptions?.Categorias) return VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT;
    
    // Las coberturas suelen estar en las categorías
    const cobertura = masterOptions.Categorias.find(c => 
      c.catdsc?.toLowerCase().includes(texto.toLowerCase()) ||
      texto.toLowerCase().includes(c.catdsc?.toLowerCase() || '') ||
      (texto.toLowerCase().includes('global') && c.catdsc?.toLowerCase().includes('global'))
    );
    
    return cobertura?.id || VELNEO_DEFAULTS.CAMPOS_NUMERICOS_DEFAULT;
  }

  private static mapMonedaTextoAId(texto?: string, masterOptions?: MasterDataOptionsDto): number {
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

  private static buildObservacionesFromAzure(observaciones?: any): string {
    if (!observaciones) return '';

    const parts = [
      observaciones.observacionesGenerales,
      observaciones.notasEscaneado?.join('\n'),
      observaciones.informacionAdicional
    ].filter(Boolean);

    return parts.join('\n\n');
  }

  private static formatDateForInput(dateString?: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }
}

// ✅ EXPORT DEL TIPO PARA COMPATIBILIDAD
export type { VelneoPolizaRequest };