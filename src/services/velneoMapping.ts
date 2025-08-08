// src/services/velneoMapping.ts - VERSIÓN COMPLETA CORREGIDA

import type { PolicyFormData, PolizaCreateRequest } from '../types/poliza';
import type { MasterDataOptionsDto } from '../types/masterData';
import type { AzureProcessResponse } from '../types/azureDocumentResult';
import { VELNEO_DEFAULTS } from '../constants/velneoDefault';

export class VelneoMappingService {
  
static mapFormDataToVelneoRequest(
    formData: PolicyFormData,
    selectedClient: any,
    selectedCompany: any,
    selectedSection: any,
    masterOptions?: MasterDataOptionsDto,
    scannedData?: any
  ): PolizaCreateRequest {

    // Construir observaciones completas
    let observacionesCompletas = formData.observaciones || '';
    
    if (scannedData) {
      observacionesCompletas += '\n\n========== PROCESADO CON INTELIGENCIA ARTIFICIAL ==========';
      observacionesCompletas += `\nArchivo: ${scannedData.archivo || 'Documento PDF'}`;
      observacionesCompletas += `\nFecha procesamiento: ${new Date().toLocaleDateString('es-UY')} ${new Date().toLocaleTimeString('es-UY')}`;
      observacionesCompletas += `\nPrecisión del escaneo: ${Math.round(scannedData.porcentajeCompletitud || 0)}%`;
    }

    if (formData.cuotas > 1) {
      observacionesCompletas += '\n\n========== PLAN DE PAGOS ==========';
      observacionesCompletas += `\nForma de pago: ${formData.formaPago}`;
      observacionesCompletas += `\nTotal de cuotas: ${formData.cuotas}`;
      observacionesCompletas += `\nPremio: $${formData.premio}`;
      observacionesCompletas += `\nTotal a pagar: $${formData.total}`;
      observacionesCompletas += `\nValor por cuota: $${formData.valorCuota}`;
      
      if (formData.monedaPagoId !== formData.monedaId) {
        const monedaPago = masterOptions?.monedas?.find((m: any) => m.id === formData.monedaPagoId);
        observacionesCompletas += `\nMoneda de pago: ${monedaPago?.nombre || `ID ${formData.monedaPagoId}`}`;
      }
    }

    // IMPORTANTE: Garantizar que Seccod SIEMPRE sea un número
    const seccionId = selectedSection?.id || 
                     formData.seccion || 
                     VELNEO_DEFAULTS.SECCION_AUTOMOVILES;

    const request: PolizaCreateRequest = {
      // ===== CAMPOS REQUERIDOS (nunca undefined) =====
      Comcod: selectedCompany?.id || formData.compania || VELNEO_DEFAULTS.COMPANIA_BSE,
      Seccod: Number(seccionId),
      Clinro: selectedClient?.id || formData.clinro || 0,
      Conpol: formData.poliza || '',
      Confchdes: this.formatDateForVelneo(formData.desde),
      Confchhas: this.formatDateForVelneo(formData.hasta),
      Conpremio: Number(formData.premio) || 0,
      Asegurado: selectedClient?.clinom || formData.asegurado || '',

      // ===== DATOS DE CONTROL =====
      Contra: this.mapTramiteToVelneo(formData.tramite),
      Congesti: this.mapEstadoTramiteToVelneo(formData.estadoTramite),
      Congeses: this.mapEstadoTramiteToVelneo(formData.estadoTramite),
      Convig: this.mapEstadoPolizaToVelneo(formData.estadoPoliza),
      Consta: this.mapFormaPagoToVelneo(formData.formaPago),

      // ===== DATOS DEL VEHÍCULO =====
      Conmaraut: formData.marcaModelo || '',
      Conanioaut: formData.anio ? Number(formData.anio) : undefined,
      Conmataut: formData.matricula || '',
      Conmotor: formData.motor || '',
      Conchasis: formData.chasis || '',

      // ===== IDs DE MAESTROS =====
      Catdsc: formData.categoriaId || undefined,
      Desdsc: formData.destinoId || undefined,
      Caldsc: formData.calidadId || undefined,
      Tarcod: formData.tarifaId || undefined,
      
      // ===== DATOS FINANCIEROS CON DOBLE MONEDA =====
      Contot: Number(formData.total) || Number(formData.premio) || 0,
      Concuo: Number(formData.cuotas) || 1,
      Moncod: Number(formData.monedaId) || VELNEO_DEFAULTS.MONEDA_DEFAULT,
      Conviamon: Number(formData.monedaPagoId) || Number(formData.monedaId) || VELNEO_DEFAULTS.MONEDA_DEFAULT,

      // ===== CAMPOS LEGACY =====
      Combustible: formData.combustibleId || '',
      Departamento: formData.zonaCirculacion || '',
      CategoriaId: formData.categoriaId,
      DestinoId: formData.destinoId,
      CalidadId: formData.calidadId,
      FormaPago: formData.formaPago,
      CantidadCuotas: formData.cuotas,
      ValorCuota: formData.valorCuota,
      
      // ===== OTROS CAMPOS =====
      Ramo: 'AUTOMOVILES',
      Observaciones: observacionesCompletas,
      ProcesadoConIA: true,
      
      // Datos adicionales
      Condom: selectedClient?.clidir || formData.domicilio || '',
      Clinom: selectedClient?.clinom || formData.asegurado || '',
      Concar: formData.certificado || '0',
      Conend: formData.endoso || '0',
    };

    return request;
  }

  private static formatDateForVelneo(date: string | undefined): string {
    if (!date) return new Date().toISOString().split('T')[0];
    
    try {
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    } catch {
      return date;
    }
  }

  private static mapTramiteToVelneo(tramite: string | undefined): string {
    if (!tramite) return '1';
    
    const mapping: Record<string, string> = {
      'Nuevo': '1',
      'Renovación': '2',
      'Cambio': '3',
      'Endoso': '4',
      'No Renueva': '5',
      'Cancelación': '6'
    };
    return mapping[tramite] || '1';
  }

  private static mapEstadoTramiteToVelneo(estado: string | undefined): string {
    if (!estado) return '1';
    
    const mapping: Record<string, string> = {
      'Pendiente': '1',
      'En proceso': '2',
      'Terminado': '3',
      'Modificaciones': '4'
    };
    return mapping[estado] || '1';
  }

  private static mapEstadoPolizaToVelneo(estado: string | undefined): string {
    if (!estado) return '1';
    
    const mapping: Record<string, string> = {
      'VIG': '1',
      'ANT': '2',
      'VEN': '3',
      'END': '4',
      'ELIM': '5',
      'FIN': '6'
    };
    return mapping[estado] || '1';
  }

  private static mapFormaPagoToVelneo(formaPago: string | undefined): string {
    if (!formaPago) return '1';
    
    const mapping: Record<string, string> = {
      'Contado': '1',
      'Tarjeta': '2',
      'Débito Automático': '3',
      'Cuotas': '4'
    };
    return mapping[formaPago] || '1';
  }

  private static mapCombustible(combustibleTexto: string | undefined): string {
    if (!combustibleTexto) return 'GASOLINA'; // Default
    
    const textoUpper = combustibleTexto.toUpperCase().trim();
    
    // Mapeo de DIESEL y sus variantes
    // IMPORTANTE: El backend tiene "DISEL" (mal escrito)
    const dieselVariants = [
      'DIESEL',
      'DISEL',
      'GASOIL',
      'GAS-OIL',
      'GAS OIL',
      'DIESEL (GAS-OIL)',
      'DIESEL(GAS-OIL)',
      'GAZOLE',
      'DIESSEL'
    ];
    
    if (dieselVariants.some(variant => 
      textoUpper.includes(variant) || variant.includes(textoUpper)
    )) {
      console.log('🚗 Combustible DIESEL detectado, mapeando a DISEL (como está en backend)');
      return 'DISEL'; // Retornar como está en el backend (con error tipográfico)
    }
    
    // Mapeo de ELÉCTRICO
    const electricoVariants = ['ELECTRICO', 'ELECTRICOS', 'ELECTRIC', 'ELÉCTRICO', 'ELE'];
    if (electricoVariants.some(variant => 
      textoUpper.includes(variant) || variant.includes(textoUpper)
    )) {
      return 'ELECTRICOS';
    }
    
    // Mapeo de HÍBRIDO
    const hibridoVariants = ['HIBRIDO', 'HÍBRIDO', 'HYBRIDO', 'HYBRID', 'HYB'];
    if (hibridoVariants.some(variant => 
      textoUpper.includes(variant) || variant.includes(textoUpper)
    )) {
      return 'HYBRIDO';
    }
    
    // Mapeo de GASOLINA
    const gasolinaVariants = ['GASOLINA', 'NAFTA', 'BENCINA', 'SUPER', 'PREMIUM', 'GAS'];
    if (gasolinaVariants.some(variant => 
      textoUpper.includes(variant) || variant.includes(textoUpper)
    )) {
      return 'GASOLINA';
    }
    
    console.warn(`⚠️ Combustible no reconocido: "${combustibleTexto}", usando GASOLINA por defecto`);
    return 'GASOLINA';
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
    // MAPEO DE COMBUSTIBLE MEJORADO
    const combustibleEscaneado = datosVelneo.datosVehiculo?.combustible;
    const combustibleMapeado = this.mapCombustible(combustibleEscaneado);
    
    console.log('🚗 Mapeo de combustible:', {
      escaneado: combustibleEscaneado,
      mapeado: combustibleMapeado,
      esperadoEnBackend: combustibleEscaneado?.includes('DIESEL') ? 'DISEL' : combustibleMapeado
    });

    // MAPEO DE IDs DE MAESTROS DESDE TEXTO
    const destinoId = this.mapDestinoTextToId(datosVelneo.datosVehiculo?.destino, masterOptions?.destinos);
    const calidadId = this.mapCalidadTextToId(datosVelneo.datosVehiculo?.calidad, masterOptions?.calidades);
    const categoriaId = this.mapCategoriaTextToId(datosVelneo.datosVehiculo?.categoria, masterOptions?.categorias);

    console.log('🎯 Mapeo de IDs de maestros:', {
      destino: { texto: datosVelneo.datosVehiculo?.destino, id: destinoId },
      calidad: { texto: datosVelneo.datosVehiculo?.calidad, id: calidadId },
      categoria: { texto: datosVelneo.datosVehiculo?.categoria, id: categoriaId }
    });

    const mappedData: Partial<PolicyFormData> = {
      // ===== DATOS BÁSICOS =====
      corredor: datosVelneo.datosBasicos?.corredor || '',
      asegurado: selectedClient?.clinom || datosVelneo.datosBasicos?.asegurado || '',
      tomador: selectedClient?.clinom || datosVelneo.datosBasicos?.asegurado || '', // Por defecto igual al asegurado
      domicilio: datosVelneo.datosBasicos?.domicilio || selectedClient?.clidir || '',
      dirCobro: selectedClient?.clidircob || selectedClient?.clidir || datosVelneo.datosBasicos?.domicilio || '',
      estadoTramite: 'En proceso', // Valor por defecto
      tramite: this.mapTramiteFromAzure(datosVelneo.datosPoliza?.tipoMovimiento),
      fecha: datosVelneo.datosBasicos?.fecha ? this.formatDateForInput(datosVelneo.datosBasicos.fecha) : new Date().toISOString().split('T')[0],
      asignado: datosVelneo.datosBasicos?.asignado || '',
      tipo: datosVelneo.datosBasicos?.tipo || 'Líneas personales',
      estadoPoliza: 'VIG',

      // ===== DATOS PÓLIZA =====
      compania: selectedCompany?.id || VELNEO_DEFAULTS.COMPANIA_BSE,
      comalias: selectedCompany?.comalias || 'BSE',
      seccion: VELNEO_DEFAULTS.SECCION_AUTOMOVILES,
      poliza: datosVelneo.datosPoliza?.numeroPoliza || '',
      certificado: datosVelneo.datosPoliza?.certificado || '',
      endoso: datosVelneo.datosPoliza?.endoso || '0',
      desde: this.formatDateForInput(datosVelneo.datosPoliza?.desde),
      hasta: this.formatDateForInput(datosVelneo.datosPoliza?.hasta),

      // ===== DATOS VEHÍCULO CON IDs MAPEADOS =====
      marcaModelo: datosVelneo.datosVehiculo?.marcaModelo || 
                   `${datosVelneo.datosVehiculo?.marca || ''} ${datosVelneo.datosVehiculo?.modelo || ''}`.trim(),
      anio: datosVelneo.datosVehiculo?.anio || '',
      matricula: datosVelneo.datosVehiculo?.matricula || '',
      motor: datosVelneo.datosVehiculo?.motor || '',
      chasis: datosVelneo.datosVehiculo?.chasis || '',
      
      // 🚗 COMBUSTIBLE CON MAPEO INTELIGENTE
      combustibleId: combustibleMapeado,
      
      // 🎯 IDs DE MAESTROS MAPEADOS DESDE TEXTO
      destinoId: destinoId,
      calidadId: calidadId,
      categoriaId: categoriaId,

      // ===== DATOS DE COBERTURA =====
      coberturaId: VELNEO_DEFAULTS.COBERTURA_DEFAULT, // Por defecto
      tarifaId: undefined, // Se puede mapear si viene
      zonaCirculacion: datosVelneo.datosCobertura?.zonaCirculacion || 'Todo el país',
      departamentoId: this.mapDepartamentoTextToId(datosVelneo.datosBasicos?.departamento, masterOptions?.departamentos),
      monedaId: datosVelneo.datosCobertura?.codigoMoneda || VELNEO_DEFAULTS.MONEDA_DEFAULT,

      // ===== DATOS FINANCIEROS =====
      premio: Number(datosVelneo.condicionesPago?.premio) || 0,
      total: Number(datosVelneo.condicionesPago?.total) || Number(datosVelneo.condicionesPago?.premio) || 0,
      formaPago: datosVelneo.condicionesPago?.formaPago || 'Contado',
      cuotas: Number(datosVelneo.condicionesPago?.cuotas) || 1,
      valorCuota: Number(datosVelneo.condicionesPago?.valorCuota) || 0,
      monedaPagoId: datosVelneo.datosCobertura?.codigoMoneda || VELNEO_DEFAULTS.MONEDA_DEFAULT,

      // ===== OBSERVACIONES =====
      observaciones: datosVelneo.observaciones?.observacionesGenerales || ''
    };

    // Log detallado del mapeo
    console.log('✅ [VelneoMappingService] Mapeo de Azure completado:', {
      camposMapeados: Object.keys(mappedData).filter(key => {
        const value = mappedData[key as keyof PolicyFormData];
        return value !== '' && value !== null && value !== undefined;
      }).length,
      completitud: azureData.porcentajeCompletitud || 0,
      maestrosMapeados: {
        combustible: { original: combustibleEscaneado, mapeado: mappedData.combustibleId },
        destino: { original: datosVelneo.datosVehiculo?.destino, id: mappedData.destinoId },
        calidad: { original: datosVelneo.datosVehiculo?.calidad, id: mappedData.calidadId },
        categoria: { original: datosVelneo.datosVehiculo?.categoria, id: mappedData.categoriaId }
      }
    });

    return mappedData;
    
  } catch (error) {
    console.error('❌ [VelneoMappingService] Error mapeando datos de Azure:', error);
    return {};
  }
}

private static mapDestinoTextToId(destinoTexto: string | undefined, destinos?: any[]): number {
  if (!destinoTexto) return VELNEO_DEFAULTS.DESTINO_DEFAULT;
  
  const textoUpper = destinoTexto.toUpperCase().trim();
  
  // Mapeo directo de textos conocidos
  const mapeoDestino: Record<string, number> = {
    'PARTICULAR': 1,
    'COMERCIAL': 2,
    'TRABAJO': 2,
    'PARTICULAR Y TRABAJO': 3,
    'UBER': 4,
    'TAXI': 5,
    'REMISE': 6
  };
  
  // Si hay maestros disponibles, buscar coincidencia
  if (destinos && destinos.length > 0) {
    const destinoEncontrado = destinos.find(d => 
      d.desnom?.toUpperCase().includes(textoUpper) ||
      textoUpper.includes(d.desnom?.toUpperCase())
    );
    if (destinoEncontrado) return destinoEncontrado.id;
  }
  
  // Mapeo por defecto
  return mapeoDestino[textoUpper] || VELNEO_DEFAULTS.DESTINO_DEFAULT;
}

private static mapCalidadTextToId(calidadTexto: string | undefined, calidades?: any[]): number {
  if (!calidadTexto) return VELNEO_DEFAULTS.CALIDAD_DEFAULT;
  
  const textoUpper = calidadTexto.toUpperCase().trim();
  
  // Mapeo directo de textos conocidos
  const mapeoCalidad: Record<string, number> = {
    'PROPIETARIO': 1,
    'USUARIO': 2,
    'ARRENDATARIO': 3,
    'COMPRADOR': 4,
    'LEASING': 5
  };
  
  // Si hay maestros disponibles, buscar coincidencia
  if (calidades && calidades.length > 0) {
    const calidadEncontrada = calidades.find(c => 
      c.caldsc?.toUpperCase().includes(textoUpper) ||
      textoUpper.includes(c.caldsc?.toUpperCase())
    );
    if (calidadEncontrada) return calidadEncontrada.id;
  }
  
  // Mapeo por defecto
  return mapeoCalidad[textoUpper] || VELNEO_DEFAULTS.CALIDAD_DEFAULT;
}

private static mapCategoriaTextToId(categoriaTexto: string | undefined, categorias?: any[]): number {
  if (!categoriaTexto) return VELNEO_DEFAULTS.CATEGORIA_DEFAULT;
  
  const textoUpper = categoriaTexto.toUpperCase().trim();
  
  // Mapeo directo de textos conocidos para automóviles
  const mapeoCategoria: Record<string, number> = {
    'AUTOMOVIL': 20,
    'AUTOMÓVIL': 20,
    'AUTO': 20,
    'CAMIONETA': 21,
    'CAMION': 22,
    'CAMIÓN': 22,
    'OMNIBUS': 23,
    'ÓMNIBUS': 23,
    'MOTO': 24,
    'MOTOCICLETA': 24,
    'REMOLQUE': 25,
    'CASA RODANTE': 26,
    'UTILITARIO': 27
  };
  
  // Si hay maestros disponibles, buscar coincidencia
  if (categorias && categorias.length > 0) {
    const categoriaEncontrada = categorias.find(c => 
      c.catdsc?.toUpperCase().includes(textoUpper) ||
      textoUpper.includes(c.catdsc?.toUpperCase())
    );
    if (categoriaEncontrada) return categoriaEncontrada.id;
  }
  
  // Mapeo por defecto
  return mapeoCategoria[textoUpper] || VELNEO_DEFAULTS.CATEGORIA_DEFAULT;
}

private static mapDepartamentoTextToId(departamentoTexto: string | undefined, departamentos?: any[]): number {
  if (!departamentoTexto) return VELNEO_DEFAULTS.DEPARTAMENTO_DEFAULT_ID;
  
  const textoUpper = departamentoTexto.toUpperCase().trim();
  
  // Mapeo directo de departamentos de Uruguay
  const mapeoDepartamento: Record<string, number> = {
    'MONTEVIDEO': 1,
    'ARTIGAS': 2,
    'CANELONES': 3,
    'CERRO LARGO': 4,
    'COLONIA': 5,
    'DURAZNO': 6,
    'FLORES': 7,
    'FLORIDA': 8,
    'LAVALLEJA': 9,
    'MALDONADO': 10,
    'PAYSANDÚ': 11,
    'PAYSANDU': 11,
    'RÍO NEGRO': 12,
    'RIO NEGRO': 12,
    'RIVERA': 13,
    'ROCHA': 14,
    'SALTO': 15,
    'SAN JOSÉ': 16,
    'SAN JOSE': 16,
    'SORIANO': 17,
    'TACUAREMBÓ': 18,
    'TACUAREMBO': 18,
    'TREINTA Y TRES': 19
  };
  
  // Si hay maestros disponibles, buscar coincidencia
  if (departamentos && departamentos.length > 0) {
    const departamentoEncontrado = departamentos.find(d => 
      d.nombre?.toUpperCase() === textoUpper ||
      d.dptnom?.toUpperCase() === textoUpper
    );
    if (departamentoEncontrado) return departamentoEncontrado.id;
  }
  
  // Mapeo por defecto
  return mapeoDepartamento[textoUpper] || VELNEO_DEFAULTS.DEPARTAMENTO_DEFAULT_ID;
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
   * 🔄 Mapear estado de vigencia (método para compatibilidad)
   */
  static mapEstadoVigencia(estado: string): string {
    return this.mapEstadoPolizaToVelneo(estado);
  }

  static mapTipoTramite(tramite: string): string {
    return this.mapTramiteToVelneo(tramite);
  }

  static mapEstadoGestion(estado: string): string {
    return this.mapEstadoTramiteToVelneo(estado);
  }
}



export default VelneoMappingService;