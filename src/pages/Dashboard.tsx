import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Search, Filter, FileText, Users, Menu, X, AlertCircle, Loader2, Eye } from 'lucide-react';
import { useClientes } from '../hooks/useCliente';
import { Pagination } from '../components/common/Pagination';
import { ClienteModal, PolizaModal } from '../components/modals'; 

// Types
interface Compania {
  id: number;
  nombre: string;
  codigo: string;
}

interface Ramo {
  id: number;
  nombre: string;
  codigo: string;
}

const Dashboard: React.FC = () => {
  // Hook con datos reales
  const {
    clientes,
    clienteSeleccionado,
    polizasCliente,
    stats,
    pagination,
    loading,
    loadingPolizas,
    error,
    selectCliente,
    clearClienteSeleccionado,
    searchClientes,
    refreshClientes,
    loadPage,
    changePageSize,
    hasClientes,
    hasPolizas,
    isClienteSelected,
    
    // 🆕 FUNCIONES PARA MODALES
    selectedClienteForModal,
    selectedPolizaForModal,
    clienteModalOpen,
    polizaModalOpen,
    openClienteModal,
    closeClienteModal,
    openPolizaModal,
    closePolizaModal,
  } = useClientes();

  // State local
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroPoliza, setFiltroPoliza] = useState('');
  const [showNewPolizaModal, setShowNewPolizaModal] = useState(false);
  const [selectedCompania, setSelectedCompania] = useState<number | null>(null);
  const [selectedRamo, setSelectedRamo] = useState<number | null>(null);

  // Mock data para compañías y ramos
  const companias: Compania[] = [
    { id: 1, nombre: 'Banco de Seguros del Estado', codigo: 'BSE' },
    { id: 2, nombre: 'Sura Seguros', codigo: 'SURA' },
    { id: 3, nombre: 'Mapfre Seguros', codigo: 'MAPFRE' },
    { id: 4, nombre: 'La República Seguros', codigo: 'LRS' }
  ];

  const ramos: Ramo[] = [
    { id: 1, nombre: 'Automóviles', codigo: 'AUTO' },
    { id: 2, nombre: 'Incendio', codigo: 'INC' },
    { id: 3, nombre: 'Responsabilidad Civil', codigo: 'RC' },
    { id: 4, nombre: 'Vida', codigo: 'VIDA' }
  ];

  // 🆕 FUNCIONES PARA MANEJAR MODALES
  const handleEditCliente = (cliente: any) => {
    console.log('Editar cliente:', cliente.clinom);
    // Aquí irá la lógica para editar cliente
  };

  const handleEditPoliza = (poliza: any) => {
    console.log('Editar póliza:', poliza.conpol || poliza.numero);
    // Aquí irá la lógica para editar póliza
  };

  const handleViewEndosos = (poliza: any) => {
    console.log('Ver endosos de póliza:', poliza.conpol || poliza.numero);
    // Aquí irá la lógica para ver endosos
  };

  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filtroCliente.trim()) {
        searchClientes(filtroCliente);
      } else if (filtroCliente === '') {
        loadPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filtroCliente]);

  // Filtros
  const polizasFiltradas = polizasCliente.filter(poliza => {
    if (!filtroPoliza.trim()) return true;
    
    const filtro = filtroPoliza.toLowerCase();
    
    const numero = String(poliza.conpol || poliza.numero || '');
    const compania = String(poliza.com_alias || poliza.compania || '');
    const ramo = String(poliza.ramo || '');
    const cobertura = String(poliza.contpocob || '');
    
    return (
      numero.toLowerCase().includes(filtro) ||
      compania.toLowerCase().includes(filtro) ||
      ramo.toLowerCase().includes(filtro) ||
      cobertura.toLowerCase().includes(filtro)
    );
  });

  const handleNewPoliza = () => {
    if (!clienteSeleccionado) {
      alert('Por favor seleccione un cliente primero');
      return;
    }
    setShowNewPolizaModal(true);
  };

  const handleCreatePoliza = () => {
    if (selectedCompania && selectedRamo) {
      setShowNewPolizaModal(false);
      console.log('🚀 Redirigir a ProcesarPoliza:', {
        cliente: clienteSeleccionado,
        compania: companias.find(c => c.id === selectedCompania),
        ramo: ramos.find(r => r.id === selectedRamo)
      });
      setSelectedCompania(null);
      setSelectedRamo(null);
    }
  };

  const getEstadoColor = (estado: string | undefined) => {
    if (!estado) return 'bg-gray-100 text-gray-800';
    
    switch (estado.toLowerCase()) {
      case 'vigente':
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'vencida':
      case 'vencido':
        return 'bg-red-100 text-red-800';
      case 'cancelada':
      case 'cancelado':
        return 'bg-yellow-100 text-yellow-800';
      case 'pendiente':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-gray-800">RegularizadorPólizas</h1>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <div className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-lg">
              <Users className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3 font-medium">Clientes</span>}
            </div>
            <div className="flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
              <FileText className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3">Pólizas</span>}
            </div>
          </div>
        </nav>
        
        {/* Status indicator */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`} />
                <span>{error ? 'Desconectado' : 'Conectado a Velneo'}</span>
              </div>
              {stats.totalClientes > 0 && (
                <div className="mt-1">
                  {stats.totalClientes} clientes • {stats.totalPolizas} pólizas
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Gestión de Clientes y Pólizas</h2>
              {isClienteSelected && (
                <p className="text-sm text-gray-500 mt-1">
                  Cliente seleccionado: {clienteSeleccionado?.clinom}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refreshClientes}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
              <div className="text-sm text-gray-500">
                Usuario: agustin.muniz
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <h3 className="text-red-800 font-medium">Error de conexión</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
                <button
                  onClick={refreshClientes}
                  className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {/* Clientes Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Clientes {hasClientes && `(${stats.totalClientes})`}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar cliente..."
                      value={filtroCliente}
                      onChange={(e) => setFiltroCliente(e.target.value)}
                      disabled={loading}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                  <button 
                    className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg"
                    disabled={loading}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="p-12 text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin animation-delay-75 mx-auto"></div>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Cargando clientes desde Velneo
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Descargando información de {loading ? '2,000+' : ''} clientes...
                </p>
                <p className="text-xs text-gray-500">
                  💾 Esto puede tardar 1-2 minutos debido al volumen de datos
                </p>
                
                {/* Barra de progreso animada */}
                <div className="w-64 bg-gray-200 rounded-full h-2 mt-4 mx-auto overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            ) : !hasClientes ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No hay clientes</p>
                <p>No se encontraron clientes en el sistema</p>
              </div>
            ) : (
              <div>
                {/* Tabla de clientes */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Documento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contacto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clientes.map((cliente) => (
                        <tr 
                          key={cliente.id}
                          className={`transition-colors ${
                            clienteSeleccionado?.id === cliente.id 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {cliente.clinom}
                              </div>
                              {cliente.clidir && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {cliente.clidir}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{cliente.cliced}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              {cliente.telefono && (
                                <div className="text-sm text-gray-900">{cliente.telefono}</div>
                              )}
                              {cliente.cliemail && (
                                <div className="text-sm text-gray-500">{cliente.cliemail}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              cliente.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {cliente.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {/* 🆕 BOTÓN VER (ABRE MODAL) */}
                              <button
                                onClick={() => openClienteModal(cliente)}
                                className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                                title="Ver detalles"
                              >
                                <Eye className="w-4 h-4 text-white" />
                                <span className="text-white">Ver</span>
                              </button>
                              {/* BOTÓN SELECCIONAR (FUNCIONALIDAD ORIGINAL) */}
                              <button
                                onClick={() => selectCliente(cliente)}
                                className="text-white"
                                title="Seleccionar para ver pólizas"
                              >
                                Seleccionar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Controles de Paginación */}
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  pageSize={pagination.pageSize}
                  totalCount={pagination.totalCount}
                  onPageChange={loadPage}
                  onPageSizeChange={changePageSize}
                  loading={loading}
                />
              </div>
            )}
          </div>

          {/* Pólizas Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Pólizas {hasPolizas && `(${stats.totalPolizas})`}
                  </h3>
                  {clienteSeleccionado && (
                    <p className="text-sm text-gray-500 mt-1">
                      Cliente: {clienteSeleccionado.clinom}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {isClienteSelected && (
                    <button
                      onClick={clearClienteSeleccionado}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Limpiar selección
                    </button>
                  )}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar póliza..."
                      value={filtroPoliza}
                      onChange={(e) => setFiltroPoliza(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!clienteSeleccionado || loadingPolizas}
                    />
                  </div>
                  <button
                    onClick={handleNewPoliza}
                    disabled={!clienteSeleccionado}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo</span>
                  </button>
                </div>
              </div>
            </div>
            
            {!clienteSeleccionado ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Selecciona un cliente</p>
                <p>Elige un cliente de la tabla superior para ver sus pólizas</p>
              </div>
            ) : loadingPolizas ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
                <p className="text-gray-500">Cargando pólizas desde Velneo...</p>
              </div>
            ) : !hasPolizas ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Sin pólizas</p>
                <p>Este cliente no tiene pólizas registradas</p>
                <button
                  onClick={() => setShowNewPolizaModal(true)}
                  className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear primera póliza</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Número
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Compañía
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ramo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vigencia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prima
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {polizasFiltradas.map((poliza, index) => (
                      <tr key={poliza.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {poliza.conpol || poliza.numero || 'Sin número'}
                          </div>
                          {poliza.conend && (
                            <div className="text-xs text-gray-500">
                              Endoso: {poliza.conend}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {poliza.com_alias || poliza.compania || 'Sin compañía'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {poliza.ramo || 'Sin ramo'}
                          </div>
                          {poliza.contpocob && (
                            <div className="text-xs text-gray-500">
                              {poliza.contpocob}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            {poliza.confchdes ? new Date(poliza.confchdes).toLocaleDateString() : 'Sin fecha'}
                          </div>
                          {poliza.confchhas && (
                            <div className="text-xs text-gray-500">
                              hasta {new Date(poliza.confchhas).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {poliza.conpremio ? 
                            new Intl.NumberFormat('es-UY', {
                              style: 'currency',
                              currency: poliza.moncod === 2 ? 'USD' : 'UYU'
                            }).format(poliza.conpremio) : 
                            'Sin prima'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(poliza.estado || 'activo')}`}>
                            {poliza.estado || 'Activo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {/* 🆕 BOTÓN VER (ABRE MODAL DE PÓLIZA) */}
                          <button
                            onClick={() => openPolizaModal(poliza)}
                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Ver</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Información de paginación */}
                {polizasCliente.length > 0 && (
                  <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                    <p className="text-sm text-gray-600">
                      Mostrando {polizasFiltradas.length} de {polizasCliente.length} pólizas
                      {filtroPoliza && ` (filtrado por "${filtroPoliza}")`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para Nueva Póliza */}
      {showNewPolizaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nueva Póliza</h3>
            <p className="text-gray-600 mb-4">
              Cliente: <strong>{clienteSeleccionado?.clinom}</strong>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compañía
                </label>
                <select
                  value={selectedCompania || ''}
                  onChange={(e) => setSelectedCompania(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar compañía...</option>
                  {companias.map(compania => (
                    <option key={compania.id} value={compania.id}>
                      {compania.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ramo
                </label>
                <select
                  value={selectedRamo || ''}
                  onChange={(e) => setSelectedRamo(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar ramo...</option>
                  {ramos.map(ramo => (
                    <option key={ramo.id} value={ramo.id}>
                      {ramo.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewPolizaModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePoliza}
                disabled={!selectedCompania || !selectedRamo}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 MODALES DE DETALLES */}
      <ClienteModal
        cliente={selectedClienteForModal}
        isOpen={clienteModalOpen}
        onClose={closeClienteModal}
        onEdit={handleEditCliente}
      />

      <PolizaModal
        poliza={selectedPolizaForModal}
        isOpen={polizaModalOpen}
        onClose={closePolizaModal}
        onEdit={handleEditPoliza}
        onViewEndosos={handleViewEndosos}
      />
    </div>
  );
};

export default Dashboard;