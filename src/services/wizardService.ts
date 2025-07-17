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
  
  // 🔧 CAMPOS EXTENDIDOS PARA VEHÍCULO
  vehiculo?: string;
  marca?: string;
  modelo?: string;
  motor?: string;
  chasis?: string;
  matricula?: string;
  combustible?: string;
  anio?: string | number;
  
  // 🔧 CAMPOS EXTENDIDOS FINANCIEROS
  primaComercial?: number;
  premioTotal?: number;
  
  // 🔧 OTROS CAMPOS
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
  /**
   * Validar archivo PDF
   */
  validatePdfFile(file: File): { isValid: boolean; error?: string } {
    // Validar tipo de archivo
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return { isValid: false, error: 'Solo se permiten archivos PDF' };
    }
    
    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'El archivo es demasiado grande. Máximo 10MB' };
    }
    
    return { isValid: true };
  }

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
      console.log('📄 Processing document with Azure:', file.name);
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('📤 Sending request to Azure endpoint...');
      
      // Usar tu endpoint existente de Azure Document Intelligence
      const response = await apiService.post<AzureProcessResponse>('/azure-document/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Timeout más largo para procesamiento de documentos
        timeout: 120000, // 2 minutos
      });
      
      console.log('📥 Azure response:', response);
      
      if (response.success && response.data) {
        // Mapear respuesta de Azure a DocumentProcessResult
        const azureData = response.data;
        
        const result: DocumentProcessResult = {
          documentId: azureData.datosFormateados?.numeroPoliza || `doc_${Date.now()}`,
          nombreArchivo: file.name,
          estadoProcesamiento: azureData.estado || 'PROCESADO',
          timestamp: azureData.timestamp,
          
          // Mapear datos básicos
          numeroPoliza: azureData.datosFormateados?.numeroPoliza || '',
          asegurado: azureData.datosFormateados?.asegurado || '',
          vigenciaDesde: azureData.datosFormateados?.vigenciaDesde || '',
          vigenciaHasta: azureData.datosFormateados?.vigenciaHasta || '',
          
          // 🔧 MAPEAR DATOS DEL VEHÍCULO
          vehiculo: azureData.datosFormateados?.vehiculo || '',
          marca: azureData.datosFormateados?.marca || '',
          modelo: azureData.datosFormateados?.modelo || '',
          motor: azureData.datosFormateados?.motor || '',
          chasis: azureData.datosFormateados?.chasis || '',
          matricula: azureData.datosFormateados?.matricula || '',
          // combustible: azureData.datosFormateados?.combustible || '',
          // anio: azureData.datosFormateados?.anio || '',
          
          // 🔧 MAPEAR DATOS FINANCIEROS
          prima: azureData.datosFormateados?.primaComercial || 0,
          primaComercial: azureData.datosFormateados?.primaComercial || 0,
          premioTotal: azureData.datosFormateados?.premioTotal || 0,
          moneda: 'UYU',
          
          // 🔧 OTROS CAMPOS
          corredor: azureData.datosFormateados?.corredor || '',
          plan: azureData.datosFormateados?.plan || '',
          ramo: azureData.datosFormateados?.ramo || 'AUTOMOVILES',
          compania: azureData.datosFormateados?.compania || '',
          
          // Datos del cliente
          // documento: azureData.datosFormateados?.documento || '',
          email: azureData.datosFormateados?.email || '',
          telefono: azureData.datosFormateados?.telefono?.toString() || '',
          direccion: azureData.datosFormateados?.direccion || '',
          localidad: azureData.datosFormateados?.localidad || '',
          departamento: azureData.datosFormateados?.departamento || '',
          
          // Metadatos
          nivelConfianza: 85, // Valor por defecto
          requiereRevision: !azureData.resumen?.listoParaVelneo,
          listoParaVelneo: azureData.resumen?.listoParaVelneo || false,
          
          // Conservar datos originales
          extractedFields: azureData,
          originalResponse: azureData
        };
        
        console.log('✅ Document processed successfully:', result);
        return result;
      }
      
      throw new Error('No se recibieron datos válidos del procesamiento');
      
    } catch (error: any) {
      console.error('❌ Error processing document:', error);
      
      // Mejorar el mensaje de error
      let errorMessage = 'Error al procesar el documento';
      if (error.response?.status === 413) {
        errorMessage = 'El archivo es demasiado grande';
      } else if (error.response?.status === 400) {
        errorMessage = 'El archivo no es válido o no se puede procesar';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * 🔧 CREAR PÓLIZA EN VELNEO CON TIPOS EXTENDIDOS
   */
  async createPolizaInVelneo(
    formData: PolizaFormDataExtended, 
    clienteId: number, 
    companyId: number
  ): Promise<any> {
    try {
      console.log('📋 Creating poliza in Velneo...');
      console.log('🎯 Form data received:', formData);
      console.log('👤 Cliente ID:', clienteId);
      console.log('🏢 Company ID:', companyId);
      
      // Mapear PolizaFormDataExtended a PolizaCreateRequest
      const polizaData: PolizaCreateRequest = {
        // IDs de relaciones
        comcod: companyId,
        clinro: clienteId,
        
        // Datos básicos de la póliza
        conpol: formData.numeroPoliza,
        confchdes: formData.vigenciaDesde,
        confchhas: formData.vigenciaHasta,
        conpremio: typeof formData.prima === 'string' ? parseFloat(formData.prima) : formData.prima,
        asegurado: formData.asegurado,
        observaciones: formData.observaciones,
        moneda: formData.moneda,
        
        // 🔧 DATOS EXTENDIDOS DEL VEHÍCULO
        vehiculo: formData.vehiculo,
        marca: formData.marca,
        modelo: formData.modelo,
        motor: formData.motor,
        chasis: formData.chasis,
        matricula: formData.matricula,
        combustible: formData.combustible,
        anio: formData.anio,
        
        // 🔧 DATOS FINANCIEROS EXTENDIDOS
        primaComercial: typeof formData.primaComercial === 'string' ? 
          parseFloat(formData.primaComercial) : formData.primaComercial,
        premioTotal: typeof formData.premioTotal === 'string' ? 
          parseFloat(formData.premioTotal) : formData.premioTotal,
        
        // 🔧 OTROS CAMPOS EXTENDIDOS
        corredor: formData.corredor,
        plan: formData.plan,
        ramo: formData.ramo,
        documento: formData.documento,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
        localidad: formData.localidad,
        departamento: formData.departamento,
        
        // Metadatos del procesamiento
        procesadoConIA: true,
      };
      
      console.log('📤 Sending poliza data to Velneo:', polizaData);
      
      // Enviar al endpoint de creación de pólizas
      const response = await apiService.post<any>('/polizas/create', polizaData);
      
      if (response.success && response.data) {
        console.log('✅ Poliza created successfully in Velneo:', response.data);
        return response.data;
      }
      
      throw new Error('No se pudo crear la póliza en Velneo');
      
    } catch (error: any) {
      console.error('❌ Error creating poliza in Velneo:', error);
      
      let errorMessage = 'Error al crear póliza en Velneo';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * MÉTODO ALTERNATIVO: Crear póliza con formato legacy
   */
  async createPolizaInVelneoLegacy(
    formData: any, 
    clienteId: number, 
    companyId: number
  ): Promise<any> {
    console.log('📋 Using legacy create method...');
    
    const legacyData = {
      comcod: companyId,
      clinro: clienteId,
      conpol: formData.numeroPoliza,
      confchdes: formData.vigenciaDesde,
      confchhas: formData.vigenciaHasta,
      conpremio: formData.prima,
      asegurado: formData.asegurado,
      observaciones: formData.observaciones,
      moneda: formData.moneda,
      documentoId: formData.documentoId,
      archivoOriginal: formData.archivoOriginal,
      procesadoConIA: true,
    };
    
    return this.createPolizaInVelneo(legacyData as any, clienteId, companyId);
  }
}

export const wizardService = new WizardService();