// src/components/modals/ClienteModal.tsx
import React from 'react';
import { User, FileText, Phone, Mail, MapPin, Calendar, Building } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Cliente } from '../../types/cliente';

interface ClienteModalProps {
  cliente: Cliente | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (cliente: Cliente) => void;
}

export const ClienteModal: React.FC<ClienteModalProps> = ({ 
  cliente, 
  isOpen, 
  onClose, 
  onEdit 
}) => {
  if (!cliente) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificado';
    try {
      return new Date(dateString).toLocaleDateString('es-UY');
    } catch {
      return 'Fecha inválida';
    }
  };

  const handleEdit = () => {
    if (onEdit && cliente) {
      onEdit(cliente);
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Detalles del Cliente"
      size="lg"
    >
      <div className="space-y-6">
        {/* Información principal */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-semibold text-gray-900">
              {cliente.clinom || 'Sin nombre'}
            </h4>
            <div className="flex items-center mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                cliente.activo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {cliente.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>

        {/* Grid de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900 border-b pb-2">Información Personal</h5>
            
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Documento</p>
                <p className="text-sm text-gray-600">
                  {cliente.cliced || 'No especificado'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Building className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">RUC</p>
                <p className="text-sm text-gray-600">
                  {cliente.cliruc || 'No especificado'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Fecha Nacimiento</p>
                <p className="text-sm text-gray-600">
                  {formatDate(cliente.clifchnac || 'No especificado')}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-medium text-gray-900 border-b pb-2">Información de Contacto</h5>
            
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Teléfono</p>
                <p className="text-sm text-gray-600">
                  {cliente.telefono || 'No especificado'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">
                  {cliente.cliemail || 'No especificado'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Dirección</p>
                <p className="text-sm text-gray-600">
                  {cliente.clidir || 'No especificado'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cerrar
          </button>
          {onEdit && (
            <button
              onClick={handleEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Editar Cliente
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};