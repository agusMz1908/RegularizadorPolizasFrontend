import React from 'react';
import { User, Search, ArrowRight, Mail, Phone, MapPin } from 'lucide-react';
import { Cliente } from '../../../types/ui/wizard';
import { StepLayout } from '../shared/StepLayout';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface ClienteStepProps {
  // Estado del wizard
  clienteSearch: string;
  clienteResults: Cliente[];
  loadingClientes: boolean;
  selectedCliente: Cliente | null;
  
  // Acciones
  onSearchChange: (search: string) => void;
  onClienteSelect: (cliente: Cliente) => void;
  onNext: () => void;
  onBack?: () => void;
  
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
  const handleSearchChange = (search: string) => {
    onSearchChange(search);
    // Auto-buscar cuando hay más de 2 caracteres
    if (search.length >= 2) {
      // La búsqueda se maneja en el hook usePolizaWizard
    }
  };

  return (
    <StepLayout
      title="Seleccionar Cliente"
      description="Busca y selecciona el cliente para crear la póliza"
      icon={User}
      color="blue"
      isDarkMode={isDarkMode}
      onNext={selectedCliente ? onNext : undefined}
      onBack={onBack}
      nextLabel="Continuar"
      backLabel="Atrás"
      nextDisabled={!selectedCliente}
    >
      {/* Buscador */}
      <ClienteSearchBox
        value={clienteSearch}
        onChange={handleSearchChange}
        isDarkMode={isDarkMode}
      />

      {/* Resultados */}
      <div className="p-8">
        {loadingClientes ? (
          <LoadingSpinner 
            message="Buscando clientes..." 
            isDarkMode={isDarkMode}
          />
        ) : (
          <ClienteResultsList
            clientes={clienteResults}
            selectedCliente={selectedCliente}
            onSelect={onClienteSelect}
            isDarkMode={isDarkMode}
            searchValue={clienteSearch}
          />
        )}
      </div>
    </StepLayout>
  );
};

// ✅ Sub-componente: Buscador
interface ClienteSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  isDarkMode: boolean;
}

const ClienteSearchBox: React.FC<ClienteSearchBoxProps> = ({
  value,
  onChange,
  isDarkMode
}) => (
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por nombre, documento o RUC..."
        className={`block w-full pl-12 pr-4 py-4 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 shadow-sm ${
          isDarkMode 
            ? 'bg-gray-700/50 border-blue-700/30 text-gray-100 focus:ring-blue-500/30' 
            : 'bg-white border-gray-200 focus:ring-blue-100'
        }`}
      />
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
        <div className={`px-3 py-1 text-sm rounded-lg ${
          isDarkMode 
            ? 'text-gray-400 bg-gray-700' 
            : 'text-gray-500 bg-gray-100'
        }`}>
          {value.length}/2 min
        </div>
      </div>
    </div>
  </div>
);

// ✅ Sub-componente: Lista de resultados
interface ClienteResultsListProps {
  clientes: Cliente[];
  selectedCliente: Cliente | null;
  onSelect: (cliente: Cliente) => void;
  isDarkMode: boolean;
  searchValue: string;
}

const ClienteResultsList: React.FC<ClienteResultsListProps> = ({
  clientes,
  selectedCliente,
  onSelect,
  isDarkMode,
  searchValue
}) => {
  // Estado cuando no hay búsqueda iniciada
  if (searchValue.length < 2) {
    return (
      <div className="text-center py-16">
        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <User className={`w-12 h-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
        </div>
        <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Buscar Cliente
        </h3>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
          Escribe al menos 2 caracteres para buscar clientes
        </p>
      </div>
    );
  }

  // Estado cuando no hay resultados
  if (clientes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <Search className={`w-12 h-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
        </div>
        <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Sin resultados
        </h3>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
          No se encontraron clientes con "{searchValue}"
        </p>
        <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Intenta buscar por nombre, documento o RUC
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Resultados encontrados
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isDarkMode 
            ? 'bg-blue-900 text-blue-200' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lista de clientes */}
      <div className="space-y-3 max-h-80 sm:max-h-96 lg:max-h-[32rem] xl:max-h-[40rem] overflow-y-auto pr-2">
        {clientes.map((cliente) => (
          <ClienteCard
            key={cliente.id}
            cliente={cliente}
            isSelected={selectedCliente?.id === cliente.id}
            onSelect={() => onSelect(cliente)}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </div>
  );
};

// ✅ Sub-componente: Card de cliente
interface ClienteCardProps {
  cliente: Cliente;
  isSelected: boolean;
  onSelect: () => void;
  isDarkMode: boolean;
}

const ClienteCard: React.FC<ClienteCardProps> = ({
  cliente,
  isSelected,
  onSelect,
  isDarkMode
}) => (
  <div
    onClick={onSelect}
    className={`group relative p-4 border rounded-xl hover:shadow-md cursor-pointer transition-all duration-200 ${
      isDarkMode 
        ? 'border-gray-600 bg-gray-700 hover:border-blue-500 hover:bg-gray-650' 
        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
    } ${isSelected 
      ? isDarkMode 
        ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-900/20' 
        : 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
      : ''}`}
  >
    <div className="flex items-center justify-between">
      {/* Información principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isSelected 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
              : isDarkMode 
                ? 'bg-gradient-to-br from-blue-600 to-purple-700' 
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
          }`}>
            <User className="w-5 h-5 text-white" />
          </div>

          {/* Datos del cliente */}
          <div className="flex-1 min-w-0">
            {/* Nombre + documentos */}
            <div className="flex items-center space-x-3 mb-1">
              <h4 className={`font-bold text-lg truncate ${
                isDarkMode 
                  ? 'text-white group-hover:text-blue-300' 
                  : 'text-gray-900 group-hover:text-blue-900'
              } transition-colors`}>
                {cliente.clinom}
              </h4>
              
              {/* Documentos inline */}
              <div className="flex items-center space-x-2">
                {cliente.cliced && (
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    isDarkMode 
                      ? 'bg-blue-800 text-blue-200' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    CI: {cliente.cliced}
                  </span>
                )}
                {cliente.cliruc && (
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    isDarkMode 
                      ? 'bg-green-800 text-green-200' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    RUC: {cliente.cliruc}
                  </span>
                )}
              </div>
            </div>

            {/* Contacto */}
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

      {/* Acción */}
      <div className="flex items-center space-x-3 ml-4">
        {isSelected && (
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-green-600' : 'bg-green-500'
          }`}>
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        )}
        <span className={`text-xs font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-500'
        }`}>
          {isSelected ? 'Seleccionado' : 'Seleccionar'}
        </span>
        <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
          isDarkMode ? 'text-blue-400' : 'text-blue-500'
        }`} />
      </div>
    </div>
  </div>
);

export default ClienteStep;