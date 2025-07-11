import React from 'react';
import { Shield, Building, FileText, Calendar, DollarSign, Car, User } from 'lucide-react';
import { Modal } from '../common/Modal';

type PolizaData = {
  [key: string]: any;
  conpol?: string | number;
  numero?: string | number;
  asegurado?: string;
  compania?: string;
  ramo?: string;
  suma?: number;
  prima?: number;
  estado?: string;
  confchdes?: string;
  confchhas?: string;
  vehiculo?: any;
};

interface PolizaModalProps {
  poliza: PolizaData | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (poliza: PolizaData) => void;
  onViewEndosos?: (poliza: PolizaData) => void;
}

export const PolizaModal: React.FC<PolizaModalProps> = ({ 
  poliza, 
  isOpen, 
  onClose, 
  onEdit,
  onViewEndosos 
}) => {
  if (!poliza) return null;

  const formatCurrency = (amount: any) => {
    if (!amount) return 'No especificado';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (isNaN(numAmount)) return 'No especificado';
    
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'No especificado';
    try {
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      return date.toLocaleDateString('es-UY');
    } catch {
      return 'Fecha inválida';
    }
  };

  const getEstadoColor = (estado: any) => {
    if (!estado) return 'bg-gray-100 text-gray-800';
    
    const estadoStr = String(estado).toLowerCase();
    switch (estadoStr) {
      case 'vigente':
      case 'activa':
        return 'bg-green-100 text-green-800';
      case 'vencida':
      case 'vencido':
        return 'bg-red-100 text-red-800';
      case 'cancelada':
      case 'cancelado':
        return 'bg-gray-100 text-gray-800';
      case 'renovada':
      case 'renovado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleEdit = () => {
    if (onEdit && poliza) {
      onEdit(poliza);
      onClose();
    }
  };

  const handleViewEndosos = () => {
    if (onViewEndosos && poliza) {
      onViewEndosos(poliza);
      onClose();
    }
  };

  // Obtener valores con múltiples fallbacks
  const numeroPoliza = String(
    poliza.conpol || 
    poliza.numero || 
    poliza.numeroPoliza || 
    'N/A'
  );

  const asegurado = String(
    poliza.asegurado || 
    poliza.cliente || 
    poliza.nombreAsegurado || 
    poliza.clinom || 
    'No especificado'
  );

  const compania = String(
    poliza.compania || 
    poliza.com_alias || 
    poliza.Com_alias || 
    poliza.aseguradora || 
    poliza.nombreCompania || 
    'No especificado'
  );

  const ramo = String(
    poliza.ramo || 
    poliza.Ramo || 
    poliza.tipoSeguro || 
    poliza.rama || 
    'No especificado'
  );

  const suma = poliza.suma || 
    poliza.sumaAsegurada || 
    poliza.consum || 
    poliza.Consum || 
    0;

  const prima = poliza.prima || 
    poliza.primaNeta || 
    poliza.conpremio || 
    poliza.Conpremio || 
    0;

  const estado = String(
    poliza.estado || 
    poliza.Estado || 
    poliza.estadoPoliza || 
    'No especificado'
  );

  const vigenciaDesde = poliza.vigenciaDesde || 
    poliza.fechaDesde || 
    poliza.confchdes || 
    poliza.Confchdes || 
    '';

  const vigenciaHasta = poliza.vigenciaHasta || 
    poliza.fechaHasta || 
    poliza.confchhas || 
    poliza.Confchhas || 
    '';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Detalles de la Póliza"
      size="lg"
    >
      <div className="space-y-6">
        {/* Información principal */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-semibold text-gray-900">Póliza #{numeroPoliza}</h4>
            <p className="text-gray-600 mt-1">{asegurado}</p>
            <div className="flex items-center mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(estado)}`}>
                {estado}
              </span>
            </div>
          </div>
        </div>

        {/* Grid de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900 border-b pb-2">Información de la Póliza</h5>
            
            <div className="flex items-center space-x-3">
              <Building className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Compañía</p>
                <p className="text-sm text-gray-600">{compania}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Ramo</p>
                <p className="text-sm text-gray-600">{ramo}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Vigencia</p>
                <p className="text-sm text-gray-600">
                  {formatDate(vigenciaDesde)} - {formatDate(vigenciaHasta)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Asegurado</p>
                <p className="text-sm text-gray-600">{asegurado}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-medium text-gray-900 border-b pb-2">Información Financiera</h5>
            
            <div className="flex items-center space-x-3">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Suma Asegurada</p>
                <p className="text-sm text-gray-600 font-semibold">{formatCurrency(suma)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Prima</p>
                <p className="text-sm text-gray-600 font-semibold">{formatCurrency(prima)}</p>
              </div>
            </div>

            {/* Información adicional si existe */}
            {poliza.conend && (
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Endoso</p>
                  <p className="text-sm text-gray-600">#{String(poliza.conend)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información del vehículo (si aplica y existe) */}
        {ramo.toLowerCase().includes('auto') && poliza.vehiculo && (
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900 border-b pb-2">Información del Vehículo</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Car className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs font-medium text-gray-900">Marca</p>
                  <p className="text-sm text-gray-600">{poliza.vehiculo.marca}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">Modelo</p>
                <p className="text-sm text-gray-600">{poliza.vehiculo.modelo}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">Año</p>
                <p className="text-sm text-gray-600">{poliza.vehiculo.año}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">Patente</p>
                <p className="text-sm text-gray-600 font-mono">{poliza.vehiculo.patente}</p>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
          {onViewEndosos && (
            <button
              onClick={handleViewEndosos}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Ver Endosos
            </button>
          )}
          {onEdit && (
            <button
              onClick={handleEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Editar Póliza
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};