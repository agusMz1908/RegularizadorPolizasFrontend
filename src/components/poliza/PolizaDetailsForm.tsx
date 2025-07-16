import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  User, 
  Car, 
  CreditCard, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Building, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Info,
  Edit3,
  Save,
  X
} from 'lucide-react';

interface PolizaDetailsFormProps {
  datos?: any; // Los datos reales que vienen de tu API
  onSave?: (datos: any) => void;
  onCancel?: () => void;
  onSendToVelneo?: (datos: any) => void;
}

const PolizaDetailsForm: React.FC<PolizaDetailsFormProps> = ({ 
  datos: datosOriginales = null,
  onSave,
  onCancel,
  onSendToVelneo
}) => {
  const [datos, setDatos] = useState(datosOriginales);
  const [editando, setEditando] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('poliza');

  // Actualizar datos cuando cambien las props
  useEffect(() => {
    if (datosOriginales) {
      setDatos(datosOriginales);
    }
  }, [datosOriginales]);

  const actualizarCampo = (campo: string, valor: string | number) => {
    setDatos((prev: { datosFormateados: any; }) => ({
      ...prev,
      datosFormateados: {
        ...prev?.datosFormateados,
        [campo]: valor
      }
    }));
  };

  const handleSave = () => {
    setEditando(false);
    if (onSave) {
      onSave(datos);
    }
  };

  const handleSendToVelneo = () => {
    if (onSendToVelneo) {
      onSendToVelneo(datos);
    }
  };

  const formatearMoneda = (valor: number | bigint) => {
    if (!valor && valor !== 0) return '-';
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 2
    }).format(valor);
  };

  const formatearFecha = (fecha: string | number | Date) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-UY');
  };

  const getConfianzaColor = (confianza: number) => {
    if (!confianza) return 'text-gray-600 bg-gray-50';
    if (confianza >= 90) return 'text-green-600 bg-green-50';
    if (confianza >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const secciones = [
    { id: 'poliza', nombre: 'Póliza', icono: FileText },
    { id: 'cliente', nombre: 'Cliente', icono: User },
    { id: 'vehiculo', nombre: 'Vehículo', icono: Car },
    { id: 'financiero', nombre: 'Financiero', icono: CreditCard },
    { id: 'corredor', nombre: 'Corredor', icono: Building }
  ];

  // Si no hay datos, mostrar mensaje
  if (!datos) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-white">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos de póliza</h3>
          <p className="text-gray-500">Escanee un documento para ver la información extraída aquí.</p>
        </div>
      </div>
    );
  }

  const datosFormateados = datos.datosFormateados || {};
  const resumen = datos.resumen || {};

  const renderSeccionPoliza = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de Póliza</label>
          <div className="flex">
            <input
              type="text"
              value={datosFormateados.numeroPoliza || ''}
              onChange={(e) => actualizarCampo('numeroPoliza', e.target.value)}
              disabled={!editando}
              className={`flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
              placeholder="No detectado"
            />
            {datosFormateados.numeroPoliza && (
              <div className="bg-green-50 border border-l-0 border-green-200 px-3 py-3 rounded-r-lg">
                <span className="text-green-600 text-sm font-medium">✓</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vigencia Desde</label>
          <input
            type="date"
            value={datosFormateados.vigenciaDesde ? datosFormateados.vigenciaDesde.split('T')[0] : ''}
            onChange={(e) => actualizarCampo('vigenciaDesde', e.target.value)}
            disabled={!editando}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vigencia Hasta</label>
          <input
            type="date"
            value={datosFormateados.vigenciaHasta ? datosFormateados.vigenciaHasta.split('T')[0] : ''}
            onChange={(e) => actualizarCampo('vigenciaHasta', e.target.value)}
            disabled={!editando}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
          <input
            type="text"
            value={datosFormateados.plan || ''}
            onChange={(e) => actualizarCampo('plan', e.target.value)}
            disabled={!editando}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
            placeholder="No detectado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ramo</label>
          <input
            type="text"
            value={datosFormateados.ramo || ''}
            onChange={(e) => actualizarCampo('ramo', e.target.value)}
            disabled={!editando}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
            placeholder="No detectado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
          <input
            type="text"
            value={datosFormateados.anio || ''}
            onChange={(e) => actualizarCampo('anio', e.target.value)}
            disabled={!editando}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
            placeholder="No detectado"
          />
        </div>
      </div>
    </div>
  );

  const renderSeccionCliente = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Asegurado</label>
          <div className="flex">
            <input
              type="text"
              value={datosFormateados.asegurado || ''}
              onChange={(e) => actualizarCampo('asegurado', e.target.value)}
              disabled={!editando}
              className={`flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
              placeholder="No detectado"
            />
            {!datosFormateados.asegurado && (
              <div className="bg-red-50 border border-l-0 border-red-200 px-3 py-3 rounded-r-lg">
                <span className="text-red-600 text-sm font-medium">Requiere revisión</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
          <input
            type="text"
            value={datosFormateados.documento || ''}
            onChange={(e) => actualizarCampo('documento', e.target.value)}
            disabled={!editando}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
            placeholder="No detectado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="flex">
            <Mail className="w-5 h-5 text-gray-400 mt-3.5 ml-3 absolute" />
            <input
              type="email"
              value={datosFormateados.email || ''}
              onChange={(e) => actualizarCampo('email', e.target.value)}
              disabled={!editando}
              className={`w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
              placeholder="No detectado"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <div className="flex">
            <MapPin className="w-5 h-5 text-gray-400 mt-3.5 ml-3 absolute" />
            <input
              type="text"
              value={datosFormateados.direccion || ''}
              onChange={(e) => actualizarCampo('direccion', e.target.value)}
              disabled={!editando}
              className={`w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
              placeholder="No detectado"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
          <input
            type="text"
            value={datosFormateados.localidad || ''}
            onChange={(e) => actualizarCampo('localidad', e.target.value)}
            disabled={!editando}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
            placeholder="No detectado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
          <input
            type="text"
            value={datosFormateados.departamento || ''}
            onChange={(e) => actualizarCampo('departamento', e.target.value)}
            disabled={!editando}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
            placeholder="No detectado"
          />
        </div>
      </div>
    </div>
  );

  const renderSeccionVehiculo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del Vehículo</label>
          <div className="flex">
            <input
              type="text"
              value={datosFormateados.vehiculo || ''}
              onChange={(e) => actualizarCampo('vehiculo', e.target.value)}
              disabled={!editando}
              className={`flex-1 p-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
              placeholder="No detectado"
            />
            {datosFormateados.vehiculo && (
              <div className="bg-green-50 border border-l-0 border-green-200 px-3 py-3 rounded-r-lg">
                <span className="text-green-600 text-sm font-medium">✓</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
          <input
            type="text"
            value={datosFormateados.marca || ''}
            onChange={(e) => actualizarCampo('marca', e.target.value)}
            disabled={!editando}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
            placeholder="No detectado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
          <input
            type="text"
            value={datosFormateados.modelo || ''}
            onChange={(e) => actualizarCampo('modelo', e.target.value)}
            disabled={!editando}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
            placeholder="No detectado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Motor</label>
          <input
            type="text"
            value={datosFormateados.motor || ''}
            onChange={(e) => actualizarCampo('motor', e.target.value)}
            disabled={!editando}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
            placeholder="No detectado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chasis</label>
          <input
            type="text"
            value={datosFormateados.chasis || ''}
            onChange={(e) => actualizarCampo('chasis', e.target.value)}
            disabled={!editando}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
            placeholder="No detectado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
          <input
            type="text"
            value={datosFormateados.matricula || ''}
            onChange={(e) => actualizarCampo('matricula', e.target.value)}
            disabled={!editando}
            placeholder="No detectado"
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
          />
        </div>
      </div>
    </div>
  );

  const renderSeccionFinanciero = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prima Comercial</label>
          <input
            type="number"
            value={datosFormateados.primaComercial || ''}
            onChange={(e) => actualizarCampo('primaComercial', parseFloat(e.target.value))}
            disabled={!editando}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
            placeholder="0"
          />
          <div className="text-sm text-gray-500 mt-1">{formatearMoneda(datosFormateados.primaComercial)}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Premio Total</label>
          <input
            type="number"
            value={datosFormateados.premioTotal || ''}
            onChange={(e) => actualizarCampo('premioTotal', parseFloat(e.target.value))}
            disabled={!editando}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
            placeholder="0"
          />
          <div className="text-sm text-green-600 font-medium mt-1">{formatearMoneda(datosFormateados.premioTotal)}</div>
        </div>
      </div>
    </div>
  );

  const renderSeccionCorreder = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Corredor</label>
          <input
            type="text"
            value={datosFormateados.corredor || ''}
            onChange={(e) => actualizarCampo('corredor', e.target.value)}
            disabled={!editando}
            className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!editando ? 'bg-gray-50' : ''}`}
            placeholder="No detectado"
          />
        </div>
      </div>
    </div>
  );

  const renderContenidoSeccion = () => {
    switch (seccionActiva) {
      case 'poliza': return renderSeccionPoliza();
      case 'cliente': return renderSeccionCliente();
      case 'vehiculo': return renderSeccionVehiculo();
      case 'financiero': return renderSeccionFinanciero();
      case 'corredor': return renderSeccionCorreder();
      default: return renderSeccionPoliza();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Información Extraída de Póliza</h1>
          <p className="text-gray-600 mt-1">
            Archivo: <span className="font-medium">{datos.archivo || 'Sin archivo'}</span>
            {datos.tiempoProcesamiento && (
              <> • Procesado en {(datos.tiempoProcesamiento / 1000).toFixed(1)}s</>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Estado del procesamiento */}
          {datos.estado && (
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">{datos.estado}</span>
            </div>
          )}
          
          {/* Botón de edición */}
          <button
            onClick={() => editando ? handleSave() : setEditando(true)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              editando 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {editando ? (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Editar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Métricas de calidad */}
      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Campos Completos</p>
                <p className="text-2xl font-bold text-blue-900">{datosFormateados.camposCompletos || 0}</p>
              </div>
              <Info className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">% Completitud</p>
                <p className="text-2xl font-bold text-green-900">{resumen.porcentajeCompletitud || 0}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Estado</p>
                <p className="text-sm font-bold text-purple-900">{resumen.estadoGeneral || 'Sin procesar'}</p>
              </div>
              <Settings className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Listo para Velneo</p>
                <p className="text-sm font-bold text-yellow-900">{datos.listoParaVelneo ? 'Sí' : 'No'}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      )}

      {/* Navegación por pestañas */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {secciones.map((seccion) => {
            const IconoSeccion = seccion.icono;
            return (
              <button
                key={seccion.id}
                onClick={() => setSeccionActiva(seccion.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  seccionActiva === seccion.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconoSeccion className="w-5 h-5" />
                <span>{seccion.nombre}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido de la sección activa */}
      <div className="bg-gray-50 p-6 rounded-lg">
        {renderContenidoSeccion()}
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>
            Última actualización: {formatearFecha(datos.timestamp || new Date())}
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSendToVelneo}
            disabled={!datos.listoParaVelneo}
            className={`px-4 py-2 rounded-lg transition-colors ${
              datos.listoParaVelneo
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Enviar a Velneo
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolizaDetailsForm;