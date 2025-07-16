import React, { useState } from 'react';
import { 
  FileText, 
  User, 
  Car, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  DollarSign,
  Shield,
  Edit3,
  Check,
  X,
  Send,
  Search,
  UserPlus,
  ArrowLeft
} from 'lucide-react';
import type { AzureProcessResponse } from '../../types/azure-document';

interface EnhancedDocumentDisplayProps {
  documentResult: AzureProcessResponse;
  onBack: () => void;
  onSendToVelneo: (data: any) => void;
  onSearchClient: (searchData: any) => void;
  onCreateClient: (clientData: any) => void;
}

export const EnhancedDocumentDisplay: React.FC<EnhancedDocumentDisplayProps> = ({
  documentResult,
  onBack,
  onSendToVelneo,
  onSearchClient,
  onCreateClient
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState(documentResult.datosFormateados);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);

  const handleFieldEdit = (fieldName: string, newValue: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: newValue
    }));
    setEditingField(null);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 95) return 'bg-green-100 text-green-800';
    if (score >= 85) return 'bg-yellow-100 text-yellow-800';
    if (score >= 70) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const EditableField: React.FC<{
    label: string;
    value: string | number | null | undefined;
    fieldName: string;
    type?: string;
    required?: boolean;
  }> = ({ label, value, fieldName, type = "text", required = false }) => {
    const isEditing = editingField === fieldName;
    const displayValue = value?.toString() || '';
    
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 flex items-center">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type={type}
                defaultValue={displayValue}
                className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFieldEdit(fieldName, (e.target as HTMLInputElement).value);
                  } else if (e.key === 'Escape') {
                    setEditingField(null);
                  }
                }}
                autoFocus
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.parentElement?.querySelector('input');
                  if (input) {
                    handleFieldEdit(fieldName, input.value);
                  }
                }}
                className="p-1 text-green-600 hover:text-green-800"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="p-1 text-red-600 hover:text-red-800"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <input
                type={type}
                value={displayValue}
                readOnly
                className={`flex-1 px-3 py-2 border rounded-md bg-gray-50 ${
                  displayValue ? 'border-green-300' : 'border-orange-300'
                }`}
              />
              <button
                onClick={() => setEditingField(fieldName)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Edit3 size={16} />
              </button>
              {displayValue && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const SectionCard: React.FC<{
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    className?: string;
  }> = ({ title, icon: Icon, children, className = "" }) => (
    <div className={`bg-white rounded-lg border shadow-sm p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Icon className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const handleConfirmClient = (cliente: any) => {
    setClienteSeleccionado(cliente);
  };

  const handleSearchClient = () => {
    const searchData = {
      nombre: formData.asegurado,
      documento: formData.documento,
      email: formData.email
    };
    onSearchClient(searchData);
  };

  const handleSendToVelneo = () => {
    const dataToSend = {
      ...formData,
      clienteSeleccionado,
      documentoOriginal: documentResult.archivo
    };
    onSendToVelneo(dataToSend);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header con botón de regreso */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{documentResult.archivo}</h1>
              <p className="text-sm text-gray-600">
                Procesado en {documentResult.tiempoProcesamiento}ms • Estado: {documentResult.estado}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">
                Procesamiento Exitoso
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Estado del Cliente */}
      {documentResult.busquedaCliente.clientesEncontrados > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-900">Cliente Encontrado</h3>
                <p className="text-sm text-yellow-700">{documentResult.busquedaCliente.mensaje}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(documentResult.busquedaCliente.matches[0]?.score || 0)}`}>
                {documentResult.busquedaCliente.matches[0]?.score || 0}% Confianza
              </span>
              <button 
                onClick={() => handleConfirmClient(documentResult.busquedaCliente.matches[0]?.cliente)}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
              >
                Confirmar Cliente
              </button>
              <button 
                onClick={handleSearchClient}
                className="px-3 py-1 border border-yellow-600 text-yellow-600 rounded text-sm hover:bg-yellow-50"
              >
                Buscar Otro
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información de la Póliza */}
        <SectionCard title="Información de la Póliza" icon={Shield}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Número de Póliza"
              value={formData.numeroPoliza}
              fieldName="numeroPoliza"
              required
            />
            <EditableField
              label="Compañía"
              value={formData.compania || documentResult.resumen.numeroPolizaExtraido}
              fieldName="compania"
              required
            />
            <EditableField
              label="Vigencia Desde"
              value={formData.vigenciaDesde}
              fieldName="vigenciaDesde"
              type="date"
              required
            />
            <EditableField
              label="Vigencia Hasta"
              value={formData.vigenciaHasta}
              fieldName="vigenciaHasta"
              type="date"
              required
            />
            <EditableField
              label="Corredor"
              value={formData.corredor}
              fieldName="corredor"
            />
            <EditableField
              label="Plan"
              value={formData.plan}
              fieldName="plan"
            />
            <EditableField
              label="Ramo"
              value={formData.ramo}
              fieldName="ramo"
            />
          </div>
        </SectionCard>

        {/* Información del Cliente */}
        <SectionCard title="Datos del Cliente" icon={User}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <EditableField
                label="Asegurado"
                value={formData.asegurado}
                fieldName="asegurado"
                required
              />
            </div>
            <EditableField
              label="Documento"
              value={formData.documento}
              fieldName="documento"
              required
            />
            <EditableField
              label="Teléfono"
              value={formData.telefono}
              fieldName="telefono"
              type="tel"
            />
            <div className="md:col-span-2">
              <EditableField
                label="Email"
                value={formData.email}
                fieldName="email"
                type="email"
              />
            </div>
            <div className="md:col-span-2">
              <EditableField
                label="Dirección"
                value={formData.direccion}
                fieldName="direccion"
              />
            </div>
            <EditableField
              label="Departamento"
              value={formData.departamento}
              fieldName="departamento"
            />
            <EditableField
              label="Localidad"
              value={formData.localidad}
              fieldName="localidad"
            />
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Vehículo */}
        <SectionCard title="Datos del Vehículo" icon={Car}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <EditableField
                label="Vehículo"
                value={formData.vehiculo}
                fieldName="vehiculo"
                required
              />
            </div>
            <EditableField
              label="Marca"
              value={formData.marca}
              fieldName="marca"
              required
            />
            <EditableField
              label="Modelo"
              value={formData.modelo}
              fieldName="modelo"
              required
            />
            <EditableField
              label="Año"
              value={formData.anio}
              fieldName="anio"
              type="number"
              required
            />
            <EditableField
              label="Matrícula"
              value={formData.matricula}
              fieldName="matricula"
              required
            />
            <EditableField
              label="Motor"
              value={formData.motor}
              fieldName="motor"
            />
            <EditableField
              label="Chasis"
              value={formData.chasis}
              fieldName="chasis"
            />
          </div>
        </SectionCard>

        {/* Información Financiera */}
        <SectionCard title="Información Financiera" icon={DollarSign}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditableField
              label="Prima Comercial"
              value={formData.primaComercial}
              fieldName="primaComercial"
              type="number"
              required
            />
            <EditableField
              label="Premio Total"
              value={formData.premioTotal}
              fieldName="premioTotal"
              type="number"
              required
            />
          </div>
        </SectionCard>
      </div>

      {/* Cliente Confirmado */}
      {clienteSeleccionado && (
        <SectionCard title="Cliente Confirmado" icon={User} className="border-green-300 bg-green-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Nombre</p>
              <p className="text-lg font-semibold text-green-800">{clienteSeleccionado.nombre}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Documento</p>
              <p className="text-lg font-semibold text-green-800">{clienteSeleccionado.documento}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Teléfono</p>
              <p className="text-lg font-semibold text-green-800">{clienteSeleccionado.telefono}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => setClienteSeleccionado(null)}
              className="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-100"
            >
              Cambiar Cliente
            </button>
          </div>
        </SectionCard>
      )}

      {/* Acciones */}
      <div className="flex items-center justify-between bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleSearchClient}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Search className="w-4 h-4" />
            <span>Buscar Cliente</span>
          </button>
          <button 
            onClick={() => onCreateClient(formData)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Cliente</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Volver
          </button>
          <button 
            onClick={handleSendToVelneo}
            disabled={!clienteSeleccionado}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span>Enviar a Velneo</span>
          </button>
        </div>
      </div>
    </div>
  );
};