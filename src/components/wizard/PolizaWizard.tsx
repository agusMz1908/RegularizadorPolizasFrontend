// src/components/wizard/PolizaWizard.tsx - FORMULARIO COMPLETO COMO DOCUMENTSCANNER
import React, { useState, useEffect } from 'react';
import { 
  User, Building2, Upload, FileText, Eye, Check, 
  Car, DollarSign, Calendar, MapPin, Mail, Phone,
  Edit3, Save, X, CheckCircle, AlertTriangle, Loader2,
  ArrowLeft, ArrowRight, Search, FileCheck, Building, Hash
} from 'lucide-react';
import { usePolizaWizard } from '../../hooks/usePolizaWizard';
import { WizardResult, Cliente, Company } from '../../types/wizard';

// Props para el componente PolizaWizard usando los tipos existentes
interface PolizaWizardProps {
  onComplete?: (result: WizardResult) => void;
  onCancel?: () => void;
}

// Tipos extendidos para el formulario completo
interface PolizaFormDataExtended {
  // Información de la Póliza
  numeroPoliza: string;
  anio?: string | number;
  vigenciaDesde: string;
  vigenciaHasta: string;
  plan?: string;
  ramo?: string;
  
  // Datos del Cliente
  asegurado: string;
  documento?: string;
  email?: string;
  direccion?: string;
  localidad?: string;
  departamento?: string;
  telefono?: string;
  
  // Datos del Vehículo
  vehiculo?: string;
  marca?: string;
  modelo?: string;
  motor?: string;
  chasis?: string;
  matricula?: string;
  combustible?: string;
  
  // Información Financiera
  prima: number | string;
  primaComercial?: number | string;
  premioTotal?: number | string;
  moneda: string;
  
  // Corredor de Seguros
  corredor?: string;
  
  // Observaciones
  observaciones: string;
}

const PolizaWizard: React.FC<PolizaWizardProps> = ({ onComplete, onCancel }) => {
  const wizard = usePolizaWizard();
  
  // Estado para todos los campos del formulario extendido
  const [formData, setFormData] = useState<PolizaFormDataExtended>({
    numeroPoliza: '',
    vigenciaDesde: '',
    vigenciaHasta: '',
    prima: 0,
    moneda: 'UYU',
    asegurado: '',
    observaciones: 'Procesado automáticamente con Azure AI.'
  });
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // NUEVO: Estado de edición
  const [initialDataLoaded, setInitialDataLoaded] = useState(false); // NUEVO: Control de carga inicial

  // Llenar formulario con datos extraídos SOLO UNA VEZ - ARREGLADO
  useEffect(() => {
    // CONDICIÓN ESTRICTA: Solo ejecutar si hay datos Y no se han cargado antes Y no está editando
    if (wizard.extractedData && !initialDataLoaded && !isEditing) {
      console.log('🔍 Cargando datos extraídos por primera vez:', wizard.extractedData);
      
      // Acceder a los datos de Azure (polizaData contiene la respuesta completa)
      const azureData = wizard.extractedData.polizaData?.datosFormateados || {};
      
      // También buscar en extractedFields para los campos específicos
      const extractedFields = wizard.extractedData.extractedFields || [];
      
      // Función helper para buscar un campo específico
      const findFieldValue = (fieldName: string) => {
        const field = extractedFields.find((f: { field: string; }) => f.field === fieldName);
        return field?.value || '';
      };
      
      // Función helper para formatear fechas de ISO a dd/mm/yyyy
      const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        
        try {
          // Si viene en formato ISO (2025-04-11T00:00:00)
          if (dateString.includes('T')) {
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
              const day = date.getDate().toString().padStart(2, '0');
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              const year = date.getFullYear();
              return `${day}/${month}/${year}`;
            }
          }
          
          // Si ya viene en formato correcto, devolverlo tal como está
          return dateString;
        } catch (error) {
          // Si hay error, devolver el string original
          return dateString;
        }
      };

      // Función helper para extraer fechas con múltiples etiquetas - SIMPLIFICADO
      const extractDateField = (etiquetas: string[]) => {
        for (const etiqueta of etiquetas) {
          const valor = azureData[etiqueta];
          if (valor && valor !== '') {
            return formatDate(String(valor)); // Formatear la fecha
          }
        }
        return '';
      };
      
      const newFormData = {
        // Información de la Póliza
        numeroPoliza: wizard.extractedData.numeroPoliza || azureData.numeroPoliza || '',
        anio: azureData.anio || '',
        
        // FECHAS FORMATEADAS
        vigenciaDesde: formatDate(wizard.extractedData.vigenciaDesde || '') || extractDateField([
          'poliza.vigencia.desde', 'fecha_desde', 'vigencia_desde', 'start_date', 'fecha_inicio', 'vigenciaDesde', 'confchdes'
        ]) || '',
        vigenciaHasta: formatDate(wizard.extractedData.vigenciaHasta || '') || extractDateField([
          'poliza.vigencia.hasta', 'fecha_hasta', 'vigencia_hasta', 'end_date', 'fecha_fin', 'vencimiento', 'vigenciaHasta', 'confchhas'
        ]) || '',
        
        plan: azureData.plan || '',
        ramo: azureData.ramo || '',
        
        // Datos del Cliente - USAR DATOS DEL CLIENTE SELECCIONADO Y Azure
        asegurado: wizard.selectedCliente?.clinom || wizard.extractedData.asegurado || azureData.asegurado || '',
        documento: wizard.selectedCliente?.cliced || wizard.selectedCliente?.cliruc || azureData.documento || '',
        email: wizard.selectedCliente?.cliemail || azureData.email || '',
        direccion: wizard.selectedCliente?.clidir || azureData.direccion || '',
        
        // LOCALIDAD Y DEPARTAMENTO con etiquetas específicas de Azure
        localidad: azureData['asegurado.localidad'] || azureData.localidad || findFieldValue('asegurado.localidad') || '',
        departamento: azureData['asegurado.departamento'] || azureData.departamento || findFieldValue('asegurado.departamento') || '',
        
        telefono: wizard.selectedCliente?.telefono || azureData.telefono || '',
        
        // Datos del Vehículo
        vehiculo: azureData.vehiculo || '',
        marca: azureData.marca || '',
        modelo: azureData.modelo || '',
        motor: azureData.motor || '',
        chasis: azureData.chasis || '',
        matricula: azureData.matricula || '',
        combustible: azureData.combustible || '',
        
        // Información Financiera
        prima: wizard.extractedData.prima || azureData.primaComercial || 0,
        primaComercial: azureData.primaComercial || 0,
        premioTotal: azureData.premioTotal || 0,
        moneda: 'UYU',
        
        // Corredor de Seguros
        corredor: azureData.corredor || '',
        
        // Observaciones
        observaciones: 'Procesado automáticamente con Azure AI.'
      };
      
      setFormData(newFormData);
      setInitialDataLoaded(true); // Marcar que ya se cargaron los datos
      
      console.log('✅ Datos iniciales cargados correctamente (no se volverán a cargar)');
    }
  }, [wizard.extractedData, wizard.selectedCliente]); // REMOVER initialDataLoaded e isEditing de las dependencias

  // Función para manejar cambios en los inputs
  const handleInputChange = (field: keyof PolizaFormDataExtended, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Funciones para manejar edición
  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    // Aquí podrías revertir los cambios si quisieras
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    console.log('💾 Cambios guardados:', formData);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Crear la póliza usando el wizard (convertir a formato básico)
      const basicFormData = {
        numeroPoliza: formData.numeroPoliza,
        vigenciaDesde: formData.vigenciaDesde,
        vigenciaHasta: formData.vigenciaHasta,
        prima: formData.prima,
        moneda: formData.moneda,
        asegurado: formData.asegurado,
        observaciones: formData.observaciones
      };
      
      const polizaCreated = await wizard.createPoliza(basicFormData);
      
      // Crear el resultado según la interfaz WizardResult existente
      if (onComplete && wizard.selectedCliente && wizard.selectedCompany && wizard.uploadedFile && wizard.extractedData) {
        const result: WizardResult = {
          cliente: wizard.selectedCliente,
          company: wizard.selectedCompany,
          file: wizard.uploadedFile,
          extractedData: wizard.extractedData,
          formData: basicFormData,
          polizaCreated: polizaCreated
        };
        
        onComplete(result);
      }
    } catch (error) {
      console.error('Error creando póliza:', error);
      wizard.setError('Error al crear la póliza. Por favor, intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  // Función para manejar la cancelación
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Componente helper para inputs - CON CONTROL DE EDICIÓN
  const InputField: React.FC<{
    label: string;
    field: keyof PolizaFormDataExtended;
    value: any;
    type?: string;
    step?: string;
    icon?: React.ComponentType<any>;
    placeholder?: string;
    required?: boolean;
    className?: string;
    readOnly?: boolean;
    alwaysReadOnly?: boolean; // NUEVO: Para campos que nunca se pueden editar (cliente)
  }> = ({ label, field, value, type = "text", step, icon: Icon, placeholder, required = false, className = "", readOnly = false, alwaysReadOnly = false }) => {
    
    const isFieldReadOnly = alwaysReadOnly || (!isEditing && !readOnly) || readOnly;
    
    return (
      <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <input
            type={type}
            step={step}
            value={value || ''}
            onChange={(e) => handleInputChange(field, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
            readOnly={isFieldReadOnly}
            className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              isFieldReadOnly ? 'bg-gray-50 text-gray-700' : 'bg-white'
            }`}
            placeholder={placeholder || `Ingrese ${label.toLowerCase()}`}
          />
          {/* TICK EN ESQUINA SUPERIOR DERECHA PARA TODOS LOS CAMPOS */}
          {value && value !== '' && value !== 0 && (
            <div className="absolute -top-1 -right-1">
              <CheckCircle className="h-4 w-4 text-green-500 bg-white rounded-full" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // =================== FUNCIONES DE RENDERIZADO POR PASO ===================

  // Paso 1: Selección de Cliente
  const renderClienteStep = () => (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Seleccionar Cliente</h2>
        <p className="text-gray-600">Busque y seleccione el cliente para la nueva póliza</p>
      </div>

      {/* Buscador de clientes */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            type="text"
            value={wizard.clienteSearch}
            onChange={(e) => wizard.setClienteSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && wizard.clienteSearch.trim()) {
                wizard.searchClientes(wizard.clienteSearch);
              }
            }}
            placeholder="Buscar por nombre, cédula o RUT..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => wizard.searchClientes(wizard.clienteSearch)}
            disabled={wizard.loadingClientes || !wizard.clienteSearch.trim()}
            className="ml-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {wizard.loadingClientes ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
          </button>
        </div>

        {/* Resultados de búsqueda */}
        {wizard.clienteResults.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {wizard.clienteResults.map((cliente) => (
              <div
                key={cliente.id}
                onClick={() => wizard.selectCliente(cliente)}
                className="p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-colors"
              >
                <div className="font-medium text-gray-900">{cliente.clinom}</div>
                <div className="text-sm text-gray-600">
                  {cliente.cliced && `CI: ${cliente.cliced} • `}
                  {cliente.cliruc && `RUT: ${cliente.cliruc} • `}
                  {cliente.cliemail && cliente.cliemail}
                </div>
              </div>
            ))}
          </div>
        )}

        {wizard.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {wizard.error}
          </div>
        )}
      </div>
    </div>
  );

  // Paso 2: Selección de Compañía
  const renderCompanyStep = () => (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Seleccionar Compañía</h2>
        <p className="text-gray-600">Elija la compañía aseguradora</p>
      </div>

      {/* Cliente seleccionado */}
      {wizard.selectedCliente && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <User className="w-4 h-4 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-purple-900">Cliente seleccionado:</span>
            <span className="text-sm text-purple-800 ml-2">{wizard.selectedCliente.clinom}</span>
          </div>
        </div>
      )}

      {/* Lista de compañías */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {wizard.loadingCompanies ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">Cargando compañías...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {wizard.companies.map((company) => (
              <div
                key={company.id}
                onClick={() => wizard.selectCompany(company)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 cursor-pointer transition-colors"
              >
                <div className="font-medium text-gray-900">{company.comnom}</div>
                <div className="text-sm text-gray-600">{company.comalias}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón de retroceso */}
      <div className="flex justify-start mt-6">
        <button
          type="button"
          onClick={wizard.goBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a selección de cliente
        </button>
      </div>
    </div>
  );

  // Paso 3: Subir Archivo
  const renderUploadStep = () => (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Subir Documento</h2>
        <p className="text-gray-600">Arrastre y suelte el PDF de la póliza</p>
      </div>

      {/* Contexto seleccionado */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <User className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-900">Cliente:</span>
              <span className="text-sm text-purple-800 ml-1">{wizard.selectedCliente?.clinom}</span>
            </div>
            <div className="flex items-center">
              <Building2 className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-900">Compañía:</span>
              <span className="text-sm text-purple-800 ml-1">{wizard.selectedCompany?.comnom}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zona de drag & drop */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            if (files[0] && files[0].type === 'application/pdf') {
              wizard.setUploadedFile(files[0]);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Arrastre su archivo PDF aquí
          </p>
          <p className="text-gray-600 mb-4">o haga clic para seleccionar</p>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) wizard.setUploadedFile(file);
            }}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Seleccionar Archivo
          </label>
        </div>
      </div>

      {/* Botón de retroceso */}
      <div className="flex justify-start mt-6">
        <button
          type="button"
          onClick={wizard.goBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a selección de compañía
        </button>
      </div>
    </div>
  );

  // Paso 4: Extraer Datos
  const renderExtractStep = () => (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {wizard.processing ? (
            <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
          ) : (
            <FileCheck className="w-8 h-8 text-yellow-600" />
          )}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {wizard.processing ? 'Procesando Documento' : 'Procesar Documento'}
        </h2>
        <p className="text-gray-600">
          {wizard.processing 
            ? 'Azure AI está extrayendo los datos de la póliza...'
            : 'Haga clic para iniciar el procesamiento con Azure AI'
          }
        </p>
      </div>

      {/* Archivo seleccionado */}
      {wizard.uploadedFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <FileText className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">Archivo:</span>
            <span className="text-sm text-blue-800 ml-2">{wizard.uploadedFile.name}</span>
          </div>
        </div>
      )}

      {/* Botón de procesamiento */}
      {!wizard.processing && !wizard.extractedData && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <button
            type="button"
            onClick={wizard.processDocument}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all shadow-lg"
          >
            <FileCheck className="w-5 h-5 mr-2" />
            Procesar con Azure AI
          </button>
        </div>
      )}

      {/* Indicador de procesamiento */}
      {wizard.processing && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-yellow-600 mb-4" />
          <p className="text-gray-600">Extrayendo datos del documento...</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div className="bg-yellow-600 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
          </div>
        </div>
      )}

      {/* Error de procesamiento */}
      {wizard.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm text-red-800">{wizard.error}</span>
          </div>
        </div>
      )}

      {/* Botón de retroceso */}
      <div className="flex justify-start mt-6">
        <button
          type="button"
          onClick={wizard.goBack}
          disabled={wizard.processing}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a subir archivo
        </button>
      </div>
    </div>
  );

  // Paso 5: Formulario Final Completo (como DocumentScanner)
  const renderFormStep = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-purple-600" />
        </div>
        <div className="flex items-center justify-center gap-4 mb-4">
          <h2 className="text-3xl font-bold text-gray-900">Información Extraída de Póliza</h2>
          
          {/* BOTONES DE EDICIÓN */}
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEditing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Revisar y Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveChanges}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="w-4 h-4 mr-2" />
                Guardar
              </button>
              <button
                type="button"
                onClick={handleCancelEditing}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </button>
            </div>
          )}
        </div>
        
        <p className="text-gray-600">
          Archivo: {wizard.uploadedFile?.name} • Procesado con Azure AI
          {isEditing && <span className="text-blue-600 font-medium ml-2">• Modo edición activo</span>}
        </p>
      </div>

      {/* Resumen del contexto */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-8 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <User className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-900">Cliente:</span>
              <span className="text-sm text-purple-800 ml-1">{wizard.selectedCliente?.clinom}</span>
            </div>
            <div className="flex items-center">
              <Building2 className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-900">Compañía:</span>
              <span className="text-sm text-purple-800 ml-1">{wizard.selectedCompany?.comnom}</span>
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-900">Archivo:</span>
              <span className="text-sm text-purple-800 ml-1">{wizard.uploadedFile?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de procesamiento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Campos Completos</p>
              <p className="text-lg font-semibold text-gray-900">
                {Object.values(formData).filter(v => v && v !== '' && v !== 0).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">% Completitud</p>
              <p className="text-lg font-semibold text-gray-900">
                {Math.round((Object.values(formData).filter(v => v && v !== '' && v !== 0).length / Object.keys(formData).length) * 100)}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Eye className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Estado</p>
              <p className="text-lg font-semibold text-gray-900">Procesado</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Building className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Listo para Velneo</p>
              <p className="text-lg font-semibold text-gray-900">
                {formData.numeroPoliza && formData.asegurado ? 'Sí' : 'No'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario completo */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda */}
          <div className="space-y-6">
            
            {/* 1. INFORMACIÓN DE LA PÓLIZA */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Información de la Póliza
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Número de Póliza"
                    field="numeroPoliza"
                    value={formData.numeroPoliza}
                    icon={Hash}
                    required
                  />
                  <InputField
                    label="Año"
                    field="anio"
                    value={formData.anio}
                    type="number"
                    icon={Calendar}
                  />
                </div>
                
                {/* AGREGAR CAMPO COMPAÑÍA CON TICK EN ESQUINA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compañía Aseguradora
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={wizard.selectedCompany?.comnom || ''}
                      readOnly
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                      placeholder="Compañía seleccionada"
                    />
                    {wizard.selectedCompany?.comnom && (
                      <div className="absolute -top-1 -right-1">
                        <CheckCircle className="h-4 w-4 text-green-500 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Vigencia Desde"
                    field="vigenciaDesde"
                    value={formData.vigenciaDesde}
                    type="text"
                    icon={Calendar}
                    placeholder="dd/mm/aaaa"
                  />
                  <InputField
                    label="Vigencia Hasta"
                    field="vigenciaHasta"
                    value={formData.vigenciaHasta}
                    type="text"
                    icon={Calendar}
                    placeholder="dd/mm/aaaa"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Plan"
                    field="plan"
                    value={formData.plan}
                    placeholder="No detectado"
                  />
                  <InputField
                    label="Ramo"
                    field="ramo"
                    value={formData.ramo}
                    placeholder="No detectado"
                  />
                </div>
              </div>
            </div>

            {/* 2. DATOS DEL CLIENTE */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-green-600" />
                  Datos del Cliente
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <InputField
                  label="Nombre del Asegurado"
                  field="asegurado"
                  value={formData.asegurado}
                  icon={User}
                  required
                  alwaysReadOnly={true} // SIEMPRE BLOQUEADO - dato del cliente
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Documento"
                    field="documento"
                    value={formData.documento}
                    icon={Hash}
                    placeholder="No detectado"
                    alwaysReadOnly={true} // SIEMPRE BLOQUEADO - dato del cliente
                  />
                  <InputField
                    label="Email"
                    field="email"
                    value={formData.email}
                    type="email"
                    icon={Mail}
                    placeholder="No detectado"
                    alwaysReadOnly={true} // SIEMPRE BLOQUEADO - dato del cliente
                  />
                </div>
                
                <InputField
                  label="Dirección"
                  field="direccion"
                  value={formData.direccion}
                  icon={MapPin}
                  placeholder="No detectado"
                  alwaysReadOnly={true} // SIEMPRE BLOQUEADO - dato del cliente
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Localidad"
                    field="localidad"
                    value={formData.localidad}
                    icon={MapPin}
                    placeholder="No detectado"
                    alwaysReadOnly={true} // SIEMPRE BLOQUEADO - dato del cliente
                  />
                  <InputField
                    label="Departamento"
                    field="departamento"
                    value={formData.departamento}
                    icon={MapPin}
                    placeholder="No detectado"
                    alwaysReadOnly={true} // SIEMPRE BLOQUEADO - dato del cliente
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-6">
            
            {/* 3. DATOS DEL VEHÍCULO */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Car className="w-5 h-5 mr-2 text-purple-600" />
                  Datos del Vehículo
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <InputField
                  label="Descripción del Vehículo"
                  field="vehiculo"
                  value={formData.vehiculo}
                  icon={Car}
                  placeholder="No detectado"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Marca"
                    field="marca"
                    value={formData.marca}
                    placeholder="No detectado"
                  />
                  <InputField
                    label="Modelo"
                    field="modelo"
                    value={formData.modelo}
                    placeholder="No detectado"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Motor"
                    field="motor"
                    value={formData.motor}
                    placeholder="No detectado"
                  />
                  <InputField
                    label="Chasis"
                    field="chasis"
                    value={formData.chasis}
                    placeholder="No detectado"
                  />
                </div>
                
                <InputField
                  label="Matrícula"
                  field="matricula"
                  value={formData.matricula}
                  placeholder="No detectado"
                />
              </div>
            </div>

            {/* 4. INFORMACIÓN FINANCIERA */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Información Financiera
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Prima Comercial"
                    field="primaComercial"
                    value={formData.primaComercial}
                    type="number"
                    step="0.01"
                    icon={DollarSign}
                    placeholder="0.00"
                  />
                  <InputField
                    label="Premio Total"
                    field="premioTotal"
                    value={formData.premioTotal}
                    type="number"
                    step="0.01"
                    icon={DollarSign}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Moneda
                  </label>
                  <div className="relative">
                    <select
                      value={formData.moneda || 'UYU'}
                      onChange={(e) => handleInputChange('moneda', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        !isEditing ? 'bg-gray-50 text-gray-700' : 'bg-white'
                      }`}
                    >
                      <option value="UYU">UYU - Peso Uruguayo</option>
                      <option value="USD">USD - Dólar Americano</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                    {formData.moneda && (
                      <div className="absolute -top-1 -right-1">
                        <CheckCircle className="h-4 w-4 text-green-500 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. CORREDOR DE SEGUROS */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-orange-600" />
                  Corredor de Seguros
                </h3>
              </div>
              <div className="p-6">
                <InputField
                  label="Nombre del Corredor"
                  field="corredor"
                  value={formData.corredor}
                  placeholder="No detectado"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 6. OBSERVACIONES */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Edit3 className="w-5 h-5 mr-2 text-gray-600" />
              Observaciones
            </h3>
          </div>
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones adicionales
            </label>
            <div className="relative">
              <textarea
                value={formData.observaciones || ''}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                readOnly={!isEditing}
                rows={4}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                  !isEditing ? 'bg-gray-50 text-gray-700' : 'bg-white'
                }`}
                placeholder="Información adicional sobre la póliza..."
              />
              {formData.observaciones && formData.observaciones.trim() !== '' && (
                <div className="absolute -top-1 -right-1">
                  <CheckCircle className="h-4 w-4 text-green-500 bg-white rounded-full" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={wizard.goBack}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a procesamiento
          </button>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            
            {/* MOSTRAR "CREAR PÓLIZA" SOLO CUANDO NO ESTÁ EDITANDO */}
            {!isEditing && (
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando Póliza...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Crear Póliza
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );

  // Paso 6: Éxito
  const renderSuccessStep = () => (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">¡Póliza Creada Exitosamente!</h2>
      <p className="text-gray-600 mb-8">
        La póliza ha sido procesada y enviada a Velneo correctamente.
      </p>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
        <div className="text-sm text-green-800">
          <p><strong>Cliente:</strong> {wizard.selectedCliente?.clinom}</p>
          <p><strong>Compañía:</strong> {wizard.selectedCompany?.comnom}</p>
          <p><strong>Número de Póliza:</strong> {formData.numeroPoliza}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.location.href = '/dashboard'}
        className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Volver al Dashboard
      </button>
    </div>
  );

  // =================== RENDERIZADO PRINCIPAL ===================

  const renderCurrentStep = () => {
    switch (wizard.currentStep) {
      case 'cliente':
        return renderClienteStep();
      case 'company':
        return renderCompanyStep();
      case 'upload':
        return renderUploadStep();
      case 'extract':
        return renderExtractStep();
      case 'form':
        return renderFormStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderClienteStep();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con progreso */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Asistente de Pólizas IA</h1>
              <span className="ml-3 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                ✨ Powered by Azure AI
              </span>
            </div>
            
            {/* Indicador de progreso */}
            <div className="flex items-center space-x-2">
              {['cliente', 'company', 'upload', 'extract', 'form', 'success'].map((step, index) => {
                const isActive = wizard.currentStep === step;
                const isCompleted = ['cliente', 'company', 'upload', 'extract', 'form', 'success'].indexOf(wizard.currentStep) > index;
                
                return (
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      isActive
                        ? 'bg-purple-600 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="py-8">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default PolizaWizard;