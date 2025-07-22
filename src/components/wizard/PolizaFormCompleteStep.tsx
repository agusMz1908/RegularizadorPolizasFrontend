import React, { useState, useEffect } from 'react';
import { 
  User, Building2, FileText, Car, DollarSign, Calendar, 
  MapPin, Mail, Phone, Edit3, Save, CheckCircle, AlertTriangle, 
  Loader2, Shield, CreditCard, Hash, Navigation, Clock, Settings,
  Eye, EyeOff, ChevronDown, ChevronUp, Info, Copy, ExternalLink
} from 'lucide-react';
import { 
  PolizaFormDataComplete, 
  DocumentProcessResultVelneo,
  Cuota 
} from '../../types/azure-document-velneo';

interface PolizaFormCompleteStepProps {
  extractedData: DocumentProcessResultVelneo;
  onSubmit: (formData: PolizaFormDataComplete) => Promise<void>;
  onCancel: () => void;
  selectedCliente?: { clinom: string; id: number } | null;
  selectedCompany?: { comnom: string; id: number } | null;
}

const PolizaFormCompleteStep: React.FC<PolizaFormCompleteStepProps> = ({ 
  extractedData, 
  onSubmit, 
  onCancel,
  selectedCliente,
  selectedCompany
}) => {
  const [saving, setSaving] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basicos: true,
    poliza: true,
    vehiculo: true,
    cobertura: false,
    pago: true,
    observaciones: false
  });

  // Estado del formulario inicializado con datos extraídos
  const [formData, setFormData] = useState<PolizaFormDataComplete>(() => {
    const datos = extractedData.datosVelneo;
    return {
      // Datos Básicos
      corredor: datos.datosBasicos.corredor || '',
      asegurado: datos.datosBasicos.asegurado || '',
      estado: datos.datosBasicos.estado || '',
      domicilio: datos.datosBasicos.domicilio || '',
      tramite: datos.datosBasicos.tramite || 'Nuevo',
      fecha: datos.datosBasicos.fecha || new Date().toISOString(),
      asignado: datos.datosBasicos.asignado || '',
      tipo: datos.datosBasicos.tipo || 'PERSONA',
      telefono: datos.datosBasicos.telefono || '',
      email: datos.datosBasicos.email || '',
      documento: datos.datosBasicos.documento || '',
      departamento: datos.datosBasicos.departamento || '',
      localidad: datos.datosBasicos.localidad || '',
      codigoPostal: datos.datosBasicos.codigoPostal || '',

      // Datos Póliza
      compania: datos.datosPoliza.compania || '',
      desde: datos.datosPoliza.desde || '',
      hasta: datos.datosPoliza.hasta || '',
      numeroPoliza: datos.datosPoliza.numeroPoliza || '',
      certificado: datos.datosPoliza.certificado || '',
      endoso: datos.datosPoliza.endoso || '0',
      tipoMovimiento: datos.datosPoliza.tipoMovimiento || '',
      ramo: datos.datosPoliza.ramo || 'AUTOMOVILES',

      // Datos Vehículo
      marcaModelo: datos.datosVehiculo.marcaModelo || '',
      marca: datos.datosVehiculo.marca || '',
      modelo: datos.datosVehiculo.modelo || '',
      anio: datos.datosVehiculo.anio || '',
      motor: datos.datosVehiculo.motor || '',
      destino: datos.datosVehiculo.destino || '',
      combustible: datos.datosVehiculo.combustible || '',
      chasis: datos.datosVehiculo.chasis || '',
      calidad: datos.datosVehiculo.calidad || '',
      categoria: datos.datosVehiculo.categoria || '',
      matricula: datos.datosVehiculo.matricula || '',
      color: datos.datosVehiculo.color || '',
      tipoVehiculo: datos.datosVehiculo.tipoVehiculo || '',
      uso: datos.datosVehiculo.uso || '',

      // Datos Cobertura
      cobertura: datos.datosCobertura.cobertura || '',
      zonaCirculacion: datos.datosCobertura.zonaCirculacion || '',
      moneda: datos.datosCobertura.moneda || 'UYU',
      codigoMoneda: datos.datosCobertura.codigoMoneda || 1,

      // Condiciones Pago
      formaPago: datos.condicionesPago.formaPago || '',
      premio: datos.condicionesPago.premio || 0,
      total: datos.condicionesPago.total || 0,
      valorCuota: datos.condicionesPago.valorCuota || 0,
      cuotas: datos.condicionesPago.cuotas || 0,

      // Observaciones
      observacionesGenerales: datos.observaciones.observacionesGenerales || '',
      observacionesGestion: datos.observaciones.observacionesGestion || '',
      informacionAdicional: datos.observaciones.informacionAdicional || 'Procesado automáticamente con Azure Document Intelligence'
    };
  });

  const handleInputChange = (field: keyof PolizaFormDataComplete, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return dateString.split('T')[0]; // Formato YYYY-MM-DD para input date
    } catch {
      return '';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header con métricas mejorado */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Eye className="w-10 h-10 text-purple-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Revisar y Completar Información</h1>
        <p className="text-gray-600 text-lg mb-6">
          Datos extraídos automáticamente con Azure Document Intelligence
        </p>
        
        {/* Panel de métricas */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Completitud */}
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCompletionColor(extractedData.porcentajeCompletitud)}`}>
                <CheckCircle className="w-4 h-4 mr-1" />
                {extractedData.porcentajeCompletitud}% Completo
              </div>
              <p className="text-xs text-gray-500 mt-1">Completitud</p>
            </div>

            {/* Campos extraídos */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {extractedData.datosVelneo.metricas.camposExtraidos}
              </div>
              <p className="text-xs text-gray-500">Campos Extraídos</p>
            </div>

            {/* Tiempo procesamiento */}
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(extractedData.tiempoProcesamiento / 1000)}s
              </div>
              <p className="text-xs text-gray-500">Tiempo Procesamiento</p>
            </div>

            {/* Estado */}
            <div className="text-center">
              {extractedData.listoParaVelneo ? (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-green-600 bg-green-100">
                  <Shield className="w-4 h-4 mr-1" />
                  Listo para Velneo
                </div>
              ) : (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-orange-600 bg-orange-100">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Requiere Revisión
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Estado</p>
            </div>
          </div>

          {/* Contexto seleccionado */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600 mr-2" />
                <span className="font-medium text-gray-700">Cliente:</span>
                <span className="ml-2 text-gray-900">{selectedCliente?.clinom || 'No seleccionado'}</span>
              </div>
              <div className="flex items-center justify-center">
                <Building2 className="w-4 h-4 text-green-600 mr-2" />
                <span className="font-medium text-gray-700">Compañía:</span>
                <span className="ml-2 text-gray-900">{selectedCompany?.comnom || 'No seleccionada'}</span>
              </div>
              <div className="flex items-center justify-center">
                <FileText className="w-4 h-4 text-purple-600 mr-2" />
                <span className="font-medium text-gray-700">Archivo:</span>
                <span className="ml-2 text-gray-900">{extractedData.nombreArchivo}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 1. DATOS BÁSICOS */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div 
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('basicos')}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Datos Básicos del Cliente</h3>
                <p className="text-sm text-gray-500">Información personal y de contacto</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-600">
                {formData.asegurado ? '✓' : '○'} {formData.documento ? '✓' : '○'} {formData.domicilio ? '✓' : '○'}
              </span>
              {expandedSections.basicos ? 
                <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                <ChevronDown className="w-5 h-5 text-gray-500" />
              }
            </div>
          </div>
          
          {expandedSections.basicos && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asegurado *
                  </label>
                  <input
                    type="text"
                    value={formData.asegurado}
                    onChange={(e) => handleInputChange('asegurado', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                    placeholder="Nombre completo del asegurado"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Cliente
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => handleInputChange('tipo', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="PERSONA">Persona Física</option>
                    <option value="EMPRESA">Empresa</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documento
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.documento}
                      onChange={(e) => handleInputChange('documento', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="CI o RUT"
                    />
                    {formData.documento && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.documento)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trámite
                  </label>
                  <select
                    value={formData.tramite}
                    onChange={(e) => handleInputChange('tramite', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="Renovación">Renovación</option>
                    <option value="Cambio">Cambio</option>
                    <option value="Endoso">Endoso</option>
                    <option value="No Renueva">No Renueva</option>
                    <option value="Cancelación">Cancelación</option>
                  </select>
                </div>
                
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domicilio
                  </label>
                  <input
                    type="text"
                    value={formData.domicilio}
                    onChange={(e) => handleInputChange('domicilio', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dirección completa"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={formData.departamento}
                    onChange={(e) => handleInputChange('departamento', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Montevideo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localidad
                  </label>
                  <input
                    type="text"
                    value={formData.localidad}
                    onChange={(e) => handleInputChange('localidad', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ciudad o localidad"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={formData.codigoPostal}
                    onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="CP"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="099 123 456"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Corredor
                  </label>
                  <input
                    type="text"
                    value={formData.corredor}
                    onChange={(e) => handleInputChange('corredor', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre del corredor"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. DATOS DE LA PÓLIZA */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div 
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('poliza')}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Datos de la Póliza</h3>
                <p className="text-sm text-gray-500">Información específica de la póliza</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-green-600">
                {formData.numeroPoliza ? '✓' : '○'} {formData.desde ? '✓' : '○'} {formData.hasta ? '✓' : '○'}
              </span>
              {expandedSections.poliza ? 
                <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                <ChevronDown className="w-5 h-5 text-gray-500" />
              }
            </div>
          </div>
          
          {expandedSections.poliza && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Póliza *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.numeroPoliza}
                      onChange={(e) => handleInputChange('numeroPoliza', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      placeholder="Número de póliza"
                    />
                    <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vigencia Desde
                  </label>
                  <input
                    type="date"
                    value={formatDate(formData.desde)}
                    onChange={(e) => handleInputChange('desde', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vigencia Hasta
                  </label>
                  <input
                    type="date"
                    value={formatDate(formData.hasta)}
                    onChange={(e) => handleInputChange('hasta', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ramo
                  </label>
                  <input
                    type="text"
                    value={formData.ramo}
                    onChange={(e) => handleInputChange('ramo', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="AUTOMOVILES"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificado
                  </label>
                  <input
                    type="text"
                    value={formData.certificado}
                    onChange={(e) => handleInputChange('certificado', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nº del certificado"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endoso
                  </label>
                  <input
                    type="text"
                    value={formData.endoso}
                    onChange={(e) => handleInputChange('endoso', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. DATOS DEL VEHÍCULO */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div 
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('vehiculo')}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <Car className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Datos del Vehículo</h3>
                <p className="text-sm text-gray-500">Información técnica del vehículo asegurado</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-purple-600">
                {formData.marca ? '✓' : '○'} {formData.modelo ? '✓' : '○'} {formData.chasis ? '✓' : '○'}
              </span>
              {expandedSections.vehiculo ? 
                <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                <ChevronDown className="w-5 h-5 text-gray-500" />
              }
            </div>
          </div>
          
          {expandedSections.vehiculo && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                <div className="lg:col-span-3 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción Completa
                  </label>
                  <input
                    type="text"
                    value={formData.marcaModelo}
                    onChange={(e) => handleInputChange('marcaModelo', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                    placeholder="Descripción completa del vehículo"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => handleInputChange('marca', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="RENAULT"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => handleInputChange('modelo', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="MASTER 2.3T"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año
                  </label>
                  <input
                    type="text"
                    value={formData.anio}
                    onChange={(e) => handleInputChange('anio', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="2024"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chasis
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.chasis}
                      onChange={(e) => handleInputChange('chasis', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Número de chasis"
                    />
                    {formData.chasis && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(formData.chasis)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motor
                  </label>
                  <input
                    type="text"
                    value={formData.motor}
                    onChange={(e) => handleInputChange('motor', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Número de motor"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matrícula
                  </label>
                  <input
                    type="text"
                    value={formData.matricula}
                    onChange={(e) => handleInputChange('matricula', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Matrícula del vehículo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Combustible
                  </label>
                  <input
                    type="text"
                    value={formData.combustible}
                    onChange={(e) => handleInputChange('combustible', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="DIESEL (GAS-OIL)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uso
                  </label>
                  <select
                    value={formData.uso}
                    onChange={(e) => handleInputChange('uso', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar uso</option>
                    <option value="PARTICULAR">Particular</option>
                    <option value="COMERCIAL">Comercial</option>
                    <option value="TAXI">Taxi</option>
                    <option value="REMISE">Remise</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Color del vehículo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => handleInputChange('categoria', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="AUTOMOVIL"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. DATOS DE COBERTURA */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div 
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('cobertura')}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Datos de Cobertura</h3>
                <p className="text-sm text-gray-500">Tipo de cobertura y zona de circulación</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-indigo-600">
                {formData.cobertura ? '✓' : '○'} {formData.zonaCirculacion ? '✓' : '○'}
              </span>
              {expandedSections.cobertura ? 
                <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                <ChevronDown className="w-5 h-5 text-gray-500" />
              }
            </div>
          </div>
          
          {expandedSections.cobertura && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Cobertura
                  </label>
                  <input
                    type="text"
                    value={formData.cobertura}
                    onChange={(e) => handleInputChange('cobertura', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="SEGURO GLOBAL"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona de Circulación
                  </label>
                  <input
                    type="text"
                    value={formData.zonaCirculacion}
                    onChange={(e) => handleInputChange('zonaCirculacion', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="MONTEVIDEO"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moneda
                  </label>
                  <select
                    value={formData.moneda}
                    onChange={(e) => handleInputChange('moneda', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="UYU">Peso Uruguayo (UYU)</option>
                    <option value="USD">Dólar Americano (USD)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. CONDICIONES DE PAGO */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div 
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('pago')}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <CreditCard className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Condiciones de Pago</h3>
                <p className="text-sm text-gray-500">
                  Premio: {formatCurrency(formData.premio)} | Total: {formatCurrency(formData.total)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-yellow-600">
                {formData.premio > 0 ? '✓' : '○'} {formData.total > 0 ? '✓' : '○'} {formData.formaPago ? '✓' : '○'}
              </span>
              {expandedSections.pago ? 
                <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                <ChevronDown className="w-5 h-5 text-gray-500" />
              }
            </div>
          </div>
          
          {expandedSections.pago && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Premio Comercial
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.premio}
                      onChange={(e) => handleInputChange('premio', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total a Pagar
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={formData.total}
                      onChange={(e) => handleInputChange('total', Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad de Cuotas
                  </label>
                  <input
                    type="number"
                    value={formData.cuotas}
                    onChange={(e) => handleInputChange('cuotas', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="1"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forma de Pago
                  </label>
                  <input
                    type="text"
                    value={formData.formaPago}
                    onChange={(e) => handleInputChange('formaPago', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="TARJETA DE CRÉDITO"
                  />
                </div>
              </div>

              {/* Cronograma de cuotas si existe */}
              {extractedData.datosVelneo.condicionesPago.detalleCuotas?.tieneCuotasDetalladas && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Cronograma de Cuotas</h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-4 gap-4 text-xs font-medium text-gray-700 mb-2">
                      <div>Cuota</div>
                      <div>Vencimiento</div>
                      <div>Monto</div>
                      <div>Estado</div>
                    </div>
                    {extractedData.datosVelneo.condicionesPago.detalleCuotas.cuotas.map((cuota: Cuota) => (
                      <div key={cuota.numero} className="grid grid-cols-4 gap-4 text-sm py-2 border-b border-gray-200 last:border-0">
                        <div className="font-medium">#{cuota.numero}</div>
                        <div>{new Date(cuota.fechaVencimiento).toLocaleDateString('es-UY')}</div>
                        <div className="font-medium">{formatCurrency(cuota.monto)}</div>
                        <div>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            cuota.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {cuota.estado}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6. OBSERVACIONES */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div 
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('observaciones')}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                <Edit3 className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Observaciones</h3>
                <p className="text-sm text-gray-500">Notas adicionales y comentarios</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">
                {formData.observacionesGenerales || formData.informacionAdicional ? '✓' : '○'}
              </span>
              {expandedSections.observaciones ? 
                <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                <ChevronDown className="w-5 h-5 text-gray-500" />
              }
            </div>
          </div>
          
          {expandedSections.observaciones && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="space-y-6 pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones Generales
                  </label>
                  <textarea
                    value={formData.observacionesGenerales}
                    onChange={(e) => handleInputChange('observacionesGenerales', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                    placeholder="Observaciones sobre la póliza..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Información Adicional
                  </label>
                  <textarea
                    value={formData.informacionAdicional}
                    onChange={(e) => handleInputChange('informacionAdicional', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                    placeholder="Información adicional relevante..."
                  />
                </div>

                {/* Mostrar notas del escaneado */}
                {extractedData.datosVelneo.observaciones.notasEscaneado.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Info className="w-5 h-5 text-blue-600 mr-2" />
                      <h4 className="text-sm font-medium text-blue-800">Notas del Procesamiento Automático</h4>
                    </div>
                    <ul className="space-y-1">
                      {extractedData.datosVelneo.observaciones.notasEscaneado.map((nota, index) => (
                        <li key={index} className="text-sm text-blue-700 flex items-start">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {nota}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mostrar campos faltantes si los hay */}
                {extractedData.datosVelneo.metricas.camposFaltantes.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
                      <h4 className="text-sm font-medium text-amber-800">Campos Faltantes Detectados</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {extractedData.datosVelneo.metricas.camposFaltantes.map((campo, index) => (
                        <span 
                          key={index}
                          className="inline-flex px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-md"
                        >
                          {campo}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botón para mostrar datos crudos */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <button
            type="button"
            onClick={() => setShowRawData(!showRawData)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {showRawData ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showRawData ? 'Ocultar' : 'Mostrar'} datos extraídos (desarrollador)
          </button>

          {showRawData && (
            <div className="mt-4 p-4 bg-gray-900 rounded-lg overflow-auto max-h-96">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-400 text-sm font-mono">Datos extraídos por Azure</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(JSON.stringify(extractedData.datosVelneo, null, 2))}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <pre className="text-green-400 text-xs font-mono overflow-x-auto">
                {JSON.stringify(extractedData.datosVelneo, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>✅ {extractedData.datosVelneo.metricas.camposCompletos} campos completos</span>
                <span>⏱️ Procesado en {Math.round(extractedData.tiempoProcesamiento / 1000)}s</span>
                <span className={extractedData.listoParaVelneo ? 'text-green-600' : 'text-amber-600'}>
                  {extractedData.listoParaVelneo ? '🚀 Listo para Velneo' : '⚠️ Revisar antes de enviar'}
                </span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creando Póliza en Velneo...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Crear Póliza en Velneo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PolizaFormCompleteStep;