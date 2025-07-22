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
    
    // ✅ USAR EL ENDPOINT CORRECTO
    const response = await apiService.post<AzureProcessResponse>('/AzureDocument/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutos
    });
    
    console.log('📥 Azure response completa:', response);
    
    if (response.success && response.data) {
      const azureData = response.data;
      
      // ✅ VERIFICAR QUE TENEMOS datosVelneo (NO datosFormateados)
      if (!azureData.datosVelneo) {
        console.error('❌ No se encontró datosVelneo en la respuesta:', azureData);
        console.log('🔍 Estructura recibida:', Object.keys(azureData));
        throw new Error('Estructura de respuesta inválida: falta datosVelneo');
      }
      
      const datos = azureData.datosVelneo;
      console.log('📋 Datos Velneo recibidos:', datos);
      
      // ✅ MAPEAR CORRECTAMENTE DESDE datosVelneo
      const result: DocumentProcessResult = {
        // METADATOS BÁSICOS
        documentId: datos.datosPoliza?.numeroPoliza || `doc_${Date.now()}`,
        nombreArchivo: file.name,
        estadoProcesamiento: azureData.estado || 'PROCESADO',
        timestamp: azureData.timestamp,
        
        // ✅ DATOS PRINCIPALES DESDE LA ESTRUCTURA CORRECTA
        numeroPoliza: datos.datosPoliza?.numeroPoliza || '',
        asegurado: datos.datosBasicos?.asegurado || '',
        vigenciaDesde: datos.datosPoliza?.desde || '',
        vigenciaHasta: datos.datosPoliza?.hasta || '',
        prima: datos.condicionesPago?.premio || datos.condicionesPago?.total || 0,
        
        // METADATOS DE PROCESAMIENTO
        nivelConfianza: datos.porcentajeCompletitud ? (datos.porcentajeCompletitud / 100) : 0.5,
        requiereVerificacion: !datos.tieneDatosMinimos,
        readyForVelneo: azureData.listoParaVelneo || false,
        
        // ✅ DATOS COMPLETOS PARA EL FORMULARIO
        datosVelneo: datos, // Incluir toda la estructura
        porcentajeCompletitud: azureData.porcentajeCompletitud
      };
      
      console.log('✅ Resultado mapeado correctamente:', {
        numeroPoliza: result.numeroPoliza,
        asegurado: result.asegurado,
        prima: result.prima,
        tieneVelneo: !!result.datosVelneo,
        porcentaje: result.porcentajeCompletitud
      });
      
      return result;
      
    } else {
      console.error('❌ Respuesta sin éxito o sin datos:', response);
      throw new Error(response.error || 'Error procesando documento');
    }
    
  } catch (error: any) {
    console.error('❌ Error en processDocument:', error);
    
    if (error.message.includes('timeout')) {
      throw new Error('El procesamiento tardó demasiado tiempo. Intenta con un archivo más pequeño.');
    }
    
    if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
      throw new Error('Error de conexión con el servidor. Verifica tu conexión.');
    }
    
    throw new Error(error.message || 'Error desconocido procesando el documento');
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