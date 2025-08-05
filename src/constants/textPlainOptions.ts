// src/constants/textPlainOptions.ts - Opciones de texto plano

/**
 * 📋 OPCIONES DE TEXTO PLANO
 * Estas opciones NO vienen de la base de datos, son valores fijos
 * Basado en el endpoint /api/velneo/mapping-options del backend
 */

/**
 * 🎯 ESTADOS DE PÓLIZA
 * Correspondiente al campo "convig" en Velneo
 */
export const ESTADOS_POLIZA = [
  { id: 'VIG', name: 'VIG - Vigente', description: 'Póliza activa' },
  { id: 'ANT', name: 'ANT - Anterior', description: 'Póliza anterior' },
  { id: 'VEN', name: 'VEN - Vencida', description: 'Póliza vencida' },
  { id: 'END', name: 'END - Endosada', description: 'Póliza con endoso' },
  { id: 'ELIM', name: 'ELIM - Eliminada', description: 'Póliza eliminada' },
  { id: 'FIN', name: 'FIN - Finalizada', description: 'Póliza finalizada' }
] as const;

/**
 * 📝 TIPOS DE TRÁMITE
 * Correspondiente al campo "contra" en Velneo
 */
export const TIPOS_TRAMITE = [
  { id: 'Nuevo', name: 'Nuevo', description: 'Emisión nueva' },
  { id: 'Renovación', name: 'Renovación', description: 'Renovación de póliza existente' },
  { id: 'Cambio', name: 'Cambio', description: 'Modificación de póliza' },
  { id: 'Endoso', name: 'Endoso', description: 'Endoso de póliza' },
  { id: 'No Renueva', name: 'No Renueva', description: 'Cliente no renueva' },
  { id: 'Cancelación', name: 'Cancelación', description: 'Cancelación de póliza' }
] as const;

/**
 * ⚡ ESTADOS BÁSICOS
 * Correspondiente al campo "congeses" en Velneo
 */
export const ESTADOS_BASICOS = [
  { id: 'Pendiente', name: 'Pendiente', description: 'En espera' },
  { id: 'Pendiente c/plazo', name: 'Pendiente c/plazo', description: 'Pendiente con plazo definido' },
  { id: 'Terminado', name: 'Terminado', description: 'Proceso completado' },
  { id: 'En proceso', name: 'En proceso', description: 'En tramitación' },
  { id: 'Modificaciones', name: 'Modificaciones', description: 'Requiere modificaciones' },
  { id: 'En emisión', name: 'En emisión', description: 'En proceso de emisión' },
  { id: 'Enviado a cía', name: 'Enviado a cía', description: 'Enviado a compañía' },
  { id: 'Enviado a cía x mail', name: 'Enviado a cía x mail', description: 'Enviado por email' },
  { id: 'Devuelto a ejecutivo', name: 'Devuelto a ejecutivo', description: 'Requiere revisión' },
  { id: 'Declinado', name: 'Declinado', description: 'Solicitud declinada' }
] as const;

/**
 * 👥 TIPOS DE LÍNEA
 */
export const TIPOS_LINEA = [
  { id: 'Líneas personales', name: 'Líneas personales', description: 'Seguros para personas' },
  { id: 'Líneas comerciales', name: 'Líneas comerciales', description: 'Seguros para empresas' }
] as const;

/**
 * 💳 FORMAS DE PAGO
 * Correspondiente al campo "consta" en Velneo
 */
export const FORMAS_PAGO = [
  { id: 'Contado', name: 'Contado', description: 'Pago único al contado' },
  { id: 'Tarjeta de Crédito', name: 'Tarjeta de Crédito', description: 'Pago con tarjeta de crédito' },
  { id: 'Débito Automático', name: 'Débito Automático', description: 'Débito automático mensual' },
  { id: 'Cuotas', name: 'Cuotas', description: 'Pago en cuotas' },
  { id: 'Financiado', name: 'Financiado', description: 'Financiado por la compañía' }
] as const;

/**
 * 🏦 DEPARTAMENTOS DE URUGUAY
 * Para el campo "zonaCirculacion" / "dptnom"
 */
export const DEPARTAMENTOS_URUGUAY = [
  { id: 'MONTEVIDEO', name: 'Montevideo', description: 'Capital del país' },
  { id: 'ARTIGAS', name: 'Artigas', description: 'Departamento del norte' },
  { id: 'CANELONES', name: 'Canelones', description: 'Departamento metropolitano' },
  { id: 'CERRO LARGO', name: 'Cerro Largo', description: 'Departamento del este' },
  { id: 'COLONIA', name: 'Colonia', description: 'Departamento del suroeste' },
  { id: 'DURAZNO', name: 'Durazno', description: 'Centro del país' },
  { id: 'FLORES', name: 'Flores', description: 'Departamento central' },
  { id: 'FLORIDA', name: 'Florida', description: 'Departamento central' },
  { id: 'LAVALLEJA', name: 'Lavalleja', description: 'Departamento del sureste' },
  { id: 'MALDONADO', name: 'Maldonado', description: 'Departamento turístico' },
  { id: 'PAYSANDÚ', name: 'Paysandú', description: 'Departamento del noroeste' },
  { id: 'RÍO NEGRO', name: 'Río Negro', description: 'Departamento central-oeste' },
  { id: 'RIVERA', name: 'Rivera', description: 'Departamento fronterizo norte' },
  { id: 'ROCHA', name: 'Rocha', description: 'Departamento del este' },
  { id: 'SALTO', name: 'Salto', description: 'Departamento del noroeste' },
  { id: 'SAN JOSÉ', name: 'San José', description: 'Departamento del sur' },
  { id: 'SORIANO', name: 'Soriano', description: 'Departamento del suroeste' },
  { id: 'TACUAREMBÓ', name: 'Tacuarembó', description: 'Departamento del norte-centro' },
  { id: 'TREINTA Y TRES', name: 'Treinta y Tres', description: 'Departamento del este' }
] as const;

/**
 * 🎯 MAPEO INTELIGENTE DE VALORES
 * Para el mapeo automático desde Azure Document Intelligence
 */
export const MAPEO_AUTOMATICO = {
  // Estados de póliza más comunes desde Azure
  estadosPoliza: {
    'vigente': 'VIG',
    'activa': 'VIG',
    'válida': 'VIG',
    'vencida': 'VEN',
    'caducada': 'VEN',
    'cancelada': 'FIN',
    'anulada': 'ELIM'
  },
  
  // Tipos de trámite desde tipo de movimiento Azure
  tiposTramite: {
    'emisión': 'Nuevo',
    'emision': 'Nuevo',
    'nueva': 'Nuevo',
    'renovacion': 'Renovación',
    'renovación': 'Renovación',
    'modificacion': 'Cambio',
    'modificación': 'Cambio',
    'cambio': 'Cambio',
    'endoso': 'Endoso'
  },
  
  // Formas de pago comunes
  formasPago: {
    'efectivo': 'Contado',
    'contado': 'Contado',
    'tarjeta': 'Tarjeta de Crédito',
    'credito': 'Tarjeta de Crédito',
    'crédito': 'Tarjeta de Crédito',
    'debito': 'Débito Automático',
    'débito': 'Débito Automático',
    'automatico': 'Débito Automático',
    'automático': 'Débito Automático',
    'cuotas': 'Cuotas',
    'financiado': 'Financiado'
  },
  
  // Mapeo de departamentos (incluye variaciones)
  departamentos: {
    'montevideo': 'MONTEVIDEO',
    'canelones': 'CANELONES',
    'maldonado': 'MALDONADO',
    'colonia': 'COLONIA',
    'paysandu': 'PAYSANDÚ',
    'paysandú': 'PAYSANDÚ',
    'salto': 'SALTO',
    'rivera': 'RIVERA',
    'artigas': 'ARTIGAS',
    'tacuarembo': 'TACUAREMBÓ',
    'tacuarembó': 'TACUAREMBÓ',
    'cerro largo': 'CERRO LARGO',
    'rocha': 'ROCHA',
    'treinta y tres': 'TREINTA Y TRES',
    'lavalleja': 'LAVALLEJA',
    'florida': 'FLORIDA',
    'flores': 'FLORES',
    'durazno': 'DURAZNO',
    'rio negro': 'RÍO NEGRO',
    'río negro': 'RÍO NEGRO',
    'soriano': 'SORIANO',
    'san jose': 'SAN JOSÉ',
    'san josé': 'SAN JOSÉ'
  }
} as const;

/**
 * 🔍 UTILIDADES PARA BÚSQUEDA
 */
export const TextPlainUtils = {
  /**
   * Busca una opción por texto (fuzzy matching)
   */
  findOption: <T extends { id: string; name: string }>(
    options: readonly T[], 
    searchText: string
  ): T | null => {
    if (!searchText) return null;
    
    const text = searchText.toLowerCase().trim();
    
    // Búsqueda exacta por ID
    let found = options.find(opt => opt.id.toLowerCase() === text);
    if (found) return found;
    
    // Búsqueda exacta por nombre
    found = options.find(opt => opt.name.toLowerCase() === text);
    if (found) return found;
    
    // Búsqueda parcial por nombre
    found = options.find(opt => opt.name.toLowerCase().includes(text));
    if (found) return found;
    
    // Búsqueda parcial por ID
    found = options.find(opt => opt.id.toLowerCase().includes(text));
    if (found) return found;
    
    return null;
  },

  /**
   * Convierte opciones a formato para Select
   */
  toSelectOptions: <T extends { id: string; name: string; description?: string }>(
    options: readonly T[]
  ) => options.map(opt => ({
    id: opt.id,
    name: opt.name,
    description: opt.description
  }))
};

/**
 * 📦 EXPORT POR CATEGORÍA PARA FÁCIL IMPORTACIÓN
 */
export const TEXT_PLAIN_OPTIONS = {
  estadosPoliza: ESTADOS_POLIZA,
  tiposTramite: TIPOS_TRAMITE,
  estadosBasicos: ESTADOS_BASICOS,
  tiposLinea: TIPOS_LINEA,
  formasPago: FORMAS_PAGO,
  departamentos: DEPARTAMENTOS_URUGUAY
} as const;