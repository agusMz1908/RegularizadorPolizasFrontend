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
  plan: string;          // Movido de cobertura a póliza
  ramo: string;
  observaciones: string;
  anio: string;
  documento: string;
  
  // Campos adicionales del vehículo que faltaban
  destino: string;
  combustible: string;
  calidad: string;
  categoria: string;
  tipoVehiculo: string;
  uso: string;
  
  // Campos de condiciones de pago
  formaPago: string;
  cantidadCuotas: number;
  valorCuota: number;
  moneda: string;
  
  // Datos de primera cuota
  primeraCuotaFecha: string;
  primeraCuotaMonto: number;
}


const PolizaWizard: React.FC<PolizaWizardProps> = ({ onComplete, onCancel }) => {
  const wizard = usePolizaWizard();
  
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
      // Campos adicionales del vehículo que faltaban
    destino: '',
    combustible: '',
    calidad: '',
    categoria: '',
    tipoVehiculo: '',
    uso: '',
    
    // Campos de condiciones de pago
    formaPago: '',
    cantidadCuotas: 0,
    valorCuota: 0,
    moneda: '',

    primeraCuotaFecha: '',
    primeraCuotaMonto: 0,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
  if (wizard.extractedData?.datosVelneo) {
    const datos = wizard.extractedData.datosVelneo;
    
    console.log('📝 Llenando formulario con datos extraídos:', datos);
    
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
      
      // DATOS BÁSICOS
      numeroPoliza: datos.datosPoliza?.numeroPoliza || '',
      asegurado: datos.datosBasicos?.asegurado || wizard.selectedCliente?.clinom || '',
      documento: datos.datosBasicos?.documento || '',
      corredor: datos.datosBasicos?.corredor || '',
      
      // FECHAS DE VIGENCIA
      vigenciaDesde: convertirFecha(datos.datosPoliza?.desde),
      vigenciaHasta: convertirFecha(datos.datosPoliza?.hasta),
      
      // PLAN/COBERTURA (movido de cobertura a póliza)
      plan: datos.datosCobertura?.cobertura || '',
      ramo: datos.datosPoliza?.ramo || 'AUTOMOVILES',
      
      // DATOS DEL VEHÍCULO (completos)
      vehiculo: datos.datosVehiculo?.marcaModelo || '',
      marca: datos.datosVehiculo?.marca || '',
      modelo: datos.datosVehiculo?.modelo || '',
      anio: datos.datosVehiculo?.anio || '',
      motor: datos.datosVehiculo?.motor || '',
      chasis: datos.datosVehiculo?.chasis || '',
      matricula: datos.datosVehiculo?.matricula || '',
      destino: datos.datosVehiculo?.destino || '',           // ✅ NUEVO
      combustible: datos.datosVehiculo?.combustible || '',   // ✅ NUEVO
      calidad: datos.datosVehiculo?.calidad || '',           // ✅ NUEVO
      categoria: datos.datosVehiculo?.categoria || '',       // ✅ NUEVO
      tipoVehiculo: datos.datosVehiculo?.tipoVehiculo || '', // ✅ NUEVO
      uso: datos.datosVehiculo?.uso || '',                   // ✅ NUEVO
      
      // DATOS DE CONTACTO
      email: datos.datosBasicos?.email || '',
      telefono: datos.datosBasicos?.telefono || '',
      direccion: datos.datosBasicos?.domicilio || '',
      localidad: datos.datosBasicos?.localidad || '',
      departamento: datos.datosBasicos?.departamento || '',
      
      // DATOS FINANCIEROS (ahora en condiciones de pago)
      primaComercial: datos.condicionesPago?.premio || 0,    // ✅ MOVIDO
      premioTotal: datos.condicionesPago?.total || 0,        // ✅ MOVIDO
      prima: datos.condicionesPago?.premio || 0,
      
      // CONDICIONES DE PAGO - ✅ MODIFICADO: Insertamos automáticamente la forma de pago
      formaPago: datos.condicionesPago?.formaPago || '',     // ✅ AHORA SE INSERTA AUTOMÁTICAMENTE
      cantidadCuotas: datos.condicionesPago?.cuotas || 1,
      valorCuota: datos.condicionesPago?.valorCuota || 0,
      moneda: datos.condicionesPago?.moneda || datos.datosCobertura?.moneda || 'UYU',
      
      // PRIMERA CUOTA
      primeraCuotaFecha: datos.condicionesPago?.detalleCuotas?.primeraCuota?.fechaVencimiento
        ? convertirFecha(datos.condicionesPago.detalleCuotas.primeraCuota.fechaVencimiento)
        : '',
        
      primeraCuotaMonto: datos.condicionesPago?.detalleCuotas?.primeraCuota?.monto || 0,
      
      observaciones: generarObservacionesAutomaticas(datos)
    }));

    console.log('✅ Formulario llenado con estructura completa');
  }
}, [wizard.extractedData]);

const generarObservacionesAutomaticas = (datos: any): string => {
  const observaciones = [];
  
  // Mensaje principal
  observaciones.push('📄 Documento procesado automáticamente con Azure Document Intelligence');
  observaciones.push(`📊 ${datos.metricas?.camposCompletos || 0} campos extraídos (${datos.porcentajeCompletitud || 0}% completitud)`);
  
  // Información de cuotas
  if (datos.condicionesPago?.detalleCuotas?.tieneCuotasDetalladas && datos.condicionesPago.detalleCuotas.cuotas?.length > 0) {
    observaciones.push('');
    observaciones.push('💳 CRONOGRAMA DE CUOTAS DETECTADO:');
    observaciones.push(`${datos.condicionesPago.formaPago} - ${datos.condicionesPago.cuotas} cuotas de ${datos.condicionesPago.moneda} ${datos.condicionesPago.valorCuota?.toLocaleString()}`);
    observaciones.push('');
    
    // Detalle de todas las cuotas
    datos.condicionesPago.detalleCuotas.cuotas.forEach((cuota: any, index: number) => {
      const fecha = new Date(cuota.fechaVencimiento).toLocaleDateString('es-UY');
      observaciones.push(`Cuota ${cuota.numero}: ${fecha} - $${cuota.monto?.toLocaleString()}`);
    });
  }
  
  // Alertas si hay campos faltantes
  if (!datos.tieneDatosMinimos) {
    observaciones.push('');
    observaciones.push('⚠️ REQUIERE VERIFICACIÓN MANUAL - Datos incompletos');
  }
  
  return observaciones.join('\n');
};

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
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
        />
      </div>

      {/* Loading de búsqueda */}
      {wizard.loadingClientes && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600 mr-2" />
          <span className="text-gray-600">Buscando clientes...</span>
        </div>
      )}

      {/* ✅ RESULTADOS MEJORADOS CON SCROLL */}
      {wizard.clienteResults.length > 0 && (
        <div className="mb-4">
          {/* Header con contador */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-700">
              Resultados encontrados
            </h3>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              {wizard.clienteResults.length} cliente{wizard.clienteResults.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Lista con scroll y altura limitada */}
          <div className="max-h-96 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {wizard.clienteResults.map((cliente, index) => (
              <div
                key={cliente.id}
                onClick={() => wizard.selectCliente(cliente)}
                className="group p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 cursor-pointer transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Nombre principal */}
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate group-hover:text-purple-900">
                        {cliente.clinom}
                      </h4>
                      {index < 3 && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                          Top {index + 1}
                        </span>
                      )}
                    </div>
                    
                    {/* Información compacta en dos líneas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-600">
                      {/* Primera línea: Documentos */}
                      <div className="flex items-center space-x-3">
                        {cliente.cliced && (
                          <span className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1"></span>
                            CI: {cliente.cliced}
                          </span>
                        )}
                        {cliente.cliruc && (
                          <span className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
                            RUC: {cliente.cliruc}
                          </span>
                        )}
                      </div>
                      
                      {/* Segunda línea: Contacto */}
                      <div className="flex items-center space-x-3">
                        {cliente.cliemail && (
                          <span className="flex items-center truncate">
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-1"></span>
                            {cliente.cliemail}
                          </span>
                        )}
                        {cliente.telefono && (
                          <span className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-1"></span>
                            {cliente.telefono}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dirección si existe */}
                    {cliente.clidir && (
                      <div className="mt-1 text-xs text-gray-500 truncate">
                        📍 {cliente.clidir}
                      </div>
                    )}
                  </div>

                  {/* Flecha e indicador */}
                  <div className="flex items-center space-x-2 ml-3">
                    <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Seleccionar
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer con hint */}
          <div className="mt-3 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              💡 Haz clic en cualquier cliente para seleccionarlo
            </p>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {wizard.clienteSearch.length >= 2 && !wizard.loadingClientes && wizard.clienteResults.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Sin resultados</h3>
          <p className="text-xs text-gray-500">
            No se encontraron clientes con el criterio "{wizard.clienteSearch}"
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Intenta con otro nombre o documento
          </p>
        </div>
      )}

      {/* Mensaje inicial */}
      {wizard.clienteSearch.length < 2 && wizard.clienteResults.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Buscar cliente</h3>
          <p className="text-xs text-gray-500">
            Escribe al menos 2 caracteres para comenzar la búsqueda
          </p>
          <div className="mt-3 flex items-center justify-center space-x-4 text-xs text-gray-400">
            <span>Busca por:</span>
            <span className="bg-gray-100 px-2 py-1 rounded">Nombre</span>
            <span className="bg-gray-100 px-2 py-1 rounded">CI</span>
            <span className="bg-gray-100 px-2 py-1 rounded">RUC</span>
          </div>
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
      {/* Cliente seleccionado - Resumen mejorado */}
      {wizard.selectedCliente && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <span className="font-medium text-green-800">Cliente seleccionado:</span>
                <span className="ml-2 text-green-900 font-semibold">{wizard.selectedCliente.clinom}</span>
              </div>
            </div>
            <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              ✓ Paso 1 completado
            </div>
          </div>
          {/* Información adicional del cliente */}
          <div className="mt-2 text-xs text-green-700 flex items-center space-x-4">
            {wizard.selectedCliente.cliced && (
              <span>CI: {wizard.selectedCliente.cliced}</span>
            )}
            {wizard.selectedCliente.cliemail && (
              <span>📧 {wizard.selectedCliente.cliemail}</span>
            )}
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

      {/* ✅ LISTA DE COMPAÑÍAS MEJORADA */}
      {wizard.companies.length > 0 && (
        <div className="mb-4">
          {/* Header con contador */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-700">
              Compañías disponibles
            </h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {wizard.companies.length} compañía{wizard.companies.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Grid responsivo con scroll si hay muchas compañías */}
          <div className="max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {wizard.companies.map((company, index) => (
                <div
                  key={company.id}
                  onClick={() => wizard.selectCompany(company)}
                  className="group p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    {/* Icono de la compañía */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                        <Building2 className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                      </div>
                    </div>

                    {/* Información de la compañía */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-900">
                          {company.comnom}
                        </h4>
                        {index < 2 && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                            ⭐ Popular
                          </span>
                        )}
                      </div>
                      
                      {/* Alias/código de la compañía */}
                      {company.comalias && company.comalias !== company.comnom && (
                        <div className="text-xs text-gray-600 flex items-center">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5"></span>
                          Código: {company.comalias}
                        </div>
                      )}
                      
                      {/* Estado activo */}
                      <div className="flex items-center mt-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                        <span className="text-xs text-green-600 font-medium">Activa</span>
                      </div>
                    </div>

                    {/* Flecha e indicador */}
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Seleccionar
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer con información */}
          <div className="mt-3 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              🏢 Haz clic en cualquier compañía para continuar
            </p>
          </div>
        </div>
      )}

      {/* Sin compañías disponibles - Estado mejorado */}
      {!wizard.loadingCompanies && wizard.companies.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sin compañías disponibles</h3>
          <p className="text-sm text-gray-600 mb-4">
            No se encontraron compañías activas en el sistema
          </p>
          <div className="space-y-3">
            <button
              onClick={wizard.loadCompanies}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Loader2 className="w-4 h-4 mr-2" />
              Recargar compañías
            </button>
            <p className="text-xs text-gray-500">
              Si el problema persiste, contacta al administrador
            </p>
          </div>
        </div>
      )}

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6 border-t border-gray-100">
        <button
          onClick={wizard.goBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a cliente
        </button>
        
        {wizard.selectedCompany && (
          <button
            onClick={() => wizard.goToStep('upload')}
            className="inline-flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Continuar
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        )}
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
  const renderFormStep = () => {
const tabs = [
  { id: 'basicos', label: 'Datos Básicos', icon: User },
  { id: 'poliza', label: 'Póliza', icon: FileText },
  { id: 'vehiculo', label: 'Vehículo', icon: Car },
  { id: 'pago', label: 'Condiciones Pago', icon: CreditCard },
  { id: 'observaciones', label: 'Observaciones', icon: FileCheck }
];

const generarObservacionesAutomaticas = (datos: any): string => {
  const observaciones = [];
  const fecha = new Date().toLocaleDateString('es-UY');
  const hora = new Date().toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });
  
  // Encabezado principal
  observaciones.push('📄 PÓLIZA PROCESADA AUTOMÁTICAMENTE CON AZURE DOCUMENT INTELLIGENCE');
  observaciones.push(`📅 Fecha de procesamiento: ${fecha} a las ${hora}`);
  observaciones.push('');
  
  // Información de extracción
  observaciones.push('📊 MÉTRICAS DE EXTRACCIÓN:');
  observaciones.push(`• Campos extraídos: ${datos.metricas?.camposExtraidos || 0}`);
  observaciones.push(`• Completitud: ${datos.porcentajeCompletitud || 0}%`);
  observaciones.push(`• Datos mínimos: ${datos.tieneDatosMinimos ? 'Completos ✅' : 'Incompletos ⚠️'}`);
  observaciones.push('');
  
  // Información de la póliza extraída
  if (datos.datosPoliza?.numeroPoliza) {
    observaciones.push('📋 DATOS DE PÓLIZA EXTRAÍDOS:');
    observaciones.push(`• Número: ${datos.datosPoliza.numeroPoliza}`);
    if (datos.datosPoliza.certificado) observaciones.push(`• Certificado: ${datos.datosPoliza.certificado}`);
    if (datos.datosPoliza.endoso) observaciones.push(`• Endoso: ${datos.datosPoliza.endoso}`);
    if (datos.datosCobertura?.cobertura) observaciones.push(`• Plan: ${datos.datosCobertura.cobertura}`);
    observaciones.push('');
  }
  
  // Información del vehículo
  if (datos.datosVehiculo?.marcaModelo) {
    observaciones.push('🚗 VEHÍCULO EXTRAÍDO:');
    observaciones.push(`• ${datos.datosVehiculo.marcaModelo}`);
    if (datos.datosVehiculo.anio) observaciones.push(`• Año: ${datos.datosVehiculo.anio}`);
    if (datos.datosVehiculo.combustible) observaciones.push(`• Combustible: ${datos.datosVehiculo.combustible}`);
    if (datos.datosVehiculo.uso) observaciones.push(`• Uso: ${datos.datosVehiculo.uso}`);
    observaciones.push('');
  }
  
  // Información de condiciones de pago
  if (datos.condicionesPago) {
    observaciones.push('💳 CONDICIONES DE PAGO EXTRAÍDAS:');
    if (datos.condicionesPago.formaPago) {
      observaciones.push(`• Forma de pago: ${datos.condicionesPago.formaPago}`);
    }
    if (datos.condicionesPago.cuotas && datos.condicionesPago.valorCuota) {
      observaciones.push(`• ${datos.condicionesPago.cuotas} cuotas de ${datos.condicionesPago.moneda || 'UYU'} ${datos.condicionesPago.valorCuota.toLocaleString()}`);
    }
    if (datos.condicionesPago.premio) {
      observaciones.push(`• Prima comercial: ${datos.condicionesPago.moneda || 'UYU'} ${datos.condicionesPago.premio.toLocaleString()}`);
    }
    if (datos.condicionesPago.total) {
      observaciones.push(`• Premio total: ${datos.condicionesPago.moneda || 'UYU'} ${datos.condicionesPago.total.toLocaleString()}`);
    }
    observaciones.push('');
  }
  
  // Cronograma de cuotas detallado
  if (datos.condicionesPago?.detalleCuotas?.tieneCuotasDetalladas && datos.condicionesPago.detalleCuotas.cuotas?.length > 0) {
    observaciones.push('📅 CRONOGRAMA DE CUOTAS DETECTADO:');
    observaciones.push(`${datos.condicionesPago.formaPago} - ${datos.condicionesPago.cuotas} cuotas`);
    observaciones.push('');
    
    // Encabezado de tabla
    observaciones.push('Cuota | Fecha Vencimiento | Monto');
    observaciones.push('------|------------------|------');
    
    // Detalle de cada cuota
    datos.condicionesPago.detalleCuotas.cuotas.forEach((cuota: any) => {
      const fecha = new Date(cuota.fechaVencimiento).toLocaleDateString('es-UY');
      const monto = cuota.monto?.toLocaleString() || '0';
      observaciones.push(`${cuota.numero.toString().padStart(2, ' ')}    | ${fecha.padEnd(16, ' ')} | $${monto}`);
    });
    
    observaciones.push('');
    observaciones.push(`TOTAL: ${datos.condicionesPago.cuotas} cuotas - ${datos.condicionesPago.moneda || 'UYU'} ${datos.condicionesPago.total?.toLocaleString()}`);
    observaciones.push('');
  }
  
  // Alertas y notas especiales
  if (!datos.tieneDatosMinimos) {
    observaciones.push('⚠️ ALERTAS:');
    observaciones.push('• REQUIERE VERIFICACIÓN MANUAL - Datos incompletos detectados');
    observaciones.push('• Revisar campos faltantes antes de enviar a Velneo');
    observaciones.push('');
  }
  
  // Notas de escaneado adicionales
  if (datos.observaciones?.notasEscaneado?.length > 0) {
    observaciones.push('📝 NOTAS ADICIONALES:');
    datos.observaciones.notasEscaneado.forEach((nota: string) => {
      observaciones.push(`• ${nota}`);
    });
    observaciones.push('');
  }
  
  // Footer
  observaciones.push('---');
  observaciones.push('✨ Generado automáticamente por RegularizadorPolizas v2.0');
  observaciones.push('📧 Para soporte: soporte@regularizadorpolizas.com');
  
  return observaciones.join('\n');
};

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basicos':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Información del Cliente
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Corredor</label>
                <input
                  type="text"
                  value={formData.corredor}
                  onChange={(e) => setFormData(prev => ({ ...prev, corredor: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asegurado *</label>
                <input
                  type="text"
                  value={formData.asegurado}
                  onChange={(e) => setFormData(prev => ({ ...prev, asegurado: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Documento</label>
                <input
                  type="text"
                  value={formData.documento}
                  onChange={(e) => setFormData(prev => ({ ...prev, documento: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Datos de Contacto
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                  <input
                    type="text"
                    value={formData.departamento}
                    onChange={(e) => setFormData(prev => ({ ...prev, departamento: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Localidad</label>
                  <input
                    type="text"
                    value={formData.localidad}
                    onChange={(e) => setFormData(prev => ({ ...prev, localidad: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

case 'poliza':
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Hash className="w-5 h-5 mr-2" />
          Datos de la Póliza
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Número de Póliza *</label>
          <input
            type="text"
            value={formData.numeroPoliza}
            onChange={(e) => setFormData(prev => ({ ...prev, numeroPoliza: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ramo</label>
          <select
            value={formData.ramo}
            onChange={(e) => setFormData(prev => ({ ...prev, ramo: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="AUTOMOVILES">Automóviles</option>
            <option value="MOTOCICLETAS">Motocicletas</option>
            <option value="CAMIONES">Camiones</option>
            <option value="OTROS">Otros</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Shield className="w-4 h-4 inline mr-1" />
            Plan/Cobertura *
          </label>
          <input
            type="text"
            value={formData.plan}
            onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Ej: SEGURO GLOBAL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Corredor</label>
          <input
            type="text"
            value={formData.corredor}
            onChange={(e) => setFormData(prev => ({ ...prev, corredor: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Vigencia y Certificación
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vigencia Desde *</label>
            <input
              type="date"
              value={formData.vigenciaDesde}
              onChange={(e) => setFormData(prev => ({ ...prev, vigenciaDesde: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vigencia Hasta *</label>
            <input
              type="date"
              value={formData.vigenciaHasta}
              onChange={(e) => setFormData(prev => ({ ...prev, vigenciaHasta: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
        </div>

        {/* Mostrar información extraída del certificado y endoso */}
        {wizard.extractedData?.datosVelneo?.datosPoliza && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">
              <FileCheck className="w-4 h-4 inline mr-1" />
              Información Extraída
            </h4>
            <div className="text-blue-700 text-sm space-y-1">
              {wizard.extractedData.datosVelneo.datosPoliza.certificado && (
                <p>Certificado: {wizard.extractedData.datosVelneo.datosPoliza.certificado}</p>
              )}
              {wizard.extractedData.datosVelneo.datosPoliza.endoso && (
                <p>Endoso: {wizard.extractedData.datosVelneo.datosPoliza.endoso}</p>
              )}
              {wizard.extractedData.datosVelneo.datosPoliza.tipoMovimiento && (
                <p>Tipo: {wizard.extractedData.datosVelneo.datosPoliza.tipoMovimiento}</p>
              )}
            </div>
          </div>
        )}
                <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4 inline mr-1" />
            Compañía de Seguros
          </label>
          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
            {wizard.selectedCompany?.comnom || 'No seleccionada'}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Compañía seleccionada en el paso anterior
          </p>
        </div>
      </div>
    </div>
  );

      case 'vehiculo':
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Car className="w-5 h-5 mr-2" />
          Información del Vehículo
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vehículo (Descripción Completa)</label>
          <input
            type="text"
            value={formData.vehiculo}
            onChange={(e) => setFormData(prev => ({ ...prev, vehiculo: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Descripción completa del vehículo"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Marca *</label>
            <input
              type="text"
              value={formData.marca}
              onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Modelo *</label>
            <input
              type="text"
              value={formData.modelo}
              onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
            <input
              type="text"
              value={formData.anio}
              onChange={(e) => setFormData(prev => ({ ...prev, anio: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="2024"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Matrícula</label>
            <input
              type="text"
              value={formData.matricula}
              onChange={(e) => setFormData(prev => ({ ...prev, matricula: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="ABC1234"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Combustible</label>
          <select
            value={formData.combustible}
            onChange={(e) => setFormData(prev => ({ ...prev, combustible: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Destino</label>
            <select
              value={formData.destino}
              onChange={(e) => setFormData(prev => ({ ...prev, destino: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Uso</label>
            <select
              value={formData.uso}
              onChange={(e) => setFormData(prev => ({ ...prev, uso: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Especificaciones Técnicas
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Motor</label>
          <input
            type="text"
            value={formData.motor}
            onChange={(e) => setFormData(prev => ({ ...prev, motor: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Número de motor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chasis</label>
          <input
            type="text"
            value={formData.chasis}
            onChange={(e) => setFormData(prev => ({ ...prev, chasis: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Número de chasis"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Vehículo</label>
          <select
            value={formData.tipoVehiculo}
            onChange={(e) => setFormData(prev => ({ ...prev, tipoVehiculo: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
          <input
            type="text"
            value={formData.categoria}
            onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Categoría del vehículo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Calidad</label>
          <select
            value={formData.calidad}
            onChange={(e) => setFormData(prev => ({ ...prev, calidad: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Seleccionar calidad</option>
            <option value="NUEVO">Nuevo</option>
            <option value="USADO">Usado</option>
            <option value="EXCELENTE">Excelente</option>
            <option value="BUENO">Bueno</option>
            <option value="REGULAR">Regular</option>
          </select>
        </div>

        {/* ✅ REMOVIDO: Recuadro azul con información extraída del documento */}
      </div>
    </div>
  );

      case 'cobertura':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Plan de Cobertura
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                <input
                  type="text"
                  value={formData.plan}
                  onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Ej: SEGURO GLOBAL"
                />
              </div>

              {/* Mostrar información de cuotas si está disponible */}
              {wizard.extractedData?.datosVelneo?.condicionesPago?.detalleCuotas?.tieneCuotasDetalladas && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Cronograma de Cuotas Detectado
                  </h4>
                  <p className="text-blue-700 text-sm">
                    Se detectó un cronograma de {wizard.extractedData.datosVelneo.condicionesPago.detalleCuotas.cantidadTotal} cuotas 
                    ({wizard.extractedData.datosVelneo.condicionesPago.detalleCuotas.cantidadDetalladas} detalladas)
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Valores
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prima Comercial</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.primaComercial}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaComercial: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Premio Total</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.premioTotal}
                  onChange={(e) => setFormData(prev => ({ ...prev, premioTotal: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        );

      case 'pago':
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Importes y Valores
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prima Comercial</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              value={formData.primaComercial}
              onChange={(e) => setFormData(prev => ({ ...prev, primaComercial: parseFloat(e.target.value) || 0 }))}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="123584.47"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Premio Total</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              value={formData.premioTotal}
              onChange={(e) => setFormData(prev => ({ ...prev, premioTotal: parseFloat(e.target.value) || 0 }))}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="153790.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
            <select
              value={formData.moneda}
              onChange={(e) => setFormData(prev => ({ ...prev, moneda: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="UYU">Peso Uruguayo (UYU)</option>
              <option value="USD">Dólar Americano (USD)</option>
              <option value="UI">Unidades Indexadas (UI)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de Cuotas</label>
            <input
              type="number"
              min="1"
              max="24"
              value={formData.cantidadCuotas}
              onChange={(e) => setFormData(prev => ({ ...prev, cantidadCuotas: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Valor por Cuota</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              value={formData.valorCuota}
              onChange={(e) => setFormData(prev => ({ ...prev, valorCuota: parseFloat(e.target.value) || 0 }))}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="15379.00"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Condiciones de Pago
        </h3>

        {/* ✅ MODIFICADO: Cambio de select por input de texto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pago</label>
          <input
            type="text"
            value={formData.formaPago}
            onChange={(e) => setFormData(prev => ({ ...prev, formaPago: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Ej: TARJETA DE CRÉDITO, CONTADO, DÉBITO AUTOMÁTICO"
          />
        </div>

        {/* ✅ REMOVIDO: Recuadro verde que mostraba la forma de pago detectada */}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Primera Cuota
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">Fecha de Vencimiento</label>
              <input
                type="date"
                value={formData.primeraCuotaFecha}
                onChange={(e) => setFormData(prev => ({ ...prev, primeraCuotaFecha: e.target.value }))}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">Monto</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-blue-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.primeraCuotaMonto}
                  onChange={(e) => setFormData(prev => ({ ...prev, primeraCuotaMonto: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-8 pr-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ REMOVIDO: Recuadro amarillo de cronograma completo detectado */}
        {/* ✅ REMOVIDO: Recuadro de métricas de extracción */}
      </div>
    </div>
  );

      case 'observaciones':
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <FileCheck className="w-5 h-5 mr-2" />
        Observaciones y Notas
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones Automáticas
          <span className="text-xs text-gray-500 ml-2">(Generadas automáticamente - Puedes editarlas)</span>
        </label>
        <textarea
          value={formData.observaciones}
          onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
          placeholder="Las observaciones se generarán automáticamente..."
        />
        
        {/* Botón para regenerar observaciones */}
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (wizard.extractedData?.datosVelneo) {
                const nuevasObservaciones = generarObservacionesAutomaticas(wizard.extractedData.datosVelneo);
                setFormData(prev => ({ ...prev, observaciones: nuevasObservaciones }));
              }
            }}
            className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
          >
            <Settings className="w-3 h-3 mr-1" />
            Regenerar observaciones automáticas
          </button>
        </div>
      </div>

      {/* Vista previa del cronograma si está disponible */}
      {wizard.extractedData?.datosVelneo?.condicionesPago?.detalleCuotas?.tieneCuotasDetalladas && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Vista Previa - Cronograma de Cuotas
          </h4>
          
          <div className="max-h-64 overflow-y-auto bg-white rounded border border-blue-200 p-3">
            <div className="grid grid-cols-3 gap-4 text-sm font-medium text-blue-800 border-b border-blue-200 pb-2 mb-2">
              <div>Cuota</div>
              <div>Fecha Vencimiento</div>
              <div>Monto</div>
            </div>
            
            {wizard.extractedData.datosVelneo.condicionesPago.detalleCuotas.cuotas.map((cuota: any) => (
              <div key={cuota.numero} className="grid grid-cols-3 gap-4 text-sm text-blue-700 py-1 border-b border-blue-100">
                <div>Cuota {cuota.numero}</div>
                <div>{new Date(cuota.fechaVencimiento).toLocaleDateString('es-UY')}</div>
                <div>${cuota.monto?.toLocaleString()}</div>
              </div>
            ))}
            
            <div className="grid grid-cols-3 gap-4 text-sm font-medium text-blue-800 pt-2 mt-2 border-t border-blue-200">
              <div>Total:</div>
              <div>{wizard.extractedData.datosVelneo.condicionesPago.cuotas} cuotas</div>
              <div>${wizard.extractedData.datosVelneo.condicionesPago.total?.toLocaleString()}</div>
            </div>
          </div>
          
          <p className="text-blue-600 text-xs mt-2 italic">
            ℹ️ Este cronograma se incluye automáticamente en las observaciones de la póliza
          </p>
        </div>
      )}

      {/* Información de procesamiento */}
      {wizard.extractedData && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <Settings className="w-4 h-4 mr-1" />
            Información de Procesamiento
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-white rounded border border-gray-200 p-3">
              <span className="text-gray-600 block text-xs">Archivo procesado:</span>
              <p className="font-medium text-gray-900 truncate" title={wizard.uploadedFile?.name}>
                {wizard.uploadedFile?.name}
              </p>
            </div>
            
            <div className="bg-white rounded border border-gray-200 p-3">
              <span className="text-gray-600 block text-xs">Tiempo de procesamiento:</span>
              <p className="font-medium text-gray-900">
                {((wizard.extractedData.tiempoProcesamiento || 0) / 1000).toFixed(1)}s
              </p>
            </div>
            
            <div className="bg-white rounded border border-gray-200 p-3">
              <span className="text-gray-600 block text-xs">Estado:</span>
              <p className="font-medium text-green-700">
                {wizard.extractedData.estadoProcesamiento}
              </p>
            </div>
            
            <div className="bg-white rounded border border-gray-200 p-3">
              <span className="text-gray-600 block text-xs">Timestamp:</span>
                <p className="font-medium text-gray-900 text-xs">
                  {new Date(wizard.extractedData.timestamp || Date.now()).toLocaleString('es-UY')}
                </p>
            </div>
          </div>

          {/* Detalles adicionales */}
          {wizard.extractedData?.datosVelneo && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Campos extraídos:</span>
                  <p className="font-medium">{wizard.extractedData.datosVelneo.metricas?.camposExtraidos || 0}</p>
                </div>
                <div>
                  <span className="text-gray-600">Completitud:</span>
                  <p className="font-medium">{wizard.extractedData.datosVelneo.porcentajeCompletitud || 0}%</p>
                </div>
                <div>
                  <span className="text-gray-600">Datos mínimos:</span>
                  <p className={`font-medium ${wizard.extractedData.datosVelneo.tieneDatosMinimos ? 'text-green-600' : 'text-red-600'}`}>
                    {wizard.extractedData.datosVelneo.tieneDatosMinimos ? 'Completos' : 'Incompletos'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Listo para Velneo:</span>
                  <p className={`font-medium ${wizard.extractedData.listoParaVelneo ? 'text-green-600' : 'text-yellow-600'}`}>
                    {wizard.extractedData.listoParaVelneo ? 'Sí' : 'Requiere revisión'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notas adicionales */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-1" />
          Notas Importantes
        </h4>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• Las observaciones se generan automáticamente basadas en la información extraída</li>
          <li>• El cronograma de cuotas se incluye automáticamente cuando es detectado</li>
          <li>• Puedes editar las observaciones según sea necesario antes de crear la póliza</li>
          <li>• La información de procesamiento se incluye para auditoría y debugging</li>
        </ul>
      </div>
    </div>
  );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">✅ Validar Datos Extraídos</h2>
        <p className="text-gray-600">Revisa y completa la información antes de crear la póliza</p>
      </div>

      {/* Header con información del procesamiento */}
      {wizard.extractedData && (
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
      )}

      {/* Tabs de navegación */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido del tab activo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {renderTabContent()}
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between items-center">
        <button
          onClick={wizard.goBack}
          className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al procesamiento
        </button>

        <button
          onClick={async () => {
            setSaving(true);
            try {
              console.log('💾 Creando póliza con datos:', formData);
              // Aquí implementarías la lógica para enviar a Velneo
              await new Promise(resolve => setTimeout(resolve, 2000)); // Simular guardado
              wizard.goToStep('success');
            } catch (error) {
              console.error('Error creando póliza:', error);
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
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
      </div>
    </div>
  );
};

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