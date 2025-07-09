import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Search, Filter, FileText, Users, Menu, X, AlertCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ClientesList } from '../components/cliente/ClienteList';
import { useClientes } from '../hooks/useCliente';

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
  const {
  clientes,
  clienteSeleccionado,
  polizasCliente,
  totalClientes,
  totalPolizas,
  currentPage,
  totalPages,
  pageSize,
  hasNextPage,
  hasPreviousPage,
  loading,
  loadingPolizas,
  error,
  selectCliente,
  clearClienteSeleccionado,
  searchClientes,
  refreshClientes,
  goToPage,
  changePageSize,
  hasClientes,
  hasPolizas,
  isClienteSelected,
} = useClientes();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroPoliza, setFiltroPoliza] = useState('');
  const [showNewPolizaModal, setShowNewPolizaModal] = useState(false);
  const [selectedCompania, setSelectedCompania] = useState<number | null>(null);
  const [selectedRamo, setSelectedRamo] = useState<number | null>(null);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (filtroCliente.trim()) {
        searchClientes(filtroCliente);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filtroCliente, searchClientes]);

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(filtroCliente.toLowerCase()) ||
    cliente.documento.includes(filtroCliente)
  );

  const polizasFiltradas = polizasCliente.filter(poliza =>
    poliza.numero.includes(filtroPoliza) ||
    poliza.compania.toLowerCase().includes(filtroPoliza.toLowerCase()) ||
    poliza.ramo.toLowerCase().includes(filtroPoliza.toLowerCase())
  );

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

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Vigente': return 'text-green-600 bg-green-100';
      case 'Vencida': return 'text-red-600 bg-red-100';
      case 'Cancelada': return 'text-gray-600 bg-gray-100';
      case 'Pendiente': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
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
            {totalClientes > 0 && (
              <div className="mt-1">
                {totalClientes} clientes • {totalPolizas} pólizas
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
                Cliente seleccionado: {clienteSeleccionado?.nombre}
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

        {/* Clientes Section - ACTUALIZADA CON PAGINACIÓN */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Clientes {hasClientes && `(${totalClientes})`}
              </h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={filtroCliente}
                    onChange={(e) => {
                      setFiltroCliente(e.target.value);
                      searchClientes(e.target.value);
                    }}
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
              <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
              <p className="text-gray-500">Cargando clientes desde Velneo...</p>
            </div>
          ) : !hasClientes ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron clientes</p>
              <button
                onClick={refreshClientes}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Intentar nuevamente
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clientes.map((cliente) => (
                      <tr
                        key={cliente.id}
                        onClick={() => selectCliente(cliente)}
                        className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                          clienteSeleccionado?.id === cliente.id ? 'bg-blue-100' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{cliente.nombre || 'Sin nombre'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{cliente.documento || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{cliente.telefono || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{cliente.email || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{cliente.direccion || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            cliente.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {cliente.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Paginación - NUEVA SECCIÓN */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-700">
                        Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalClientes)} de {totalClientes} clientes
                      </span>
                      
                      <select
                        value={pageSize}
                        onChange={(e) => changePageSize(Number(e.target.value))}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value={25}>25 por página</option>
                        <option value={50}>50 por página</option>
                        <option value={100}>100 por página</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={!hasPreviousPage}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <span className="px-3 py-1 text-sm text-gray-700">
                        {currentPage} de {totalPages}
                      </span>
                      
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={!hasNextPage}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pólizas Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Pólizas {hasPolizas && `(${totalPolizas})`}
                </h3>
                {clienteSeleccionado && (
                  <p className="text-sm text-gray-500 mt-1">
                    Cliente: {clienteSeleccionado.nombre}
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
              <p className="text-lg font-medium mb-2">No hay pólizas</p>
              <p>Este cliente no tiene pólizas registradas</p>
              <button
                onClick={handleNewPoliza}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crear primera póliza
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Desde</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hasta</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cía</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ramo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Póliza</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {polizasCliente
                    .filter(poliza =>
                      poliza.numero?.includes(filtroPoliza) ||
                      poliza.compania?.toLowerCase().includes(filtroPoliza.toLowerCase()) ||
                      poliza.ramo?.toLowerCase().includes(filtroPoliza.toLowerCase())
                    )
                    .map((poliza) => (
                    <tr key={poliza.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{poliza.fechaDesde || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{poliza.fechaHasta || '-'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">{poliza.compania || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{poliza.ramo || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-mono">{poliza.numero || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(poliza.estado)}`}>
                          {poliza.estado || 'Sin estado'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {poliza.prima && poliza.prima > 0 ? `${poliza.prima.toLocaleString()} ${poliza.moneda || 'UYU'}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {polizasCliente
                .filter(poliza =>
                  poliza.numero?.includes(filtroPoliza) ||
                  poliza.compania?.toLowerCase().includes(filtroPoliza.toLowerCase()) ||
                  poliza.ramo?.toLowerCase().includes(filtroPoliza.toLowerCase())
                ).length === 0 && filtroPoliza && (
                <div className="p-8 text-center text-gray-500">
                  <p>No se encontraron pólizas que coincidan con "{filtroPoliza}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Modal Nueva Póliza */}
    {showNewPolizaModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-96 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Nueva Póliza</h3>
          
          {clienteSeleccionado && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Cliente:</span> {clienteSeleccionado.nombre}
              </p>
              <p className="text-xs text-blue-600">
                {clienteSeleccionado.documento}
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Compañía</label>
              <select
                value={selectedCompania || ''}
                onChange={(e) => setSelectedCompania(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar compañía...</option>
                {companias.map((compania) => (
                  <option key={compania.id} value={compania.id}>
                    {compania.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ramo</label>
              <select
                value={selectedRamo || ''}
                onChange={(e) => setSelectedRamo(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar ramo...</option>
                {ramos.map((ramo) => (
                  <option key={ramo.id} value={ramo.id}>
                    {ramo.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowNewPolizaModal(false);
                setSelectedCompania(null);
                setSelectedRamo(null);
              }}
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
  </div>
);
};

export default Dashboard;