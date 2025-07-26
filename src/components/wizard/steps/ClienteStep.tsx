import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Cliente } from '../../../types/core/cliente'

// ✅ INTERFACE CORREGIDA - USANDO Cliente EN LUGAR DE ClienteDto
interface ClienteStepProps {
  // Estado del wizard
  clienteSearch: string;
  clienteResults: Cliente[];           // ✅ Cliente[] no ClienteDto[]
  loadingClientes: boolean;
  selectedCliente: Cliente | null;     // ✅ Cliente no ClienteDto
  
  // Acciones
  onSearchChange: (search: string) => (() => void) | void;
  onClienteSelect: (cliente: Cliente) => void;  // ✅ Cliente no ClienteDto
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
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Busque y seleccione el cliente para la póliza
            </p>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 p-8">
        
        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar cliente por nombre, cédula o RUC..."
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-4 focus:border-blue-500 transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500/30' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-100'
              }`}
            />
          </div>
        </div>

        {/* Estado de carga */}
        {loadingClientes && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Sin resultados */}
        {!loadingClientes && searchTerm.length >= 2 && clienteResults.length === 0 && (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron clientes con "{searchTerm}"</p>
          </div>
        )}

        {/* Instrucción inicial */}
        {searchTerm.length < 2 && (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Escriba al menos 2 caracteres para buscar clientes</p>
          </div>
        )}

        {/* Lista de resultados */}
        {!loadingClientes && clienteResults.length > 0 && (
          <div className="space-y-3">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Resultados de búsqueda ({clienteResults.length})
            </h3>
            
            <div className="grid gap-3">
              {clienteResults.map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => onClienteSelect(cliente)}
                  className={`
                    w-full p-4 rounded-xl border-2 text-left transition-all duration-200
                    ${selectedCliente?.id === cliente.id
                      ? isDarkMode 
                        ? 'bg-blue-900/50 border-blue-600 text-blue-200' 
                        : 'bg-blue-50 border-blue-400 text-blue-900'
                      : isDarkMode
                        ? 'bg-gray-700 border-gray-600 hover:border-gray-500 text-gray-200 hover:bg-gray-600'
                        : 'bg-white border-gray-200 hover:border-gray-300 text-gray-900 hover:bg-gray-50'
                    }
                    hover:scale-[1.02] hover:shadow-lg
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedCliente?.id === cliente.id
                            ? 'bg-blue-600 text-white'
                            : isDarkMode 
                              ? 'bg-gray-600 text-gray-300' 
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          <User className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg truncate">
                            {cliente.clinom}
                          </h4>
                          
                          <div className="flex items-center space-x-4 mt-1">
                            {cliente.cliced && (
                              <span className={`text-sm ${
                                selectedCliente?.id === cliente.id
                                  ? isDarkMode ? 'text-blue-300' : 'text-blue-700'
                                  : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                CI: {cliente.cliced}
                              </span>
                            )}
                            
                            {cliente.cliruc && (
                              <span className={`text-sm ${
                                selectedCliente?.id === cliente.id
                                  ? isDarkMode ? 'text-blue-300' : 'text-blue-700'
                                  : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                RUC: {cliente.cliruc}
                              </span>
                            )}
                          </div>

                          {/* Información adicional */}
                          <div className="flex items-center space-x-4 mt-2">
                            {cliente.cliemail && (
                              <div className="flex items-center space-x-1">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm truncate max-w-48">
                                  {cliente.cliemail}
                                </span>
                              </div>
                            )}
                            
                            {cliente.telefono && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm">
                                  {cliente.telefono}
                                </span>
                              </div>
                            )}
                          </div>

                          {cliente.clidir && (
                            <div className="flex items-center space-x-1 mt-1">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm truncate">
                                {cliente.clidir}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {selectedCliente?.id === cliente.id && (
                      <div className="ml-4">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cliente seleccionado */}
        {selectedCliente && (
          <div className={`mt-6 p-4 rounded-xl border-2 ${
            isDarkMode 
              ? 'bg-green-900/20 border-green-700 text-green-300' 
              : 'bg-green-50 border-green-300 text-green-800'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold">Cliente seleccionado</h4>
                <p className="text-sm opacity-90">{selectedCliente.clinom}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between items-center p-8 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Anterior
        </button>

        <button
          onClick={onNext}
          disabled={!selectedCliente}
          className={`
            px-6 py-3 rounded-lg font-medium transition-all duration-200
            flex items-center space-x-2
            ${!selectedCliente
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105'
            }
          `}
        >
          <span>Continuar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};