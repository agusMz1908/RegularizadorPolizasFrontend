import React, { useState } from 'react';
import { Car, Home, Shield, Users } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Compania, Ramo } from '../../types/poliza';

interface NewPolizaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (companiaId: number, ramoId: number) => void;
  companias: Compania[];
  ramos: Ramo[];
  clienteNombre?: string;
}

const ramoIcons: Record<string, React.ReactNode> = {
  AUTO: <Car className="w-5 h-5" />,
  INC: <Home className="w-5 h-5" />,
  RC: <Shield className="w-5 h-5" />,
  VIDA: <Users className="w-5 h-5" />,
};

export const NewPolizaModal: React.FC<NewPolizaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  companias,
  ramos,
  clienteNombre,
}) => {
  const [selectedCompania, setSelectedCompania] = useState<number | null>(null);
  const [selectedRamo, setSelectedRamo] = useState<number | null>(null);

  const handleSubmit = () => {
    if (selectedCompania && selectedRamo) {
      onSubmit(selectedCompania, selectedRamo);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedCompania(null);
    setSelectedRamo(null);
    onClose();
  };

  const isValid = selectedCompania && selectedRamo;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva Póliza"
      size="md"
    >
      <div className="space-y-6">
        {clienteNombre && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Cliente:</span> {clienteNombre}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Seleccionar Compañía
          </label>
          <div className="grid grid-cols-1 gap-2">
            {companias.map((compania) => (
              <button
                key={compania.id}
                onClick={() => setSelectedCompania(compania.id)}
                className={`w-full p-4 text-left border rounded-lg transition-colors ${
                  selectedCompania === compania.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{compania.nombre}</div>
                <div className="text-sm text-gray-500">{compania.codigo}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Seleccionar Ramo
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ramos.map((ramo) => (
              <button
                key={ramo.id}
                onClick={() => setSelectedRamo(ramo.id)}
                className={`p-4 text-left border rounded-lg transition-colors ${
                  selectedRamo === ramo.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {ramoIcons[ramo.codigo] || <Shield className="w-5 h-5" />}
                  <div>
                    <div className="font-medium">{ramo.nombre}</div>
                    <div className="text-xs text-gray-500">{ramo.codigo}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-8">
        <button
          onClick={handleClose}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </Modal>
  );
};