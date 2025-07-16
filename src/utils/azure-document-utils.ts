import type {
  AzureProcessResponse,
  AzureDatosFormateados,
  AzureBatchResponse
} from '../types/azure-document';

export const AzureDocumentUtils = {

  getNextStepMessage(siguientePaso: string): string {
    const steps = {
      'crear_poliza_automatico': 'Cliente encontrado. Listo para crear póliza automáticamente.',
      'confirmar_cliente': 'Cliente muy probable encontrado. Confirmar antes de proceder.',
      'seleccionar_cliente': 'Múltiples clientes encontrados. Seleccionar el correcto.',
      'buscar_cliente_manualmente': 'No se encontró cliente. Buscar manualmente o crear nuevo.'
    };
    return steps[siguientePaso as keyof typeof steps] || 'Paso no reconocido';
  },

  getStateColor(estado: string): { color: string; bgColor: string; textColor: string } {
    const colors = {
      'PROCESADO_CON_SMART_EXTRACTION': { 
        color: 'green-500', 
        bgColor: 'bg-green-50', 
        textColor: 'text-green-700' 
      },
      'ERROR': { 
        color: 'red-500', 
        bgColor: 'bg-red-50', 
        textColor: 'text-red-700' 
      },
      'PROCESANDO': { 
        color: 'yellow-500', 
        bgColor: 'bg-yellow-50', 
        textColor: 'text-yellow-700' 
      },
      'PENDIENTE': { 
        color: 'blue-500', 
        bgColor: 'bg-blue-50', 
        textColor: 'text-blue-700' 
      }
    };
    return colors[estado as keyof typeof colors] || { 
      color: 'gray-500', 
      bgColor: 'bg-gray-50', 
      textColor: 'text-gray-700' 
    };
  },

  getClientResultIcon(tipoResultado: string): string {
    const icons = {
      'MatchExacto': '✅',
      'MatchMuyProbable': '🟡',
      'MultiplesMatches': '🔄',
      'SinCoincidencias': '❌'
    };
    return icons[tipoResultado as keyof typeof icons] || '❓';
  },

  getConfidenceLevel(score: number): { 
    level: string; 
    color: string; 
    bgColor: string;
    icon: string;
    percentage: string;
  } {
    if (score >= 95) return { 
      level: 'Alto', 
      color: 'text-green-700', 
      bgColor: 'bg-green-100',
      icon: '🟢',
      percentage: `${score.toFixed(1)}%`
    };
    if (score >= 70) return { 
      level: 'Medio', 
      color: 'text-yellow-700', 
      bgColor: 'bg-yellow-100',
      icon: '🟡',
      percentage: `${score.toFixed(1)}%`
    };
    return { 
      level: 'Bajo', 
      color: 'text-red-700', 
      bgColor: 'bg-red-100',
      icon: '🔴',
      percentage: `${score.toFixed(1)}%`
    };
  },

  validateExtractedData(datos: AzureDatosFormateados): {
    isValid: boolean;
    missingFields: string[];
    warnings: string[];
    score: number;
  } {
    const requiredFields = [
      { key: 'numeroPoliza', label: 'Número de Póliza' },
      { key: 'asegurado', label: 'Asegurado' },
      { key: 'documento', label: 'Documento' }
    ];
    
    const recommendedFields = [
      { key: 'vehiculo', label: 'Vehículo' },
      { key: 'marca', label: 'Marca' },
      { key: 'modelo', label: 'Modelo' },
      { key: 'vigenciaDesde', label: 'Vigencia Desde' },
      { key: 'vigenciaHasta', label: 'Vigencia Hasta' }
    ];
    
    const missingFields = requiredFields
      .filter(field => !datos[field.key as keyof AzureDatosFormateados] || 
                      datos[field.key as keyof AzureDatosFormateados] === '')
      .map(field => field.label);
    
    const warnings = recommendedFields
      .filter(field => !datos[field.key as keyof AzureDatosFormateados] || 
                      datos[field.key as keyof AzureDatosFormateados] === '')
      .map(field => field.label);

    const totalFields = requiredFields.length + recommendedFields.length;
    const completedFields = totalFields - missingFields.length - warnings.length;
    const score = Math.round((completedFields / totalFields) * 100);
    
    return {
      isValid: missingFields.length === 0,
      missingFields,
      warnings,
      score
    };
  },

  formatExtractedData(datos: AzureDatosFormateados): {
    poliza: Array<{ label: string; value: string; important: boolean }>;
    cliente: Array<{ label: string; value: string; important: boolean }>;
    vehiculo: Array<{ label: string; value: string; important: boolean }>;
    financiero: Array<{ label: string; value: string; important: boolean }>;
    contacto: Array<{ label: string; value: string; important: boolean }>;
  } {
    const fieldConfig = {
      numeroPoliza: { label: 'Número de Póliza', important: true, category: 'poliza' },
      vigenciaDesde: { label: 'Vigencia Desde', important: false, category: 'poliza' },
      vigenciaHasta: { label: 'Vigencia Hasta', important: false, category: 'poliza' },
      corredor: { label: 'Corredor', important: false, category: 'poliza' },
      plan: { label: 'Plan', important: false, category: 'poliza' },
      ramo: { label: 'Ramo', important: false, category: 'poliza' },

      asegurado: { label: 'Asegurado', important: true, category: 'cliente' },
      documento: { label: 'Documento', important: true, category: 'cliente' },

      vehiculo: { label: 'Vehículo', important: true, category: 'vehiculo' },
      marca: { label: 'Marca', important: false, category: 'vehiculo' },
      modelo: { label: 'Modelo', important: false, category: 'vehiculo' },
      anio: { label: 'Año', important: false, category: 'vehiculo' },
      matricula: { label: 'Matrícula', important: false, category: 'vehiculo' },
      motor: { label: 'Motor', important: false, category: 'vehiculo' },
      chasis: { label: 'Chasis', important: false, category: 'vehiculo' },

      primaComercial: { label: 'Prima Comercial', important: false, category: 'financiero' },
      premioTotal: { label: 'Premio Total', important: false, category: 'financiero' },

      email: { label: 'Email', important: false, category: 'contacto' },
      direccion: { label: 'Dirección', important: false, category: 'contacto' },
      departamento: { label: 'Departamento', important: false, category: 'contacto' },
      localidad: { label: 'Localidad', important: false, category: 'contacto' }
    } as const;

    const result = {
      poliza: [] as Array<{ label: string; value: string; important: boolean }>,
      cliente: [] as Array<{ label: string; value: string; important: boolean }>,
      vehiculo: [] as Array<{ label: string; value: string; important: boolean }>,
      financiero: [] as Array<{ label: string; value: string; important: boolean }>,
      contacto: [] as Array<{ label: string; value: string; important: boolean }>
    };

    Object.entries(datos).forEach(([key, value]) => {
      const config = fieldConfig[key as keyof typeof fieldConfig];
      if (!config || value === null || value === undefined || value === '') return;

      const formattedValue = typeof value === 'number' ? value.toLocaleString() : String(value);
      const item = {
        label: config.label,
        value: formattedValue,
        important: config.important
      };

      result[config.category].push(item);
    });

    return result;
  },

  calculateProcessingMetrics(resultado: AzureProcessResponse): {
    overallScore: number;
    dataQuality: 'high' | 'medium' | 'low';
    clientConfidence: 'high' | 'medium' | 'low' | 'none';
    readyForVelneo: boolean;
    recommendations: string[];
    summary: string;
  } {
    const { datosFormateados, busquedaCliente, resumen } = resultado;

    const validation = this.validateExtractedData(datosFormateados);
    const dataScore = validation.score;

    let clientScore = 0;
    let clientConfidence: 'high' | 'medium' | 'low' | 'none' = 'none';
    
    if (busquedaCliente.tipoResultado === 'MatchExacto') {
      clientScore = 100;
      clientConfidence = 'high';
    } else if (busquedaCliente.tipoResultado === 'MatchMuyProbable') {
      clientScore = 80;
      clientConfidence = 'medium';
    } else if (busquedaCliente.tipoResultado === 'MultiplesMatches') {
      clientScore = 60;
      clientConfidence = 'low';
    } else {
      clientScore = 20;
      clientConfidence = 'none';
    }
    
    const overallScore = Math.round((dataScore * 0.6 + clientScore * 0.4));
    const dataQuality = dataScore >= 80 ? 'high' : dataScore >= 60 ? 'medium' : 'low';

    const recommendations: string[] = [];
    
    if (!validation.isValid) {
      recommendations.push(`Completar campos obligatorios: ${validation.missingFields.join(', ')}`);
    }
    
    if (busquedaCliente.tipoResultado === 'SinCoincidencias') {
      recommendations.push('Buscar cliente manualmente o crear nuevo cliente');
    } else if (busquedaCliente.tipoResultado === 'MultiplesMatches') {
      recommendations.push('Seleccionar el cliente correcto de la lista');
    } else if (busquedaCliente.tipoResultado === 'MatchMuyProbable') {
      recommendations.push('Confirmar que el cliente encontrado es correcto');
    }
    
    if (validation.warnings.length > 0) {
      recommendations.push(`Revisar campos opcionales: ${validation.warnings.slice(0, 3).join(', ')}`);
    }

    const summary = resumen.listoParaVelneo 
      ? `✅ Listo para Velneo (${overallScore}% completitud)`
      : busquedaCliente.clientesEncontrados > 0
        ? `🔍 Cliente encontrado, revisar datos (${overallScore}% completitud)`
        : `⚠️ Requiere intervención manual (${overallScore}% completitud)`;
    
    return {
      overallScore,
      dataQuality,
      clientConfidence,
      readyForVelneo: resumen.listoParaVelneo,
      recommendations,
      summary
    };
  },

  formatBatchStats(batch: AzureBatchResponse): {
    summary: string;
    details: Array<{ 
      label: string; 
      value: string | number; 
      type: 'success' | 'warning' | 'error' | 'info';
      icon: string;
    }>;
    categories: {
      exitosos: number;
      errores: number;
      clientesEncontrados: number;
      listosParaVelneo: number;
    };
  } {
    const details = [
      { 
        label: 'Total Procesados', 
        value: batch.procesados, 
        type: 'success' as const,
        icon: '📄'
      },
      { 
        label: 'Con Errores', 
        value: batch.errores, 
        type: batch.errores > 0 ? 'error' as const : 'info' as const,
        icon: '❌'
      },
      { 
        label: 'Tasa de Éxito', 
        value: `${batch.porcentajeExito?.toFixed(1) || 0}%`, 
        type: 'info' as const,
        icon: '📊'
      },
      { 
        label: 'Clientes Encontrados', 
        value: batch.estadisticas?.clientesEncontrados || 0, 
        type: 'info' as const,
        icon: '👥'
      },
      { 
        label: 'Listos para Velneo', 
        value: batch.estadisticas?.listosParaVelneo || 0, 
        type: 'success' as const,
        icon: '✅'
      },
      { 
        label: 'Tiempo Total', 
        value: `${(batch.tiempoTotalProcesamiento / 1000).toFixed(1)}s`, 
        type: 'info' as const,
        icon: '⏱️'
      },
      { 
        label: 'Tiempo Promedio', 
        value: `${(batch.tiempoPromedioPorArchivo ? batch.tiempoPromedioPorArchivo / 1000 : 0).toFixed(1)}s`, 
        type: 'info' as const,
        icon: '⚡'
      }
    ];

    const summary = batch.estadisticas?.resumenTexto || 
                   `${batch.procesados} procesados, ${batch.errores} errores`;

    const categories = {
      exitosos: batch.procesados,
      errores: batch.errores,
      clientesEncontrados: batch.estadisticas?.clientesEncontrados || 0,
      listosParaVelneo: batch.estadisticas?.listosParaVelneo || 0
    };

    return { summary, details, categories };
  },

  getFileProcessingStatus(resultado: AzureProcessResponse): {
    status: 'success' | 'warning' | 'error';
    icon: string;
    message: string;
    color: string;
    bgColor: string;
  } {
    if (resultado.resumen.listoParaVelneo) {
      return {
        status: 'success',
        icon: '✅',
        message: 'Listo para Velneo',
        color: 'text-green-700',
        bgColor: 'bg-green-50'
      };
    }

    if (resultado.busquedaCliente.clientesEncontrados > 0) {
      return {
        status: 'warning',
        icon: '⚠️',
        message: 'Requiere revisión',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50'
      };
    }

    return {
      status: 'error',
      icon: '❌',
      message: 'Requiere intervención',
      color: 'text-red-700',
      bgColor: 'bg-red-50'
    };
  },

  generateSuggestions(resultado: AzureProcessResponse): string[] {
    const suggestions: string[] = [];
    const { datosFormateados, busquedaCliente } = resultado;

    if (!datosFormateados.numeroPoliza) {
      suggestions.push('El número de póliza es obligatorio para continuar');
    }
    if (!datosFormateados.asegurado) {
      suggestions.push('Verificar que el nombre del asegurado esté correcto');
    }
    if (!datosFormateados.documento) {
      suggestions.push('El documento del cliente es requerido');
    }

    switch (busquedaCliente.tipoResultado) {
      case 'SinCoincidencias':
        suggestions.push('Considerar crear un nuevo cliente en el sistema');
        suggestions.push('Verificar que los datos del cliente sean correctos');
        break;
      case 'MultiplesMatches':
        suggestions.push('Revisar la lista de clientes encontrados');
        suggestions.push('Usar criterios adicionales para refinar la búsqueda');
        break;
      case 'MatchMuyProbable':
        suggestions.push('Confirmar que el cliente encontrado es el correcto');
        break;
    }

    if (!datosFormateados.vehiculo && !datosFormateados.marca) {
      suggestions.push('Agregar información del vehículo para completar la póliza');
    }

    return suggestions.slice(0, 3); 
  }
};