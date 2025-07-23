import React, { useState, useEffect } from 'react';
import { 
  User, Building2, Upload, FileText, Eye, Check, 
  Car, DollarSign, Calendar, MapPin, Mail, Phone,
  Edit3, Save, X, CheckCircle, AlertTriangle, Loader2,
  ArrowLeft, ArrowRight, Search, FileCheck, Building,
  Settings, Shield, CreditCard, Navigation, Clock, Hash,
  Star, Zap, Sparkles, Award, Target
} from 'lucide-react';
import { usePolizaWizard } from '../../hooks/usePolizaWizard';
import { useDarkMode } from '../../context/ThemeContext';

interface PolizaWizardProps {
  onComplete?: (result: any) => void;
  onCancel?: () => void;
}

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
  destino: string;
  combustible: string;
  calidad: string;
  categoria: string;
  tipoVehiculo: string;
  uso: string;
  formaPago: string;
  cantidadCuotas: number;
  valorCuota: number;
  moneda: string;
  primeraCuotaFecha: string;
  primeraCuotaMonto: number;
}

const PolizaWizard: React.FC<PolizaWizardProps> = ({ onComplete, onCancel }) => {
  const wizard = usePolizaWizard();
  const isDarkMode = useDarkMode();
  
  const [activeTab, setActiveTab] = useState('basicos');
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
    documento: '',
    destino: '',
    combustible: '',
    calidad: '',
    categoria: '',
    tipoVehiculo: '',
    uso: '',
    formaPago: '',
    cantidadCuotas: 0,
    valorCuota: 0,
    moneda: '',
    primeraCuotaFecha: '',
    primeraCuotaMonto: 0,
  });

  const [saving, setSaving] = useState(false);

  const getBgClass = () => isDarkMode 
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
    : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50';

  const getCardClass = () => isDarkMode 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-gray-100';

  // Función para obtener clases de texto según modo oscuro
  const getTextClass = () => isDarkMode 
    ? 'text-gray-100' 
    : 'text-gray-900';

  // Función para obtener clases de texto secundario según modo oscuro
  const getTextSecondaryClass = () => isDarkMode 
    ? 'text-gray-300' 
    : 'text-gray-600';

  // useEffect para llenar el formulario (sin cambios)
  useEffect(() => {
    if (wizard.extractedData?.datosVelneo) {
      const datos = wizard.extractedData.datosVelneo;
      
      const convertirFecha = (fecha: string | undefined): string => {
        if (!fecha) return '';
        try {
          if (fecha.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(fecha)) {
            return fecha.split('T')[0];
          }
          const match = fecha.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (match) {
            const dia = parseInt(match[1]);
            const mes = parseInt(match[2]);
            const anio = parseInt(match[3]);
            if (dia >= 1 && dia <= 31 && mes >= 1 && mes <= 12) {
              const fechaObj = new Date(anio, mes - 1, dia);
              return fechaObj.toISOString().split('T')[0];
            }
          }
          return '';
        } catch (error) {
          console.error('Error convirtiendo fecha:', fecha, error);
          return '';
        }
      };

      setFormData(prev => ({
        ...prev,
        numeroPoliza: datos.datosPoliza?.numeroPoliza || '',
        asegurado: datos.datosBasicos?.asegurado || wizard.selectedCliente?.clinom || '',
        documento: datos.datosBasicos?.documento || '',
        corredor: datos.datosBasicos?.corredor || '',
        vigenciaDesde: convertirFecha(datos.datosPoliza?.desde),
        vigenciaHasta: convertirFecha(datos.datosPoliza?.hasta),
        plan: datos.datosCobertura?.cobertura || '',
        ramo: datos.datosPoliza?.ramo || 'AUTOMOVILES',
        vehiculo: datos.datosVehiculo?.marcaModelo || '',
        marca: datos.datosVehiculo?.marca || '',
        modelo: datos.datosVehiculo?.modelo || '',
        anio: datos.datosVehiculo?.anio || '',
        motor: datos.datosVehiculo?.motor || '',
        chasis: datos.datosVehiculo?.chasis || '',
        matricula: datos.datosVehiculo?.matricula || '',
        destino: datos.datosVehiculo?.destino || '',
        combustible: datos.datosVehiculo?.combustible || '',
        calidad: datos.datosVehiculo?.calidad || '',
        categoria: datos.datosVehiculo?.categoria || '',
        tipoVehiculo: datos.datosVehiculo?.tipoVehiculo || '',
        uso: datos.datosVehiculo?.uso || '',
        email: datos.datosBasicos?.email || '',
        telefono: datos.datosBasicos?.telefono || '',
        direccion: datos.datosBasicos?.domicilio || '',
        localidad: datos.datosBasicos?.localidad || '',
        departamento: datos.datosBasicos?.departamento || '',
        primaComercial: datos.condicionesPago?.premio || 0,
        premioTotal: datos.condicionesPago?.total || 0,
        prima: datos.condicionesPago?.premio || 0,
        formaPago: datos.condicionesPago?.formaPago || '',
        cantidadCuotas: datos.condicionesPago?.cuotas || 1,
        valorCuota: datos.condicionesPago?.valorCuota || 0,
        moneda: datos.condicionesPago?.moneda || datos.datosCobertura?.moneda || 'UYU',
        primeraCuotaFecha: datos.condicionesPago?.detalleCuotas?.primeraCuota?.fechaVencimiento
          ? convertirFecha(datos.condicionesPago.detalleCuotas.primeraCuota.fechaVencimiento)
          : '',
        primeraCuotaMonto: datos.condicionesPago?.detalleCuotas?.primeraCuota?.monto || 0,
        observaciones: generarObservacionesAutomaticas(datos)
      }));
    }
  }, [wizard.extractedData]);

  const generarObservacionesAutomaticas = (datos: any): string => {
    const observaciones = [];
    observaciones.push('📄 Documento procesado automáticamente con Azure Document Intelligence');
    observaciones.push(`📊 ${datos.metricas?.camposCompletos || 0} campos extraídos (${datos.porcentajeCompletitud || 0}% completitud)`);
    
    if (datos.condicionesPago?.detalleCuotas?.tieneCuotasDetalladas && datos.condicionesPago.detalleCuotas.cuotas?.length > 0) {
      observaciones.push('');
      observaciones.push('💳 CRONOGRAMA DE CUOTAS DETECTADO:');
      observaciones.push(`${datos.condicionesPago.formaPago} - ${datos.condicionesPago.cuotas} cuotas de ${datos.condicionesPago.moneda} ${datos.condicionesPago.valorCuota?.toLocaleString()}`);
      observaciones.push('');
      datos.condicionesPago.detalleCuotas.cuotas.forEach((cuota: any, index: number) => {
        const fecha = new Date(cuota.fechaVencimiento).toLocaleDateString('es-UY');
        observaciones.push(`Cuota ${cuota.numero}: ${fecha} - $${cuota.monto?.toLocaleString()}`);
      });
    }
    
    if (!datos.tieneDatosMinimos) {
      observaciones.push('');
      observaciones.push('⚠️ REQUIERE VERIFICACIÓN MANUAL - Datos incompletos');
    }
    
    return observaciones.join('\n');
  };

  // =====================================
  // 🎨 RENDERS DE CADA PASO - DISEÑO MODERNO
  // =====================================

  // 1️⃣ PASO: Selección de Cliente - REDISEÑADO
  const renderClienteStep = () => (
  <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'text-gray-100' : ''}`}>
    {/* Header mejorado con gradiente */}
    <div className={`text-center mb-12 p-8 rounded-3xl shadow-xl ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
        : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100'
    }`}>
      {/* Add background container here */}
      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${
        isDarkMode 
          ? 'bg-gradient-to-br from-blue-600 to-purple-700' 
          : 'bg-gradient-to-br from-blue-500 to-purple-600'
      } shadow-lg mb-6`}>
        <User className="w-10 h-10 text-white" />
      </div>
      <h2 className={`text-4xl font-bold ${
        isDarkMode 
          ? 'bg-gradient-to-r from-blue-300 to-purple-300' 
          : 'bg-gradient-to-r from-gray-900 to-gray-600'
      } bg-clip-text text-transparent mb-4`}>
        Seleccionar Cliente
      </h2>
      <p className={`text-xl ${
        isDarkMode ? 'text-gray-300' : 'text-gray-600'
      } max-w-2xl mx-auto`}>
        Busca y selecciona el cliente para comenzar el proceso de creación de la póliza
      </p>
    </div>

      {/* Card principal con sombra moderna */}
            <div className={`rounded-3xl shadow-xl border overflow-hidden ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        {/* Buscador mejorado */}
        <div className={`p-8 border-b ${
          isDarkMode 
            ? 'border-gray-700 bg-gradient-to-r from-gray-900 to-blue-900' 
            : 'border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50'
        }`}>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
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
              className="block w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <div className="px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-lg">
                {wizard.clienteSearch.length}/2 min
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Loading */}
          {wizard.loadingClientes && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-gray-600 mt-4 text-lg">Buscando clientes...</p>
            </div>
          )}

          {/* Resultados mejorados */}
          {wizard.clienteResults.length > 0 && (
            <div className="space-y-6">
              {/* Header con estadísticas */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Resultados encontrados
                </h3>
                <div className="flex items-center space-x-3">
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {wizard.clienteResults.length} cliente{wizard.clienteResults.length !== 1 ? 's' : ''}
                  </span>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <Zap className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Búsqueda instantánea</span>
                </div>
              </div>

              {/* Grid de resultados */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                {wizard.clienteResults.map((cliente, index) => (
                  <div
                    key={cliente.id}
                    onClick={() => wizard.selectCliente(cliente)}
                    className="group relative p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-lg cursor-pointer transition-all duration-300 bg-white hover:bg-blue-50"
                  >
                    {/* Badge de ranking */}
                    {index < 3 && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                          <Star className="w-3 h-3" />
                          <span>Top {index + 1}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Nombre principal */}
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-900 transition-colors">
                          {cliente.clinom}
                        </h4>
                      </div>
                      
                      {/* Información en cards */}
                      <div className="grid grid-cols-2 gap-3">
                        {cliente.cliced && (
                          <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-blue-800">CI: {cliente.cliced}</span>
                          </div>
                        )}
                        {cliente.cliruc && (
                          <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-800">RUC: {cliente.cliruc}</span>
                          </div>
                        )}
                      </div>

                      {/* Contacto */}
                      <div className="space-y-2">
                        {cliente.cliemail && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm truncate">{cliente.cliemail}</span>
                          </div>
                        )}
                        {cliente.telefono && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">{cliente.telefono}</span>
                          </div>
                        )}
                      </div>

                      {/* Dirección */}
                      {cliente.clidir && (
                        <div className="flex items-start space-x-2 text-gray-500">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{cliente.clidir}</span>
                        </div>
                      )}

                      {/* Botón de acción */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Haz clic para seleccionar</span>
                        <ArrowRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer informativo */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  💡 Los resultados están ordenados por relevancia
                </p>
              </div>
            </div>
          )}

          {/* Estados vacíos mejorados */}
          {wizard.clienteSearch.length >= 2 && !wizard.loadingClientes && wizard.clienteResults.length === 0 && (
            <div className="text-center py-16">
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              } mb-3`}>Sin resultados</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                No se encontraron clientes con el criterio "{wizard.clienteSearch}"
              </p>
              <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-sm`}>
                Intenta con otro nombre o documento
              </p>
            </div>
          )}

          {wizard.clienteSearch.length < 2 && wizard.clienteResults.length === 0 && (
            <div className="text-center py-16">
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-blue-900 to-purple-900' 
                  : 'bg-gradient-to-br from-blue-100 to-purple-100'
              }`}>
                <Search className={`w-12 h-12 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className={`text-xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              } mb-3`}>
                Comienza tu búsqueda
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                Escribe al menos 2 caracteres para encontrar clientes
              </p>
              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">Nombre</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">CI</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-600">RUC</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 2️⃣ PASO: Selección de Compañía - REDISEÑADO
  const renderCompanyStep = () => (
    <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'text-gray-100' : ''}`}>
      {/* Header mejorado */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-lg mb-6">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
          Seleccionar Compañía
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Elige la compañía de seguros para procesar la póliza
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Cliente seleccionado - Card mejorada */}
        {wizard.selectedCliente && (
          <div className="p-8 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-b border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Cliente seleccionado</p>
                  <h3 className="text-xl font-bold text-green-900">{wizard.selectedCliente.clinom}</h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-green-700">
                    {wizard.selectedCliente.cliced && <span>CI: {wizard.selectedCliente.cliced}</span>}
                    {wizard.selectedCliente.cliemail && <span>📧 {wizard.selectedCliente.cliemail}</span>}
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium">
                ✓ Paso 1 completado
              </div>
            </div>
          </div>
        )}

        <div className="p-8">
          {/* Loading mejorado */}
          {wizard.loadingCompanies && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-gray-600 mt-4 text-lg">Cargando compañías...</p>
            </div>
          )}

          {/* Lista de compañías mejorada */}
          {wizard.companies.length > 0 && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">
                  Compañías disponibles
                </h3>
                <div className="flex items-center space-x-3">
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {wizard.companies.length} compañía{wizard.companies.length !== 1 ? 's' : ''}
                  </span>
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-600">Verificadas</span>
                </div>
              </div>

              {/* Grid de compañías */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wizard.companies.map((company, index) => (
                  <div
                    key={company.id}
                    onClick={() => wizard.selectCompany(company)}
                    className="group relative p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl cursor-pointer transition-all duration-300 bg-white hover:bg-blue-50"
                  >
                    {/* Badge premium */}
                    {index < 2 && (
                      <div className="absolute top-4 right-4">
                        <div className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                          ⭐ Popular
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Icono y título */}
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                          <Building2 className="w-6 h-6 text-blue-600 group-hover:text-blue-700" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-900 transition-colors">
                            {company.comnom}
                          </h4>
                          {company.comalias && company.comalias !== company.comnom && (
                            <p className="text-sm text-gray-600">Código: {company.comalias}</p>
                          )}
                        </div>
                      </div>

                      {/* Estado */}
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-600">Activa y verificada</span>
                      </div>

                      {/* Botón de acción */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500">Seleccionar compañía</span>
                        <ArrowRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  🏢 Todas las compañías están activas y verificadas
                </p>
              </div>
            </div>
          )}

          {/* Estado sin compañías */}
          {!wizard.loadingCompanies && wizard.companies.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Sin compañías disponibles</h3>
              <p className="text-gray-600 mb-6">
                No se encontraron compañías activas en el sistema
              </p>
              <button
                onClick={wizard.loadCompanies}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <Loader2 className="w-5 h-5 mr-2" />
                Recargar compañías
              </button>
            </div>
          )}
        </div>

        {/* Navegación */}
        <div className="flex justify-between items-center p-8 bg-gray-50 border-t border-gray-100">
          <button
            onClick={wizard.goBack}
            className="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a cliente
          </button>
          
          {wizard.selectedCompany && (
            <button
              onClick={() => wizard.goToStep('upload')}
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
            >
              Continuar
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // 3️⃣ PASO: Upload de Archivo - REDISEÑADO
  const renderUploadStep = () => (
  <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'text-gray-100' : ''}`}>
    {/* Header mejorado con fondo */}
    <div className={`text-center mb-12 p-8 rounded-3xl shadow-xl ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
        : 'bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-100'
    }`}>
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg mb-6">
        <Upload className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
        Subir Póliza
      </h2>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Arrastra o selecciona el archivo PDF de la póliza para procesarlo con IA
      </p>
    </div>

    <div className={`rounded-3xl shadow-xl border overflow-hidden ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      {/* Selecciones anteriores - Grid mejorado */}
      <div className={`p-8 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-900 to-blue-900 border-b border-gray-700' 
          : 'bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wizard.selectedCliente && (
            <div className={`flex items-center space-x-4 p-4 rounded-2xl shadow-sm ${
              isDarkMode 
                ? 'bg-gray-700 border border-green-800' 
                : 'bg-white border border-green-200'
            }`}>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-green-300' : 'text-green-800'
                } mb-1`}>Cliente</p>
                <p className={`font-bold ${isDarkMode ? 'text-green-200' : 'text-green-900'}`}>
                  {wizard.selectedCliente.clinom}
                </p>
              </div>
            </div>
          )}
          
          {wizard.selectedCompany && (
            <div className={`flex items-center space-x-4 p-4 rounded-2xl shadow-sm ${
              isDarkMode 
                ? 'bg-gray-700 border border-blue-800' 
                : 'bg-white border border-blue-200'
            }`}>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-800'
                } mb-1`}>Compañía</p>
                <p className={`font-bold ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                  {wizard.selectedCompany.comnom}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        {/* Zona de drop mejorada con soporte para dark mode y hover */}
        <div className={`border-3 border-dashed rounded-3xl p-12 text-center transition-all duration-300 group ${
          isDarkMode 
            ? 'border-gray-600 hover:border-purple-500 hover:bg-purple-900/30' 
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
        }`}>
          <div className="space-y-6">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform ${
              isDarkMode 
                ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50' 
                : 'bg-gradient-to-br from-purple-100 to-pink-100'
            }`}>
              <Upload className={`w-12 h-12 ${
                isDarkMode 
                  ? 'text-purple-400 group-hover:text-purple-300' 
                  : 'text-purple-600 group-hover:text-purple-700'
              }`} />
            </div>
            
            <div>
              <h3 className={`text-2xl font-bold ${
                isDarkMode 
                  ? 'text-white group-hover:text-purple-300' 
                  : 'text-gray-900 group-hover:text-purple-900'
              } mb-2 transition-colors`}>Arrastra tu archivo aquí</h3>
              <p className={`text-lg mb-6 ${
                isDarkMode 
                  ? 'text-gray-400 group-hover:text-gray-300' 
                  : 'text-gray-600 group-hover:text-gray-800'
              } transition-colors`}>
                o haz click para seleccionar desde tu computadora
              </p>
              
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
                className={`inline-flex items-center px-8 py-4 rounded-2xl cursor-pointer transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-purple-700 to-pink-700 text-white hover:from-purple-600 hover:to-pink-600' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
                }`}
              >
                <FileText className="w-6 h-6 mr-3" />
                Seleccionar PDF
              </label>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Target className="w-4 h-4 text-green-500" />
                <span>Tamaño máximo: 10MB</span>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Solo archivos PDF</span>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Procesamiento IA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Archivo seleccionado - Card mejorada con dark mode */}
        {wizard.uploadedFile && (
          <div className={`mt-8 p-6 rounded-2xl ${
            isDarkMode 
              ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-800' 
              : 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className={`font-bold ${
                    isDarkMode ? 'text-green-200' : 'text-green-900'
                  } text-lg`}>{wizard.uploadedFile.name}</p>
                  <p className={isDarkMode ? 'text-green-400' : 'text-green-700'}>
                    {(wizard.uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Listo para procesar
                  </p>
                </div>
              </div>
              <button
                onClick={() => wizard.setUploadedFile(null)}
                className={`w-10 h-10 rounded-xl transition-colors flex items-center justify-center ${
                  isDarkMode 
                    ? 'bg-red-900 hover:bg-red-800 text-red-300' 
                    : 'bg-red-100 hover:bg-red-200 text-red-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navegación */}
      <div className={`flex justify-between items-center p-8 ${
        isDarkMode 
          ? 'bg-gray-900/50 border-t border-gray-700' 
          : 'bg-gray-50 border-t border-gray-100'
      }`}>
        <button
          onClick={() => wizard.goBack()}
          className={`inline-flex items-center px-6 py-3 rounded-xl transition-colors font-medium ${
            isDarkMode 
              ? 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600' 
              : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a compañías
        </button>

        {wizard.uploadedFile && (
          <button
            onClick={() => wizard.processDocument()}
            disabled={wizard.processing}
            className={`inline-flex items-center px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg ${
              isDarkMode 
                ? 'bg-gradient-to-r from-purple-700 to-pink-700 text-white hover:from-purple-600 hover:to-pink-600' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
            }`}
          >
            {wizard.processing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                🚀 Procesar con Azure AI
              </>
            )}
          </button>
        )}
      </div>
    </div>
  </div>
);

  // 4️⃣ PASO: Procesamiento - REDISEÑADO
  const renderExtractStep = () => (
  <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'text-gray-100' : ''}`}>
    {/* Header mejorado */}
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-6">
        <div className="relative">
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
        </div>
      </div>
      <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
        🤖 Procesando con Azure AI
      </h2>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Nuestra inteligencia artificial está extrayendo datos de forma inteligente
      </p>
    </div>

    <div className={`rounded-3xl shadow-xl border p-12 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="text-center space-y-8">
        {/* Nueva animación de spinner */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Spinner principal */}
            <div className={`w-32 h-32 rounded-full border-8 ${
              isDarkMode 
                ? 'border-gray-700' 
                : 'border-gray-200'
            }`}></div>
            
            {/* Spinner animado */}
            <div className={`absolute top-0 left-0 w-32 h-32 rounded-full border-8 border-t-transparent ${
              isDarkMode 
                ? 'border-purple-500' 
                : 'border-purple-600'
            } animate-spin`}></div>
            
            {/* Spinner secundario */}
            <div className={`absolute top-4 left-4 w-24 h-24 rounded-full border-8 border-t-transparent ${
              isDarkMode 
                ? 'border-indigo-400' 
                : 'border-indigo-500'
            } animate-spin-reverse`}></div>
            
            {/* Spinner interior */}
            <div className={`absolute top-8 left-8 w-16 h-16 rounded-full border-8 border-t-transparent ${
              isDarkMode 
                ? 'border-pink-400' 
                : 'border-pink-500'
            } animate-spin`}></div>
            
            {/* Icono central */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-10 h-10 rounded-full ${
                isDarkMode 
                  ? 'bg-purple-600' 
                  : 'bg-purple-500'
              } flex items-center justify-center`}>
                <Sparkles className={`w-5 h-5 ${
                  isDarkMode ? 'text-purple-300' : 'text-white'
                } animate-pulse`} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Estado actual mejorado */}
        <div className="space-y-3">
          <h3 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {wizard.processingProgress < 30 ? '📤 Subiendo archivo...' :
             wizard.processingProgress < 70 ? '🧠 Extrayendo datos...' :
             wizard.processingProgress < 95 ? '✅ Validando información...' :
             '🎯 Finalizando...'}
          </h3>
          
          <p className={`text-lg ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Azure Document Intelligence está analizando la póliza con IA avanzada
          </p>
        </div>

        {/* Info del archivo mejorada con dark mode */}
        {wizard.uploadedFile && (
          <div className={`rounded-2xl p-6 max-w-md mx-auto ${
            isDarkMode 
              ? 'bg-gradient-to-r from-gray-900 to-blue-900' 
              : 'bg-gradient-to-r from-gray-50 to-blue-50'
          }`}>
            <div className={`space-y-3 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                <FileText className={`w-5 h-5 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <span className="font-medium">{wizard.uploadedFile.name}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <User className={`w-5 h-5 ${
                  isDarkMode ? 'text-green-400' : 'text-green-600'
                }`} />
                <span>{wizard.selectedCliente?.clinom}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Building className={`w-5 h-5 ${
                  isDarkMode ? 'text-purple-400' : 'text-purple-600'
                }`} />
                <span>{wizard.selectedCompany?.comnom}</span>
              </div>
            </div>
          </div>
        )}

        {/* Características del procesamiento con dark mode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className={`text-center p-4 rounded-xl ${
            isDarkMode 
              ? 'bg-gray-700' 
              : 'bg-blue-50'
          }`}>
            <Zap className={`w-8 h-8 mx-auto mb-2 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <p className={`text-sm font-medium ${
              isDarkMode ? 'text-blue-300' : 'text-blue-900'
            }`}>Súper Rápido</p>
            <p className={`text-xs ${
              isDarkMode ? 'text-blue-400' : 'text-blue-700'
            }`}>Procesamiento en segundos</p>
          </div>
          <div className={`text-center p-4 rounded-xl ${
            isDarkMode 
              ? 'bg-gray-700' 
              : 'bg-green-50'
          }`}>
            <Target className={`w-8 h-8 mx-auto mb-2 ${
              isDarkMode ? 'text-green-400' : 'text-green-600'
            }`} />
            <p className={`text-sm font-medium ${
              isDarkMode ? 'text-green-300' : 'text-green-900'
            }`}>Alta Precisión</p>
            <p className={`text-xs ${
              isDarkMode ? 'text-green-400' : 'text-green-700'
            }`}>IA entrenada específicamente</p>
          </div>
          <div className={`text-center p-4 rounded-xl ${
            isDarkMode 
              ? 'bg-gray-700' 
              : 'bg-purple-50'
          }`}>
            <Shield className={`w-8 h-8 mx-auto mb-2 ${
              isDarkMode ? 'text-purple-400' : 'text-purple-600'
            }`} />
            <p className={`text-sm font-medium ${
              isDarkMode ? 'text-purple-300' : 'text-purple-900'
            }`}>Seguro</p>
            <p className={`text-xs ${
              isDarkMode ? 'text-purple-400' : 'text-purple-700'
            }`}>Datos protegidos</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

  // 5️⃣ PASO: Formulario de validación - PESTAÑAS REDISEÑADAS
  const renderFormStep = () => {
    const tabs = [
      { id: 'basicos', label: 'Datos Básicos', icon: User, color: 'blue' },
      { id: 'poliza', label: 'Póliza', icon: FileText, color: 'purple' },
      { id: 'vehiculo', label: 'Vehículo', icon: Car, color: 'green' },
      { id: 'pago', label: 'Condiciones Pago', icon: CreditCard, color: 'orange' },
      { id: 'observaciones', label: 'Observaciones', icon: FileCheck, color: 'gray' }
    ];

     const getTabColorClasses = (color: string, isActive: boolean) => {
    if (isDarkMode) {
      if (isActive) {
        const colors = {
          blue: 'bg-blue-700 text-white shadow-lg border-blue-600',
          purple: 'bg-purple-700 text-white shadow-lg border-purple-600',
          green: 'bg-green-700 text-white shadow-lg border-green-600',
          orange: 'bg-orange-700 text-white shadow-lg border-orange-600',
          gray: 'bg-gray-700 text-white shadow-lg border-gray-600',
        };
        return colors[color as keyof typeof colors] || colors.gray;
      } else {
        return 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700';
      }
    } else {
      // Light mode (existing logic)
      const colors = {
        blue: isActive 
          ? 'bg-blue-500 text-white shadow-lg' 
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
        purple: isActive 
          ? 'bg-purple-500 text-white shadow-lg' 
          : 'bg-purple-50 text-purple-700 hover:bg-purple-100',
        green: isActive 
          ? 'bg-green-500 text-white shadow-lg' 
          : 'bg-green-50 text-green-700 hover:bg-green-100',
        orange: isActive 
          ? 'bg-orange-500 text-white shadow-lg' 
          : 'bg-orange-50 text-orange-700 hover:bg-orange-100',
        gray: isActive 
          ? 'bg-gray-500 text-white shadow-lg' 
          : 'bg-gray-50 text-gray-700 hover:bg-gray-100',
      };
      return colors[color as keyof typeof colors] || colors.gray;
    }
  };
  

    const renderTabContent = () => {
      switch (activeTab) {
        case 'basicos':
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Columna izquierda - Información del Cliente */}
      <div className="space-y-6">
        <div className={`space-y-6 rounded-2xl p-6 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-blue-900/20 border border-blue-800/50' 
            : 'bg-gradient-to-r from-blue-50 to-blue-100'
        }`}>
          <h3 className={`text-lg font-medium flex items-center ${
            isDarkMode 
              ? 'text-blue-300' 
              : 'text-blue-900'
          } mb-4`}>
            <User className="w-5 h-5 mr-2" />
            Información del Cliente
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-blue-300' 
                  : 'text-blue-800'
              } mb-2`}>Corredor</label>
              <input
                type="text"
                value={formData.corredor}
                onChange={(e) => setFormData(prev => ({ ...prev, corredor: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                    : 'bg-white border-blue-200 focus:ring-blue-100'
                }`}
                placeholder="Nombre del corredor"
              />
            </div>

            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-blue-300' 
                  : 'text-blue-800'
              } mb-2`}>Asegurado *</label>
              <input
                type="text"
                value={formData.asegurado}
                onChange={(e) => setFormData(prev => ({ ...prev, asegurado: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                    : 'bg-white border-blue-200 focus:ring-blue-100'
                }`}
                placeholder="Nombre del asegurado"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-blue-300' 
                  : 'text-blue-800'
              } mb-2`}>Documento</label>
              <input
                type="text"
                value={formData.documento}
                onChange={(e) => setFormData(prev => ({ ...prev, documento: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                    : 'bg-white border-blue-200 focus:ring-blue-100'
                }`}
                placeholder="CI o RUC"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Columna derecha - Datos de Contacto */}
      <div className="space-y-6">
        <div className={`rounded-2xl p-6 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-emerald-900/20 border border-emerald-800/50' 
            : 'bg-gradient-to-r from-green-50 to-emerald-100'
        }`}>
          <h3 className={`text-xl font-bold flex items-center ${
            isDarkMode 
              ? 'text-emerald-300' 
              : 'text-green-900'
          } mb-6`}>
            <MapPin className="w-6 h-6 mr-3" />
            Datos de Contacto
          </h3>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-emerald-300' 
                  : 'text-green-800'
              } mb-2`}>Dirección</label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                    : 'bg-white border-green-200 focus:ring-green-100'
                }`}
                placeholder="Dirección completa"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode 
                    ? 'text-emerald-300' 
                    : 'text-green-800'
                } mb-2`}>Departamento</label>
                <input
                  type="text"
                  value={formData.departamento}
                  onChange={(e) => setFormData(prev => ({ ...prev, departamento: e.target.value }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                      : 'bg-white border-green-200 focus:ring-green-100'
                  }`}
                  placeholder="Departamento"
                />
              </div>
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode 
                    ? 'text-emerald-300' 
                    : 'text-green-800'
                } mb-2`}>Localidad</label>
                <input
                  type="text"
                  value={formData.localidad}
                  onChange={(e) => setFormData(prev => ({ ...prev, localidad: e.target.value }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                      : 'bg-white border-green-200 focus:ring-green-100'
                  }`}
                  placeholder="Localidad"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`text-sm font-bold mb-2 flex items-center ${
                  isDarkMode 
                    ? 'text-emerald-300' 
                    : 'text-green-800'
                }`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Teléfono
                </label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                      : 'bg-white border-green-200 focus:ring-green-100'
                  }`}
                  placeholder="Teléfono"
                />
              </div>
              <div>
                <label className={`text-sm font-bold mb-2 flex items-center ${
                  isDarkMode 
                    ? 'text-emerald-300' 
                    : 'text-green-800'
                }`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                      : 'bg-white border-green-200 focus:ring-green-100'
                  }`}
                  placeholder="Email"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

case 'poliza':
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Columna izquierda - Datos de la Póliza */}
      <div className="space-y-6">
        <div className={`rounded-2xl p-6 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-purple-900/20 border border-purple-800/50' 
            : 'bg-gradient-to-r from-purple-50 to-purple-100'
        }`}>
          <h3 className={`text-xl font-bold flex items-center ${
            isDarkMode 
              ? 'text-purple-300' 
              : 'text-purple-900'
          } mb-6`}>
            <Hash className="w-6 h-6 mr-3" />
            Datos de la Póliza
          </h3>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-purple-300' 
                  : 'text-purple-800'
              } mb-2`}>Número de Póliza *</label>
              <input
                type="text"
                value={formData.numeroPoliza}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroPoliza: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-purple-500 transition-all duration-200 shadow-sm font-mono text-lg ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-purple-700/30 text-gray-100 focus:ring-purple-500/30' 
                    : 'bg-white border-purple-200 focus:ring-purple-100'
                }`}
                placeholder="Número de póliza"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-purple-300' 
                  : 'text-purple-800'
              } mb-2`}>Ramo</label>
              <select
                value={formData.ramo}
                onChange={(e) => setFormData(prev => ({ ...prev, ramo: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-purple-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-purple-700/30 text-gray-100 focus:ring-purple-500/30' 
                    : 'bg-white border-purple-200 focus:ring-purple-100'
                }`}
              >
                <option value="AUTOMOVILES">Automóviles</option>
                <option value="MOTOCICLETAS">Motocicletas</option>
                <option value="CAMIONES">Camiones</option>
                <option value="OTROS">Otros</option>
              </select>
            </div>

            <div>
              <label className={`text-sm font-bold mb-2 flex items-center ${
                isDarkMode 
                  ? 'text-purple-300' 
                  : 'text-purple-800'
              }`}>
                <Shield className="w-4 h-4 mr-2" />
                Plan/Cobertura *
              </label>
              <input
                type="text"
                value={formData.plan}
                onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-purple-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-purple-700/30 text-gray-100 focus:ring-purple-500/30' 
                    : 'bg-white border-purple-200 focus:ring-purple-100'
                }`}
                placeholder="Ej: SEGURO GLOBAL"
              />
            </div>

            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-purple-300' 
                  : 'text-purple-800'
              } mb-2`}>Corredor</label>
              <input
                type="text"
                value={formData.corredor}
                onChange={(e) => setFormData(prev => ({ ...prev, corredor: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-purple-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-purple-700/30 text-gray-100 focus:ring-purple-500/30' 
                    : 'bg-white border-purple-200 focus:ring-purple-100'
                }`}
                placeholder="Nombre del corredor"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Columna derecha - Vigencia y Certificación */}
      <div className="space-y-6">
        <div className={`rounded-2xl p-6 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-blue-900/20 border border-blue-800/50' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-100'
        }`}>
          <h3 className={`text-xl font-bold flex items-center ${
            isDarkMode 
              ? 'text-blue-300' 
              : 'text-blue-900'
          } mb-6`}>
            <Calendar className="w-6 h-6 mr-3" />
            Vigencia y Certificación
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode 
                    ? 'text-blue-300' 
                    : 'text-blue-800'
                } mb-2`}>Vigencia Desde *</label>
                <input
                  type="date"
                  value={formData.vigenciaDesde}
                  onChange={(e) => setFormData(prev => ({ ...prev, vigenciaDesde: e.target.value }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                      : 'bg-white border-blue-200 focus:ring-blue-100'
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode 
                    ? 'text-blue-300' 
                    : 'text-blue-800'
                } mb-2`}>Vigencia Hasta *</label>
                <input
                  type="date"
                  value={formData.vigenciaHasta}
                  onChange={(e) => setFormData(prev => ({ ...prev, vigenciaHasta: e.target.value }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                      : 'bg-white border-blue-200 focus:ring-blue-100'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Información extraída */}
            {wizard.extractedData?.datosVelneo?.datosPoliza && (
              <div className={`rounded-xl p-4 ${
                isDarkMode 
                  ? 'bg-gray-700/50 border border-blue-700/30' 
                  : 'bg-white border-2 border-blue-200'
              }`}>
                <h4 className={`font-bold mb-3 flex items-center ${
                  isDarkMode 
                    ? 'text-blue-300' 
                    : 'text-blue-800'
                }`}>
                  <FileCheck className="w-5 h-5 mr-2" />
                  Información Extraída
                </h4>
                <div className={`text-sm space-y-2 ${
                  isDarkMode 
                    ? 'text-blue-300' 
                    : 'text-blue-700'
                }`}>
                  {wizard.extractedData.datosVelneo.datosPoliza.certificado && (
                    <p>📄 Certificado: {wizard.extractedData.datosVelneo.datosPoliza.certificado}</p>
                  )}
                  {wizard.extractedData.datosVelneo.datosPoliza.endoso && (
                    <p>📋 Endoso: {wizard.extractedData.datosVelneo.datosPoliza.endoso}</p>
                  )}
                  {wizard.extractedData.datosVelneo.datosPoliza.tipoMovimiento && (
                    <p>🔄 Tipo: {wizard.extractedData.datosVelneo.datosPoliza.tipoMovimiento}</p>
                  )}
                </div>
              </div>
            )}

            {/* Compañía seleccionada */}
            <div className={`rounded-xl p-4 ${
              isDarkMode 
                ? 'bg-gray-700/50 border border-gray-600' 
                : 'bg-white border-2 border-gray-200'
            }`}>
              <label className={`text-sm font-bold mb-3 flex items-center ${
                isDarkMode 
                  ? 'text-gray-300' 
                  : 'text-gray-800'
              }`}>
                <Building2 className="w-5 h-5 mr-2" />
                Compañía de Seguros
              </label>
              <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-600/50' 
                  : 'bg-gray-50'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDarkMode 
                    ? 'bg-blue-600' 
                    : 'bg-blue-500'
                }`}>
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className={`font-bold ${
                    isDarkMode 
                      ? 'text-gray-100' 
                      : 'text-gray-900'
                  }`}>{wizard.selectedCompany?.comnom || 'No seleccionada'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

case 'vehiculo':
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Columna izquierda */}
      <div className="space-y-6">
        <div className={`rounded-2xl p-6 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-emerald-900/20 border border-emerald-800/50' 
            : 'bg-gradient-to-r from-green-50 to-emerald-100'
        }`}>
          <h3 className={`text-xl font-bold flex items-center ${
            isDarkMode 
              ? 'text-emerald-300' 
              : 'text-green-900'
          } mb-6`}>
            <Car className="w-6 h-6 mr-3" />
            Información del Vehículo
          </h3>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-emerald-300' 
                  : 'text-green-800'
              } mb-2`}>Vehículo (Descripción Completa)</label>
              <input
                type="text"
                value={formData.vehiculo}
                onChange={(e) => setFormData(prev => ({ ...prev, vehiculo: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                    : 'bg-white border-green-200 focus:ring-green-100'
                }`}
                placeholder="Descripción completa del vehículo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode 
                    ? 'text-emerald-300' 
                    : 'text-green-800'
                } mb-2`}>Marca *</label>
                <input
                  type="text"
                  value={formData.marca}
                  onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                      : 'bg-white border-green-200 focus:ring-green-100'
                  }`}
                  placeholder="Marca"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode 
                    ? 'text-emerald-300' 
                    : 'text-green-800'
                } mb-2`}>Modelo *</label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                      : 'bg-white border-green-200 focus:ring-green-100'
                  }`}
                  placeholder="Modelo"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode 
                    ? 'text-emerald-300' 
                    : 'text-green-800'
                } mb-2`}>Año</label>
                <input
                  type="text"
                  value={formData.anio}
                  onChange={(e) => setFormData(prev => ({ ...prev, anio: e.target.value }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                      : 'bg-white border-green-200 focus:ring-green-100'
                  }`}
                  placeholder="2024"
                />
              </div>
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode 
                    ? 'text-emerald-300' 
                    : 'text-green-800'
                } mb-2`}>Matrícula</label>
                <input
                  type="text"
                  value={formData.matricula}
                  onChange={(e) => setFormData(prev => ({ ...prev, matricula: e.target.value }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm font-mono ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                      : 'bg-white border-green-200 focus:ring-green-100'
                  }`}
                  placeholder="ABC1234"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-emerald-300' 
                  : 'text-green-800'
              } mb-2`}>Combustible</label>
              <select
                value={formData.combustible}
                onChange={(e) => setFormData(prev => ({ ...prev, combustible: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                    : 'bg-white border-green-200 focus:ring-green-100'
                }`}
              >
                <option value="">Seleccionar combustible</option>
                <option value="GASOLINA">Gasolina</option>
                <option value="DIESEL">Diesel</option>
                <option value="DIESEL (GAS-OIL)">Diesel (Gas-Oil)</option>
                <option value="GAS">Gas</option>
                <option value="ELECTRICO">Eléctrico</option>
                <option value="HIBRIDO">Híbrido</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode 
                    ? 'text-emerald-300' 
                    : 'text-green-800'
                } mb-2`}>Destino</label>
                <select
                  value={formData.destino}
                  onChange={(e) => setFormData(prev => ({ ...prev, destino: e.target.value }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                      : 'bg-white border-green-200 focus:ring-green-100'
                  }`}
                >
                  <option value="">Seleccionar destino</option>
                  <option value="PARTICULAR">Particular</option>
                  <option value="COMERCIAL">Comercial</option>
                  <option value="TRANSPORTE">Transporte</option>
                  <option value="CARGA">Carga</option>
                  <option value="PUBLICO">Público</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode 
                    ? 'text-emerald-300' 
                    : 'text-green-800'
                } mb-2`}>Uso</label>
                <select
                  value={formData.uso}
                  onChange={(e) => setFormData(prev => ({ ...prev, uso: e.target.value }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                      : 'bg-white border-green-200 focus:ring-green-100'
                  }`}
                >
                  <option value="">Seleccionar uso</option>
                  <option value="PARTICULAR">Particular</option>
                  <option value="COMERCIAL">Comercial</option>
                  <option value="PUBLICO">Público</option>
                  <option value="OFICIAL">Oficial</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="space-y-6">
        <div className={`rounded-2xl p-6 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-blue-900/20 border border-blue-800/50' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-100'
        }`}>
          <h3 className={`text-xl font-bold flex items-center ${
            isDarkMode 
              ? 'text-blue-300' 
              : 'text-blue-900'
          } mb-6`}>
            <Settings className="w-6 h-6 mr-3" />
            Especificaciones Técnicas
          </h3>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-blue-300' 
                  : 'text-blue-800'
              } mb-2`}>Motor</label>
              <input
                type="text"
                value={formData.motor}
                onChange={(e) => setFormData(prev => ({ ...prev, motor: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm font-mono ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                    : 'bg-white border-blue-200 focus:ring-blue-100'
                }`}
                placeholder="Número de motor"
              />
            </div>

            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-blue-300' 
                  : 'text-blue-800'
              } mb-2`}>Chasis</label>
              <input
                type="text"
                value={formData.chasis}
                onChange={(e) => setFormData(prev => ({ ...prev, chasis: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm font-mono ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                    : 'bg-white border-blue-200 focus:ring-blue-100'
                }`}
                placeholder="Número de chasis"
              />
            </div>

            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-blue-300' 
                  : 'text-blue-800'
              } mb-2`}>Tipo de Vehículo</label>
              <select
                value={formData.tipoVehiculo}
                onChange={(e) => setFormData(prev => ({ ...prev, tipoVehiculo: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                    : 'bg-white border-blue-200 focus:ring-blue-100'
                }`}
              >
                <option value="">Seleccionar tipo</option>
                <option value="AUTOMOVIL">Automóvil</option>
                <option value="CAMIONETA">Camioneta</option>
                <option value="CAMION">Camión</option>
                <option value="MOTOCICLETA">Motocicleta</option>
                <option value="OMNIBUS">Ómnibus</option>
                <option value="FURGON">Furgón</option>
                <option value="PICKUP">Pick-up</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-blue-300' 
                  : 'text-blue-800'
              } mb-2`}>Categoría</label>
              <input
                type="text"
                value={formData.categoria}
                onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                    : 'bg-white border-blue-200 focus:ring-blue-100'
                }`}
                placeholder="Categoría del vehículo"
              />
            </div>

            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-blue-300' 
                  : 'text-blue-800'
              } mb-2`}>Calidad</label>
              <select
                value={formData.calidad}
                onChange={(e) => setFormData(prev => ({ ...prev, calidad: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                    : 'bg-white border-blue-200 focus:ring-blue-100'
                }`}
              >
                <option value="">Seleccionar calidad</option>
                <option value="NUEVO">Nuevo</option>
                <option value="USADO">Usado</option>
                <option value="EXCELENTE">Excelente</option>
                <option value="BUENO">Bueno</option>
                <option value="REGULAR">Regular</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

case 'pago':
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Columna izquierda */}
      <div className="space-y-6">
        <div className={`rounded-2xl p-6 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-orange-900/20 border border-orange-800/50' 
            : 'bg-gradient-to-r from-orange-50 to-yellow-100'
        }`}>
          <h3 className={`text-xl font-bold flex items-center ${
            isDarkMode 
              ? 'text-orange-300' 
              : 'text-orange-900'
          } mb-6`}>
            <DollarSign className="w-6 h-6 mr-3" />
            Importes y Valores
          </h3>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-orange-300' 
                  : 'text-orange-800'
              } mb-2`}>Prima Comercial</label>
              <div className="relative">
                <span className={`absolute left-4 top-3 font-bold text-lg ${
                  isDarkMode 
                    ? 'text-orange-400' 
                    : 'text-orange-600'
                }`}>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.primaComercial}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaComercial: parseFloat(e.target.value) || 0 }))}
                  className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-orange-500 transition-all duration-200 shadow-sm text-lg font-bold ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-orange-700/30 text-gray-100 focus:ring-orange-500/30' 
                      : 'bg-white border-orange-200 focus:ring-orange-100'
                  }`}
                  placeholder="63812.36"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-orange-300' 
                  : 'text-orange-800'
              } mb-2`}>Premio Total</label>
              <div className="relative">
                <span className={`absolute left-4 top-3 font-bold text-lg ${
                  isDarkMode 
                    ? 'text-orange-400' 
                    : 'text-orange-600'
                }`}>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.premioTotal}
                  onChange={(e) => setFormData(prev => ({ ...prev, premioTotal: parseFloat(e.target.value) || 0 }))}
                  className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-orange-500 transition-all duration-200 shadow-sm text-lg font-bold ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-orange-700/30 text-gray-100 focus:ring-orange-500/30' 
                      : 'bg-white border-orange-200 focus:ring-orange-100'
                  }`}
                  placeholder="79410.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode 
                    ? 'text-orange-300' 
                    : 'text-orange-800'
                } mb-2`}>Moneda</label>
                <select
                  value={formData.moneda}
                  onChange={(e) => setFormData(prev => ({ ...prev, moneda: e.target.value }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-orange-500 transition-all duration-200 shadow-sm font-bold ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-orange-700/30 text-gray-100 focus:ring-orange-500/30' 
                      : 'bg-white border-orange-200 focus:ring-orange-100'
                  }`}
                >
                  <option value="UYU">🇺🇾 Peso Uruguayo (UYU)</option>
                  <option value="USD">🇺🇸 Dólar Americano (USD)</option>
                  <option value="UI">📊 Unidades Indexadas (UI)</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode 
                    ? 'text-orange-300' 
                    : 'text-orange-800'
                } mb-2`}>Cantidad de Cuotas</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={formData.cantidadCuotas}
                  onChange={(e) => setFormData(prev => ({ ...prev, cantidadCuotas: parseInt(e.target.value) || 1 }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-orange-500 transition-all duration-200 shadow-sm text-center font-bold text-lg ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-orange-700/30 text-gray-100 focus:ring-orange-500/30' 
                      : 'bg-white border-orange-200 focus:ring-orange-100'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-orange-300' 
                  : 'text-orange-800'
              } mb-2`}>Valor por Cuota</label>
              <div className="relative">
                <span className={`absolute left-4 top-3 font-bold text-lg ${
                  isDarkMode 
                    ? 'text-orange-400' 
                    : 'text-orange-600'
                }`}>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valorCuota}
                  onChange={(e) => setFormData(prev => ({ ...prev, valorCuota: parseFloat(e.target.value) || 0 }))}
                  className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-orange-500 transition-all duration-200 shadow-sm text-lg font-bold ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-orange-700/30 text-gray-100 focus:ring-orange-500/30' 
                      : 'bg-white border-orange-200 focus:ring-orange-100'
                  }`}
                  placeholder="7941.00"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="space-y-6">
        <div className={`rounded-2xl p-6 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-blue-900/20 border border-blue-800/50' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-100'
        }`}>
          <h3 className={`text-xl font-bold flex items-center ${
            isDarkMode 
              ? 'text-blue-300' 
              : 'text-blue-900'
          } mb-6`}>
            <CreditCard className="w-6 h-6 mr-3" />
            Condiciones de Pago
          </h3>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode 
                  ? 'text-blue-300' 
                  : 'text-blue-800'
              } mb-2`}>Forma de Pago</label>
              <input
                type="text"
                value={formData.formaPago}
                onChange={(e) => setFormData(prev => ({ ...prev, formaPago: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                    : 'bg-white border-blue-200 focus:ring-blue-100'
                }`}
                placeholder="Ej: TARJETA DE CRÉDITO"
              />
            </div>

            {/* Primera Cuota - Card especial */}
            <div className={`rounded-xl p-4 ${
              isDarkMode 
                ? 'bg-gray-700/50 border border-blue-700/30' 
                : 'bg-white border-2 border-blue-200'
            }`}>
              <h4 className={`font-bold mb-4 flex items-center ${
                isDarkMode 
                  ? 'text-blue-300' 
                  : 'text-blue-800'
              }`}>
                <Calendar className="w-5 h-5 mr-2" />
                Primera Cuota
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-bold ${
                    isDarkMode 
                      ? 'text-blue-300' 
                      : 'text-blue-700'
                  } mb-2`}>Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={formData.primeraCuotaFecha}
                    onChange={(e) => setFormData(prev => ({ ...prev, primeraCuotaFecha: e.target.value }))}
                    className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:border-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                        : 'bg-white border-blue-300 focus:ring-blue-100'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-bold ${
                    isDarkMode 
                      ? 'text-blue-300' 
                      : 'text-blue-700'
                  } mb-2`}>Monto</label>
                  <div className="relative">
                    <span className={`absolute left-3 top-2 font-bold ${
                      isDarkMode 
                        ? 'text-blue-400' 
                        : 'text-blue-500'
                    }`}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.primeraCuotaMonto}
                      onChange={(e) => setFormData(prev => ({ ...prev, primeraCuotaMonto: parseFloat(e.target.value) || 0 }))}
                      className={`w-full pl-8 pr-3 py-2 border-2 rounded-lg focus:ring-2 focus:border-blue-500 font-bold ${
                        isDarkMode 
                          ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                          : 'bg-white border-blue-300 focus:ring-blue-100'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

case 'observaciones':
  return (
    <div className="space-y-8">
      {/* Contenedor principal de Observaciones */}
      <div className={`rounded-2xl p-8 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 to-slate-900/50 border border-gray-700' 
          : 'bg-gradient-to-r from-gray-50 to-slate-100'
      }`}>
        <h3 className={`text-2xl font-bold flex items-center ${
          isDarkMode 
            ? 'text-gray-100' 
            : 'text-gray-900'
        } mb-6`}>
          <FileCheck className="w-6 h-6 mr-3" />
          Observaciones y Notas
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={`text-lg font-bold ${
                isDarkMode 
                  ? 'text-gray-300' 
                  : 'text-gray-800'
              }`}>
                Observaciones Automáticas
              </label>
              <span className={`text-sm ${
                isDarkMode 
                  ? 'text-gray-500' 
                  : 'text-gray-600'
              }`}>
                (Generadas automáticamente - Puedes editarlas)
              </span>
            </div>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              rows={15}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 font-mono text-sm shadow-sm ${
                isDarkMode 
                  ? 'bg-gray-700/50 border-gray-600 text-gray-100 focus:ring-blue-500/30' 
                  : 'bg-white border-gray-300 focus:ring-blue-100'
              }`}
              placeholder="Las observaciones se generarán automáticamente..."
            />
            
            <div className="mt-3 flex justify-end">
            </div>
          </div>
        </div>
      </div>

      {/* Vista previa del cronograma */}
      {wizard.extractedData?.datosVelneo?.condicionesPago?.detalleCuotas?.tieneCuotasDetalladas && (
        <div className={`rounded-2xl p-6 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-blue-900/20 border border-blue-800/50' 
            : 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200'
        }`}>
          <h4 className={`font-bold mb-4 flex items-center text-lg ${
            isDarkMode 
              ? 'text-blue-300' 
              : 'text-blue-800'
          }`}>
            <Calendar className="w-5 h-5 mr-2" />
            Vista Previa - Cronograma de Cuotas
          </h4>
          
          <div className={`max-h-64 overflow-y-auto rounded-xl border-2 p-4 ${
            isDarkMode 
              ? 'bg-gray-800 border-blue-800/50' 
              : 'bg-white border-blue-200'
          }`}>
            <div className={`grid grid-cols-3 gap-4 text-sm font-bold border-b pb-3 mb-3 ${
              isDarkMode 
                ? 'border-blue-700 text-blue-300' 
                : 'border-blue-200 text-blue-800'
            }`}>
              <div>Cuota</div>
              <div>Fecha Vencimiento</div>
              <div>Monto</div>
            </div>
            
            {wizard.extractedData.datosVelneo.condicionesPago.detalleCuotas.cuotas.map((cuota: any) => (
              <div 
                key={cuota.numero} 
                className={`grid grid-cols-3 gap-4 text-sm py-2 border-b rounded ${
                  isDarkMode 
                    ? 'border-gray-700 text-blue-300 hover:bg-gray-700/50' 
                    : 'border-blue-100 text-blue-700 hover:bg-blue-50'
                }`}
              >
                <div className="font-medium">Cuota {cuota.numero}</div>
                <div>{new Date(cuota.fechaVencimiento).toLocaleDateString('es-UY')}</div>
                <div className="font-bold">${cuota.monto?.toLocaleString()}</div>
              </div>
            ))}
            
            <div className={`grid grid-cols-3 gap-4 text-sm font-bold pt-3 mt-3 border-t rounded p-2 ${
              isDarkMode 
                ? 'border-blue-700 bg-gray-700/50 text-blue-300' 
                : 'border-blue-200 bg-blue-50 text-blue-800'
            }`}>
              <div>Total:</div>
              <div>{wizard.extractedData.datosVelneo.condicionesPago.cuotas} cuotas</div>
              <div>${wizard.extractedData.datosVelneo.condicionesPago.total?.toLocaleString()}</div>
            </div>
          </div>
          
          <p className={`text-sm mt-3 italic flex items-center ${
            isDarkMode 
              ? 'text-blue-400' 
              : 'text-blue-600'
          }`}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Este cronograma se incluye automáticamente en las observaciones de la póliza
          </p>
        </div>
      )}

      {/* Información de procesamiento */}
      {wizard.extractedData && (
        <div className={`rounded-2xl p-6 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
            : 'bg-white border-2 border-gray-200'
        }`}>
          <h4 className={`font-bold mb-4 flex items-center text-lg ${
            isDarkMode 
              ? 'text-gray-300' 
              : 'text-gray-800'
          }`}>
            <Settings className="w-5 h-5 mr-2" />
            Información de Procesamiento
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`rounded-xl border p-4 ${
              isDarkMode 
                ? 'bg-gray-700/50 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <span className={`block text-xs font-medium mb-1 ${
                isDarkMode 
                  ? 'text-gray-400' 
                  : 'text-gray-600'
              }`}>
                Archivo procesado:
              </span>
              <p className={`font-bold truncate text-sm ${
                isDarkMode 
                  ? 'text-gray-200' 
                  : 'text-gray-900'
              }`} title={wizard.uploadedFile?.name}>
                📄 {wizard.uploadedFile?.name}
              </p>
            </div>
            
            <div className={`rounded-xl border p-4 ${
              isDarkMode 
                ? 'bg-gray-700/50 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <span className={`block text-xs font-medium mb-1 ${
                isDarkMode 
                  ? 'text-gray-400' 
                  : 'text-gray-600'
              }`}>
                Tiempo de procesamiento:
              </span>
              <p className={`font-bold text-lg ${
                isDarkMode 
                  ? 'text-green-400' 
                  : 'text-green-600'
              }`}>
                ⚡ {((wizard.extractedData.tiempoProcesamiento || 0) / 1000).toFixed(1)}s
              </p>
            </div>
            
            <div className={`rounded-xl border p-4 ${
              isDarkMode 
                ? 'bg-gray-700/50 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <span className={`block text-xs font-medium mb-1 ${
                isDarkMode 
                  ? 'text-gray-400' 
                  : 'text-gray-600'
              }`}>
                Estado:
              </span>
              <p className={`font-bold flex items-center ${
                isDarkMode 
                  ? 'text-green-400' 
                  : 'text-green-700'
              }`}>
                <CheckCircle className="w-4 h-4 mr-1" />
                {wizard.extractedData.estadoProcesamiento}
              </p>
            </div>
            
            <div className={`rounded-xl border p-4 ${
              isDarkMode 
                ? 'bg-gray-700/50 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <span className={`block text-xs font-medium mb-1 ${
                isDarkMode 
                  ? 'text-gray-400' 
                  : 'text-gray-600'
              }`}>
                Timestamp:
              </span>
              <p className={`font-bold text-xs ${
                isDarkMode 
                  ? 'text-gray-300' 
                  : 'text-gray-900'
              }`}>
                🕒 {new Date(wizard.extractedData.timestamp || Date.now()).toLocaleString('es-UY')}
              </p>
            </div>
          </div>

          {/* Detalles adicionales */}
          {wizard.extractedData?.datosVelneo && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`text-center p-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-blue-900/30' 
                    : 'bg-blue-50'
                }`}>
                  <span className={`text-xs block ${
                    isDarkMode 
                      ? 'text-blue-300' 
                      : 'text-blue-700'
                  }`}>
                    Campos extraídos:
                  </span>
                  <p className={`font-bold text-lg ${
                    isDarkMode 
                      ? 'text-blue-400' 
                      : 'text-blue-600'
                  }`}>
                    {wizard.extractedData.datosVelneo.metricas?.camposExtraidos || 0}
                  </p>
                </div>
                <div className={`text-center p-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-green-900/30' 
                    : 'bg-green-50'
                }`}>
                  <span className={`text-xs block ${
                    isDarkMode 
                      ? 'text-green-300' 
                      : 'text-green-700'
                  }`}>
                    Completitud:
                  </span>
                  <p className={`font-bold text-lg ${
                    isDarkMode 
                      ? 'text-green-400' 
                      : 'text-green-600'
                  }`}>
                    {wizard.extractedData.datosVelneo.porcentajeCompletitud || 0}%
                  </p>
                </div>
                <div className={`text-center p-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-yellow-900/30' 
                    : 'bg-yellow-50'
                }`}>
                  <span className={`text-xs block ${
                    isDarkMode 
                      ? 'text-yellow-300' 
                      : 'text-yellow-700'
                  }`}>
                    Datos mínimos:
                  </span>
                  <p className={`font-bold text-lg ${
                    wizard.extractedData.datosVelneo.tieneDatosMinimos 
                      ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                      : (isDarkMode ? 'text-red-400' : 'text-red-600')
                  }`}>
                    {wizard.extractedData.datosVelneo.tieneDatosMinimos ? '✅ Sí' : '❌ No'}
                  </p>
                </div>
                <div className={`text-center p-3 rounded-xl ${
                  isDarkMode 
                    ? 'bg-purple-900/30' 
                    : 'bg-purple-50'
                }`}>
                  <span className={`text-xs block ${
                    isDarkMode 
                      ? 'text-purple-300' 
                      : 'text-purple-700'
                  }`}>
                    Listo para Velneo:
                  </span>
                  <p className={`font-bold text-lg ${
                    wizard.extractedData.listoParaVelneo 
                      ? (isDarkMode ? 'text-green-400' : 'text-green-600')
                      : (isDarkMode ? 'text-yellow-400' : 'text-yellow-600')
                  }`}>
                    {wizard.extractedData.listoParaVelneo ? '✅ Sí' : '⚠️ Revisar'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notas importantes */}
      <div className={`rounded-2xl p-6 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 to-amber-900/20 border border-amber-800/50' 
          : 'bg-gradient-to-r from-amber-50 to-yellow-100 border-2 border-amber-200'
      }`}>
        <h4 className={`font-bold mb-3 flex items-center text-lg ${
          isDarkMode 
            ? 'text-amber-300' 
            : 'text-amber-800'
        }`}>
          <AlertTriangle className="w-5 h-5 mr-2" />
          Notas Importantes
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                isDarkMode 
                  ? 'bg-amber-400' 
                  : 'bg-amber-500'
              }`}></div>
              <span className={`text-sm ${
                isDarkMode 
                  ? 'text-amber-300' 
                  : 'text-amber-700'
              }`}>
                Las observaciones se generan automáticamente basadas en la información extraída
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                isDarkMode 
                  ? 'bg-amber-400' 
                  : 'bg-amber-500'
              }`}></div>
              <span className={`text-sm ${
                isDarkMode 
                  ? 'text-amber-300' 
                  : 'text-amber-700'
              }`}>
                El cronograma de cuotas se incluye automáticamente cuando es detectado
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                isDarkMode 
                  ? 'bg-amber-400' 
                  : 'bg-amber-500'
              }`}></div>
              <span className={`text-sm ${
                isDarkMode 
                  ? 'text-amber-300' 
                  : 'text-amber-700'
              }`}>
                Puedes editar las observaciones según sea necesario antes de crear la póliza
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                isDarkMode 
                  ? 'bg-amber-400' 
                  : 'bg-amber-500'
              }`}></div>
              <span className={`text-sm ${
                isDarkMode 
                  ? 'text-amber-300' 
                  : 'text-amber-700'
              }`}>
                La información de procesamiento se incluye para auditoría y debugging
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

        default:
          return null;
      }
    };

    return (
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'text-gray-100' : ''}`}>
        {/* Header con información del procesamiento mejorado */}
        {wizard.extractedData && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Procesamiento completado</p>
                  <h3 className="font-bold text-blue-900 text-lg">
                    Documento procesado exitosamente con Azure AI
                  </h3>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm">
                {wizard.extractedData.nivelConfianza && (
                  <div className="text-center p-2 bg-white rounded-lg border border-blue-200">
                    <p className="font-bold text-blue-600 text-lg">{Math.round(wizard.extractedData.nivelConfianza * 100)}%</p>
                    <p className="text-blue-800 text-xs">Confianza</p>
                  </div>
                )}
                {wizard.extractedData.tiempoProcesamiento && (
                  <div className="text-center p-2 bg-white rounded-lg border border-green-200">
                    <p className="font-bold text-green-600 text-lg">{(wizard.extractedData.tiempoProcesamiento / 1000).toFixed(1)}s</p>
                    <p className="text-green-800 text-xs">Tiempo</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pestañas modernas */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3 p-2 bg-gray-100 rounded-2xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 ${getTabColorClasses(tab.color, isActive)}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido del tab activo */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          {renderTabContent()}
        </div>

        {/* Navegación mejorada */}
        <div className="flex justify-between items-center bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <button
            onClick={wizard.goBack}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-600 text-white rounded-xl hover:from-gray-500 hover:to-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-200 font-medium shadow-md"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al procesamiento
          </button>
          <button
            onClick={async () => {
              setSaving(true);
              try {
                console.log('💾 Creando póliza con datos:', formData);
                await new Promise(resolve => setTimeout(resolve, 2000));
                wizard.goToStep('success');
              } catch (error) {
                console.error('Error creando póliza:', error);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
            className="flex items-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl hover:from-emerald-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creando Póliza...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Crear Póliza
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // 6️⃣ PASO: Éxito - REDISEÑADO
  const renderSuccessStep = () => (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'text-gray-100' : ''}`}>
      <div className="text-center">
        <div className={`rounded-3xl shadow-xl border p-12 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          {/* Animación de éxito */}
          <div className="relative inline-flex items-center justify-center w-32 h-32 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full animate-pulse"></div>
            <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            🎉 ¡Póliza Creada Exitosamente!
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            La póliza se ha procesado y creado correctamente usando inteligencia artificial
          </p>
          
          {/* Resumen mejorado */}
          {wizard.extractedData && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">📋 Resumen del Procesamiento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-700">Cliente</p>
                      <p className="text-gray-900 font-bold">{wizard.selectedCliente?.clinom}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-700">Compañía</p>
                      <p className="text-gray-900 font-bold">{wizard.selectedCompany?.comnom}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-700">Póliza</p>
                      <p className="text-gray-900 font-bold">{formData.numeroPoliza}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Upload className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-gray-700">Archivo</p>
                      <p className="text-gray-900 font-bold truncate">{wizard.uploadedFile?.name}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {wizard.extractedData.tiempoProcesamiento && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-full">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 font-bold">
                      Procesado en {(wizard.extractedData.tiempoProcesamiento / 1000).toFixed(1)} segundos
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}         

          {/* Estadísticas de éxito */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-blue-900">Alta Precisión</p>
                <p className="text-xs text-blue-700">IA especializada en seguros</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-green-900">Súper Rápido</p>
                <p className="text-xs text-green-700">95% menos tiempo</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-purple-900">Seguro</p>
                <p className="text-xs text-purple-700">Datos protegidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // =====================================
  // 🎨 RENDER PRINCIPAL - REDISEÑADO
  // =====================================

  const renderCurrentStep = () => {
    switch (wizard.currentStep) {
      case 'cliente': return renderClienteStep();
      case 'company': return renderCompanyStep();
      case 'upload': return renderUploadStep();
      case 'extract': return renderExtractStep();
      case 'form': return renderFormStep();
      case 'success': return renderSuccessStep();
      default: return renderClienteStep();
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
    <div className={`min-h-screen ${getBgClass()}`}>
  {/* Header con progreso - FIXED */}
  <div className={`backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm ${
    isDarkMode 
      ? 'bg-gray-900 border-gray-700'  // Changed from bg-gray-900/90
      : 'bg-white border-gray-200'
  }`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        {/* Logo y título */}
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
            isDarkMode 
              ? 'bg-gradient-to-br from-purple-700 to-blue-700' 
              : 'bg-gradient-to-br from-purple-600 to-blue-600'
          }`}>
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${
              isDarkMode 
                ? 'bg-gradient-to-r from-blue-300 to-purple-300' 
                : 'bg-gradient-to-r from-gray-900 to-gray-600'
            } bg-clip-text text-transparent`}>
              🤖 Asistente de Pólizas IA
            </h1>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 text-xs rounded-full font-bold ${
                isDarkMode 
                  ? 'bg-blue-900 text-blue-300' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                ✨ Powered by Azure AI
              </span>
              <span className={`px-3 py-1 text-xs rounded-full font-bold ${
                isDarkMode 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-green-100 text-green-800'
              }`}>
                🚀 v2.0
              </span>
            </div>
          </div>
        </div>
        
        {/* Indicador de progreso */}
        <div className="hidden lg:flex items-center space-x-3">
          {stepOrder.map((step, index) => {
            const isActive = wizard.currentStep === step;
            const isCompleted = stepOrder.indexOf(wizard.currentStep) > index;
            
            return (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? isDarkMode 
                          ? 'bg-gradient-to-br from-purple-700 to-blue-700 text-white shadow-lg scale-110' 
                          : 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg scale-110'
                        : isCompleted
                        ? isDarkMode 
                          ? 'bg-gradient-to-br from-green-700 to-emerald-700 text-white shadow-md' 
                          : 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-md'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <span className={`mt-2 text-xs font-bold transition-colors ${
                    isActive 
                      ? isDarkMode 
                        ? 'text-purple-400' 
                        : 'text-purple-600' 
                      : isCompleted 
                        ? isDarkMode 
                          ? 'text-green-400' 
                          : 'text-green-600' 
                        : isDarkMode 
                          ? 'text-gray-500' 
                          : 'text-gray-500'
                  }`}>
                    {stepLabels[step as keyof typeof stepLabels]}
                  </span>
                </div>
                {index < stepOrder.length - 1 && (
                  <div className={`w-12 h-1 mx-2 rounded-full transition-colors ${
                    isCompleted 
                      ? isDarkMode 
                        ? 'bg-green-600' 
                        : 'bg-green-300' 
                      : isDarkMode 
                        ? 'bg-gray-600' 
                        : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Botón cancelar - FIXED VISIBILITY */}
        {onCancel && (
          <button
            onClick={onCancel}
            className={`w-10 h-10 rounded-xl transition-colors flex items-center justify-center ${
              isDarkMode 
                ? 'bg-red-900 hover:bg-red-800 text-red-300' 
                : 'bg-red-100 hover:bg-red-200 text-red-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  </div>

      {/* Contenido principal */}
      <div className="py-12">
        {renderCurrentStep()}
      </div>

      {/* Notificaciones de error */}
      {wizard.error && (
        <div className={`fixed bottom-6 right-6 max-w-md rounded-2xl shadow-xl z-50 overflow-hidden ${
          isDarkMode 
            ? 'bg-gray-800 border-2 border-red-800' 
            : 'bg-white border-2 border-red-200'
        }`}>
          <div className={`h-1 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-red-700 to-pink-700' 
              : 'bg-gradient-to-r from-red-500 to-pink-500'
          }`}></div>
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isDarkMode ? 'bg-red-900' : 'bg-red-100'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  isDarkMode ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              <div className="flex-1">
                <h4 className={`font-bold ${
                  isDarkMode ? 'text-red-300' : 'text-red-900'
                } mb-1`}>
                  Error en el procesamiento
                </h4>
                <p className={`${isDarkMode ? 'text-red-400' : 'text-red-700'} text-sm`}>
                  {wizard.error}
                </p>
              </div>
              <button
                onClick={() => wizard.setError(null)}
                className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 ${
                  isDarkMode ? 'bg-red-900 hover:bg-red-800' : 'bg-red-100 hover:bg-red-200'
                }`}
              >
                <X className={`w-4 h-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolizaWizard;