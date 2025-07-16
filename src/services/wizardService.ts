import { apiService } from './api';

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
  primaComercial: string;
  premioTotal: string;
  plan: string;
  moneda: string;
  vehiculo: string;
  marca: string;
  modelo: string;
  anio: string;
  matricula: string;
  motor: string;
  chasis: string;
  combustible: string;
  email: string;
  direccion: string;
  localidad: string;
  departamento: string;
  telefono: string;
  corredor: string;
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
  // Agregar otros campos según tu PolizaDto
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
   * Procesar documento con Azure Document Intelligence usando tu endpoint existente
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

      const result = await response.json();
      console.log('✅ Document processed successfully');
      return result;
    } catch (error) {
      console.error('❌ Error processing document:', error);
      throw error;
    }
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
      console.error('❌ Error creating poliza in Velneo:', error);
      throw new Error('Error al crear póliza en Velneo');
    }
  }

  /**
   * Verificar estado de la conexión con Velneo
   */
  async testVelneoConnection(): Promise<boolean> {
    try {
      // Si tienes un endpoint de health check, usarlo aquí
      const response = await apiService.get<any>('/health'); // o el endpoint que tengas
      return response.success;
    } catch (error) {
      console.error('❌ Error testing Velneo connection:', error);
      return false;
    }
  }

  /**
   * Obtener cliente por ID usando tu endpoint existente
   */
  async getClienteById(id: number): Promise<Cliente | null> {
    try {
      const response = await apiService.get<Cliente>(`/clientes/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting cliente by ID:', error);
      throw new Error('Error al obtener cliente');
    }
  }

  /**
   * Obtener compañía por ID usando tu endpoint existente
   */
  async getCompanyById(id: number): Promise<Company | null> {
    try {
      const response = await apiService.get<Company>(`/companies/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting company by ID:', error);
      throw new Error('Error al obtener compañía');
    }
  }

  /**
   * Validar que el archivo sea un PDF válido
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
    
    return { isValid: true };
  }

  /**
   * Formatear datos extraídos para el formulario
   */
  formatExtractedData(extractedData: any): any {
    return {
      numeroPoliza: extractedData?.numeroPoliza || '',
      vigenciaDesde: extractedData?.vigenciaDesde || '',
      vigenciaHasta: extractedData?.vigenciaHasta || '',
      prima: extractedData?.prima || 0,
      asegurado: extractedData?.asegurado || '',
      moneda: extractedData?.moneda || 'UYU',
      // Agregar más campos según necesites
    };
  }
}

export const wizardService = new WizardService();