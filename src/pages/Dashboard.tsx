// src/pages/Dashboard.tsx - VERSIÓN COMPLETA CON CLIENTES Y PÓLIZAS
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  RefreshCw, 
  Search, 
  FileText, 
  Users, 
  Menu, 
  X, 
  AlertCircle, 
  Loader2,
  TrendingUp,
  Shield,
  Clock,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useClientes } from '../hooks/useCliente';
import { Cliente } from '../types/cliente';
import { Poliza } from '../types/poliza';
import { AuthDebug } from '../components/AuthDebug';

// Types para el modal
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
    loading,
    loadingPolizas,
    error,
    selectCliente,
    clearClienteSeleccionado,
    searchClientes,
    refreshClientes,
    refreshPolizas,
    hasClientes,
    hasPolizas,
    isClienteSelected,
  } = useClientes();

  // State local para UI
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroPoliza, setFiltroPoliza] = useState('');
  const [showNewPolizaModal, setShowNewPolizaModal] = useState(false);
  const [showAuthDebug, setShowAuthDebug] = useState(false);
  const [selectedCompania, setSelectedCompania] = useState<number | null>(null);
  const [selectedRamo, setSelectedRamo] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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

  // ✅ Debounce con useCallback para evitar re-creaciones
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      console.log('🔍 Ejecutando búsqueda debounced:', query);
      if (query.trim()) {
        searchClientes(query);
      } else {
        refreshClientes();
      }
    }, 500),
    [searchClientes, refreshClientes]
  );

  // ✅ Solo ejecutar debounce cuando cambia el filtro
  useEffect(() => {
    debouncedSearch(filtroCliente);
    
    return () => {
      debouncedSearch.cancel();
    };
  }, [filtroCliente, debouncedSearch]);

  // ✅ Filtros locales con useMemo
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(filtroCliente.toLowerCase()) ||
      cliente.documento.includes(filtroCliente)
    );
  }, [clientes, filtroCliente]);

  const polizasFiltradas = useMemo(() => {
    if (!filtroPoliza.trim()) return polizasCliente;
    
    return polizasCliente.filter(poliza =>
      poliza.numero.includes(filtroPoliza) ||
      poliza.compania.toLowerCase().includes(filtroPoliza.toLowerCase()) ||
      poliza.ramo.toLowerCase().includes(filtroPoliza.toLowerCase())
    );
  }, [polizasCliente, filtroPoliza]);

  // Paginación para clientes
  const paginatedClientes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return clientesFiltrados.slice(startIndex, endIndex);
  }, [clientesFiltrados, currentPage, pageSize]);

  const totalPages = Math.ceil(clientesFiltrados.length / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Handlers con useCallback para optimización
  const handleRefreshClientes = useCallback(() => {
    setFiltroCliente('');
    setCurrentPage(1);
    refreshClientes();
  }, [refreshClientes]);

  const handleClienteSelect = useCallback((cliente: Cliente) => {
    selectCliente(cliente);
  }, [selectCliente]);

  const handleNewPoliza = useCallback(() => {
    if (clienteSeleccionado) {
      setSelectedCompania(null);
      setSelectedRamo(null);
      setShowNewPolizaModal(true);
    }
  }, [clienteSeleccionado]);

  const handleCloseModal = useCallback(() => {
    setShowNewPolizaModal(false);
    setSelectedCompania(null);
    setSelectedRamo(null);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [totalPages]);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFiltroCliente(value);
    setCurrentPage(1);
  }, []);

  const handlePolizaSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroPoliza(e.target.value);
  }, []);

  // Helpers para estado de conexión
  const isConnected = !error || !error.includes('401');
  const connectionStatus = error?.includes('401') ? 'auth_error' : 
                          error ? 'error' : 
                          loading ? 'connecting' : 
                          hasClientes ? 'connected' : 'unknown';
  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'vigente': return 'bg-green-100 text-green-800';
      case 'vencida': return 'bg-red-100 text-red-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-UY');
    } catch {
      return dateString; // Si no se puede parsear, mostrar tal como viene
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white shadow-lg border-r border-gray-200`}>
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-gray-900">RegularizadorPolizas</h2>
                <p className="text-xs text-gray-500">Sistema de Gestión</p>
              </div>
            )}
          </div>
        </div>
        
        {sidebarOpen && (
          <nav className="mt-8 px-4 space-y-2">
            <a href="#" className="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
              <Users className="w-5 h-5" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5" />
              <span>Pólizas</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <TrendingUp className="w-5 h-5" />
              <span>Reportes</span>
            </a>
          </nav>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Última actualización: {new Date().toLocaleTimeString('es-UY')}
              </span>
              
              {/* Estado de conexión */}
              <div className="flex items-center space-x-2">
                {connectionStatus === 'connected' && (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Conectado</span>
                  </>
                )}
                {connectionStatus === 'auth_error' && (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">Error 401</span>
                    <button
                      onClick={() => setShowAuthDebug(true)}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                    >
                      Configurar
                    </button>
                  </>
                )}
                {connectionStatus === 'error' && (
                  <>
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-orange-600">Error de conexión</span>
                  </>
                )}
                {connectionStatus === 'connecting' && (
                  <>
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    <span className="text-sm text-blue-600">Conectando...</span>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setShowAuthDebug(true)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Configuración de API"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClientes}</p>
                <p className="text-xs text-green-600">
                  {stats.clientesActivos} activos
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pólizas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPolizas}</p>
                <p className="text-xs text-green-600">
                  {stats.polizasVigentes} vigentes
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.polizasPendientes}</p>
                <p className="text-xs text-yellow-600">
                  Requieren atención
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vencidas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.polizasVencidas}</p>
                <p className="text-xs text-red-600">
                  Necesitan renovación
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Sección de Clientes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Clientes {hasClientes && `(${clientesFiltrados.length})`}
                </h2>
                <button
                  onClick={handleRefreshClientes}
                  disabled={loading}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>
              </div>
              
              {/* Búsqueda de clientes */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar cliente por nombre o documento..."
                  value={filtroCliente}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                {loading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />
                )}
              </div>
            </div>

            {/* Contenido de clientes */}
            {error?.includes('401') ? (
              <div className="p-6 bg-red-50 border border-red-200 rounded-lg m-4">
                <div className="flex items-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mr-4" />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-red-800">Error de Autenticación (401)</h3>
                    <p className="text-red-700 mt-1">
                      No se pudo acceder al API. Esto puede deberse a:
                    </p>
                    <ul className="text-red-600 text-sm mt-2 ml-4 list-disc">
                      <li>URL incorrecta del backend</li>
                      <li>Falta de token de autenticación</li>
                      <li>Backend no iniciado</li>
                      <li>Problemas de CORS</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setShowAuthDebug(true)}
                    className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Configurar API
                  </button>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border-l-4 border-red-400">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700">Error al cargar clientes</p>
                    <p className="text-xs text-red-600 mt-1">{error}</p>
                    <button
                      onClick={handleRefreshClientes}
                      className="mt-2 text-sm text-red-700 underline hover:text-red-900"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Cargando clientes desde Velneo...</p>
              </div>
            ) : clientesFiltrados.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">No se encontraron clientes</p>
                <p className="text-sm mt-1">
                  {filtroCliente ? 'Intenta con otros términos de búsqueda' : 'No hay clientes disponibles'}
                </p>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedClientes.map((cliente) => (
                        <tr
                          key={cliente.id}
                          className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                            clienteSeleccionado?.id === cliente.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                        >
                          <td 
                            className="px-4 py-3 text-sm font-medium text-gray-900"
                            onClick={() => handleClienteSelect(cliente)}
                          >
                            {cliente.nombre}
                          </td>
                          <td 
                            className="px-4 py-3 text-sm text-gray-600"
                            onClick={() => handleClienteSelect(cliente)}
                          >
                            {cliente.documento}
                          </td>
                          <td 
                            className="px-4 py-3 text-sm text-gray-600"
                            onClick={() => handleClienteSelect(cliente)}
                          >
                            {cliente.telefono || 'N/A'}
                          </td>
                          <td 
                            className="px-4 py-3 text-sm text-gray-600"
                            onClick={() => handleClienteSelect(cliente)}
                          >
                            {cliente.email || 'N/A'}
                          </td>
                          <td 
                            className="px-4 py-3"
                            onClick={() => handleClienteSelect(cliente)}
                          >
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              cliente.activo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {cliente.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClienteSelect(cliente);
                                }}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Ver pólizas"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 text-gray-600 hover:text-gray-800"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-700">
                        Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, clientesFiltrados.length)} de {clientesFiltrados.length} clientes
                      </span>
                      
                      <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value={25}>25 por página</option>
                        <option value={50}>50 por página</option>
                        <option value={100}>100 por página</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!hasPreviousPage}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <span className="px-3 py-1 text-sm text-gray-700">
                        {currentPage} de {totalPages}
                      </span>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasNextPage}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sección de Pólizas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Pólizas {hasPolizas && `(${polizasFiltradas.length})`}
                  </h3>
                  {clienteSeleccionado && (
                    <p className="text-sm text-gray-500 mt-1">
                      Cliente: {clienteSeleccionado.nombre}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {isClienteSelected && (
                    <>
                      <button
                        onClick={refreshPolizas}
                        disabled={loadingPolizas}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        title="Actualizar pólizas"
                      >
                        <RefreshCw className={`w-4 h-4 ${loadingPolizas ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={clearClienteSeleccionado}
                        className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                      >
                        Limpiar selección
                      </button>
                    </>
                  )}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar póliza..."
                      value={filtroPoliza}
                      onChange={handlePolizaSearchChange}
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
                    <span>Nueva Póliza</span>
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
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Cargando pólizas...</p>
              </div>
            ) : polizasFiltradas.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">No hay pólizas</p>
                <p className="text-sm mt-1">
                  {filtroPoliza ? 'No se encontraron pólizas con esos criterios' : 'Este cliente no tiene pólizas registradas'}
                </p>
                <button
                  onClick={handleNewPoliza}
                  className="mt-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compañía</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ramo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigencia</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prima</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {polizasFiltradas.map((poliza) => (
                      <tr key={poliza.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {poliza.numero || poliza.conpol || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {poliza.compania || poliza.comAlias || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {poliza.ramo || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatDate(poliza.fechaInicio || poliza.confchdes || '')} - {formatDate(poliza.fechaVencimiento || poliza.confchhas || '')}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {poliza.prima ? formatCurrency(poliza.prima) : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(poliza.estado || poliza.convig || 'pendiente')}`}>
                            {poliza.estado || poliza.convig || 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <button
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1 text-gray-600 hover:text-gray-800"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Renovar"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Configuración de Auth */}
      {showAuthDebug && (
        <AuthDebug onClose={() => setShowAuthDebug(false)} />
      )}

      {/* Modal para Nueva Póliza */}
      {showNewPolizaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Nueva Póliza para {clienteSeleccionado?.nombre}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Selección de Compañía */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compañía de Seguros
                </label>
                <select
                  value={selectedCompania || ''}
                  onChange={(e) => setSelectedCompania(Number(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona una compañía</option>
                  {companias.map(compania => (
                    <option key={compania.id} value={compania.id}>
                      {compania.nombre} ({compania.codigo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selección de Ramo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ramo de Seguro
                </label>
                <select
                  value={selectedRamo || ''}
                  onChange={(e) => setSelectedRamo(Number(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona un ramo</option>
                  {ramos.map(ramo => (
                    <option key={ramo.id} value={ramo.id}>
                      {ramo.nombre} ({ramo.codigo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-center py-4">
                <p className="text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  Funcionalidad de creación de pólizas en desarrollo
                </p>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                  disabled={true}
                >
                  Crear Póliza (Próximamente)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Utility function para debounce
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced as T & { cancel: () => void };
}

export default Dashboard;