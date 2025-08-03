// src/components/wizard/ClientSelector.tsx - MEJORADO BASADO EN TU CÓDIGO ACTUAL
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  IdCard,
  Building2
} from 'lucide-react';
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
        <h2 className="text-2xl font-bold text-foreground">
          Seleccionar Cliente
        </h2>
        <p className="text-lg text-muted-foreground">
          Busca y selecciona el cliente para la póliza
        </p>
      </div>

      {/* Enhanced Search Input */}
      <div className="relative max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className={cn(
              "h-5 w-5 transition-colors",
              showLoading ? "text-primary animate-pulse" : "text-muted-foreground"
            )} />
          </div>
          <Input
            type="text"
            placeholder="Buscar cliente por nombre, documento o email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-12 pr-20 h-12 text-lg border-2 focus:border-primary transition-all"
            autoFocus
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            {showLoading ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <Badge variant="secondary" className="text-xs">
                {showResults ? `${clients.length} resultados` : 'Escribe para buscar'}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Enhanced Search hint */}
        <div className="flex items-center justify-center mt-3 space-x-4 text-xs text-muted-foreground">
          <span>✨ Busca por nombre, CI, RUT o email</span>
          <span>•</span>
          <span>📧 Mínimo 2 caracteres</span>
        </div>
      </div>

      {/* Selected Client Display */}
      {selected && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-foreground mb-2 flex items-center">
              <User className="h-4 w-4 mr-2 text-primary" />
              Cliente Seleccionado:
            </h3>
          </div>
          <EnhancedClientCard 
            client={selected} 
            isSelected={true}
            onClick={() => {}} 
            showSelectButton={false}
          />
        </div>
      )}

      {/* Error State */}
      {isError && showResults && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Error al buscar clientes
          </h3>
          <p className="text-destructive mb-4">
            {error?.message || 'No se pudo conectar con el servidor'}
          </p>
          <Button 
            variant="outline" 
            onClick={() => setSearchTerm('')}
            className="mx-auto"
          >
            Reintentar Búsqueda
          </Button>
        </div>
      )}

      {/* Enhanced Loading State */}
      {showLoading && !isError && (
        <div className="text-center py-12">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <Search className="absolute inset-0 w-6 h-6 m-auto text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-lg">
            Buscando clientes...
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Término: "{debouncedSearchTerm}"
          </p>
        </div>
      )}

      {/* Search Results with Virtual Scrolling */}
      {showResults && !showLoading && !isError && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center space-x-2">
              {clients.length === 0 ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <span>No se encontraron clientes para "{debouncedSearchTerm}"</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4 text-primary" />
                  <span>
                    {clients.length} cliente{clients.length !== 1 ? 's' : ''} encontrado{clients.length !== 1 ? 's' : ''}
                  </span>
                </>
              )}
            </p>
          </div>
          
          {clients.length > 0 && (
            <div className="h-96 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {clients.map((client: ClientDto) => (
                  <EnhancedClientCard
                    key={client.id}
                    client={client}
                    isSelected={selected?.id === client.id}
                    onClick={() => handleClientSelect(client)}
                    showSelectButton={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Results State */}
          {clients.length === 0 && (
            <div className="text-center py-8">
              <div className="bg-muted/50 rounded-lg p-6 max-w-md mx-auto">
                <User className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-foreground mb-2">Sin resultados</h3>
                <p className="text-sm text-muted-foreground">
                  Intenta con otro término de búsqueda o verifica la información del cliente.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Empty State */}
      {!showResults && searchTerm.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 max-w-md mx-auto">
            <Search className="mx-auto h-16 w-16 text-primary mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Buscar Cliente
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Utiliza el campo de búsqueda para encontrar el cliente. 
              Puedes buscar por nombre, email, cédula o RUT.
            </p>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center">
                <IdCard className="h-4 w-4 mr-1" />
                CI/RUT
              </span>
              <span className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                Email
              </span>
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                Nombre
              </span>
            </div>
            
            {/* API Connection Status */}
            <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
              <p>🔗 Conectando con: <code className="text-primary">https://localhost:7001/api</code></p>
              <p>📡 Endpoint: <code className="text-secondary">GET /api/clientes/all?search=...</code></p>
            </div>
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
              onSelect(selected);
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

// Función para obtener iniciales del nombre
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// Enhanced Client Card basado en tu código actual pero mejorado
interface EnhancedClientCardProps {
  client: ClientDto;
  isSelected: boolean;
  onClick: () => void;
  showSelectButton: boolean;
}

const EnhancedClientCard: React.FC<EnhancedClientCardProps> = ({ 
  client, 
  isSelected, 
  onClick, 
  showSelectButton 
}) => {
  // Mantener tu lógica original para determinar si es empresa
  const isCompany = client.cliruc && client.cliruc.length >= 12;
  
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-xl group relative overflow-hidden",
        "hover:scale-[1.02] hover:border-primary/30 active:scale-[0.98]",
        isSelected && "ring-2 ring-primary bg-primary/5 shadow-lg scale-[1.02]"
      )}
      onClick={onClick}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Enhanced Avatar */}
            <Avatar className="h-10 w-10 group-hover:scale-110 transition-transform duration-300">
              <AvatarFallback className={cn(
                "font-semibold text-white transition-all duration-300",
                isCompany 
                  ? "bg-gradient-to-br from-purple-500 to-pink-500" 
                  : "bg-gradient-to-br from-blue-500 to-primary",
                isSelected && "from-primary to-primary"
              )}>
                {getInitials(client.clinom)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <CardTitle className={cn(
                "text-lg font-semibold transition-colors duration-300",
                "group-hover:text-primary",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {client.clinom}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={isCompany ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {isCompany ? (
                    <>
                      <Building2 className="h-3 w-3 mr-1" />
                      Empresa
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3 mr-1" />
                      Persona
                    </>
                  )}
                </Badge>
                <span className="text-xs text-muted-foreground">ID: {client.id}</span>
              </div>
            </div>
          </div>
          
          {isSelected && (
            <div className="flex items-center text-primary animate-in fade-in slide-in-from-right-2">
              <span className="text-sm font-medium">Seleccionado</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 relative">
        <div className="space-y-3">
          {/* Documento con iconos mejorados */}
          <div className="flex items-center space-x-3 text-sm">
            <IdCard className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground min-w-0 flex-shrink-0">
              {isCompany ? 'RUT:' : 'CI:'}
            </span>
            <span className="text-foreground font-medium truncate">
              {isCompany ? client.cliruc : client.cliced}
            </span>
          </div>
          
          {/* Email */}
          {client.cliemail && (
            <div className="flex items-center space-x-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground min-w-0 flex-shrink-0">Email:</span>
              <span className="text-foreground font-medium truncate">{client.cliemail}</span>
            </div>
          )}
          
          {/* Teléfono */}
          {client.clitelcel && (
            <div className="flex items-center space-x-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground min-w-0 flex-shrink-0">Tel:</span>
              <span className="text-foreground font-medium">{client.clitelcel}</span>
            </div>
          )}
          
          {/* Dirección */}
          {client.clidir && (
            <div className="flex items-center space-x-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground min-w-0 flex-shrink-0">Dir:</span>
              <span className="text-foreground font-medium truncate">
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
              className={cn(
                "w-full transition-all duration-300",
                "group-hover:bg-primary group-hover:text-primary-foreground",
                isSelected && "bg-primary text-primary-foreground"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              {isSelected ? (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Cliente Seleccionado
                </>
              ) : (
                <>
                  Seleccionar Cliente
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientSelector;