import React from "react";

export type TipoOperacion = 'EMISION' | 'RENOVACION' | 'ENDOSO' | 'CAMBIO';
export type TipoTramite = 'Nuevo' | 'Renovacion' | 'Cambio' | 'Endoso';
export type EstadoPoliza = 'VIG' | 'VEN' | 'END' | 'CAN' | 'ANT';

export interface OperacionConfig {
  operacion: TipoOperacion;
  tramite: TipoTramite;
  estadoPoliza: EstadoPoliza;
  descripcion: string;
  icon?: string;
}

export const OPERACIONES_CONFIG: Record<TipoOperacion, OperacionConfig> = {
  EMISION: {
    operacion: 'EMISION',
    tramite: 'Nuevo',
    estadoPoliza: 'VIG', // Por defecto vigente, se validará con fechas
    descripcion: 'Nueva póliza de seguro',
    icon: '🆕'
  },
  RENOVACION: {
    operacion: 'RENOVACION',
    tramite: 'Renovacion',
    estadoPoliza: 'VIG', // La nueva póliza renovada es vigente
    descripcion: 'Renovación de póliza existente',
    icon: '🔄'
  },
  ENDOSO: {
    operacion: 'ENDOSO',
    tramite: 'Endoso',
    estadoPoliza: 'END', // Estado específico para endosos
    descripcion: 'Modificación de póliza (endoso)',
    icon: '📝'
  },
  CAMBIO: {
    operacion: 'CAMBIO',
    tramite: 'Cambio',
    estadoPoliza: 'VIG', // Cambios mantienen vigencia
    descripcion: 'Cambio en póliza existente',
    icon: '⚡'
  }
};

/**
 * Determina automáticamente el trámite según la operación
 */
export const determinarTramite = (operacion: TipoOperacion): TipoTramite => {
  return OPERACIONES_CONFIG[operacion].tramite;
};

/**
 * Determina el estado de la póliza según operación y fechas
 */
export const determinarEstadoPoliza = (
  operacion: TipoOperacion, 
  vigenciaHasta?: string | Date
): EstadoPoliza => {
  const config = OPERACIONES_CONFIG[operacion];
  
  // Para emisiones, verificar si está en fecha
  if (operacion === 'EMISION' && vigenciaHasta) {
    const hoy = new Date();
    const fechaVencimiento = new Date(vigenciaHasta);
    
    // Si ya venció, estado vencido
    if (fechaVencimiento < hoy) {
      return 'VEN';
    }
  }
  
  return config.estadoPoliza;
};

/**
 * Extrae el tipo de operación desde datos de Azure
 */
export const extraerOperacionDesdeAzure = (datosAzure: any): TipoOperacion => {
  // Buscar en diferentes campos posibles
  const tipoMovimiento = datosAzure?.datosVelneo?.datosPoliza?.tipoMovimiento ||
                        datosAzure?.datosFormateados?.tipoMovimiento ||
                        datosAzure?.tipoMovimiento ||
                        '';
  
  const tramite = datosAzure?.datosVelneo?.datosBasicos?.tramite ||
                 datosAzure?.datosFormateados?.tramite ||
                 datosAzure?.tramite ||
                 '';

  // Normalizar texto
  const texto = (tipoMovimiento || tramite).toString().toUpperCase().trim();
  
  // Mapear según patrones conocidos
  if (texto.includes('EMISION') || texto.includes('NUEVA') || texto.includes('ALTA')) {
    return 'EMISION';
  }
  
  if (texto.includes('RENOVACION') || texto.includes('RENOV')) {
    return 'RENOVACION';
  }
  
  if (texto.includes('ENDOSO')) {
    return 'ENDOSO';
  }
  
  if (texto.includes('MODIFICACION') || texto.includes('CAMBIO')) {
    return 'CAMBIO';
  }
  
  // Por defecto, asumimos emisión
  return 'EMISION';
};

/**
 * Aplica la lógica automática a los datos del formulario
 */
export const aplicarLogicaOperacion = (
  operacion: TipoOperacion,
  datosFormulario: any,
  datosAzure?: any
) => {
  const tramite = determinarTramite(operacion);
  const estadoPoliza = determinarEstadoPoliza(operacion, datosFormulario.vigenciaHasta);
  
  return {
    ...datosFormulario,
    operacion,
    tramite,
    estadoPoliza,
    
    // Metadata para auditoría
    operacionDetectadaAutomaticamente: !!datosAzure,
    fechaAplicacionLogica: new Date().toISOString(),
  };
};

/**
 * Hook para manejar la lógica de operaciones en el formulario
 */
export const useOperacionLogic = (initialData?: any) => {
  const [operacionActual, setOperacionActual] = React.useState<TipoOperacion>('EMISION');
  const [tramiteCalculado, setTramiteCalculado] = React.useState<TipoTramite>('Nuevo');
  const [estadoCalculado, setEstadoCalculado] = React.useState<EstadoPoliza>('VIG');

  React.useEffect(() => {
    // Aplicar lógica cuando cambia la operación
    const nuevoTramite = determinarTramite(operacionActual);
    const nuevoEstado = determinarEstadoPoliza(
      operacionActual, 
      initialData?.vigenciaHasta
    );
    
    setTramiteCalculado(nuevoTramite);
    setEstadoCalculado(nuevoEstado);
  }, [operacionActual, initialData?.vigenciaHasta]);

  const cambiarOperacion = (nuevaOperacion: TipoOperacion) => {
    setOperacionActual(nuevaOperacion);
  };

  const aplicarLogicaAutomatica = (datosAzure: any) => {
    const operacionDetectada = extraerOperacionDesdeAzure(datosAzure);
    setOperacionActual(operacionDetectada);
    return operacionDetectada;
  };

  return {
    operacionActual,
    tramiteCalculado,
    estadoCalculado,
    cambiarOperacion,
    aplicarLogicaAutomatica,
    configActual: OPERACIONES_CONFIG[operacionActual],
  };
};

