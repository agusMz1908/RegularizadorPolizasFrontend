import React from 'react';
import { Save, X } from 'lucide-react';
import { Cliente } from '../../types/cliente';
import { Modal } from '../common/Modal';

interface ClienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cliente: Omit<Cliente, 'id'>) => Promise<void>;
  initialData?: Partial<Cliente>;
  isEditing?: boolean;
  loading?: boolean;
}

export const ClienteForm: React.FC<ClienteFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  isEditing = false,
  loading = false,
}) => {
  const [formData, setFormData] = React.useState<Partial<Cliente>>({
    nombre: '',
    documento: '',
    telefono: '',
    email: '',
    direccion: '',
    activo: true,
    ...initialData,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: '',
        documento: '',
        telefono: '',
        email: '',
        direccion: '',
        activo: true,
        ...initialData,
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.documento?.trim()) {
      newErrors.documento = 'El documento es requerido';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData as Omit<Cliente, 'id'>);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleChange = (field: keyof Cliente, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.nombre || ''}
                onChange={(e) => handleChange('nombre', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nombre completo del cliente"
                disabled={loading}
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documento *
              </label>
              <input
                type="text"
                value={formData.documento || ''}
                onChange={(e) => handleChange('documento', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.documento ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="CI o RUT"
                disabled={loading}
              />
              {errors.documento && (
                <p className="text-red-500 text-sm mt-1">{errors.documento}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                value={formData.telefono || ''}
                onChange={(e) => handleChange('telefono', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Número de teléfono"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="email@ejemplo.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección
            </label>
            <input
              type="text"
              value={formData.direccion || ''}
              onChange={(e) => handleChange('direccion', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dirección completa"
              disabled={loading}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo || false}
              onChange={(e) => handleChange('activo', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
              Cliente activo
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            <X className="w-4 h-4 inline mr-2" />
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Cliente')}
          </button>
        </div>
      </form>
    </Modal>
  );
};