// src/services/wizardService.ts
import { apiService } from './api';
import { Cliente, Company, DocumentProcessResult, PolizaFormDataExtended } from '../types/wizard';
import { AzureProcessResponse } from '../types/azure-document';

export interface PolizaCreateRequest {
  comcod: number;
  clinro: number;
  conpol?: string;
  confchdes?: string;
  confchhas?: string;
  conpremio?: number;
  asegurado?: string;
  observaciones?: string;
  moneda?: string;
  documentoId?: string;
  archivoOriginal?: string;
  procesadoConIA?: boolean;
  
  // CAMPOS EXTENDIDOS PARA VEHÍCULO
  vehiculo?: string;
  marca?: string;
  modelo?: string;
  motor?: string;
  chasis?: string;
  matricula?: string;
  combustible?: string;
  anio?: string | number;
  
  // CAMPOS EXTENDIDOS FINANCIEROS
  primaComercial?: number;
  premioTotal?: number;
  
  // OTROS CAMPOS
  corredor?: string;
  plan?: string;
  ramo?: string;
  documento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  localidad?: string;
  departamento?: string;
}

class WizardService {
  validatePdfFile(file: File): { isValid: boolean; error?: string } {
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return { isValid: false, error: 'Solo se permiten archivos PDF' };
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'El archivo es demasiado grande. Máximo 10MB' };
    }
    
    return { isValid: true };
  }

  async searchClientes(searchTerm: string, pageSize: number = 50): Promise<Cliente[]> {
  try {
    console.log('🚀 WizardService: Searching clients DIRECT:', searchTerm);
    
    const response = await apiService.get<any>(
      `/clientes/direct?filtro=${encodeURIComponent(searchTerm)}`
    );
    
    if (response.success && response.data) {
      const rawData = response.data;
      const clientes = rawData.clientes || rawData.clients || rawData || [];
      
      const clientesMapeados: Cliente[] = clientes.slice(0, pageSize).map((cliente: any) => ({
        id: cliente.id || cliente.clinro,
        clinom: cliente.clinom || cliente.nombre,
        cliced: cliente.cliced || cliente.documento,
        cliruc: cliente.cliruc || cliente.ruc,
        cliemail: cliente.cliemail || cliente.email,
        telefono: cliente.telefono || cliente.clicel,
        clidir: cliente.clidir || cliente.direccion,
        activo: cliente.activo !== false
      }));
      
      return clientesMapeados;
    }
    
    return [];
  } catch (error) {
    console.error('❌ WizardService: Error in direct search:', error);
    
    try {
      const fallbackResponse = await apiService.get<any>(
        `/clientes/all?search=${encodeURIComponent(searchTerm)}`
      );
      
      if (fallbackResponse.success && fallbackResponse.data) {
        const clientesFallback = fallbackResponse.data.items || fallbackResponse.data || [];
        return clientesFallback.slice(0, pageSize);
      }
      
      return [];
    } catch (fallbackError) {
      console.error('❌ Both direct and fallback failed:', fallbackError);
      throw new Error('Error al buscar clientes');
    }
  }
}

  async getCompaniesForLookup(): Promise<Company[]> {
    try {
      console.log('🏢 Loading companies...');
      
      const response = await apiService.get<Company[]>('/companies/lookup');
      
      if (response.success && response.data) {
        console.log('✅ Loaded companies:', response.data.length);
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error loading companies:', error);
      throw new Error('Error al cargar compañías');
    }
  }

  // ✅ MÉTODO CORREGIDO: Procesar documento con Azure Document Intelligence
  // ================================
// CORRECCIÓN COMPLETA EN wizardService.ts
// ================================

// Reemplaza TODA la función processDocument con esto:

async processDocument(file: File): Promise<DocumentProcessResult> {
  try {
    console.log('📄 Processing document with Azure:', file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('📤 Sending request to Azure endpoint...');
    
    const response = await apiService.post<AzureProcessResponse>('/AzureDocument/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutos
    });
    
    console.log('📥 Azure response:', response);
    
    if (response.success && response.data) {
      const azureData = response.data;
      
      // ✅ VERIFICAR QUE TENEMOS datosVelneo
      if (!azureData.datosVelneo) {
        console.error('❌ No se encontró datosVelneo en la respuesta:', azureData);
        throw new Error('Estructura de respuesta inválida: falta datosVelneo');
      }
      
      const datos = azureData.datosVelneo;
      console.log('📋 Datos Velneo recibidos:', datos);
      
      const result: DocumentProcessResult = {
        // ✅ METADATOS BÁSICOS
        documentId: datos.datosPoliza?.numeroPoliza || `doc_${Date.now()}`,
        nombreArchivo: file.name,
        estadoProcesamiento: azureData.estado || 'PROCESADO',
        timestamp: azureData.timestamp,
        
        // ✅ DATOS PRINCIPALES MAPEADOS DESDE NUEVA ESTRUCTURA
        numeroPoliza: datos.datosPoliza?.numeroPoliza || '',
        asegurado: datos.datosBasicos?.asegurado || '',
        vigenciaDesde: datos.datosPoliza?.desde || '',
        vigenciaHasta: datos.datosPoliza?.hasta || '',
        prima: datos.condicionesPago?.premio || 0,
        compania: datos.datosPoliza?.compania || '',
        
        // ✅ DATOS DEL VEHÍCULO COMPLETOS
        vehiculo: datos.datosVehiculo?.marcaModelo || '',
        marca: datos.datosVehiculo?.marca || '',
        modelo: datos.datosVehiculo?.modelo || '',
        motor: datos.datosVehiculo?.motor || '',
        chasis: datos.datosVehiculo?.chasis || '',
        matricula: datos.datosVehiculo?.matricula || '',
        combustible: datos.datosVehiculo?.combustible || '',
        anio: datos.datosVehiculo?.anio || '',
        
        // ✅ DATOS DEL CLIENTE COMPLETOS
        documento: datos.datosBasicos?.documento || '',
        email: datos.datosBasicos?.email || '',
        telefono: datos.datosBasicos?.telefono || '',
        direccion: datos.datosBasicos?.domicilio || '',
        departamento: datos.datosBasicos?.departamento || '',
        localidad: datos.datosBasicos?.localidad || '',
        
        // ✅ DATOS FINANCIEROS COMPLETOS
        primaComercial: datos.condicionesPago?.premio || 0,
        premioTotal: datos.condicionesPago?.total || 0,
        moneda: datos.datosCobertura?.moneda || 'UYU',
        
        // ✅ OTROS DATOS
        corredor: datos.datosBasicos?.corredor || '',
        ramo: datos.datosPoliza?.ramo || '',
        plan: datos.datosCobertura?.cobertura || '',
        
        // ✅ METADATOS DEL PROCESAMIENTO
        nivelConfianza: azureData.procesamientoExitoso ? 0.9 : 0.5,
        requiereVerificacion: !azureData.procesamientoExitoso || azureData.porcentajeCompletitud < 80,
        readyForVelneo: azureData.listoParaVelneo || false,
        listoParaVelneo: azureData.listoParaVelneo || false,
        
        // ✅ INCLUIR DATOS COMPLETOS PARA EL FORMULARIO
        polizaData: {
          datosVelneo: datos, // Para compatibilidad
          timestamp: azureData.timestamp,
          tiempoProcesamiento: azureData.tiempoProcesamiento,
          estadoFormateado: azureData.estado,
          porcentajeCompletitud: azureData.porcentajeCompletitud,
          camposCompletos: datos.metricas?.camposCompletos || 0
        },
        
        // ✅ CLAVE: INCLUIR TODA LA ESTRUCTURA NUEVA
        datosVelneo: datos
      };
      
      console.log('✅ Document processed successfully:', result);
      console.log('🔍 datosVelneo incluido:', !!result.datosVelneo);
      console.log('📊 Campos en datosVelneo:', Object.keys(result.datosVelneo || {}));
      
      return result;
    } else {
      throw new Error(response.error || 'Error procesando documento');
    }
  } catch (error: any) {
    console.error('❌ Error processing document:', error);
    
    if (error.response?.status === 401) {
      throw new Error('No autorizado. Verifica tu sesión.');
    } else if (error.response?.status === 400) {
      throw new Error('Archivo inválido. Solo se permiten PDFs válidos.');
    } else if (error.response?.status === 413) {
      throw new Error('El archivo es demasiado grande. Máximo 10MB.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout al procesar el documento. Intenta de nuevo.');
    }
    
    throw new Error(error.message || 'Error desconocido procesando documento');
  }
}

  async createPoliza(formData: PolizaFormDataExtended): Promise<void> {
    try {
      console.log('💾 Creating poliza in Velneo:', formData);
      
      const request: PolizaCreateRequest = {
        comcod: parseInt(formData.compania),
        clinro: parseInt(formData.asegurado),
        conpol: formData.numeroPoliza,
        confchdes: formData.vigenciaDesde,
        confchhas: formData.vigenciaHasta,
        conpremio: formData.prima,
        asegurado: formData.asegurado,
        observaciones: formData.observaciones || 'Procesado automáticamente con Azure AI',
        moneda: formData.moneda || 'UYU',
        
        // CAMPOS EXTENDIDOS
        vehiculo: formData.vehiculo,
        marca: formData.marca,
        modelo: formData.modelo,
        motor: formData.motor,
        chasis: formData.chasis,
        matricula: formData.matricula,
        combustible: formData.combustible,
        anio: formData.anio,
        primaComercial: formData.primaComercial,
        premioTotal: formData.premioTotal,
        corredor: formData.corredor,
        plan: formData.plan,
        ramo: formData.ramo || 'AUTOMOVILES',
        documento: formData.documento,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
        localidad: formData.localidad,
        departamento: formData.departamento,
        
        procesadoConIA: true
      };
      
      const response = await apiService.post<any>('/polizas', request, {
        timeout: 300000 // 5 minutos para Velneo
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Error creando póliza en Velneo');
      }
      
      console.log('✅ Poliza created successfully in Velneo');
    } catch (error: any) {
      console.error('❌ Error creating poliza:', error);
      throw new Error(error.message || 'Error al crear póliza en Velneo');
    }
  }
}

export const wizardService = new WizardService();