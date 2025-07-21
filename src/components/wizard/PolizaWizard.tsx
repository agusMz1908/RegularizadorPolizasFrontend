// src/components/wizard/PolizaWizard.tsx
// ⚡ COMPONENTE PRINCIPAL DEL WIZARD - VERSIÓN FINAL
// 🎯 INTEGRADO CON AZURE DOCUMENT SERVICE

import React, { useState, useEffect } from 'react';
import { 
  User, Building2, Upload, FileText, Eye, Check, 
  Car, DollarSign, Calendar, MapPin, Mail, Phone,
  Edit3, Save, X, CheckCircle, AlertTriangle, Loader2,
  ArrowLeft, ArrowRight, Search, FileCheck, Building,
  Settings, Shield, CreditCard, Navigation, Clock, Hash
} from 'lucide-react';
import { usePolizaWizard } from '../../hooks/usePolizaWizard';

interface PolizaWizardProps {
  onComplete?: (result: any) => void;
  onCancel?: () => void;
}

// 📝 TIPOS PARA EL FORMULARIO
interface PolizaFormData {
  numeroPoliza: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  prima: number;
  primaComercial: number;
  premioTotal: number;
  asegurado: string;
  vehiculo: string;
  marca: string;
  modelo: string;
  matricula: string;
  motor: string;
  chasis: string;
  direccion: string;
  localidad: string;
  departamento: string;
  telefono: string;
  email: string;
  corredor: string;
  plan: string;
  ramo: string;
  observaciones: string;
  anio: string;
  documento: string;
}

const PolizaWizard: React.FC<PolizaWizardProps> = ({ onComplete, onCancel }) => {
  const wizard = usePolizaWizard();
  
  // 📝 Estado del formulario
  const [formData, setFormData] = useState<PolizaFormData>({
    numeroPoliza: '',
    vigenciaDesde: '',
    vigenciaHasta: '',
    prima: 0,
    primaComercial: 0,
    premioTotal: 0,
    asegurado: '',
    vehiculo: '',
    marca: '',
    modelo: '',
    matricula: '',
    motor: '',
    chasis: '',
    direccion: '',
    localidad: '',
    departamento: '',
    telefono: '',
    email: '',
    corredor: '',
    plan: '',
    ramo: 'AUTOMOVILES',
    observaciones: 'Procesado automáticamente con Azure AI.',
    anio: '',
    documento: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🔄 Llenar formulario cuando se extraen los datos
  useEffect(() => {
    if (wizard.extractedData?.datosFormateados) {
      const datos = wizard.extractedData.datosFormateados;
      
      console.log('📝 Llenando formulario con datos extraídos:', datos);
      
      // 🗓️ FUNCIÓN PARA CONVERTIR FECHAS STRING A FORMATO INPUT
      const convertirFecha = (fecha: string | undefined): string => {
        if (!fecha) return '';
        
        try {
          console.log('🗓️ Convirtiendo fecha:', fecha);
          
          // CASO 1: Ya es formato ISO (2025-02-06T00:00:00 o 2025-02-06)
          if (fecha.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(fecha)) {
            const fechaISO = fecha.split('T')[0]; // Extraer solo la parte de fecha
            console.log('✅ Fecha ISO detectada:', fecha, '→', fechaISO);
            return fechaISO;
          }
          
          // Limpiar la fecha de espacios y caracteres extraños
          const fechaLimpia = fecha.trim().replace(/[^\d\/\-\.]/g, '');
          
          let fechaObj: Date | null = null;
          
          // PATRÓN 2: DD/MM/YYYY o DD/MM/YY
          if (fechaLimpia.includes('/')) {
            const partes = fechaLimpia.split('/');
            if (partes.length === 3) {
              let [dia, mes, anio] = partes;
              
              // Convertir año de 2 dígitos a 4 dígitos
              if (anio.length === 2) {
                const anioNum = parseInt(anio);
                anio = anioNum > 50 ? `19${anio}` : `20${anio}`;
              }
              
              const diaNum = parseInt(dia);
              const mesNum = parseInt(mes);
              const anioNum = parseInt(anio);
              
              if (diaNum >= 1 && diaNum <= 31 && mesNum >= 1 && mesNum <= 12 && anioNum > 1900) {
                fechaObj = new Date(anioNum, mesNum - 1, diaNum);
              }
            }
          }
          
          // PATRÓN 3: DD-MM-YYYY o DD-MM-YY
          else if (fechaLimpia.includes('-') && !fechaLimpia.startsWith('20')) {
            const partes = fechaLimpia.split('-');
            if (partes.length === 3) {
              let [dia, mes, anio] = partes;
              
              if (anio.length === 2) {
                const anioNum = parseInt(anio);
                anio = anioNum > 50 ? `19${anio}` : `20${anio}`;
              }
              
              const diaNum = parseInt(dia);
              const mesNum = parseInt(mes);
              const anioNum = parseInt(anio);
              
              if (diaNum >= 1 && diaNum <= 31 && mesNum >= 1 && mesNum <= 12 && anioNum > 1900) {
                fechaObj = new Date(anioNum, mesNum - 1, diaNum);
              }
            }
          }
          
          // PATRÓN 4: DD.MM.YYYY
          else if (fechaLimpia.includes('.')) {
            const partes = fechaLimpia.split('.');
            if (partes.length === 3) {
              let [dia, mes, anio] = partes;
              
              if (anio.length === 2) {
                const anioNum = parseInt(anio);
                anio = anioNum > 50 ? `19${anio}` : `20${anio}`;
              }
              
              const diaNum = parseInt(dia);
              const mesNum = parseInt(mes);
              const anioNum = parseInt(anio);
              
              if (diaNum >= 1 && diaNum <= 31 && mesNum >= 1 && mesNum <= 12 && anioNum > 1900) {
                fechaObj = new Date(anioNum, mesNum - 1, diaNum);
              }
            }
          }
          
          // PATRÓN 5: DDMMYYYY (sin separadores)
          else if (fechaLimpia.length === 8 && /^\d{8}$/.test(fechaLimpia)) {
            const dia = fechaLimpia.substring(0, 2);
            const mes = fechaLimpia.substring(2, 4);
            const anio = fechaLimpia.substring(4, 8);
            
            const diaNum = parseInt(dia);
            const mesNum = parseInt(mes);
            const anioNum = parseInt(anio);
            
            if (diaNum >= 1 && diaNum <= 31 && mesNum >= 1 && mesNum <= 12 && anioNum > 1900) {
              fechaObj = new Date(anioNum, mesNum - 1, diaNum);
            }
          }
          
          // Verificar que la fecha es válida y convertir a formato YYYY-MM-DD
          if (fechaObj && !isNaN(fechaObj.getTime())) {
            const resultado = fechaObj.toISOString().split('T')[0];
            console.log('✅ Fecha convertida:', fecha, '→', resultado);
            return resultado;
          }
          
          console.warn('⚠️ No se pudo parsear fecha:', fecha);
          return '';
          
        } catch (error) {
          console.warn('❌ Error parseando fecha:', fecha, error);
          return '';
        }
      };
      
      setFormData(prev => ({
        ...prev,
        // Datos básicos
        numeroPoliza: datos.numeroPoliza || '',
        asegurado: datos.asegurado || wizard.selectedCliente?.clinom || '',
        documento: datos.documento || '',
        vigenciaDesde: convertirFecha(datos.vigenciaDesde),
        vigenciaHasta: convertirFecha(datos.vigenciaHasta),
        
        // Datos financieros
        prima: datos.primaComercial || datos.premioTotal || 0,
        primaComercial: datos.primaComercial || 0,
        premioTotal: datos.premioTotal || 0,
        plan: datos.plan || '',
        
        // Datos del vehículo
        vehiculo: datos.vehiculo || '',
        marca: datos.marca || '',
        modelo: datos.modelo || '',
        matricula: datos.matricula || '',
        motor: datos.motor || '',
        chasis: datos.chasis || '',
        anio: datos.anio || '',
        
        // Datos de contacto
        direccion: datos.direccion || '',
        localidad: datos.localidad || '',
        departamento: datos.departamento || '',
        telefono: wizard.selectedCliente?.telefono || '',
        email: datos.email || wizard.selectedCliente?.cliemail || '',
        
        // Otros datos
        corredor: datos.corredor || '',
        ramo: datos.ramo || 'AUTOMOVILES'
      }));
      
      console.log('📅 Fechas convertidas:', {
        vigenciaDesde: datos.vigenciaDesde + ' → ' + convertirFecha(datos.vigenciaDesde),
        vigenciaHasta: datos.vigenciaHasta + ' → ' + convertirFecha(datos.vigenciaHasta)
      });
    }
  }, [wizard.extractedData, wizard.selectedCliente]);

  // =====================================
  // 🎨 RENDERS DE CADA PASO
  // =====================================

  // 1️⃣ PASO: Selección de Cliente
  const renderClienteStep = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccionar Cliente</h2>
        <p className="text-gray-600">Busca y selecciona el cliente para la póliza</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Buscador */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={wizard.clienteSearch}
            onChange={(e) => {
              wizard.setClienteSearch(e.target.value);
              if (e.target.value.length >= 2) {
                wizard.searchClientes(e.target.value);
              }
            }}
            placeholder="Buscar por nombre, documento o RUC..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Loading de búsqueda */}
        {wizard.loadingClientes && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600 mr-2" />
            <span className="text-gray-600">Buscando clientes...</span>
          </div>
        )}

        {/* Resultados */}
        {wizard.clienteResults.length > 0 && (
          <div className="space-y-3">
            {wizard.clienteResults.map((cliente) => (
              <div
                key={cliente.id}
                onClick={() => wizard.selectCliente(cliente)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{cliente.clinom}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {cliente.cliced && <span>CI: {cliente.cliced}</span>}
                      {cliente.cliruc && <span className="ml-3">RUC: {cliente.cliruc}</span>}
                    </div>
                    {cliente.cliemail && (
                      <div className="text-sm text-gray-500 mt-1">{cliente.cliemail}</div>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {wizard.clienteSearch.length >= 2 && !wizard.loadingClientes && wizard.clienteResults.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron clientes con ese criterio
          </div>
        )}

        {/* Mensaje inicial */}
        {wizard.clienteSearch.length < 2 && wizard.clienteResults.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Escribe al menos 2 caracteres para buscar
          </div>
        )}
      </div>
    </div>
  );

  // 2️⃣ PASO: Selección de Compañía
  const renderCompanyStep = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccionar Compañía</h2>
        <p className="text-gray-600">Elige la compañía de seguros para la póliza</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Cliente seleccionado */}
        {wizard.selectedCliente && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">Cliente: {wizard.selectedCliente.clinom}</span>
            </div>
          </div>
        )}

        {/* Loading de compañías */}
        {wizard.loadingCompanies && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600 mr-2" />
            <span className="text-gray-600">Cargando compañías...</span>
          </div>
        )}

        {/* Lista de compañías */}
        {wizard.companies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wizard.companies.map((company) => (
              <div
                key={company.id}
                onClick={() => wizard.selectCompany(company)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center">
                  <Building2 className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">{company.comnom}</h3>
                    <p className="text-sm text-gray-600">{company.comalias}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sin compañías disponibles */}
        {!wizard.loadingCompanies && wizard.companies.length === 0 && (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin compañías disponibles</h3>
            <p className="text-gray-600 mb-4">No se encontraron compañías activas</p>
            <button
              onClick={wizard.loadCompanies}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Recargar
            </button>
          </div>
        )}

        {/* Botón volver */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => wizard.goBack()}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a clientes
          </button>
        </div>
      </div>
    </div>
  );

  // 3️⃣ PASO: Upload de Archivo
  const renderUploadStep = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subir Póliza</h2>
        <p className="text-gray-600">Arrastra o selecciona el archivo PDF de la póliza</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Selecciones anteriores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {wizard.selectedCliente && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <User className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">{wizard.selectedCliente.clinom}</span>
              </div>
            </div>
          )}
          
          {wizard.selectedCompany && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <Building className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">{wizard.selectedCompany.comnom}</span>
              </div>
            </div>
          )}
        </div>

        {/* Zona de drop */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Arrastra tu archivo aquí</h3>
          <p className="text-gray-600 mb-4">o haz click para seleccionar</p>
          
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                wizard.setUploadedFile(file);
              }
            }}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 cursor-pointer transition-colors"
          >
            Seleccionar PDF
          </label>

          <div className="mt-4 text-sm text-gray-500">
            Tamaño máximo: 10MB • Solo archivos PDF
          </div>
        </div>

        {/* Archivo seleccionado */}
        {wizard.uploadedFile && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">{wizard.uploadedFile.name}</span>
                <span className="ml-2 text-sm text-green-600">
                  ({(wizard.uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                onClick={() => wizard.setUploadedFile(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => wizard.goBack()}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a compañías
          </button>

          {wizard.uploadedFile && (
            <button
              onClick={() => wizard.processDocument()}
              disabled={wizard.processing}
              className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {wizard.processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 mr-2" />
                  🚀 Procesar con Azure AI
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // 4️⃣ PASO: Procesamiento
  const renderExtractStep = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🤖 Procesando con Azure AI</h2>
        <p className="text-gray-600">Extrayendo datos inteligentemente del documento...</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {wizard.processingProgress < 30 ? '📤 Subiendo archivo...' :
             wizard.processingProgress < 70 ? '🧠 Extrayendo datos...' :
             wizard.processingProgress < 95 ? '✅ Validando información...' :
             '🎯 Finalizando...'}
          </h3>
          
          <p className="text-gray-600 mb-6">
            Azure Document Intelligence está analizando la póliza
          </p>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${wizard.processingProgress}%` }}
            ></div>
          </div>
          
          <div className="text-sm text-gray-500">
            {wizard.processingProgress}% completado
          </div>

          {/* Info del archivo */}
          {wizard.uploadedFile && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <div>📄 {wizard.uploadedFile.name}</div>
                <div>👤 {wizard.selectedCliente?.clinom}</div>
                <div>🏢 {wizard.selectedCompany?.comnom}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 5️⃣ PASO: Formulario de validación
  const renderFormStep = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">✅ Validar Datos Extraídos</h2>
        <p className="text-gray-600">Revisa y completa la información antes de crear la póliza</p>
      </div>

      {wizard.extractedData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Información de extracción */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">
                  Documento procesado exitosamente con Azure AI
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-blue-600">
                {wizard.extractedData.nivelConfianza && (
                  <span>Confianza: {Math.round(wizard.extractedData.nivelConfianza * 100)}%</span>
                )}
                {wizard.extractedData.tiempoProcesamiento && (
                  <span>Tiempo: {(wizard.extractedData.tiempoProcesamiento / 1000).toFixed(1)}s</span>
                )}
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Datos básicos */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Hash className="w-5 h-5 mr-2" />
                Datos Básicos
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Póliza *
                </label>
                <input
                  type="text"
                  value={formData.numeroPoliza}
                  onChange={(e) => setFormData(prev => ({ ...prev, numeroPoliza: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Ingrese número de póliza"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asegurado *
                </label>
                <input
                  type="text"
                  value={formData.asegurado}
                  onChange={(e) => setFormData(prev => ({ ...prev, asegurado: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Nombre del asegurado"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documento
                </label>
                <input
                  type="text"
                  value={formData.documento}
                  onChange={(e) => setFormData(prev => ({ ...prev, documento: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="CI o RUC"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vigencia Desde *
                  </label>
                  <input
                    type="date"
                    value={formData.vigenciaDesde}
                    onChange={(e) => setFormData(prev => ({ ...prev, vigenciaDesde: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vigencia Hasta *
                  </label>
                  <input
                    type="date"
                    value={formData.vigenciaHasta}
                    onChange={(e) => setFormData(prev => ({ ...prev, vigenciaHasta: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Datos del vehículo */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Vehículo
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehículo
                </label>
                <input
                  type="text"
                  value={formData.vehiculo}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehiculo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Descripción del vehículo"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Marca"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Modelo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año
                  </label>
                  <input
                    type="text"
                    value={formData.anio}
                    onChange={(e) => setFormData(prev => ({ ...prev, anio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Año"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matrícula
                  </label>
                  <input
                    type="text"
                    value={formData.matricula}
                    onChange={(e) => setFormData(prev => ({ ...prev, matricula: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Matrícula"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Datos financieros */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Prima Comercial
              </label>
              <input
                type="number"
                value={formData.primaComercial}
                onChange={(e) => setFormData(prev => ({ ...prev, primaComercial: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Premio Total
              </label>
              <input
                type="number"
                value={formData.premioTotal}
                onChange={(e) => setFormData(prev => ({ ...prev, premioTotal: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan
              </label>
              <input
                type="text"
                value={formData.plan}
                onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Plan de cobertura"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Observaciones adicionales..."
            />
          </div>

          {/* Botones */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => wizard.goBack()}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al procesamiento
            </button>

            <button
              onClick={async () => {
                setSaving(true);
                try {
                  await wizard.createPoliza(formData);
                  onComplete?.(formData);
                } catch (error) {
                  console.error('Error creando póliza:', error);
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving || !formData.numeroPoliza || !formData.asegurado}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  🎯 Crear Póliza
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // 6️⃣ PASO: Éxito
  const renderSuccessStep = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 ¡Póliza Creada Exitosamente!</h2>
          <p className="text-gray-600 mb-6">
            La póliza se ha procesado y creado correctamente con Azure AI
          </p>
          
          {wizard.extractedData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">📋 Resumen:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>👤 Cliente: {wizard.selectedCliente?.clinom}</div>
                <div>🏢 Compañía: {wizard.selectedCompany?.comnom}</div>
                <div>📄 Póliza: {formData.numeroPoliza}</div>
                <div>📁 Archivo: {wizard.uploadedFile?.name}</div>
                {wizard.extractedData.tiempoProcesamiento && (
                  <div>⏱️ Tiempo de procesamiento: {(wizard.extractedData.tiempoProcesamiento / 1000).toFixed(1)}s</div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => wizard.reset()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              🚀 Procesar Otra Póliza
            </button>
            <button
              onClick={() => onComplete?.(formData)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              📋 Ir a Pólizas
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // =====================================
  // 🎨 RENDER PRINCIPAL
  // =====================================

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

  const stepLabels = {
    cliente: 'Cliente',
    company: 'Compañía',
    upload: 'Archivo',
    extract: 'Procesando',
    form: 'Validación',
    success: 'Éxito'
  };

  const stepOrder = ['cliente', 'company', 'upload', 'extract', 'form', 'success'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con progreso */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">🤖 Asistente de Pólizas IA</h1>
              <span className="ml-3 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                ✨ Powered by Azure AI
              </span>
            </div>
            
            {/* Indicador de progreso */}
            <div className="flex items-center space-x-2">
              {stepOrder.map((step, index) => {
                const isActive = wizard.currentStep === step;
                const isCompleted = stepOrder.indexOf(wizard.currentStep) > index;
                
                return (
                  <div key={step} className="flex items-center">
                    <div
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
                    <span className={`ml-2 text-sm font-medium ${
                      isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {stepLabels[step as keyof typeof stepLabels]}
                    </span>
                    {index < stepOrder.length - 1 && (
                      <div className="w-8 h-px bg-gray-300 mx-3"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Botón cancelar */}
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="py-8">
        {renderCurrentStep()}
      </div>

      {/* Mostrar errores */}
      {wizard.error && (
        <div className="fixed bottom-4 right-4 max-w-md bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mr-2 mt-0.5" />
            <div className="flex-1">
              <span className="block">{wizard.error}</span>
            </div>
            <button
              onClick={() => wizard.setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolizaWizard;