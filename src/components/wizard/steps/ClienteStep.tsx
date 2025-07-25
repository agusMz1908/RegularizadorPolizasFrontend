// src/components/wizard/steps/ClienteStep.tsx - VERSIÓN SIMPLIFICADA SIN MAPEO EXTRA
import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

// Tipos del proyecto - AJUSTADOS A LA ESTRUCTURA REAL
interface ClienteDto {
  id: number;
  clinom: string;      // Nombre completo
  cliced?: string;     // Cédula
  cliruc?: string;     // RUC
  clidir?: string;     // Dirección
  cliemail?: string;   // Email
  telefono?: string;   // Teléfono
  activo: boolean;
  
  // Campos adicionales que pueden venir del API
  correo?: string;
  subcorreo?: string;
  dinom?: string;
  telefax?: string;
  clireferer?: string;
  direccion?: string;
  localidad?: string;
  departamento?: string;
  pais?: string;
  clisex?: string;
  cliestado?: string;
  clinacim?: string;
  clicodig?: string;
  clivendedor?: string;
  clipromotor?: string;
}

// ✅ INTERFACE EXACTA SEGÚN TU POLIZAWIZARD
interface ClienteStepProps {
  // Estado del wizard
  clienteSearch: string;
  clienteResults: ClienteDto[];
  loadingClientes: boolean;
  selectedCliente: ClienteDto | null;
  
  // Acciones
  onSearchChange: (search: string) => (() => void) | void;
  onClienteSelect: (cliente: ClienteDto) => void;
  onNext: () => void;
  onBack: () => void;
  
  // UI
  isDarkMode: boolean;
}

export const ClienteStep: React.FC<ClienteStepProps> = ({
  clienteSearch,
  clienteResults,
  loadingClientes,
  selectedCliente,
  onSearchChange,
  onClienteSelect,
  onNext,
  onBack,
  isDarkMode
}) => {
  // Estado local para el input de búsqueda
  const [searchTerm, setSearchTerm] = useState(clienteSearch);

  // Sincronizar con props
  useEffect(() => {
    setSearchTerm(clienteSearch);
  }, [clienteSearch]);

  // Manejar cambios en la búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const cleanup = onSearchChange(value);
    return typeof cleanup === 'function' ? cleanup : undefined;
  };

return (
    <div className="w-full h-full flex flex-col">
      
      {/* Header del Paso */}
      <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDarkMode ? 'bg-gradient-to-br from-blue-600 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-purple-600'
          }`}>
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Seleccionar Cliente
            </h2>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Busca y selecciona el cliente para crear la póliza
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-8 py-4 flex-1 flex flex-col min-h-0">
        
        {/* Buscador */}
        <div className="mb-4 flex-shrink-0">
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por nombre, cédula o RUC..."
              className={`w-full rounded-xl pl-12 pr-12 py-4 text-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-transparent' 
                  : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-transparent'
              }`}
            />
            {/* Indicador de carga */}
            {loadingClientes && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>

        {/* Resultados */}
        <div className={`rounded-xl border overflow-hidden flex-1 flex flex-col min-h-0 ${
          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          
          {/* Header de la lista */}
          <div className={`px-6 py-4 border-b flex-shrink-0 ${
            isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Resultados encontrados
              </h3>
              <span className="text-sm text-blue-500 font-medium bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                {clienteResults.length} cliente{clienteResults.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Lista de Clientes */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loadingClientes ? (
              <div className="p-12 text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Buscando clientes...
                </p>
              </div>
            ) : clienteResults.length === 0 ? (
              <div className="p-12 text-center">
                <User className={`w-16 h-16 mx-auto mb-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <h4 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {searchTerm ? 'No se encontraron clientes' : 'Comienza a escribir para buscar'}
                </h4>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {searchTerm 
                    ? 'Intenta con otro término de búsqueda' 
                    : 'Escribe el nombre, cédula o RUC del cliente'
                  }
                </p>
              </div>
            ) : (
              <div className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                {clienteResults.map((cliente) => {
                  const isSelected = selectedCliente?.id === cliente.id;
                  return (
                    <div
                      key={cliente.id}
                      className={`p-4 cursor-pointer group transition-all duration-200 ${
                        isDarkMode 
                          ? 'hover:bg-gray-600' 
                          : 'hover:bg-white'
                      } ${
                        isSelected 
                          ? isDarkMode 
                            ? 'bg-blue-900/30 border-l-4 border-l-blue-500' 
                            : 'bg-blue-50 border-l-4 border-l-blue-500'
                          : ''
                      }`}
                      onClick={() => onClienteSelect(cliente)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          
                          {/* Avatar */}
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                              : isDarkMode 
                                ? 'bg-gray-600 group-hover:bg-gray-500' 
                                : 'bg-gray-200 group-hover:bg-blue-100'
                          }`}>
                            <User className={`w-5 h-5 ${
                              isSelected ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`} />
                          </div>

                          {/* Información del cliente */}
                          <div className="flex-1 min-w-0">
                            
                            {/* Nombre */}
                            <h4 className={`font-semibold text-base truncate transition-colors ${
                              isDarkMode 
                                ? 'text-white group-hover:text-blue-300' 
                                : 'text-gray-900 group-hover:text-blue-600'
                            }`}>
                              {cliente.clinom}
                            </h4>
                            
                            {/* Documentos */}
                            <div className="flex items-center space-x-2 mt-1">
                              {cliente.cliced && (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  isDarkMode 
                                    ? 'bg-blue-800 text-blue-200' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  CI: {cliente.cliced}
                                </span>
                              )}
                              {cliente.cliruc && (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  isDarkMode 
                                    ? 'bg-green-800 text-green-200' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  RUC: {cliente.cliruc}
                                </span>
                              )}
                            </div>

                            {/* Información de contacto */}
                            <div className={`flex items-center space-x-3 mt-1 text-xs ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {cliente.cliemail && (
                                <div className="flex items-center space-x-1">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate max-w-48">{cliente.cliemail}</span>
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
                                  <span className="truncate max-w-40">{cliente.clidir}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Botón de selección */}
                        <div className="flex items-center space-x-2">
                          {isSelected && (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              isDarkMode ? 'bg-green-600' : 'bg-green-500'
                            }`}>
                              <ArrowRight className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <button
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              isSelected
                                ? 'bg-blue-500 text-white'
                                : isDarkMode
                                  ? 'bg-gray-600 text-gray-300 hover:bg-gray-500 group-hover:bg-blue-500 group-hover:text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 group-hover:bg-blue-500 group-hover:text-white'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onClienteSelect(cliente);
                            }}
                          >
                            {isSelected ? 'Seleccionado' : 'Seleccionar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Información del cliente seleccionado */}
        {selectedCliente && (
          <div className={`mt-4 p-4 rounded-xl border-2 flex-shrink-0 ${
            isDarkMode 
              ? 'bg-blue-900/20 border-blue-700' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Cliente seleccionado
                </h4>
                <p className={`font-bold text-base mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedCliente.clinom || selectedCliente.dinom || 'Nombre no disponible'}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs">
                  {(selectedCliente.cliruc || selectedCliente.correo) && (
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      RUC: {selectedCliente.cliruc || selectedCliente.correo}
                    </span>
                  )}
                  {(selectedCliente.cliced || selectedCliente.subcorreo) && (
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      CI: {selectedCliente.cliced || selectedCliente.subcorreo}
                    </span>
                  )}
                  {(selectedCliente.clidir || selectedCliente.direccion) && (
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      📍 {selectedCliente.clidir || selectedCliente.direccion}
                    </span>
                  )}
                  {(selectedCliente.cliemail || selectedCliente.telefono) && (
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      📧 {selectedCliente.cliemail || selectedCliente.telefono}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClienteStep;