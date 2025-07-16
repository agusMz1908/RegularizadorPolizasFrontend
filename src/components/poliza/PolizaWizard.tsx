import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  FileText, 
  CheckCircle, 
  Search,
  ArrowRight,
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  Loader2,
  Send
} from 'lucide-react';

interface Cliente {
  id: number;
  clinom: string;
  cliced: string;
  cliruc: string;
  cliemail: string;
  clitelcel: string;
  clidir: string;
  clidptnom: string;
  clilocnom: string;
  activo: boolean;
}

interface Compania {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
}

interface DatosPoliza {
  cliente: Cliente | null;
  compania: Compania | null;
  documentoEscaneado: any;
}

const API_KEY = "349THFN38U09428URUHTBG3RNMETJ859JP9";
const BASE_URL = "https://app.uruguaycom.com/apid/Seguros_dat/v1";

const PolizaWizard: React.FC = () => {
  const [pasoActual, setPasoActual] = useState(1);
  const [datosPoliza, setDatosPoliza] = useState<DatosPoliza>({
    cliente: null,
    compania: null,
    documentoEscaneado: null
  });

  // Estados para búsqueda de clientes
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [tiposBusqueda, setTiposBusqueda] = useState<'nombre' | 'documento' | 'rut'>('nombre');
  const [clientesEncontrados, setClientesEncontrados] = useState<Cliente[]>([]);
  const [buscandoCliente, setBuscandoCliente] = useState(false);

  // Estados para compañías
  const [companias, setCompanias] = useState<Compania[]>([]);
  const [cargandoCompanias, setCargandoCompanias] = useState(false);

  // Estados para documento
  const [archivo, setArchivo] = useState<File | null>(null);
  const [procesandoDocumento, setProcesandoDocumento] = useState(false);

  const pasos = [
    { numero: 1, titulo: 'Seleccionar Cliente', icono: Users, completado: !!datosPoliza.cliente },
    { numero: 2, titulo: 'Seleccionar Compañía', icono: Building2, completado: !!datosPoliza.compania },
    { numero: 3, titulo: 'Escanear Póliza', icono: FileText, completado: !!datosPoliza.documentoEscaneado },
    { numero: 4, titulo: 'Revisar y Confirmar', icono: CheckCircle, completado: false }
  ];

  // Cargar compañías al iniciar
  useEffect(() => {
    if (pasoActual === 2) {
      cargarCompanias();
    }
  }, [pasoActual]);

  const buscarClientes = async () => {
    if (!busquedaCliente.trim()) return;

    setBuscandoCliente(true);
    try {
      let url = `${BASE_URL}/clientes?api_key=${API_KEY}`;
      
      // Construir filtro según el tipo de búsqueda
      if (tiposBusqueda === 'nombre') {
        url += `&filter%5Bnombre%5D=${encodeURIComponent(busquedaCliente)}`;
      } else if (tiposBusqueda === 'documento') {
        url += `&filter%5Bdocumento%5D=${encodeURIComponent(busquedaCliente)}`;
      } else if (tiposBusqueda === 'rut') {
        url += `&filter%5Brut%5D=${encodeURIComponent(busquedaCliente)}`;
      }

      console.log('🔍 Buscando clientes:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📋 Clientes encontrados:', data);
      
      setClientesEncontrados(data.clientes || []);
    } catch (error) {
      console.error('Error buscando clientes:', error);
      alert('Error al buscar clientes');
    } finally {
      setBuscandoCliente(false);
    }
  };

  const cargarCompanias = async () => {
    setCargandoCompanias(true);
    try {
      const url = `${BASE_URL}/companias?api_key=${API_KEY}`;
      console.log('🏢 Cargando compañías:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📋 Compañías cargadas:', data);
      
      setCompanias(data.companias || []);
    } catch (error) {
      console.error('Error cargando compañías:', error);
      alert('Error al cargar compañías');
    } finally {
      setCargandoCompanias(false);
    }
  };

  const seleccionarCliente = (cliente: Cliente) => {
    setDatosPoliza(prev => ({ ...prev, cliente }));
    console.log('👤 Cliente seleccionado:', cliente);
  };

  const seleccionarCompania = (compania: Compania) => {
    setDatosPoliza(prev => ({ ...prev, compania }));
    console.log('🏢 Compañía seleccionada:', compania);
  };

  const procesarDocumento = async () => {
    if (!archivo) return;

    setProcesandoDocumento(true);
    try {
      const formData = new FormData();
      formData.append('file', archivo);

      // Llamar al endpoint de procesamiento
      const response = await fetch('https://localhost:7191/api/AzureDocument/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📄 Documento procesado:', data);
      
      setDatosPoliza(prev => ({ ...prev, documentoEscaneado: data }));
    } catch (error) {
      console.error('Error procesando documento:', error);
      alert('Error al procesar el documento');
    } finally {
      setProcesandoDocumento(false);
    }
  };

  const enviarAVelneo = async () => {
    console.log('🚀 Enviando a Velneo:', {
      cliente: datosPoliza.cliente,
      compania: datosPoliza.compania,
      documento: datosPoliza.documentoEscaneado
    });
    
    // Aquí iría la lógica para enviar a Velneo
    alert('Póliza enviada a Velneo exitosamente!');
  };

  const siguientePaso = () => {
    if (pasoActual < 4) {
      setPasoActual(pasoActual + 1);
    }
  };

  const pasoAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
    }
  };

  const renderIndicadorPasos = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {pasos.map((paso, index) => {
          const IconoPaso = paso.icono;
          const esActivo = paso.numero === pasoActual;
          const estaCompleto = paso.completado;
          
          return (
            <React.Fragment key={paso.numero}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold
                  ${esActivo ? 'bg-blue-600 text-white' : 
                    estaCompleto ? 'bg-green-500 text-white' : 
                    'bg-gray-200 text-gray-600'}
                `}>
                  {estaCompleto ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <IconoPaso className="w-6 h-6" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${
                    esActivo ? 'text-blue-600' : 
                    estaCompleto ? 'text-green-600' : 
                    'text-gray-500'
                  }`}>
                    {paso.titulo}
                  </div>
                </div>
              </div>
              
              {index < pasos.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  pasos[index + 1].completado || paso.numero < pasoActual ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  const renderPaso1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Seleccionar Cliente</h2>
      
      {/* Selección de tipo de búsqueda */}
      <div className="flex space-x-4">
        {[
          { key: 'nombre', label: 'Por Nombre' },
          { key: 'documento', label: 'Por Cédula' },
          { key: 'rut', label: 'Por RUT' }
        ].map(tipo => (
          <label key={tipo.key} className="flex items-center">
            <input
              type="radio"
              value={tipo.key}
              checked={tiposBusqueda === tipo.key}
              onChange={(e) => setTiposBusqueda(e.target.value as any)}
              className="mr-2"
            />
            {tipo.label}
          </label>
        ))}
      </div>

      {/* Búsqueda */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={busquedaCliente}
          onChange={(e) => setBusquedaCliente(e.target.value)}
          placeholder={`Buscar por ${tiposBusqueda}`}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyPress={(e) => e.key === 'Enter' && buscarClientes()}
        />
        <button
          onClick={buscarClientes}
          disabled={buscandoCliente || !busquedaCliente.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {buscandoCliente ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span className="ml-2">Buscar</span>
        </button>
      </div>

      {/* Cliente seleccionado */}
      {datosPoliza.cliente && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800">Cliente seleccionado:</span>
          </div>
          <div className="mt-2 text-sm text-green-700">
            <div><strong>{datosPoliza.cliente.clinom}</strong></div>
            <div>Documento: {datosPoliza.cliente.cliced || datosPoliza.cliente.cliruc}</div>
            <div>Email: {datosPoliza.cliente.cliemail}</div>
          </div>
        </div>
      )}

      {/* Resultados de búsqueda */}
      {clientesEncontrados.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Clientes encontrados:</h3>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {clientesEncontrados.map(cliente => (
              <div
                key={cliente.id}
                onClick={() => seleccionarCliente(cliente)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  datosPoliza.cliente?.id === cliente.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{cliente.clinom}</div>
                    <div className="text-sm text-gray-500">
                      Doc: {cliente.cliced || cliente.cliruc || 'No especificado'}
                    </div>
                    <div className="text-sm text-gray-500">{cliente.cliemail}</div>
                    <div className="text-sm text-gray-500">
                      {cliente.clidir}, {cliente.clilocnom}, {cliente.clidptnom}
                    </div>
                  </div>
                  {datosPoliza.cliente?.id === cliente.id && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPaso2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Seleccionar Compañía</h2>
      
      {/* Compañía seleccionada */}
      {datosPoliza.compania && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800">Compañía seleccionada:</span>
          </div>
          <div className="mt-2 text-sm text-green-700">
            <div><strong>{datosPoliza.compania.nombre}</strong></div>
            <div>Código: {datosPoliza.compania.codigo}</div>
          </div>
        </div>
      )}

      {cargandoCompanias ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Cargando compañías...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companias.map(compania => (
            <div
              key={compania.id}
              onClick={() => seleccionarCompania(compania)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                datosPoliza.compania?.id === compania.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{compania.nombre}</div>
                  <div className="text-sm text-gray-500">Código: {compania.codigo}</div>
                  {compania.descripcion && (
                    <div className="text-sm text-gray-500">{compania.descripcion}</div>
                  )}
                </div>
                {datosPoliza.compania?.id === compania.id && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPaso3 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Escanear Póliza</h2>
      
      {/* Información del contexto */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">Información seleccionada:</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <div><strong>Cliente:</strong> {datosPoliza.cliente?.clinom}</div>
          <div><strong>Compañía:</strong> {datosPoliza.compania?.nombre}</div>
        </div>
      </div>

      {/* Upload de archivo */}
      {!archivo && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => document.getElementById('file-upload')?.click()}
          onDrop={(e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              setArchivo(files[0]);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sube el documento de la póliza</h3>
          <p className="text-gray-600 mb-4">Arrastra y suelta o haz clic para seleccionar</p>
          <p className="text-sm text-gray-500">Solo archivos PDF (máximo 10MB)</p>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setArchivo(file);
              }
            }}
          />
        </div>
      )}

      {/* Archivo seleccionado */}
      {archivo && !datosPoliza.documentoEscaneado && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">{archivo.name}</h3>
                <p className="text-sm text-gray-500">
                  {(archivo.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={procesarDocumento}
                disabled={procesandoDocumento}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {procesandoDocumento ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Procesar
                  </>
                )}
              </button>
              <button
                onClick={() => setArchivo(null)}
                className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documento procesado */}
      {datosPoliza.documentoEscaneado && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800">Documento procesado exitosamente</span>
          </div>
          <div className="mt-2 text-sm text-green-700">
            Póliza: {datosPoliza.documentoEscaneado.datosFormateados?.numeroPoliza || 'No detectado'}
          </div>
        </div>
      )}
    </div>
  );

  const renderPaso4 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Revisar y Confirmar</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del cliente */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Cliente Seleccionado
          </h3>
          {datosPoliza.cliente && (
            <div className="space-y-2 text-sm">
              <div><strong>Nombre:</strong> {datosPoliza.cliente.clinom}</div>
              <div><strong>Documento:</strong> {datosPoliza.cliente.cliced || datosPoliza.cliente.cliruc}</div>
              <div><strong>Email:</strong> {datosPoliza.cliente.cliemail}</div>
              <div><strong>Teléfono:</strong> {datosPoliza.cliente.clitelcel}</div>
              <div><strong>Dirección:</strong> {datosPoliza.cliente.clidir}</div>
              <div><strong>Localidad:</strong> {datosPoliza.cliente.clilocnom}, {datosPoliza.cliente.clidptnom}</div>
            </div>
          )}
        </div>

        {/* Información de la compañía */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-green-600" />
            Compañía Seleccionada
          </h3>
          {datosPoliza.compania && (
            <div className="space-y-2 text-sm">
              <div><strong>Nombre:</strong> {datosPoliza.compania.nombre}</div>
              <div><strong>Código:</strong> {datosPoliza.compania.codigo}</div>
              {datosPoliza.compania.descripcion && (
                <div><strong>Descripción:</strong> {datosPoliza.compania.descripcion}</div>
              )}
            </div>
          )}
        </div>

        {/* Información del documento */}
        {datosPoliza.documentoEscaneado && (
          <div className="lg:col-span-2 bg-white border rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              Datos de la Póliza Escaneada
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div><strong>Número de Póliza:</strong> {datosPoliza.documentoEscaneado.datosFormateados?.numeroPoliza || 'No detectado'}</div>
              <div><strong>Asegurado:</strong> {datosPoliza.documentoEscaneado.datosFormateados?.asegurado || 'No detectado'}</div>
              <div><strong>Vehículo:</strong> {datosPoliza.documentoEscaneado.datosFormateados?.vehiculo || 'No detectado'}</div>
              <div><strong>Prima Comercial:</strong> ${datosPoliza.documentoEscaneado.datosFormateados?.primaComercial || 0}</div>
              <div><strong>Plan:</strong> {datosPoliza.documentoEscaneado.datosFormateados?.plan || 'No detectado'}</div>
              <div><strong>Ramo:</strong> {datosPoliza.documentoEscaneado.datosFormateados?.ramo || 'No detectado'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Botón de confirmación */}
      <div className="flex justify-center">
        <button
          onClick={enviarAVelneo}
          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-lg font-medium"
        >
          <Send className="w-5 h-5" />
          Enviar a Velneo
        </button>
      </div>
    </div>
  );

  const renderContenidoPaso = () => {
    switch (pasoActual) {
      case 1: return renderPaso1();
      case 2: return renderPaso2();
      case 3: return renderPaso3();
      case 4: return renderPaso4();
      default: return null;
    }
  };

  const puedeAvanzar = () => {
    switch (pasoActual) {
      case 1: return !!datosPoliza.cliente;
      case 2: return !!datosPoliza.compania;
      case 3: return !!datosPoliza.documentoEscaneado;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nueva Póliza</h1>
        <p className="text-gray-600">Sigue los pasos para crear una nueva póliza</p>
      </div>

      {/* Indicador de pasos */}
      {renderIndicadorPasos()}

      {/* Contenido del paso actual */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        {renderContenidoPaso()}
      </div>

      {/* Navegación */}
      <div className="flex justify-between">
        <button
          onClick={pasoAnterior}
          disabled={pasoActual === 1}
          className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </button>

        <button
          onClick={siguientePaso}
          disabled={!puedeAvanzar() || pasoActual === 4}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default PolizaWizard;