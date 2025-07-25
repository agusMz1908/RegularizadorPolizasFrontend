import React, { useState, useEffect } from 'react';
import { 
  User, Building2, Upload, FileText, Eye, Check, 
  Car, DollarSign, Calendar, MapPin, Mail, Phone,
  Edit3, Save, X, CheckCircle, AlertTriangle, Loader2,
  ArrowLeft, ArrowRight, Search, FileCheck, Building,
  Settings, Shield, CreditCard, Navigation, Clock, Hash,
  Star, Zap, Sparkles, Award, Target,
  CheckCircle2,
  Lightbulb,
  Info, RefreshCw 
} from 'lucide-react';

import { PolizaCreateRequest, PolizaFormData } from '../../types/poliza';
import { usePolizaWizard } from '../../hooks/usePolizaWizard';
import { useDarkMode } from '../../context/ThemeContext';
import FloatingWizardHeader from './FloatingWizardHeader';
import { 
  extraerOperacionDesdeAzure,
  determinarTramite,
  determinarEstadoPoliza,
  type TipoOperacion ,
  OPERACIONES_CONFIG
} from '../../utils/operationLogic';
import { useVelneoEntities } from '../../hooks/useVelneoEntities';
import ScannedValuesPanel from '../wizard/ScannedValuesPanel';
import { VelneoMapper } from '../../utils/velneoMapper';
import type { VelneoMappingInput } from '../../utils/velneoMapper';
import { VelneoContrato, VelneoEstadoPoliza, VelneoFormaPago, VelneoMappingResult, VelneoMoneda, VelneoTipoGestion, VelneoTramite } from '../../types/velneo';

interface PolizaWizardProps {
  onComplete?: (result: any) => void;
  onCancel?: () => void;
}

const PolizaWizard: React.FC<PolizaWizardProps> = ({ onComplete, onCancel }) => {
  const wizard = usePolizaWizard();
  const isDarkMode = useDarkMode();
  
  const velneoEntities = useVelneoEntities();

  const [activeTab, setActiveTab] = useState('basicos');
  const [formData, setFormData] = useState<PolizaFormData>({
  // ✅ CAMPOS REQUERIDOS (según types/poliza.ts)
  numeroPoliza: '',
  vigenciaDesde: '',
  vigenciaHasta: '',
  prima: 0,
  moneda: '',
  asegurado: '',
  compania: 0,           // ✅ number, no string
  seccionId: 0,          // ✅ requerido
  clienteId: 0,          // ✅ requerido  
  cobertura: '',         // ✅ requerido

  // ✅ CAMPOS OPCIONALES
  observaciones: '',
  vehiculo: '',
  marca: '',
  modelo: '',
  matricula: '',
  motor: '',
  chasis: '',
  anio: '',
  primaComercial: 0,
  premioTotal: 0,
  cantidadCuotas: 0,
  valorCuota: 0,
  formaPago: '',
  primeraCuotaFecha: '',
  primeraCuotaMonto: 0,
  documento: '',
  email: '',
  telefono: '',
  direccion: '',
  localidad: '',
  departamento: '',
  corredor: '',
  plan: '',
  ramo: '',
  certificado: '',
  estadoPoliza: '',
  tramite: '',
  tipo: '',
  destino: '',
  combustible: '',
  calidad: '',
  categoria: '',
  tipoVehiculo: '',
  uso: '',
  
  // ✅ IDs para combos
  combustibleId: null,
  categoriaId: null,
  destinoId: null,
  calidadId: null,
  
  // ✅ CAMPOS ADICIONALES
  operacion: null,
  seccion: '',
});

  const [saving, setSaving] = useState(false);

  const getBgClass = () => isDarkMode 
    ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
    : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50';

  useEffect(() => {
    if (wizard.extractedData?.datosVelneo) {
      const datos = wizard.extractedData.datosVelneo;

      const operacionSeleccionada = wizard.selectedOperacion || 'EMISION';
      const configOperacion = OPERACIONES_CONFIG[operacionSeleccionada];
      
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
        observaciones: generarObservacionesConLogica(
        datos, 
        operacionSeleccionada, 
        configOperacion.tramite, 
        configOperacion.estadoPoliza
      )
      }));
    }
  }, [wizard.extractedData]);

 useEffect(() => {
  if (wizard.extractedData) {
    console.log('🔍 Aplicando lógica automática a datos extraídos:', wizard.extractedData);
    
    const datos = wizard.extractedData;
    
    // Extraer operación de Azure
    const operacionDetectada = extraerOperacionDesdeAzure(datos);
    console.log('🎯 Operación detectada:', operacionDetectada);
    
    // Aplicar lógica automática
    const tramiteAuto = determinarTramite(operacionDetectada);
    const estadoAuto = determinarEstadoPoliza(operacionDetectada, datos.vigenciaHasta);
    
    console.log('🔧 Campos automáticos:', { tramiteAuto, estadoAuto });
    
    // ✅ CREAR INPUT PARA MAPEO CON PROPIEDADES CORRECTAS
    const inputMapeo: VelneoMappingInput = {
      // 🔧 CORREGIDO: Usar rutas correctas a los datos
      tramiteTexto: datos.datosVelneo?.datosPoliza?.tipoMovimiento || tramiteAuto,
      estadoTexto: '', // No existe en DocumentProcessResult
      estadoPolizaTexto: estadoAuto, // Usar el calculado automáticamente
      formaPagoTexto: datos.datosVelneo?.condicionesPago?.formaPago || '',
      monedaTexto: datos.datosVelneo?.condicionesPago?.moneda || '',
      operacion: operacionDetectada,
      fechaVencimiento: datos.vigenciaHasta ? new Date(datos.vigenciaHasta) : undefined,
      fuenteDatos: 'azure'
    };
    
    // 🎯 MAPEAR CAMPOS CON VELNEOMAPPER
    const resultadoMapeo = VelneoMapper.mapearCamposCompletos(inputMapeo);
    
    console.log('🎯 Campos mapeados automáticamente:', resultadoMapeo);
    
    // Si hay warnings, mostrarlos
    if (resultadoMapeo.warnings.length > 0) {
      console.warn('⚠️ Advertencias en mapeo:', resultadoMapeo.warnings);
    }
    
    // Actualizar solo los campos de operación, manteniendo los existentes
    setFormData(prev => ({
      ...prev,
      // CAMPOS DE OPERACION ORIGINAL
      operacion: operacionDetectada,
      tramite: tramiteAuto,
      estadoPoliza: estadoAuto,
      
      // 🎯 CAMPOS MAPEADOS DE VELNEO (NUEVOS)
      tramiteVelneo: resultadoMapeo.campos.tramite,
      estadoPolizaVelneo: resultadoMapeo.campos.estadoPoliza,
      formaPagoVelneo: resultadoMapeo.campos.formaPago,
      monedaVelneo: resultadoMapeo.campos.moneda,
      estadoGestionVelneo: resultadoMapeo.campos.estadoGestion,
      
      // ✅ SECCIÓN SELECCIONADA
      seccion: wizard.selectedSeccion?.seccion || '',
      seccionId: wizard.selectedSeccion?.id || 0,
      
      // 📝 OBSERVACIONES ENRIQUECIDAS CON INFO DE MAPEO
      observaciones: generarObservacionesConMapeo(datos, resultadoMapeo, operacionDetectada, tramiteAuto, estadoAuto)
    }));
  }
}, [wizard.extractedData, wizard.selectedSeccion]);

function generarObservacionesConMapeo(
  datos: any, 
  resultadoMapeo: VelneoMappingResult,
  operacion: TipoOperacion, 
  tramite: string, 
  estado: string
): string {
  const observaciones = [];
  
  // Información sobre detección automática del tipo de movimiento (si existe)
  if (datos.datosVelneo?.datosPoliza?.tipoMovimiento) {
    observaciones.push(`Tipo de movimiento original: "${datos.datosVelneo.datosPoliza.tipoMovimiento}"`);
    observaciones.push('');
  }
  
  // 🎯 INFORMACIÓN DEL MAPEO VELNEO
  observaciones.push('MAPEO AUTOMÁTICO VELNEO:');
  observaciones.push(`- Trámite: ${resultadoMapeo.campos.tramite} (${resultadoMapeo.mapping.tramite.metodo})`);
  observaciones.push(`- Estado Póliza: ${resultadoMapeo.campos.estadoPoliza} (${resultadoMapeo.mapping.estadoPoliza.metodo})`);
  observaciones.push(`- Forma Pago: ${resultadoMapeo.campos.formaPago} (${resultadoMapeo.mapping.formaPago.metodo})`);
  observaciones.push(`- Moneda: ${resultadoMapeo.campos.moneda} (${resultadoMapeo.mapping.moneda.metodo})`);
  observaciones.push('');
  
  // CRONOGRAMA DE CUOTAS - BUSCAR EN LA RUTA CORRECTA
  const cuotasData = datos.datosVelneo?.condicionesPago || datos.condicionesPago;
  
  if (cuotasData?.detalleCuotas?.tieneCuotasDetalladas && cuotasData.detalleCuotas.cuotas?.length > 0) {
    observaciones.push('CRONOGRAMA DE CUOTAS DETECTADO:');
    observaciones.push(`${resultadoMapeo.campos.formaPago} - ${cuotasData.cuotas} cuotas de ${resultadoMapeo.campos.moneda} $${cuotasData.valorCuota?.toLocaleString()}`);
    observaciones.push('');
    
    // Agregar cuotas individuales
    cuotasData.detalleCuotas.cuotas.forEach((cuota: any) => {
      if (cuota.fechaVencimiento) {
        const fecha = new Date(cuota.fechaVencimiento).toLocaleDateString('es-UY');
        observaciones.push(`Cuota ${cuota.numero}: ${fecha} - $${cuota.monto?.toLocaleString()}`);
      } else {
        observaciones.push(`Cuota ${cuota.numero}: Sin fecha - $${cuota.monto?.toLocaleString()}`);
      }
    });
    observaciones.push('');
  }
  
  // Advertencias del mapeo
  if (resultadoMapeo.warnings.length > 0) {
    observaciones.push('ADVERTENCIAS DE MAPEO:');
    resultadoMapeo.warnings.forEach(warning => {
      observaciones.push(`- ${warning}`);
    });
    observaciones.push('');
  }
  
  // Advertencias según el tipo de operación
  if (operacion === 'RENOVACION') {
    observaciones.push('RENOVACIÓN: Verificar que la póliza anterior esté por vencer');
    observaciones.push('');
  } else if (operacion === 'ENDOSO') {
    observaciones.push('ENDOSO: Verificar cambios respecto a la póliza original');
    observaciones.push('');
  }
  
  // Timestamp de procesamiento
  observaciones.push(`Procesado el ${new Date().toLocaleString('es-UY')} | ` +
                     `Procesado automáticamente con Azure Document Intelligence | ` +
                     `Trámite: ${resultadoMapeo.campos.tramite} | ` +
                     `Estado: ${resultadoMapeo.campos.estadoPoliza}`);
  
  return observaciones.join('\n');
}

useEffect(() => {
  if (wizard.currentStep === 'form' && wizard.selectedSeccion?.seccion && !formData.ramo) {
    setFormData(prev => ({
      ...prev,
      ramo: wizard.selectedSeccion?.seccion?.toUpperCase() || ''
    }));
  }
}, [wizard.currentStep, wizard.selectedSeccion?.seccion, formData.ramo]);

useEffect(() => {
  const certificadoEscaneado = wizard.extractedData?.datosVelneo?.datosPoliza?.certificado;
  if (certificadoEscaneado && !formData.certificado) {
    setFormData(prev => ({
      ...prev,
      certificado: certificadoEscaneado
    }));
  }
}, [wizard.extractedData, formData.certificado]);

useEffect(() => {
  if (wizard.selectedCompany?.id && !formData.compania) {
    setFormData(prev => ({
      ...prev,
      compania: Number(wizard.selectedCompany?.id || 0), // ✅ convertir a number
      clienteId: Number(wizard.selectedCliente?.id || 0), // ✅ asegurar clienteId
      seccionId: Number(wizard.selectedSeccion?.id || 0)  // ✅ asegurar seccionId
    }));
  }
}, [wizard.selectedCompany, wizard.selectedCliente, wizard.selectedSeccion, formData.compania]);

useEffect(() => {
  if (formData.operacion) {
    const tramiteAuto = getTramiteAutoFromOperacion(formData.operacion);
    const estadoAuto = getEstadoAutoFromOperacion(formData.operacion);
    
    setFormData(prev => ({
      ...prev,
      tramite: tramiteAuto,
      estadoPoliza: estadoAuto
    }));
  }
}, [formData.operacion]);


const generarObservacionesConLogica = (
  datos: any, 
  operacion: TipoOperacion, 
  tramite: string, 
  estado: string
): string => {
  const observaciones = [];
  
  // Información sobre detección automática del tipo de movimiento (si existe)
  if (datos.datosPoliza?.tipoMovimiento) {
    observaciones.push(`Tipo de movimiento original: "${datos.datosPoliza.tipoMovimiento}"`);
    observaciones.push('');
  }
  
  // CRONOGRAMA DE CUOTAS - BUSCAR EN LA RUTA CORRECTA
  const cuotasData = datos.datosVelneo?.condicionesPago || datos.condicionesPago;
  
  if (cuotasData?.detalleCuotas?.tieneCuotasDetalladas && cuotasData.detalleCuotas.cuotas?.length > 0) {
    observaciones.push('CRONOGRAMA DE CUOTAS DETECTADO:');
    observaciones.push(`${cuotasData.formaPago} - ${cuotasData.cuotas} cuotas de ${cuotasData.moneda} $${cuotasData.valorCuota?.toLocaleString()}`);
    observaciones.push('');
    
    // Agregar cuotas individuales
    cuotasData.detalleCuotas.cuotas.forEach((cuota: any) => {
      if (cuota.fechaVencimiento) {
        const fecha = new Date(cuota.fechaVencimiento).toLocaleDateString('es-UY');
        observaciones.push(`Cuota ${cuota.numero}: ${fecha} - $${cuota.monto?.toLocaleString()}`);
      } else {
        observaciones.push(`Cuota ${cuota.numero}: Sin fecha - $${cuota.monto?.toLocaleString()}`);
      }
    });
    observaciones.push('');
  }
  
  // Advertencias según el tipo de operación
  if (operacion === 'RENOVACION') {
    observaciones.push('RENOVACIÓN: Verificar que la póliza anterior esté por vencer');
    observaciones.push('');
  } else if (operacion === 'ENDOSO') {
    observaciones.push('ENDOSO: Verificar cambios respecto a la póliza original');
    observaciones.push('');
  }
  
  // Timestamp de procesamiento
  observaciones.push(`Procesado el ${new Date().toLocaleString('es-UY')}`);
  
  return observaciones.join('\n');
};

  // 1️⃣ PASO: Selección de Cliente - REDISEÑADO
  const renderClienteStep = () => (
  <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'text-gray-100' : ''}`}>
    {/* Header mejorado con gradiente */}
    <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkMode 
              ? 'bg-gradient-to-br from-blue-700 to-purple-800' 
              : 'bg-gradient-to-br from-blue-500 to-purple-600'
          }`}>
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Seleccionar Cliente
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-600'} text-xl`}>
              Busca y selecciona el cliente para crear la póliza
            </p>
          </div>
        </div>
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

          {wizard.clienteResults.length > 0 && (
            <div className="space-y-4">
              {/* Header con estadísticas */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Resultados encontrados
                </h3>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isDarkMode 
                      ? 'bg-blue-900 text-blue-200' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {wizard.clienteResults.length} cliente{wizard.clienteResults.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Lista mejorada - una columna, más compacta */}
              <div className="space-y-3 max-h-80 sm:max-h-96 lg:max-h-[32rem] xl:max-h-[40rem] overflow-y-auto pr-2">
                {wizard.clienteResults.map((cliente, index) => (
                  <div
                    key={cliente.id}
                    onClick={() => wizard.selectCliente(cliente)}
                    className={`group relative p-4 border rounded-xl hover:shadow-md cursor-pointer transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 hover:border-blue-500 hover:bg-gray-650' 
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Información principal - lado izquierdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start space-x-4">
                          {/* Avatar/Icono */}
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isDarkMode 
                              ? 'bg-gradient-to-br from-blue-600 to-purple-700' 
                              : 'bg-gradient-to-br from-blue-500 to-purple-600'
                          }`}>
                            <User className="w-5 h-5 text-white" />
                          </div>

                          {/* Datos del cliente */}
                          <div className="flex-1 min-w-0">
                            {/* Fila superior: Nombre + Documentos */}
                            <div className="flex items-center space-x-3 mb-1">
                              <h4 className={`font-bold text-lg truncate ${
                                isDarkMode 
                                  ? 'text-white group-hover:text-blue-300' 
                                  : 'text-gray-900 group-hover:text-blue-900'
                              } transition-colors`}>
                                {cliente.clinom}
                              </h4>
                              
                              {/* Documentos inline con el nombre */}
                              <div className="flex items-center space-x-2">
                                {cliente.cliced && (
                                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${
                                    isDarkMode 
                                      ? 'bg-blue-800 text-blue-200' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    <span>CI:</span>
                                    <span>{cliente.cliced}</span>
                                  </div>
                                )}
                                {cliente.cliruc && (
                                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${
                                    isDarkMode 
                                      ? 'bg-green-800 text-green-200' 
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    <span>RUC:</span>
                                    <span>{cliente.cliruc}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Fila inferior: Email, Teléfono y Dirección en una línea */}
                            <div className={`flex items-center space-x-4 text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {cliente.cliemail && (
                                <div className="flex items-center space-x-1">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate max-w-40">{cliente.cliemail}</span>
                                </div>
                              )}
                              {cliente.telefono && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{cliente.telefono}</span>
                                </div>
                              )}
                              {cliente.clidir && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate max-w-32">{cliente.clidir}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Acción - lado derecho */}
                      <div className="flex items-center space-x-3 ml-4">
                        <div className={`text-xs ${isDarkMode ? 'text-white' : 'text-gray-500'} text-xl font-bold`}>
                          Seleccionar
                        </div>
                        <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-500'
                        }`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>     
    </div>
  );

const renderCompanyStep = () => (
  <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'text-gray-100' : ''}`}>
    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isDarkMode 
            ? 'bg-gradient-to-br from-emerald-700 to-blue-800' 
            : 'bg-gradient-to-br from-emerald-500 to-blue-600'
        }`}>
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Seleccionar Compañía
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-600'} text-xl`}>
            Elige la compañía de seguros para la póliza
          </p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-8">
        {/* Loading */}
        {wizard.loadingCompanies && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-600 mt-4 text-lg">Cargando compañías...</p>
          </div>
        )}

        {/* Lista de compañías */}
        {!wizard.loadingCompanies && wizard.companies && wizard.companies.length > 0 && (
          <div className="space-y-4">
            {/* Header de la lista */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Compañías disponibles
              </h3>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isDarkMode 
                    ? 'bg-emerald-900 text-emerald-200' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {wizard.companies.length} compañía{wizard.companies.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Lista */}
            <div className="space-y-3 max-h-80 sm:max-h-96 lg:max-h-[32rem] xl:max-h-[40rem] overflow-y-auto pr-2">
              {wizard.companies.map((company, index) => (
                <div
                  key={company.id || index}
                  onClick={() => wizard.selectCompany(company)}
                  className={`group relative p-4 border rounded-xl hover:shadow-md cursor-pointer transition-all duration-200 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 hover:border-emerald-500 hover:bg-gray-650' 
                      : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                  } ${wizard.selectedCompany?.id === company.id ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    {/* Información principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-4">
                        {/* Icono de compañía */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          isDarkMode 
                            ? 'bg-gradient-to-br from-emerald-600 to-blue-700 group-hover:from-emerald-500 group-hover:to-blue-600' 
                            : 'bg-gradient-to-br from-emerald-100 to-blue-100 group-hover:from-emerald-200 group-hover:to-blue-200'
                        }`}>
                          <Building2 className={`w-5 h-5 transition-colors ${
                            isDarkMode 
                              ? 'text-white' 
                              : 'text-emerald-600 group-hover:text-emerald-700'
                          }`} />
                        </div>

                        {/* Datos de la compañía */}
                        <div className="flex-1 min-w-0">
                          {/* Nombre y código */}
                          <div className="flex items-center space-x-3 mb-1">
                            <h4 className={`font-bold text-lg truncate ${
                              isDarkMode 
                                ? 'text-white group-hover:text-emerald-300' 
                                : 'text-gray-900 group-hover:text-emerald-900'
                            } transition-colors`}>
                              {company.comnom || company.nombre || `Compañía ${company.id}` || 'Sin nombre'}
                            </h4>
                            
                            {/* Alias como badge si existe */}
                            {company.comalias && company.comalias !== company.comnom && (
                              <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${
                                isDarkMode 
                                  ? 'bg-gray-600 text-gray-200' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                <span>Alias:</span>
                                <span>{company.comalias}</span>
                              </div>
                            )}
                          </div>

                          {/* Estado y detalles */}
                          <div className={`flex items-center space-x-4 text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-green-600 font-medium">
                                {company.activo !== false ? 'Activa y verificada' : 'Inactiva'}
                              </span>
                            </div>
                            
                            {/* Código si existe */}
                            {(company.cod_srvcompanias || company.codigo) && (
                              <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${
                                  isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
                                }`}></div>
                                <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>
                                  {company.cod_srvcompanias || company.codigo}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Acción */}
                    <div className="flex items-center space-x-3 ml-4">
                      {wizard.selectedCompany?.id === company.id && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`text-xs ${isDarkMode ? 'text-white' : 'text-gray-500'} text-xl font-bold`}>
                        Seleccionar
                      </div>
                      <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                        isDarkMode ? 'text-emerald-400' : 'text-emerald-500'
                      }`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado sin compañías */}
        {!wizard.loadingCompanies && (!wizard.companies || wizard.companies.length === 0) && (
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
          onClick={() => wizard.goBack()}
          className={`inline-flex items-center px-6 py-3 rounded-xl transition-colors font-medium ${
            isDarkMode 
              ? 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600' 
              : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a clientes
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

const renderOperacionStep = () => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
    {/* Header mejorado */}
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Tipo de Operación
      </h2>
      <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
        Selecciona el tipo de operación a realizar
      </p>
    </div>

    {/* Grid de operaciones mejorado */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {Object.entries(OPERACIONES_CONFIG).map(([key, config]) => (
        <div
          key={key}
          onClick={() => wizard.selectOperacion(key as TipoOperacion)}
          className={`
            relative rounded-2xl border-2 cursor-pointer transition-all duration-500 p-6 group
            transform hover:-translate-y-2 hover:shadow-2xl
            ${wizard.selectedOperacion === key
              ? 'border-blue-500 shadow-2xl shadow-blue-500/25 scale-105 ring-2 ring-blue-200' +
                (isDarkMode ? ' bg-gradient-to-br from-blue-900/50 to-purple-900/30' : ' bg-gradient-to-br from-blue-50 to-purple-50')
              : `border-gray-200 hover:border-blue-300 hover:shadow-xl ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600' 
                    : 'bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-blue-50'
                }`
            }
          `}
        >
          {/* Glow effect para la seleccionada */}
          {wizard.selectedOperacion === key && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl -z-10"></div>
          )}

          {/* Indicador de selección mejorado */}
          {wizard.selectedOperacion === key && (
            <div className="absolute -top-3 -right-3 z-10">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          )}

          {/* Contenido de la tarjeta */}
          <div className="text-center relative z-10">
            {/* Icono con animación */}
            <div className={`text-6xl mb-4 transition-all duration-300 ${
              wizard.selectedOperacion === key 
                ? 'scale-110 animate-bounce' 
                : 'group-hover:scale-110 group-hover:rotate-6'
            }`}>
              {config.icon}
            </div>
            
            <h3 className={`text-xl font-bold mb-3 transition-colors duration-200 ${
              wizard.selectedOperacion === key 
                ? 'text-blue-600' 
                : isDarkMode ? 'text-white group-hover:text-blue-300' : 'text-gray-900 group-hover:text-blue-600'
            }`}>
              {config.operacion}
            </h3>
            
            <p className={`text-sm mb-4 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            } text-2xl`}>
              {config.descripcion}
            </p>         
          </div>

          {/* Efecto de brillo en hover */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        </div>
      ))}
    </div>

    {/* CTA mejorado */}
    <div className="text-center">
      <div className={`inline-flex items-center space-x-4 p-1 rounded-2xl ${
        isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-100/50 border border-gray-200'
      }`}>
        {/* Botón secundario - más discreto */}
        <button
          onClick={wizard.goBack}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            isDarkMode 
              ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4 mr-2 inline" />
          Atrás
        </button>   
      </div>

      {/* Indicador de progreso sutil */}
      {wizard.selectedOperacion && (
        <div className={`mt-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Operación seleccionada: <strong>{OPERACIONES_CONFIG[wizard.selectedOperacion].operacion}</strong></span>
            <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
          </div>
        </div>
      )}
    </div>
  </div>
);

  const renderSeccionStep = () => (
  <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'text-gray-100' : ''}`}>
    {/* Header mejorado */}
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isDarkMode 
            ? 'bg-gradient-to-br from-indigo-700 to-purple-800' 
            : 'bg-gradient-to-br from-indigo-500 to-purple-600'
        }`}>
          <Navigation className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Seleccionar Sección
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-xl`}>
            Elige la sección que corresponde a esta póliza
          </p>
        </div>
      </div>
    </div>

    <div className={`rounded-3xl shadow-xl border overflow-hidden ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      <div className="p-8">
        {/* Estado de carga */}
        {wizard.loadingSecciones && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-600 mt-4 text-lg">Cargando secciones...</p>
          </div>
        )}

        {/* Lista de secciones rediseñada */}
        {!wizard.loadingSecciones && wizard.secciones.length > 0 && (
          <div className="space-y-4">
            {/* Header con estadísticas */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Secciones disponibles
              </h3>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isDarkMode 
                    ? 'bg-purple-900 text-purple-200' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {wizard.secciones.length} sección{wizard.secciones.length !== 1 ? 'es' : ''}
                </span>
              </div>
            </div>

            {/* Lista de secciones - estilo similar a cliente/company */}
            <div className="space-y-3 max-h-80 sm:max-h-96 lg:max-h-[32rem] xl:max-h-[40rem] overflow-y-auto pr-2">
              {wizard.secciones.map((seccion) => (
                <div
                  key={seccion.id}
                  onClick={() => wizard.selectSeccion(seccion)}
                  className={`group relative p-4 border rounded-xl hover:shadow-md cursor-pointer transition-all duration-200 ${
                    isDarkMode 
                      ? 'border-gray-600 bg-gray-700 hover:border-purple-500 hover:bg-gray-650' 
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                  } ${wizard.selectedSeccion?.id === seccion.id 
                    ? (isDarkMode 
                        ? 'border-purple-500 bg-purple-900/20' 
                        : 'border-purple-400 bg-purple-50 shadow-md')
                    : ''}`}
                >
                  <div className="flex items-center justify-between">
                    {/* Información principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-4">
                        {/* Icono de sección */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isDarkMode 
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-700' 
                            : 'bg-gradient-to-br from-indigo-100 to-purple-100'
                        }`}>
                          <Navigation className={`w-5 h-5 ${
                            isDarkMode 
                              ? 'text-purple-300' 
                              : 'text-purple-600'
                          }`} />
                        </div>

                        {/* Datos de la sección */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-1">
                            <h4 className={`font-bold text-lg ${
                              isDarkMode 
                                ? 'text-white group-hover:text-purple-300' 
                                : 'text-gray-900 group-hover:text-purple-900'
                            }`}>
                              {seccion.seccion}
                            </h4>
                          </div>

                          {/* Badge de estado */}
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              seccion.activo 
                                ? (isDarkMode 
                                    ? 'bg-green-900 text-green-200' 
                                    : 'bg-green-100 text-green-800') 
                                : (isDarkMode 
                                    ? 'bg-gray-600 text-gray-300' 
                                    : 'bg-gray-100 text-gray-800')
                            }`}>
                              {seccion.activo ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Acción - lado derecho */}
                    <div className="flex items-center space-x-3 ml-4">
                      {wizard.selectedSeccion?.id === seccion.id && (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isDarkMode 
                            ? 'bg-green-600' 
                            : 'bg-green-500'
                        }`}>
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={`text-xs ${isDarkMode ? 'text-white' : 'text-gray-500'} text-xl font-bold`}>
                        Seleccionar
                      </div>
                      <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                        isDarkMode ? 'text-purple-400' : 'text-purple-500'
                      }`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado sin secciones */}
        {!wizard.loadingSecciones && wizard.secciones.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Navigation className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Sin secciones disponibles</h3>
            <p className="text-gray-600 mb-6">
              No se encontraron secciones activas en el sistema
            </p>
            <button
              onClick={wizard.loadSecciones}
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
            >
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Recargar secciones
            </button>
          </div>
        )}
      </div>
      {/* Botones de navegación */}
      <div className="flex justify-between items-center p-8 bg-gray-50 border-t border-gray-100">
        <button
          onClick={wizard.goBack}
          className={`inline-flex items-center px-6 py-3 rounded-xl transition-colors font-medium ${
            isDarkMode 
              ? 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600' 
              : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a compañías
        </button>

        <button
          onClick={() => wizard.goToStep('upload')}
          disabled={!wizard.selectedSeccion}
          className={`inline-flex items-center px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg ${
            wizard.selectedSeccion
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500' 
              : 'bg-gray-300 text-gray-500'
          }`}
        >
          Continuar
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  </div>
);

  // 3️⃣ PASO: Upload de Archivo - REDISEÑADO
  const renderUploadStep = () => (
  <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'text-gray-100' : ''}`}>
    {/* Header mejorado con fondo */}
    <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkMode 
              ? 'bg-gradient-to-br from-purple-700 to-pink-800' 
              : 'bg-gradient-to-br from-purple-500 to-pink-600'
          }`}>
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Subir Póliza
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-600'} text-xl`}>
              Sube el PDF para procesar con IA
            </p>
          </div>
        </div>
      </div>

    <div className={`rounded-3xl shadow-xl border overflow-hidden ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
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
      ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700' 
      : 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200'
  }`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* Icono con gradiente purple/pink */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isDarkMode 
            ? 'bg-gradient-to-br from-purple-600 to-pink-600' 
            : 'bg-gradient-to-br from-purple-500 to-pink-500'
        }`}>
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className={`font-bold text-lg ${
            isDarkMode 
              ? 'text-purple-200' 
              : 'text-purple-900'
          }`}>
            {wizard.uploadedFile.name}
          </p>
          <p className={`${
            isDarkMode 
              ? 'text-purple-400' 
              : 'text-purple-700'
          }`}>
            {(wizard.uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Listo para procesar
          </p>
        </div>
      </div>
      
      {/* Botón de eliminar */}
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
          Volver a secciones
        </button>

        {wizard.uploadedFile && (
          <button
            onClick={() => wizard.processDocument(wizard.uploadedFile)} // ✅ usar wizard.uploadedFile, no state.uploadedFile
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
                PROCESAR
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
    <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkMode 
              ? 'bg-gradient-to-br from-indigo-700 to-purple-800' 
              : 'bg-gradient-to-br from-indigo-500 to-purple-600'
          }`}>
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Procesando con IA
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Extrayendo datos de forma inteligente
            </p>
          </div>
        </div>
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
            Analizando la póliza con IA..
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
      { id: 'observaciones', label: 'Observaciones', icon: FileCheck, color: 'indigo' }
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
        indigo: 'bg-indigo-700 text-white shadow-lg border-indigo-600', // 🆕 AGREGAR
      };
      return colors[color as keyof typeof colors] || colors.gray;
    } else {
      return 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700';
    }
  } else {
    const colors = {
      blue: isActive ? 'bg-blue-500 text-white shadow-lg' : 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      purple: isActive ? 'bg-purple-500 text-white shadow-lg' : 'bg-purple-50 text-purple-700 hover:bg-purple-100',
      green: isActive ? 'bg-green-500 text-white shadow-lg' : 'bg-green-50 text-green-700 hover:bg-green-100',
      orange: isActive ? 'bg-orange-500 text-white shadow-lg' : 'bg-orange-50 text-orange-700 hover:bg-orange-100',
      gray: isActive ? 'bg-gray-500 text-white shadow-lg' : 'bg-gray-50 text-gray-700 hover:bg-gray-100',
      indigo: isActive ? 'bg-indigo-500 text-white shadow-lg' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100', // 🆕 AGREGAR
    };
    return colors[color as keyof typeof colors] || colors.gray;
  }
};
  

    const renderTabContent = () => {
    switch (activeTab) {
case 'basicos':
  return (
    <div className="space-y-8">
      {/* Formulario unificado de datos básicos */}
      <div className={`rounded-2xl p-6 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 to-blue-900/20 border border-blue-800/50' 
          : 'bg-gradient-to-r from-blue-50 to-cyan-100'
      }`}>
        <h3 className={`text-xl font-bold flex items-center ${
          isDarkMode ? 'text-blue-300' : 'text-blue-900'
        } mb-6`}>
          <User className="w-6 h-6 mr-3" />
          Datos Básicos
        </h3>

        <div className="space-y-6">
          {/* Primera fila: Corredor y Asegurado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
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
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
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
          </div>

          {/* Segunda fila: Documento y Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
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
            
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              } mb-2`}>Tipo</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                    : 'bg-white border-blue-200 focus:ring-blue-100'
                }`}
              >
                <option value="" disabled>Seleccionar tipo</option>
                <option value="PERSONA">Líneas personales</option>
                <option value="EMPRESA">Líneas comerciales</option>
              </select>
            </div>
          </div>

          {/* Tercera fila: Dirección completa */}
          <div>
            <label className={`block text-sm font-bold ${
              isDarkMode ? 'text-blue-300' : 'text-blue-800'
            } mb-2`}>Dirección</label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                isDarkMode 
                  ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                  : 'bg-white border-blue-200 focus:ring-blue-100'
              }`}
              placeholder="Dirección completa"
            />
          </div>

          {/* Cuarta fila: Departamento y Localidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              } mb-2`}>Departamento</label>
              <input
                type="text"
                value={formData.departamento}
                onChange={(e) => setFormData(prev => ({ ...prev, departamento: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                    : 'bg-white border-blue-200 focus:ring-blue-100'
                }`}
                placeholder="Departamento"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              } mb-2`}>Localidad</label>
              <input
                type="text"
                value={formData.localidad}
                onChange={(e) => setFormData(prev => ({ ...prev, localidad: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                    : 'bg-white border-blue-200 focus:ring-blue-100'
                }`}
                placeholder="Localidad"
              />
            </div>
          </div>

          {/* Quinta fila: Teléfono y Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              } mb-2`}>
                <Phone className="w-4 h-4 inline mr-1" />
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                    : 'bg-white border-blue-200 focus:ring-blue-100'
                }`}
                placeholder="Número de teléfono"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              } mb-2`}>
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
                    : 'bg-white border-blue-200 focus:ring-blue-100'
                }`}
                placeholder="Correo electrónico"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

case 'poliza':
  return (
    <div className="space-y-8">
      {/* Formulario unificado de póliza */}
      <div className={`rounded-2xl p-6 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 to-purple-900/20 border border-purple-800/50' 
          : 'bg-gradient-to-r from-purple-50 to-indigo-100'
      }`}>
        <h3 className={`text-xl font-bold flex items-center ${
          isDarkMode ? 'text-purple-300' : 'text-purple-900'
        } mb-6`}>
          <FileText className="w-6 h-6 mr-3" />
          Datos de la Póliza
        </h3>

        <div className="space-y-6">
          {/* Primera fila: Número de Póliza, Certificado, Estado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-purple-300' : 'text-purple-800'
              } mb-2`}>Número de Póliza</label>
              <input
                type="text"
                value={formData.numeroPoliza}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroPoliza: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-purple-500 transition-all duration-200 shadow-sm ${
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
                isDarkMode ? 'text-purple-300' : 'text-purple-800'
              } mb-2`}>Certificado</label>
              <input
                type="text"
                value={formData.certificado || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, certificado: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-purple-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-purple-700/30 text-gray-100 focus:ring-purple-500/30' 
                    : 'bg-white border-purple-200 focus:ring-purple-100'
                }`}
                placeholder="Nº certificado"
              />
            </div>

            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-purple-300' : 'text-purple-800'
              } mb-2`}>Estado Póliza</label>
              <input
                type="text"
                value={formData.estadoPoliza}
                onChange={(e) => setFormData(prev => ({ ...prev, estadoPoliza: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-purple-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-purple-700/30 text-gray-100 focus:ring-purple-500/30' 
                    : 'bg-white border-purple-200 focus:ring-purple-100'
                }`}
                placeholder="Estado de la póliza"
              />
            </div>
          </div>

          {/* Segunda fila: Ramo, Plan/Cobertura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-purple-300' : 'text-purple-800'
              } mb-2`}>Ramo (Sección)</label>
              <input
                type="text"
                value={formData.ramo}
                onChange={(e) => setFormData(prev => ({ ...prev, ramo: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-purple-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-purple-700/30 text-gray-100 focus:ring-purple-500/30' 
                    : 'bg-white border-purple-200 focus:ring-purple-100'
                }`}
                placeholder="Ramo de seguro"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-purple-300' : 'text-purple-800'
              } mb-2`}>Plan/Cobertura</label>
              <input
                type="text"
                value={formData.plan}
                onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-purple-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-purple-700/30 text-gray-100 focus:ring-purple-500/30' 
                    : 'bg-white border-purple-200 focus:ring-purple-100'
                }`}
                placeholder="Plan o tipo de cobertura"
              />
            </div>
          </div>

          {/* Tercera fila: Corredor y Trámite */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-purple-300' : 'text-purple-800'
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
                placeholder="Corredor de seguros"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-purple-300' : 'text-purple-800'
              } mb-2`}>Trámite</label>
              <select
                value={formData.tramite}
                onChange={(e) => setFormData(prev => ({ ...prev, tramite: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-purple-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-purple-700/30 text-gray-100 focus:ring-purple-500/30' 
                    : 'bg-white border-purple-200 focus:ring-purple-100'
                }`}
              >
                <option value="" disabled>Seleccionar trámite</option>
                <option value="Nuevo">Nuevo</option>
                <option value="Renovación">Renovación</option>
                <option value="Endoso">Endoso</option>
                <option value="Anulación">Anulación</option>
              </select>
            </div>
          </div>

          {/* Cuarta fila: Vigencias y Compañía */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-purple-300' : 'text-purple-800'
              } mb-2`}>
                <Calendar className="w-4 h-4 inline mr-1" />
                Vigencia Desde
              </label>
              <input
                type="date"
                value={formData.vigenciaDesde}
                onChange={(e) => setFormData(prev => ({ ...prev, vigenciaDesde: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-purple-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-purple-700/30 text-gray-100 focus:ring-purple-500/30' 
                    : 'bg-white border-purple-200 focus:ring-purple-100'
                }`}
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-purple-300' : 'text-purple-800'
              } mb-2`}>
                <Calendar className="w-4 h-4 inline mr-1" />
                Vigencia Hasta
              </label>
              <input
                type="date"
                value={formData.vigenciaHasta}
                onChange={(e) => setFormData(prev => ({ ...prev, vigenciaHasta: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-purple-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-purple-700/30 text-gray-100 focus:ring-purple-500/30' 
                    : 'bg-white border-purple-200 focus:ring-purple-100'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-purple-300' : 'text-purple-800'
              } mb-2`}>
                <Building className="w-4 h-4 inline mr-1" />
                Compañía de Seguros
              </label>
                <input
                  type="text"
                  value={wizard.selectedCompany?.comnom || wizard.selectedCompany?.comalias || ''} // ✅ mostrar nombre de la compañía
                  onChange={(e) => {
                    // ✅ No permitir edición manual si hay compañía seleccionada
                    if (!wizard.selectedCompany) {
                      // Permitir búsqueda manual solo si no hay compañía seleccionada
                      console.warn('Selecciona una compañía desde el paso anterior');
                    }
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-purple-500 transition-all duration-200 shadow-sm ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-purple-700/30 text-gray-100 focus:ring-purple-500/30' 
                      : 'bg-white border-purple-200 focus:ring-purple-100'
                  } ${wizard.selectedCompany ? 'bg-green-50 cursor-not-allowed' : ''}`}
                  placeholder="Selecciona una compañía en el paso anterior"
                  readOnly={true} // ✅ siempre readonly - la compañía se selecciona en el step anterior
                  required
                />
            </div>
          </div>

          {/* 🎯 NUEVA SECCIÓN: CAMPOS MAPEADOS PARA VELNEO */}
          <div className={`mt-8 rounded-xl p-6 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-700 to-green-900/20 border border-green-800/50' 
              : 'bg-gradient-to-r from-green-50 to-emerald-100 border-2 border-green-200'
          }`}>
            <h4 className={`text-lg font-bold flex items-center ${
              isDarkMode ? 'text-green-300' : 'text-green-900'
            } mb-4`}>
              <CheckCircle className="w-5 h-5 mr-2" />
              Campos Mapeados para Velneo
              <span className="ml-2 text-sm font-normal opacity-75">
                (Detectados automáticamente)
              </span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Trámite Velneo */}
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode ? 'text-green-300' : 'text-green-800'
                } mb-2`}>
                  Trámite
                  <span className="ml-2 text-xs opacity-75">(CONTRA)</span>
                </label>
                <select
                  value={formData.tramiteVelneo || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, tramiteVelneo: e.target.value as VelneoTramite }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-green-500 transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-green-700/30 text-gray-100 focus:ring-green-500/30' 
                      : 'bg-white border-green-300 focus:ring-green-100'
                  }`}
                >
                  <option value="">Seleccionar trámite</option>
                  <option value="Nuevo">Nuevo (Emisión)</option>
                  <option value="Renovacion">Renovación</option>
                  <option value="Cambio">Cambio/Modificación</option>
                  <option value="Endoso">Endoso</option>
                  <option value="No Renueva">No Renueva</option>
                  <option value="Cancelacion">Cancelación</option>
                </select>
              </div>

              {/* Estado Póliza Velneo */}
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode ? 'text-green-300' : 'text-green-800'
                } mb-2`}>
                  Estado Póliza
                  <span className="ml-2 text-xs opacity-75">(CONVIG)</span>
                </label>
                <select
                  value={formData.estadoPolizaVelneo || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, estadoPolizaVelneo: e.target.value as VelneoEstadoPoliza }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-green-500 transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-green-700/30 text-gray-100 focus:ring-green-500/30' 
                      : 'bg-white border-green-300 focus:ring-green-100'
                  }`}
                >
                  <option value="">Seleccionar estado</option>
                  <option value="VIG">VIG - Vigente</option>
                  <option value="VEN">VEN - Vencida</option>
                  <option value="END">END - Endosada</option>
                  <option value="CAN">CAN - Cancelada</option>
                  <option value="ANT">ANT - Antecedente</option>
                </select>
              </div>

              {/* Forma de Pago Velneo */}
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode ? 'text-green-300' : 'text-green-800'
                } mb-2`}>
                  Forma de Pago
                  <span className="ml-2 text-xs opacity-75">(CONSTA)</span>
                </label>
                <select
                  value={formData.formaPagoVelneo || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, formaPagoVelneo: e.target.value as VelneoFormaPago }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-green-500 transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-green-700/30 text-gray-100 focus:ring-green-500/30' 
                      : 'bg-white border-green-300 focus:ring-green-100'
                  }`}
                >
                  <option value="">Seleccionar forma de pago</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta Cred.">Tarjeta de Crédito</option>
                  <option value="Débito Banc.">Débito Bancario</option>
                  <option value="Transferencia bancaria">Transferencia Bancaria</option>
                  <option value="Cheque directo">Cheque Directo</option>
                  <option value="Cobrador">Cobrador</option>
                  <option value="Conforme">Conforme</option>
                  <option value="Pass Card">Pass Card</option>
                </select>
              </div>

              {/* Moneda Velneo */}
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode ? 'text-green-300' : 'text-green-800'
                } mb-2`}>
                  Moneda
                  <span className="ml-2 text-xs opacity-75">(MONCOD)</span>
                </label>
                <select
                  value={formData.monedaVelneo || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, monedaVelneo: e.target.value as VelneoMoneda }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-green-500 transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-green-700/30 text-gray-100 focus:ring-green-500/30' 
                      : 'bg-white border-green-300 focus:ring-green-100'
                  }`}
                >
                  <option value="">Seleccionar moneda</option>
                  <option value="PES">PES - Pesos Uruguayos</option>
                  <option value="DOL">DOL - Dólares</option>
                  <option value="EU">EU - Euros</option>
                  <option value="RS">RS - Reales</option>
                  <option value="UF">UF - Unidad de Fomento</option>
                </select>
              </div>
            </div>

            {/* Indicador de Mapeo Automático */}
            <div className={`mt-4 p-3 rounded-lg ${
              isDarkMode 
                ? 'bg-green-900/30 border border-green-800/50' 
                : 'bg-green-100 border border-green-300'
            }`}>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                <span className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                  Campos mapeados automáticamente desde Azure Document Intelligence. 
                  Puedes modificarlos si es necesario antes de enviar a Velneo.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

case 'vehiculo':
  return (
    <div className="space-y-8">
      {/* Formulario unificado de vehículo */}
      <div className={`rounded-2xl p-6 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 to-emerald-900/20 border border-emerald-800/50' 
          : 'bg-gradient-to-r from-green-50 to-emerald-100'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-bold flex items-center ${
            isDarkMode ? 'text-emerald-300' : 'text-green-900'
          }`}>
            <Car className="w-6 h-6 mr-3" />
            Información del Vehículo
          </h3>
          
          {velneoEntities.hasErrors && (
            <button
              onClick={velneoEntities.refresh}
              className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                isDarkMode 
                  ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              } transition-colors`}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reintentar
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Descripción completa del vehículo */}
          <div>
            <label className={`block text-sm font-bold ${
              isDarkMode ? 'text-emerald-300' : 'text-green-800'
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

          {/* Primera fila: Marca, Modelo, Año, Matrícula */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-emerald-300' : 'text-green-800'
              } mb-2`}>Marca</label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                    : 'bg-white border-green-200 focus:ring-green-100'
                }`}
                placeholder="Marca del vehículo"
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-emerald-300' : 'text-green-800'
              } mb-2`}>Modelo</label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                    : 'bg-white border-green-200 focus:ring-green-100'
                }`}
                placeholder="Modelo del vehículo"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-emerald-300' : 'text-green-800'
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
                isDarkMode ? 'text-emerald-300' : 'text-green-800'
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

          {/* Segunda fila: Motor, Chasis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-emerald-300' : 'text-green-800'
              } mb-2`}>Motor</label>
              <input
                type="text"
                value={formData.motor}
                onChange={(e) => setFormData(prev => ({ ...prev, motor: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm font-mono ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                    : 'bg-white border-green-200 focus:ring-green-100'
                }`}
                placeholder="Número de motor"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-emerald-300' : 'text-green-800'
              } mb-2`}>Chasis</label>
              <input
                type="text"
                value={formData.chasis}
                onChange={(e) => setFormData(prev => ({ ...prev, chasis: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm font-mono ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                    : 'bg-white border-green-200 focus:ring-green-100'
                }`}
                placeholder="Número de chasis"
              />
            </div>
          </div>

          {/* Tercera fila: Combos de Velneo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Combustible */}
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-emerald-300' : 'text-green-800'
              } mb-2`}>
                Combustible
                {velneoEntities.loading.combustibles && <Loader2 className="w-4 h-4 ml-2 inline animate-spin" />}
              </label>
              
              <select
                value={formData.combustibleId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, combustibleId: e.target.value || null }))}
                disabled={velneoEntities.loading.combustibles}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                    : 'bg-white border-green-200 focus:ring-green-100'
                } ${velneoEntities.loading.combustibles ? 'opacity-50 cursor-not-allowed' : ''} ${
                  velneoEntities.errors.combustibles ? 'border-red-500' : ''
                }`}
              >
                <option value="" disabled>
                  {velneoEntities.loading.combustibles ? 'Cargando...' : 'Seleccionar combustible'}
                </option>
                {!velneoEntities.loading.combustibles && velneoEntities.combustibles.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              
              {velneoEntities.errors.combustibles && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {velneoEntities.errors.combustibles}
                </p>
              )}
            </div>

            {/* Destino */}
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-emerald-300' : 'text-green-800'
              } mb-2`}>
                Destino
                {velneoEntities.loading.destinos && <Loader2 className="w-4 h-4 ml-2 inline animate-spin" />}
              </label>
              
              <select
                value={formData.destinoId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, destinoId: e.target.value ? Number(e.target.value) : null }))}
                disabled={velneoEntities.loading.destinos}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                    : 'bg-white border-green-200 focus:ring-green-100'
                } ${velneoEntities.loading.destinos ? 'opacity-50 cursor-not-allowed' : ''} ${
                  velneoEntities.errors.destinos ? 'border-red-500' : ''
                }`}
              >
                <option value="" disabled>
                  {velneoEntities.loading.destinos ? 'Cargando...' : 'Seleccionar destino'}
                </option>
                {!velneoEntities.loading.destinos && velneoEntities.destinos.map(option => (
                  <option key={option.id} value={option.id}>
                    {`${option.desnom} (${option.descod})`}
                  </option>
                ))}
              </select>
              
              {velneoEntities.errors.destinos && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {velneoEntities.errors.destinos}
                </p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-emerald-300' : 'text-green-800'
              } mb-2`}>
                Categoría
                {velneoEntities.loading.categorias && <Loader2 className="w-4 h-4 ml-2 inline animate-spin" />}
              </label>
              
              <select
                value={formData.categoriaId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, destinoId: e.target.value ? Number(e.target.value) : null }))}
                disabled={velneoEntities.loading.categorias}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                    : 'bg-white border-green-200 focus:ring-green-100'
                } ${velneoEntities.loading.categorias ? 'opacity-50 cursor-not-allowed' : ''} ${
                  velneoEntities.errors.categorias ? 'border-red-500' : ''
                }`}
              >
                <option value="" disabled>
                  {velneoEntities.loading.categorias ? 'Cargando...' : 'Seleccionar categoría'}
                </option>
                {!velneoEntities.loading.categorias && velneoEntities.categorias.map(option => (
                  <option key={option.id} value={option.id}>
                    {`${option.catdsc} (${option.catcod})`}
                  </option>
                ))}
              </select>
              
              {velneoEntities.errors.categorias && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {velneoEntities.errors.categorias}
                </p>
              )}
            </div>

            {/* Calidad */}
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-emerald-300' : 'text-green-800'
              } mb-2`}>
                Calidad
                {velneoEntities.loading.calidades && <Loader2 className="w-4 h-4 ml-2 inline animate-spin" />}
              </label>
              
              <select
                value={formData.calidadId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, calidadId: e.target.value ? Number(e.target.value) : null }))}
                disabled={velneoEntities.loading.calidades}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-green-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-emerald-700/30 text-gray-100 focus:ring-green-500/30' 
                    : 'bg-white border-green-200 focus:ring-green-100'
                } ${velneoEntities.loading.calidades ? 'opacity-50 cursor-not-allowed' : ''} ${
                  velneoEntities.errors.calidades ? 'border-red-500' : ''
                }`}
                required
              >
                <option value="" disabled>
                  {velneoEntities.loading.calidades ? 'Cargando...' : 'Seleccionar calidad'}
                </option>
                {!velneoEntities.loading.calidades && velneoEntities.calidades.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.caldsc || option.calcod}
                  </option>
                ))}
              </select>
              
              {velneoEntities.errors.calidades && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {velneoEntities.errors.calidades}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Panel de valores escaneados - ANCHO COMPLETO */}
      <ScannedValuesPanel 
        scannedData={wizard.extractedData?.datosVelneo}
        isDarkMode={isDarkMode}
      />

      {/* Indicador de carga - solo cuando está cargando */}
      {!velneoEntities.isAllLoaded && (
        <div className={`rounded-xl p-4 ${
          isDarkMode 
            ? 'bg-blue-900/20 border border-blue-800/30' 
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin text-blue-500" />
            <span className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              Cargando opciones desde Velneo...
            </span>
          </div>
        </div>
      )}
    </div>
  );


case 'pago':
  return (
    <div className="space-y-8">
      {/* Formulario unificado de condiciones de pago */}
      <div className={`rounded-2xl p-6 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 to-orange-900/20 border border-orange-800/50' 
          : 'bg-gradient-to-r from-orange-50 to-yellow-100'
      }`}>
        <h3 className={`text-xl font-bold flex items-center ${
          isDarkMode ? 'text-orange-300' : 'text-orange-900'
        } mb-6`}>
          <DollarSign className="w-6 h-6 mr-3" />
          Condiciones de Pago
        </h3>

        <div className="space-y-6">
          {/* Primera fila: Importes principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-orange-300' : 'text-orange-800'
              } mb-2`}>Prima *</label>
              <div className="relative">
                <span className={`absolute left-4 top-3 font-bold text-lg ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
                }`}>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.prima}
                  onChange={(e) => setFormData(prev => ({ ...prev, prima: parseFloat(e.target.value) || 0 }))}
                  className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-orange-500 transition-all duration-200 shadow-sm text-lg font-bold ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-orange-700/30 text-gray-100 focus:ring-orange-500/30' 
                      : 'bg-white border-orange-200 focus:ring-orange-100'
                  }`}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-orange-300' : 'text-orange-800'
              } mb-2`}>Prima Comercial</label>
              <div className="relative">
                <span className={`absolute left-4 top-3 font-bold text-lg ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
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
                isDarkMode ? 'text-orange-300' : 'text-orange-800'
              } mb-2`}>Premio Total</label>
              <div className="relative">
                <span className={`absolute left-4 top-3 font-bold text-lg ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
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
          </div>

          {/* Segunda fila: Forma de pago, Moneda, Cantidad de cuotas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-orange-300' : 'text-orange-800'
              } mb-2`}>
                <CreditCard className="w-4 h-4 inline mr-1" />
                Forma de Pago
              </label>
              <input
                type="text"
                value={formData.formaPago}
                onChange={(e) => setFormData(prev => ({ ...prev, formaPago: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-orange-500 transition-all duration-200 shadow-sm ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-orange-700/30 text-gray-100 focus:ring-orange-500/30' 
                    : 'bg-white border-orange-200 focus:ring-orange-100'
                }`}
                placeholder="Ej: TARJETA DE CRÉDITO"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-orange-300' : 'text-orange-800'
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
                <option value="" disabled>Seleccionar moneda</option>
                <option value="UYU">🇺🇾 Peso Uruguayo (UYU)</option>
                <option value="USD">🇺🇸 Dólar Americano (USD)</option>
                <option value="UI">📊 Unidades Indexadas (UI)</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-orange-300' : 'text-orange-800'
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
                placeholder="1"
              />
            </div>
          </div>

          {/* Tercera fila: Valor por cuota */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-bold ${
                isDarkMode ? 'text-orange-300' : 'text-orange-800'
              } mb-2`}>Valor por Cuota</label>
              <div className="relative">
                <span className={`absolute left-4 top-3 font-bold text-lg ${
                  isDarkMode ? 'text-orange-400' : 'text-orange-600'
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
            
            {/* Espacios vacíos para mantener la grilla */}
            <div></div>
            <div></div>
          </div>

          {/* Card especial para Primera Cuota */}
          <div className={`rounded-xl p-4 ${
            isDarkMode 
              ? 'bg-gray-700/50 border border-orange-700/30' 
              : 'bg-white border-2 border-orange-200'
          }`}>
            <h4 className={`font-bold mb-4 flex items-center ${
              isDarkMode ? 'text-orange-300' : 'text-orange-800'
            }`}>
              <Calendar className="w-5 h-5 mr-2" />
              Primera Cuota
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode ? 'text-orange-300' : 'text-orange-700'
                } mb-2`}>Fecha de Vencimiento</label>
                <input
                  type="date"
                  value={formData.primeraCuotaFecha}
                  onChange={(e) => setFormData(prev => ({ ...prev, primeraCuotaFecha: e.target.value }))}
                  className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:border-orange-500 ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-orange-700/30 text-gray-100 focus:ring-orange-500/30' 
                      : 'bg-white border-orange-300 focus:ring-orange-100'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-bold ${
                  isDarkMode ? 'text-orange-300' : 'text-orange-700'
                } mb-2`}>Monto</label>
                <div className="relative">
                  <span className={`absolute left-3 top-2 font-bold ${
                    isDarkMode ? 'text-orange-400' : 'text-orange-500'
                  }`}>$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.primeraCuotaMonto}
                    onChange={(e) => setFormData(prev => ({ ...prev, primeraCuotaMonto: parseFloat(e.target.value) || 0 }))}
                    className={`w-full pl-8 pr-3 py-2 border-2 rounded-lg focus:ring-2 focus:border-orange-500 font-bold ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-orange-700/30 text-gray-100 focus:ring-orange-500/30' 
                        : 'bg-white border-orange-300 focus:ring-orange-100'
                    }`}
                    placeholder="0.00"
                  />
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
      {/* Formulario unificado de observaciones */}
      <div className={`rounded-2xl p-6 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-800 to-indigo-900/20 border border-indigo-800/50' 
          : 'bg-gradient-to-r from-indigo-50 to-purple-100'
      }`}>
        <h3 className={`text-xl font-bold flex items-center ${
          isDarkMode ? 'text-indigo-300' : 'text-indigo-900'
        } mb-6`}>
          <FileText className="w-6 h-6 mr-3" />
          Observaciones y Notas
        </h3>

        <div className="space-y-6">
          {/* Campo principal de observaciones */}
          <div>
            <label className={`block text-sm font-bold ${
              isDarkMode ? 'text-indigo-300' : 'text-indigo-800'
            } mb-2`}>
              Observaciones Generales
              <span className="text-xs font-normal ml-2 opacity-75">
                (Generadas automáticamente - Puedes editarlas)
              </span>
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              rows={12}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-indigo-500 transition-all duration-200 shadow-sm resize-y ${
                isDarkMode 
                  ? 'bg-gray-700/50 border-indigo-700/30 text-gray-100 focus:ring-indigo-500/30' 
                  : 'bg-white border-indigo-200 focus:ring-indigo-100'
              }`}
              placeholder="Aquí aparecerán las observaciones generadas automáticamente del procesamiento del PDF. Puedes agregar notas adicionales o modificar el contenido según sea necesario..."
            />
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
            onClick={async () => {
              console.log('🔥 BOTÓN CREAR PÓLIZA CLICKEADO - PolizaWizard.tsx');
              setSaving(true);
              try {
                console.log('💾 Creando póliza con datos:', formData);
                const contratoVelneo = prepararDatosParaVelneo();
                console.log('📋 Datos preparados para Velneo:', contratoVelneo);
                
                // 🚀 OPCIÓN A: Enviar directamente a tu endpoint Velneo
                console.log('🚀 Enviando a Velneo...');
                
                const token = localStorage.getItem('authToken');
                
                const response = await fetch(`${import.meta.env.VITE_API_URL}/polizas`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(contratoVelneo)
                });
                
                if (response.ok) {
                  const result = await response.json();
                  console.log('✅ Póliza enviada exitosamente a Velneo:', result);
                  
                  // Continuar con el flujo del wizard
                  await wizard.createPoliza(formData);
                  console.log('✅ Proceso completado, ir a success');
                } else {
                  const error = await response.json();
                  console.error('❌ Error enviando a Velneo:', error);
                  throw new Error(`Error en Velneo: ${error.message}`);
                }
                
              } catch (error: any) {
                console.error('❌ Error creando póliza:', error);
                wizard.setError(`Error: ${error.message}`);
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

  const renderCurrentStep = () => {
    switch (wizard.currentStep) {
      case 'cliente': return renderClienteStep();
      case 'company': return renderCompanyStep();
      case 'operacion': return renderOperacionStep();
      case 'seccion': return renderSeccionStep();
      case 'upload': return renderUploadStep();
      case 'extract': return renderExtractStep();
      case 'form': return renderFormStep();
      case 'success': return renderSuccessStep();
      default: return renderClienteStep();
    }
  };

  const validateForm = (): boolean => {
  const errors: string[] = [];
  
  if (!formData.numeroPoliza.trim()) errors.push('Número de póliza es requerido');
  if (!formData.vigenciaDesde) errors.push('Fecha de vigencia desde es requerida');
  if (!formData.vigenciaHasta) errors.push('Fecha de vigencia hasta es requerida');
  if (!formData.asegurado.trim()) errors.push('Asegurado es requerido');
  if (!formData.cobertura.trim()) errors.push('Cobertura es requerida');
  if (!formData.compania) errors.push('Debe seleccionar una compañía');
  if (!formData.clienteId) errors.push('Debe seleccionar un cliente');
  if (!formData.seccionId) errors.push('Debe seleccionar una sección');
  
  if (errors.length > 0) {
    console.error('Errores de validación:', errors);
    wizard.setError(errors.join(', '));
    return false;
  }
  
  return true;
};

const getEstadoAutoFromOperacion = (operacion?: string): string => {
  switch (operacion) {
    case 'EMISION':
      return 'VIG'; // Nueva póliza = Vigente
    case 'RENOVACION':
      return 'VIG'; // Renovación = Vigente
    case 'ENDOSO':
      return 'END'; // Endoso = Endosada
    case 'CAMBIO':
      return 'VIG'; // Cambio = Vigente
    default:
      return '';
  }
};

// Función para obtener el nombre legible de la operación
const getOperacionDisplayName = (operacion?: string): string => {
  switch (operacion) {
    case 'EMISION':
      return 'EMISIÓN';
    case 'RENOVACION':
      return 'RENOVACIÓN';
    case 'ENDOSO':
      return 'ENDOSO';
    case 'CAMBIO':
      return 'CAMBIO';
    default:
      return operacion || '';
  }
};

const getEstadoDisplayName = (estado?: string): string => {
  switch (estado) {
    case 'VIG':
      return 'VIG (Vigente)';
    case 'END':
      return 'END (Endosada)';
    case 'VTO':
      return 'VTO (Vencida)';
    case 'ANU':
      return 'ANU (Anulada)';
    case 'SUS':
      return 'SUS (Suspendida)';
    case 'REN':
      return 'REN (Renovada)';
    case 'CAN':
      return 'CAN (Cancelada)';
    default:
      return estado || '';
  }
};

const getTramiteAutoFromOperacion = (operacion?: string): string => {
  switch (operacion) {
    case 'EMISION':
      return 'Nuevo';
    case 'RENOVACION':
      return 'Renovacion';
    case 'ENDOSO':
      return 'Endoso';
    case 'CAMBIO':
      return 'Cambio';
    default:
      return '';
  }
};

  const getStepNumber = (step: any): number => {
    const stepOrder = ['cliente', 'company', 'seccion', 'operacion', 'upload', 'extract', 'form', 'success'];
    return stepOrder.indexOf(step) + 1;
  };

const prepararDatosParaVelneo = (): PolizaCreateRequest => {
  console.log('📋 Preparando datos para envío a Velneo...');
  console.log('🔍 FormData actual:', formData);
  console.log('🏢 Compañía seleccionada:', wizard.selectedCompany);
  console.log('👤 Cliente seleccionado:', wizard.selectedCliente);
  console.log('📑 Sección seleccionada:', wizard.selectedSeccion);
  
  // Validaciones básicas
  if (!wizard.selectedCompany?.id) {
    throw new Error('Compañía no seleccionada');
  }
  if (!wizard.selectedCliente?.id) {
    throw new Error('Cliente no seleccionado');
  }
  if (!wizard.selectedSeccion?.id) {
    throw new Error('Sección no seleccionada');
  }
  if (!formData.numeroPoliza) {
    throw new Error('Número de póliza requerido');
  }
  
  // Crear input para mapeo final
  const inputMapeo: VelneoMappingInput = {
    tramiteTexto: formData.tramiteVelneo || formData.tramite || '',
    estadoTexto: formData.estadoGestionVelneo || '', 
    estadoPolizaTexto: formData.estadoPolizaVelneo || formData.estadoPoliza || '',
    formaPagoTexto: formData.formaPagoVelneo || formData.formaPago || '',
    monedaTexto: formData.monedaVelneo || formData.moneda || '',
    fechaVencimiento: formData.vigenciaHasta ? new Date(formData.vigenciaHasta) : undefined,
    fuenteDatos: 'formulario'
  };
  
  // Mapear campos
  const camposMapeados = VelneoMapper.mapearCamposCompletos(inputMapeo);
  console.log('🎯 Campos mapeados:', camposMapeados);
  
  if (camposMapeados.warnings.length > 0) {
    console.warn('⚠️ Advertencias del mapeo:', camposMapeados.warnings);
  }
  
  // Construir el objeto para Velneo
  const contratoVelneo: PolizaCreateRequest = {
    comcod: Number(wizard.selectedCompany.id),
    clinro: Number(wizard.selectedCliente.id),
    seccod: Number(wizard.selectedSeccion.id),
    
    // ✅ DATOS BÁSICOS DE LA PÓLIZA
    conpol: formData.numeroPoliza,
    conend: formData.certificado || '0',
    confchdes: formData.vigenciaDesde,
    confchhas: formData.vigenciaHasta,
    conpremio: Number(formData.prima || 0),
    contot: Number(formData.premioTotal || formData.prima || 0),
    concuo: Number(formData.cantidadCuotas || 1),
    
    // ✅ CAMPO ASEGURADO REQUERIDO - USAR CLIENTE SELECCIONADO
    asegurado: formData.asegurado || wizard.selectedCliente?.clinom || '',
    
    // ✅ CAMPOS VELNEO MAPEADOS
    contra: camposMapeados.campos.tramite,
    congeses: camposMapeados.campos.estadoGestion,
    convig: camposMapeados.campos.estadoPoliza,
    consta: camposMapeados.campos.formaPago,

    congesti: '1', // Tipo de gestión fijo
    
    // ✅ DATOS DEL CLIENTE/ASEGURADO
    condom: formData.direccion || wizard.selectedCliente?.clidir || '',
    clinom: formData.asegurado || wizard.selectedCliente?.clinom || '',
    
    // ✅ DATOS DEL VEHÍCULO
    conmaraut: formData.marca || '',
    conanioaut: Number(formData.anio) || new Date().getFullYear(),
    conmataut: formData.matricula || '',
    conchasis: formData.chasis || '',
    conmotor: formData.motor || '',
    
    // ✅ DATOS CATEGORIZADOS DEL VEHÍCULO (convertir a números si existen)
    catdsc: formData.categoriaId ? Number(formData.categoriaId) : undefined,
    desdsc: formData.destinoId ? Number(formData.destinoId) : undefined,
    caldsc: formData.calidadId ? Number(formData.calidadId) : undefined,
    
    // ✅ METADATOS Y AUDITORÍA
    observaciones: formData.observaciones,
    conges: 'SISTEMA_AUTO',
    congesfi: new Date(),
    ingresado: new Date(),
    last_update: new Date(),
    
    // ✅ CAMPOS ADICIONALES
    ramo: formData.ramo || 'AUTOMOVILES',
    com_alias: wizard.selectedCompany.comnom || wizard.selectedCompany.comalias || '',
    combustibles: formData.combustible || 'NAFTA',
    primaComercial: Number(formData.primaComercial || 0),
    
    // ✅ AGREGAR MÁS DATOS DEL CLIENTE SI ESTÁN DISPONIBLES
    documento: formData.documento || wizard.selectedCliente?.cliced || wizard.selectedCliente?.cliruc || '',
    email: formData.email || wizard.selectedCliente?.cliemail || '',
    telefono: formData.telefono || wizard.selectedCliente?.telefono || '',
    direccion: formData.direccion || wizard.selectedCliente?.clidir || '',
    
    // ✅ CAMPOS DE PROCESAMIENTO
    documentoId: wizard.extractedData?.documentId,
    archivoOriginal: wizard.uploadedFile?.name,
    procesadoConIA: true
  };
  
  console.log('✅ Contrato Velneo preparado:', contratoVelneo);
  return contratoVelneo;
};

  return (
    <div className={`min-h-screen ${getBgClass()}`}>
      {/* NUEVO HEADER FLOTANTE - reemplaza el header anterior */}
      <FloatingWizardHeader 
        currentStep={wizard.currentStep}
        isDarkMode={isDarkMode}
        onCancel={onCancel}
      />

      {/* Contenido principal */}
      <div className="pt-2">
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