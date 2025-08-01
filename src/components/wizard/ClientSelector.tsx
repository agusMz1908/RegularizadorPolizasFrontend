import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, Mail, Phone, MapPin, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ClientDto } from '../../types/cliente';
import { useClientSearch } from '@/hooks/useCliente';

interface ClientSelectorProps {
  onSelect: (client: ClientDto) => void;
  selected?: ClientDto;
  onBack: () => void;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ onSelect, selected, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce del término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Hook para buscar clientes con la API real
  const {
    data: clients = [],
    isLoading,
    isError,
    error,
    isFetching
  } = useClientSearch(debouncedSearchTerm, debouncedSearchTerm.length >= 2);

  const handleClientSelect = (client: ClientDto) => {
    onSelect(client);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const showResults = debouncedSearchTerm.length >= 2;
  const showLoading = isLoading || (isFetching && searchTerm !== debouncedSearchTerm);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Seleccionar Cliente
        </h2>
        <p className="text-lg text-gray-600">
          Busca y selecciona el cliente para la póliza
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar por nombre, email, CI o RUT..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
            autoFocus
          />
          {showLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
          )}
        </div>
        
        {/* Search hint */}
        <p className="text-xs text-gray-500 mt-2 text-center">
          Ingresa al menos 2 caracteres para buscar
        </p>
      </div>

      {/* Selected Client Display */}
      {selected && (
        <div className="max-w-2xl mx-auto">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Cliente Seleccionado:</h3>
          <ClientCard 
            client={selected} 
            isSelected={true}
            onClick={() => {}} 
            showSelectButton={false}
          />
        </div>
      )}

      {/* Error State */}
      {isError && showResults && (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al buscar clientes
          </h3>
          <p className="text-red-600 mb-4">
            {error?.message || 'No se pudo conectar con el servidor'}
          </p>
          <Button 
            variant="outline" 
            onClick={() => setSearchTerm('')}
            className="mx-auto"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Loading State */}
      {showLoading && !isError && (
        <div className="text-center py-8">
          <Loader2 className="mx-auto h-8 w-8 text-gray-400 animate-spin mb-4" />
          <p className="text-gray-600">
            Buscando clientes...
          </p>
        </div>
      )}

      {/* Search Results */}
      {showResults && !showLoading && !isError && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {clients.length === 0 
                ? `No se encontraron clientes para "${debouncedSearchTerm}"`
                : `${clients.length} cliente${clients.length !== 1 ? 's' : ''} encontrado${clients.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
          
          {clients.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {clients.map((client: ClientDto) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  isSelected={selected?.id === client.id}
                  onClick={() => handleClientSelect(client)}
                  showSelectButton={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!showResults && searchTerm.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Buscar Cliente
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Utiliza el campo de búsqueda para encontrar el cliente. 
            Puedes buscar por nombre, email, cédula o RUT.
          </p>
          
          {/* API Connection Status */}
          <div className="mt-4 text-xs text-gray-500">
            <p>🔗 Conectando con: <code>https://localhost:7001/api</code></p>
            <p>📡 Endpoint: <code>GET /api/clientes/all?search=...</code></p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="min-w-[120px]"
        >
          Volver
        </Button>
        
        <Button
          size="lg"
          disabled={!selected}
          onClick={() => {
            if (selected) {
              onSelect(selected); // Esto ejecutará handleClientSelect en App.tsx
            }
          }}
          className="min-w-[200px]"
        >
          Continuar
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Componente para mostrar cada cliente
interface ClientCardProps {
  client: ClientDto;
  isSelected: boolean;
  onClick: () => void;
  showSelectButton: boolean;
}

const ClientCard: React.FC<ClientCardProps> = ({ 
  client, 
  isSelected, 
  onClick, 
  showSelectButton 
}) => {
  const isCompany = client.cliruc && client.cliruc.length >= 12;
  
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-blue-500 bg-blue-50"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-lg",
              isCompany ? "bg-purple-100" : "bg-blue-100"
            )}>
              <User className={cn(
                "h-5 w-5",
                isCompany ? "text-purple-600" : "text-blue-600"
              )} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {client.clinom}
              </CardTitle>
              <p className="text-sm text-gray-500">
                {isCompany ? 'Empresa' : 'Persona'} • ID: {client.id}
              </p>
            </div>
          </div>
          
          {isSelected && (
            <div className="flex items-center text-blue-600">
              <span className="text-sm font-medium">Seleccionado</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Documento */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-medium text-gray-700">
              {isCompany ? 'RUT:' : 'CI:'}
            </span>
            <span className="text-gray-600">
              {isCompany ? client.cliruc : client.cliced}
            </span>
          </div>
          
          {/* Email */}
          {client.cliemail && (
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 truncate">{client.cliemail}</span>
            </div>
          )}
          
          {/* Teléfono */}
          {client.clitelcel && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{client.clitelcel}</span>
            </div>
          )}
          
          {/* Dirección */}
          {client.clidir && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 truncate">
                {client.clidir}
                {client.clilocnom && `, ${client.clilocnom}`}
              </span>
            </div>
          )}
        </div>
        
        {showSelectButton && (
          <div className="mt-4 pt-3 border-t">
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              {isSelected ? 'Seleccionado' : 'Seleccionar'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientSelector;