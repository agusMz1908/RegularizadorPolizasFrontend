// src/constants/formTabs.ts - Configuración de pestañas

import type { FormTab, FormTabId, FieldMetadata } from '../types/policyForm';

/**
 * 🎨 CONFIGURACIÓN DE PESTAÑAS
 * Define la estructura, orden y apariencia de las pestañas del formulario
 */
export const FORM_TABS: FormTab[] = [
  {
    id: 'datos_basicos',
    label: 'Datos Básicos',
    icon: 'User',
    description: 'Corredor, asegurado y tomador',
    color: 'bg-blue-500',
    fields: [
      'corredor', 'asegurado', 'dirCobro', 'estadoTramite', 
      'tomador', 'domicilio', 'tramite', 'fecha', 'asignado', 'tipo', 'estadoPoliza'
    ]
  },
  {
    id: 'datos_poliza',
    label: 'Datos Póliza',
    icon: 'FileText',
    description: 'Compañía, fechas, número',
    color: 'bg-green-500',
    fields: ['compania', 'desde', 'hasta', 'poliza', 'certificado']
  },
  {
    id: 'datos_vehiculo',
    label: 'Vehículo',
    icon: 'Car',
    description: 'Marca, modelo, características',
    color: 'bg-purple-500',
    fields: [
      'marcaModelo', 'anio', 'matricula', 'motor', 'destinoId', 
      'combustibleId', 'chasis', 'calidadId', 'categoriaId'
    ]
  },
  {
    id: 'datos_cobertura',
    label: 'Cobertura',
    icon: 'Shield',
    description: 'Cobertura y zona',
    color: 'bg-orange-500',
    fields: ['coberturaId', 'zonaCirculacion', 'monedaId']
  },
  {
    id: 'condiciones_pago',
    label: 'Pago',
    icon: 'CreditCard',
    description: 'Forma pago, premio, cuotas',
    color: 'bg-emerald-500',
    fields: ['formaPago', 'premio', 'total', 'moneda', 'valorCuota', 'cuotas']
  },
  {
    id: 'observaciones',
    label: 'Observaciones',
    icon: 'MessageSquare',
    description: 'Notas adicionales',
    color: 'bg-slate-500',
    fields: ['observaciones']
  }
] as const;

/**
 * 📋 METADATOS COMPLETOS DE CAMPOS
 * Define cómo se comporta y renderiza cada campo del formulario
 */
export const FIELD_METADATA: Record<string, FieldMetadata> = {
  // ===== PESTAÑA 1: DATOS BÁSICOS =====
  corredor: {
    label: 'Corredor',
    type: 'text',
    tab: 'datos_basicos',
    required: true,
    placeholder: 'Nombre del corredor',
    icon: 'Building2',
    azureField: 'datosBasicos.corredor',
    validator: 'required'
  },
  
  asegurado: {
    label: 'Asegurado',
    type: 'text',
    tab: 'datos_basicos',
    required: true,
    readonly: true,
    icon: 'User',
    placeholder: 'Cliente seleccionado en paso anterior'
  },
  
  dirCobro: {
    label: 'Dir. Cobro',
    type: 'text',
    tab: 'datos_basicos',
    required: false,
    placeholder: 'Dirección de cobro',
    icon: 'MapPin'
  },
  
  estadoTramite: {
    label: 'Estado',
    type: 'select',
    tab: 'datos_basicos',
    required: true,
    optionsSource: 'plain',
    plainOptions: ['Pendiente', 'En proceso', 'Terminado', 'Modificaciones'],
    icon: 'FileText',
    fallbackValue: 'En proceso'
  },
  
  tomador: {
    label: 'Tomador',
    type: 'text',
    tab: 'datos_basicos',
    required: true,
    readonly: true,
    icon: 'User',
    placeholder: 'Mismo que asegurado'
  },
  
  domicilio: {
    label: 'Domicilio',
    type: 'text',
    tab: 'datos_basicos',
    required: false,
    readonly: true,
    icon: 'MapPin',
    placeholder: 'Del cliente seleccionado'
  },
  
  tramite: {
    label: 'Trámite',
    type: 'select',
    tab: 'datos_basicos',
    required: true,
    optionsSource: 'plain',
    plainOptions: ['Nuevo', 'Renovación', 'Cambio', 'Endoso'],
    icon: 'FileText',
    azureField: 'datosPoliza.tipoMovimiento',
    fallbackValue: 'Nuevo'
  },
  
  fecha: {
    label: 'Fecha',
    type: 'date',
    tab: 'datos_basicos',
    required: false,
    icon: 'Calendar',
    fallbackValue: new Date().toISOString().split('T')[0]
  },
  
  asignado: {
    label: 'Asignado',
    type: 'text',
    tab: 'datos_basicos',
    required: false,
    placeholder: 'Usuario asignado (ignorar por ahora)',
    icon: 'User'
  },
  
  tipo: {
    label: 'Tipo',
    type: 'select',
    tab: 'datos_basicos',
    required: true,
    optionsSource: 'plain',
    plainOptions: ['Líneas personales', 'Líneas comerciales'],
    icon: 'IdCard',
    fallbackValue: 'Líneas personales'
  },
  
  estadoPoliza: {
    label: 'Estado Póliza',
    type: 'select',
    tab: 'datos_basicos',
    required: true,
    optionsSource: 'plain',
    plainOptions: ['VIG', 'ANT', 'VEN', 'END', 'ELIM', 'FIN'],
    icon: 'Shield',
    fallbackValue: 'VIG'
  },

  // ===== PESTAÑA 2: DATOS DE LA PÓLIZA =====
  compania: {
    label: 'Compañía',
    type: 'text',
    tab: 'datos_poliza',
    required: true,
    readonly: true,
    icon: 'Building2',
    placeholder: 'Seleccionada en paso anterior'
  },
  
  desde: {
    label: 'Desde',
    type: 'date',
    tab: 'datos_poliza',
    required: true,
    icon: 'Calendar',
    azureField: 'datosPoliza.desde',
    validator: 'required'
  },
  
  hasta: {
    label: 'Hasta',
    type: 'date',
    tab: 'datos_poliza',
    required: true,
    icon: 'Calendar',
    azureField: 'datosPoliza.hasta',
    validator: 'required',
    dependency: 'desde'
  },
  
  poliza: {
    label: 'Póliza',
    type: 'text',
    tab: 'datos_poliza',
    required: true,
    placeholder: 'Número de póliza',
    icon: 'FileText',
    azureField: 'datosPoliza.numeroPoliza',
    validator: 'required'
  },
  
  certificado: {
    label: 'Certificado',
    type: 'text',
    tab: 'datos_poliza',
    required: false,
    placeholder: 'Número de certificado',
    icon: 'IdCard',
    azureField: 'datosPoliza.certificado'
  },

  // ===== PESTAÑA 3: DATOS DEL VEHÍCULO =====
  marcaModelo: {
    label: 'Marca - Modelo',
    type: 'text',
    tab: 'datos_vehiculo',
    required: true,
    placeholder: 'Marca y modelo unidos',
    icon: 'Car',
    azureField: 'datosVehiculo.marcaModelo',
    validator: 'required'
  },
  
  anio: {
    label: 'Año',
    type: 'number',
    tab: 'datos_vehiculo',
    required: true,
    placeholder: 'Año del vehículo',
    icon: 'Calendar',
    azureField: 'datosVehiculo.anio',
    validator: 'year'
  },
  
  matricula: {
    label: 'Matrícula',
    type: 'text',
    tab: 'datos_vehiculo',
    required: false,
    placeholder: 'Matrícula (si está matriculado)',
    icon: 'IdCard',
    azureField: 'datosVehiculo.matricula'
  },
  
  motor: {
    label: 'Motor',
    type: 'text',
    tab: 'datos_vehiculo',
    required: false,
    placeholder: 'Número de motor',
    icon: 'Car',
    azureField: 'datosVehiculo.motor'
  },
  
  destinoId: {
    label: 'Destino',
    type: 'select',
    tab: 'datos_vehiculo',
    required: true,
    optionsSource: 'master',
    masterType: 'destino',
    icon: 'Car',
    azureField: 'datosVehiculo.destino',
    fallbackValue: 2
  },
  
  combustibleId: {
    label: 'Combustible',
    type: 'select',
    tab: 'datos_vehiculo',
    required: true,
    optionsSource: 'master',
    masterType: 'combustible',
    icon: 'Car',
    azureField: 'datosVehiculo.combustible',
    fallbackValue: 'GAS'
  },
  
  chasis: {
    label: 'Chasis',
    type: 'text',
    tab: 'datos_vehiculo',
    required: false,
    placeholder: 'Número de chasis',
    icon: 'IdCard',
    azureField: 'datosVehiculo.chasis'
  },
  
  calidadId: {
    label: 'Calidad',
    type: 'select',
    tab: 'datos_vehiculo',
    required: true,
    optionsSource: 'master',
    masterType: 'calidad',
    icon: 'Shield',
    azureField: 'datosVehiculo.calidad',
    fallbackValue: 2
  },
  
  categoriaId: {
    label: 'Categoría',
    type: 'select',
    tab: 'datos_vehiculo',
    required: true,
    optionsSource: 'master',
    masterType: 'categoria',
    icon: 'Car',
    azureField: 'datosVehiculo.categoria',
    fallbackValue: 0
  },

  // ===== PESTAÑA 4: DATOS DE LA COBERTURA =====
  coberturaId: {
    label: 'Cobertura',
    type: 'select',
    tab: 'datos_cobertura',
    required: true,
    optionsSource: 'master',
    masterType: 'categoria', // Las coberturas están en categorías
    icon: 'Shield',
    azureField: 'datosCobertura.cobertura',
    fallbackValue: 0
  },
  
  zonaCirculacion: {
    label: 'Zona de Circulación',
    type: 'select',
    tab: 'datos_cobertura',
    required: true,
    optionsSource: 'plain',
    plainOptions: ['MONTEVIDEO', 'CANELONES', 'MALDONADO'], // Se completará con todos los departamentos
    icon: 'MapPin',
    azureField: 'datosCobertura.zonaCirculacion',
    fallbackValue: 'MONTEVIDEO'
  },
  
  monedaId: {
    label: 'Moneda',
    type: 'select',
    tab: 'datos_cobertura',
    required: true,
    optionsSource: 'master',
    masterType: 'moneda',
    icon: 'DollarSign',
    azureField: 'datosCobertura.moneda',
    fallbackValue: 1
  },

  // ===== PESTAÑA 5: CONDICIONES DE PAGO =====
  formaPago: {
    label: 'Forma Pago',
    type: 'select',
    tab: 'condiciones_pago',
    required: true,
    optionsSource: 'plain',
    plainOptions: ['Contado', 'Tarjeta de Crédito', 'Débito Automático', 'Cuotas', 'Financiado'],
    icon: 'CreditCard',
    azureField: 'condicionesPago.formaPago',
    fallbackValue: 'Contado'
  },
  
  premio: {
    label: 'Premio',
    type: 'number',
    tab: 'condiciones_pago',
    required: true,
    placeholder: 'Premio/prima',
    icon: 'DollarSign',
    azureField: 'condicionesPago.premio',
    validator: 'positiveNumber'
  },
  
  total: {
    label: 'Total',
    type: 'number',
    tab: 'condiciones_pago',
    required: true,
    placeholder: 'Prima total',
    icon: 'DollarSign',
    azureField: 'condicionesPago.total',
    validator: 'positiveNumber'
  },
  
  moneda: {
    label: 'Moneda',
    type: 'select',
    tab: 'condiciones_pago',
    required: true,
    optionsSource: 'master',
    masterType: 'moneda',
    icon: 'DollarSign',
    dependency: 'monedaId',
    fallbackValue: 1
  },
  
  valorCuota: {
    label: 'Valor Cuota',
    type: 'number',
    tab: 'condiciones_pago',
    required: false,
    placeholder: 'Valor de la primera cuota',
    icon: 'DollarSign',
    azureField: 'condicionesPago.valorCuota'
  },
  
  cuotas: {
    label: 'Cuotas',
    type: 'number',
    tab: 'condiciones_pago',
    required: true,
    placeholder: 'Cantidad de cuotas',
    icon: 'CreditCard',
    azureField: 'condicionesPago.cuotas',
    validator: 'cuotas',
    fallbackValue: 1
  },

  // ===== PESTAÑA 6: OBSERVACIONES =====
  observaciones: {
    label: 'Observaciones',
    type: 'textarea',
    tab: 'observaciones',
    required: false,
    placeholder: 'Ingrese cualquier observación adicional...',
    icon: 'MessageSquare',
    azureField: 'observaciones.observacionesGenerales'
  }
};

/**
 * 🔍 UTILIDADES PARA TRABAJAR CON PESTAÑAS
 */
export const TabsUtils = {
  /**
   * Obtiene una pestaña por ID
   */
  getTabById: (tabId: FormTabId): FormTab | undefined => {
    return FORM_TABS.find(tab => tab.id === tabId);
  },

  /**
   * Obtiene la pestaña siguiente
   */
  getNextTab: (currentTabId: FormTabId): FormTab | null => {
    const currentIndex = FORM_TABS.findIndex(tab => tab.id === currentTabId);
    if (currentIndex === -1 || currentIndex === FORM_TABS.length - 1) return null;
    return FORM_TABS[currentIndex + 1];
  },

  /**
   * Obtiene la pestaña anterior
   */
  getPreviousTab: (currentTabId: FormTabId): FormTab | null => {
    const currentIndex = FORM_TABS.findIndex(tab => tab.id === currentTabId);
    if (currentIndex <= 0) return null;
    return FORM_TABS[currentIndex - 1];
  },

  /**
   * Obtiene los campos de una pestaña
   */
  getFieldsForTab: (tabId: FormTabId): string[] => {
    const tab = FORM_TABS.find(t => t.id === tabId);
    return tab ? tab.fields : [];
  },

  /**
   * Obtiene la pestaña que contiene un campo específico
   */
  getTabForField: (fieldName: string): FormTabId | null => {
    const tab = FORM_TABS.find(t => t.fields.includes(fieldName as any));
    return tab ? tab.id : null;
  },

  /**
   * Obtiene campos requeridos de una pestaña
   */
  getRequiredFieldsForTab: (tabId: FormTabId): string[] => {
    const fields = TabsUtils.getFieldsForTab(tabId);
    return fields.filter(field => FIELD_METADATA[field]?.required);
  },

  /**
   * Calcula el progreso de completitud de una pestaña
   */
  calculateTabCompletion: (tabId: FormTabId, formData: any): number => {
    const requiredFields = TabsUtils.getRequiredFieldsForTab(tabId);
    if (requiredFields.length === 0) return 100;
    
    const completedFields = requiredFields.filter(field => {
      const value = formData[field];
      return value !== null && value !== undefined && value !== '';
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  },

  /**
   * Obtiene metadatos de un campo
   */
  getFieldMetadata: (fieldName: string): FieldMetadata | null => {
    return FIELD_METADATA[fieldName] || null;
  }
};

/**
 * 📊 ORDEN DE NAVEGACIÓN DE PESTAÑAS
 */
export const TAB_ORDER = FORM_TABS.map(tab => tab.id);

/**
 * 🎯 PRIMERA Y ÚLTIMA PESTAÑA
 */
export const FIRST_TAB = TAB_ORDER[0];
export const LAST_TAB = TAB_ORDER[TAB_ORDER.length - 1];