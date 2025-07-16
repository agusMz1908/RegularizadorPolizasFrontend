// src/services/wizardService.ts - MAPEO CORREGIDO
import { apiService } from './api';
import { Cliente, Company, DocumentProcessResult, ExtractedField } from '../types/wizard';
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
}

class WizardService {
  /**
   * Buscar clientes por nombre, CI o RUC usando tu apiService existente
   */
  async searchClientes(searchTerm: string, pageSize: number = 10): Promise<Cliente[]> {
    try {
      console.log('🔍 Searching clients:', searchTerm);
      
      // Usar tu endpoint existente de clientes
      const response = await apiService.get<any>(`/clientes?search=${encodeURIComponent(searchTerm)}&pageSize=${pageSize}`);
      
      if (response.success && response.data) {
        // Manejar respuesta paginada o array directo
        const clientes = response.data.items || response.data || [];
        console.log('✅ Found clients:', clientes.length);
        return clientes;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error searching clientes:', error);
      throw new Error('Error al buscar clientes');
    }
  }

  /**
   * Obtener todas las compañías para el dropdown usando tu endpoint existente
   */
  async getCompaniesForLookup(): Promise<Company[]> {
    try {
      console.log('🏢 Loading companies...');
      
      // Usar tu endpoint existente de compañías
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

  /**
   * Procesar documento con Azure Document Intelligence
   */
  async processDocument(file: File): Promise<DocumentProcessResult> {
    try {
      console.log('📄 Processing document:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);

      // Usar tu configuración existente de API
      const API_BASE = import.meta.env.VITE_API_URL || 'https://localhost:7191/api';
      
      // Obtener token de tu sistema existente
      const token = localStorage.getItem(import.meta.env.VITE_JWT_STORAGE_KEY || 'regularizador_token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const response = await fetch(`${API_BASE}/azuredocument/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData || response.statusText}`);
      }

      const azureResponse: AzureProcessResponse = await response.json();
      console.log('✅ Azure response received:', azureResponse);

      // **MAPEO CORREGIDO**: Convertir AzureProcessResponse a DocumentProcessResult
      const documentResult: DocumentProcessResult = {
        documentId: `doc_${Date.now()}`,
        nombreArchivo: file.name,
        estadoProcesamiento: azureResponse.estado || 'PROCESADO',
        
        // Mapear datos principales desde datosFormateados
        numeroPoliza: azureResponse.datosFormateados?.numeroPoliza || '',
        asegurado: azureResponse.datosFormateados?.asegurado || '',
        vigenciaDesde: azureResponse.datosFormateados?.vigenciaDesde || '',
        vigenciaHasta: azureResponse.datosFormateados?.vigenciaHasta || '',
        prima: azureResponse.datosFormateados?.primaComercial || 0,
        compania: azureResponse.datosFormateados?.compania || '',
        
        // Metadatos
        nivelConfianza: 0.85, // Valor por defecto
        requiereVerificacion: azureResponse.requiereIntervencion || false,
        readyForVelneo: azureResponse.listoParaVelneo || false,
        
        // Guardar toda la respuesta de Azure como polizaData para uso posterior
        polizaData: azureResponse,
        
        // Crear extractedFields para el display
        extractedFields: this.createExtractedFields(azureResponse.datosFormateados)
      };

      console.log('🔄 Mapped to DocumentProcessResult:', documentResult);
      return documentResult;
    } catch (error) {
      console.error('❌ Error processing document:', error);
      throw error;
    }
  }

  /**
   * Crear extractedFields desde los datos formateados de Azure
   */
  private createExtractedFields(datosFormateados: any): ExtractedField[] {
    if (!datosFormateados) return [];

    const fields: ExtractedField[] = [];

    // Función helper para agregar campo si existe
    const addField = (field: string, value: any, confidence: number = 0.85) => {
      if (value !== null && value !== undefined && value !== '') {
        fields.push({
          field,
          value: String(value),
          confidence,
          needsReview: confidence < 0.8
        });
      }
    };

    // Mapear campos principales
    addField('Número de Póliza', datosFormateados.numeroPoliza, 0.95);
    addField('Asegurado', datosFormateados.asegurado, 0.90);
    addField('Vigencia Desde', datosFormateados.vigenciaDesde, 0.85);
    addField('Vigencia Hasta', datosFormateados.vigenciaHasta, 0.85);
    addField('Prima Comercial', datosFormateados.primaComercial, 0.88);
    addField('Premio Total', datosFormateados.premioTotal, 0.88);
    addField('Vehículo', datosFormateados.vehiculo, 0.92);
    addField('Marca', datosFormateados.marca, 0.90);
    addField('Modelo', datosFormateados.modelo, 0.90);
    addField('Matrícula', datosFormateados.matricula, 0.85);
    addField('Corredor', datosFormateados.corredor, 0.90);
    addField('Email', datosFormateados.email, 0.80);
    addField('Dirección', datosFormateados.direccion, 0.75);

    return fields;
  }

  /**
   * Crear póliza en Velneo usando tu apiService existente
   */
  async createPolizaInVelneo(polizaData: PolizaCreateRequest): Promise<any> {
    try {
      console.log('📋 Creating poliza in Velneo:', polizaData);
      
      // Usar tu endpoint existente de pólizas
      const response = await apiService.post<any>('/polizas', polizaData);
      
      if (response.success && response.data) {
        console.log('✅ Poliza created successfully');
        return response.data;
      } else {
        throw new Error(response.error || 'Error al crear póliza');
      }
    } catch (error) {
      console.error('❌ Error creating poliza:', error);
      throw error;
    }
  }

  /**
   * Validar archivo PDF
   */
  validatePdfFile(file: File): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: 'No se ha seleccionado ningún archivo' };
    }

    if (file.type !== 'application/pdf') {
      return { isValid: false, error: 'El archivo debe ser un PDF' };
    }

    // Máximo 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { isValid: false, error: 'El archivo no puede ser mayor a 10MB' };
    }

    return { isValid: true };
  }
}

// Exportar instancia singleton
export const wizardService = new WizardService();

// También exportar la clase para testing
export default WizardService;