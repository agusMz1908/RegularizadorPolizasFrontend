// src/services/wizardService.ts
import { apiService } from './api'; // Tu servicio API existente
import { azureDocumentService } from './azureDocumentService'; // Tu servicio Azure existente

export interface Cliente {
  id: number;
  clinom: string;
  cliced?: string;
  cliruc?: string;
  telefono?: string;
  cliemail?: string;
  clidir?: string;
  activo: boolean;
}

export interface Company {
  id: number;
  comnom: string;
  comalias: string;
  cod_srvcompanias?: string;
  broker: boolean;
  activo: boolean;
}

export interface DocumentProcessResult {
  documentId: string;
  nombreArchivo: string;
  estadoProcesamiento: string;
  numeroPoliza?: string;
  asegurado?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  prima?: number;
  compania?: string;
  nivelConfianza?: number;
  requiereVerificacion?: boolean;
  readyForVelneo?: boolean;
  polizaData?: any;
  extractedFields?: ExtractedField[];
}

export interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
  needsReview: boolean;
}

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
      console.log('🔍 WizardService: Searching clients for:', searchTerm);
      
      // Usar tu endpoint existente de clientes con el formato exacto de tu API
      const response = await apiService.get<any>(`/clientes?search=${encodeURIComponent(searchTerm)}&pageSize=${pageSize}`);
      
      if (response.success && response.data) {
        // Manejar tu estructura de respuesta paginada
        const clientes = response.data.items || response.data || [];
        console.log('✅ WizardService: Found clients:', clientes.length);
        
        // Mapear a la estructura que necesita el wizard
        return clientes.map((cliente: any) => ({
          id: cliente.id,
          clinom: cliente.clinom || cliente.nombre || '',
          cliced: cliente.cliced || cliente.cedula || '',
          cliruc: cliente.cliruc || cliente.ruc || '',
          telefono: cliente.telefono || cliente.clitelcel || '',
          cliemail: cliente.cliemail || cliente.email || '',
          clidir: cliente.clidir || cliente.direccion || '',
          activo: cliente.activo !== false
        }));
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ WizardService: Error searching clientes:', error);
      throw new Error(`Error al buscar clientes: ${error.message || 'Error desconocido'}`);
    }
  }

  /**
   * Obtener compañías para el dropdown usando tu endpoint existente
   */
  async getCompaniesForLookup(): Promise<Company[]> {
    try {
      console.log('🏢 WizardService: Loading companies...');
      
      // Usar tu endpoint existente de compañías
      const response = await apiService.get<Company[]>('/companies/lookup');
      
      if (response.success && response.data) {
        console.log('✅ WizardService: Loaded companies:', response.data.length);
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ WizardService: Error loading companies:', error);
      throw new Error(`Error al cargar compañías: ${error.message || 'Error desconocido'}`);
    }
  }

  /**
   * Procesar documento usando tu azureDocumentService existente
   */
  async processDocument(file: File): Promise<DocumentProcessResult> {
    try {
      console.log('📄 WizardService: Processing document with Azure:', file.name);
      
      // Validar archivo antes de procesar
      const validation = this.validatePdfFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Archivo inválido');
      }

      // Usar tu servicio existente de Azure Document Intelligence
      const response = await azureDocumentService.processDocument(
        file,
        undefined, // clienteId - opcional
        undefined, // companiaId - opcional  
        undefined, // ramoId - opcional
        (progress) => {
          console.log('📊 Progress:', progress + '%');
        }
      );

      console.log('✅ WizardService: Document processed successfully');

      // Mapear la respuesta de tu servicio al formato del wizard
      const result: DocumentProcessResult = {
        documentId: response.documentId || `doc_${Date.now()}`,
        nombreArchivo: file.name,
        estadoProcesamiento: 'completed',
        numeroPoliza: response.numeroPoliza,
        asegurado: response.asegurado,
        vigenciaDesde: response.vigenciaDesde,
        vigenciaHasta: response.vigenciaHasta,
        prima: response.prima,
        compania: response.compania,
        nivelConfianza: response.nivelConfianza || 0.85,
        requiereVerificacion: response.requiereVerificacion || false,
        readyForVelneo: response.readyForVelneo || true,
        polizaData: response.polizaData,
        extractedFields: response.extractedFields || []
      };

      return result;
    } catch (error: any) {
      console.error('❌ WizardService: Error processing document:', error);
      throw new Error(`Error al procesar documento: ${error.message || 'Error desconocido'}`);
    }
  }

  /**
   * Crear póliza en Velneo usando tu apiService existente
   */
  async createPolizaInVelneo(polizaData: PolizaCreateRequest): Promise<any> {
    try {
      console.log('📋 WizardService: Creating poliza in Velneo:', {
        cliente: polizaData.clinro,
        compania: polizaData.comcod,
        numero: polizaData.conpol
      });
      
      // Estructurar datos según tu PolizaDto del backend
      const polizaDto = {
        // Relaciones principales
        comcod: polizaData.comcod,
        clinro: polizaData.clinro,
        
        // Datos básicos de la póliza
        conpol: polizaData.conpol,
        confchdes: polizaData.confchdes,
        confchhas: polizaData.confchhas,
        conpremio: polizaData.conpremio,
        
        // Datos adicionales
        observaciones: polizaData.observaciones,
        
        // Metadatos del wizard
        procesadoConIA: polizaData.procesadoConIA || true,
        archivoOriginal: polizaData.archivoOriginal,
        documentoId: polizaData.documentoId,
        
        // Campos requeridos por Velneo (usar valores por defecto si no están)
        moncod: polizaData.moneda === 'USD' ? 1 : polizaData.moneda === 'EUR' ? 3 : 2, // 1=USD, 2=UYU, 3=EUR
        activo: true,
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString()
      };

      // Usar tu endpoint existente de pólizas
      const response = await apiService.post<any>('/polizas', polizaDto);
      
      if (response.success && response.data) {
        console.log('✅ WizardService: Poliza created successfully in Velneo');
        return response.data;
      } else {
        throw new Error(response.error || 'Error al crear póliza en Velneo');
      }
    } catch (error: any) {
      console.error('❌ WizardService: Error creating poliza:', error);
      throw new Error(`Error al crear póliza: ${error.message || 'Error desconocido'}`);
    }
  }

  /**
   * Validar archivo PDF
   */
  validatePdfFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!file) {
      return { isValid: false, error: 'No se ha seleccionado ningún archivo' };
    }
    
    if (file.type !== 'application/pdf') {
      return { isValid: false, error: 'El archivo debe ser un PDF' };
    }
    
    if (file.size > maxSize) {
      return { isValid: false, error: 'El archivo no puede superar los 10MB' };
    }
    
    if (file.size === 0) {
      return { isValid: false, error: 'El archivo está vacío' };
    }
    
    return { isValid: true };
  }

  /**
   * Formatear datos extraídos para el formulario
   */
  formatExtractedData(extractedData: DocumentProcessResult): any {
    return {
      numeroPoliza: extractedData.numeroPoliza || '',
      vigenciaDesde: extractedData.vigenciaDesde || '',
      vigenciaHasta: extractedData.vigenciaHasta || '',
      prima: extractedData.prima || 0,
      asegurado: extractedData.asegurado || '',
      moneda: 'UYU', // Por defecto pesos uruguayos
      observaciones: `Procesado automáticamente con IA. Confianza: ${Math.round((extractedData.nivelConfianza || 0) * 100)}%`
    };
  }

  /**
   * Obtener cliente por ID (método auxiliar)
   */
  async getClienteById(id: number): Promise<Cliente | null> {
    try {
      const response = await apiService.get<Cliente>(`/clientes/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('❌ WizardService: Error getting cliente by ID:', error);
      return null;
    }
  }

  /**
   * Obtener compañía por ID (método auxiliar)
   */
  async getCompanyById(id: number): Promise<Company | null> {
    try {
      const response = await apiService.get<Company>(`/companies/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('❌ WizardService: Error getting company by ID:', error);
      return null;
    }
  }

  /**
   * Verificar configuración del servicio
   */
  validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Verificar que apiService esté disponible
    if (!apiService) {
      errors.push('apiService no está disponible');
    }
    
    // Verificar que azureDocumentService esté disponible
    if (!azureDocumentService) {
      errors.push('azureDocumentService no está disponible');
    }
    
    // Verificar variables de entorno
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      errors.push('VITE_API_URL no está configurado');
    }
    
    const azureDocumentService_validation = azureDocumentService?.validateConfiguration?.();
    if (azureDocumentService_validation && !azureDocumentService_validation.isValid) {
      errors.push(...azureDocumentService_validation.errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Test de conectividad (método auxiliar para debugging)
   */
  async testConnectivity(): Promise<{ api: boolean; azure: boolean }> {
    const results = {
      api: false,
      azure: false
    };
    
    try {
      // Test API connection
      const apiResponse = await apiService.get('/health');
      results.api = apiResponse.success;
    } catch (error) {
      console.warn('API connectivity test failed:', error);
    }
    
    try {
      // Test Azure service
      const azureValidation = azureDocumentService.validateConfiguration();
      results.azure = azureValidation.isValid;
    } catch (error) {
      console.warn('Azure connectivity test failed:', error);
    }
    
    return results;
  }
}

export const wizardService = new WizardService();