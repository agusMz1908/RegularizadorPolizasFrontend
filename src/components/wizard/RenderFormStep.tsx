import React, { useState, useEffect } from 'react';
import { 
  User, Building2, FileText, Eye, Check, 
  Car, DollarSign, Calendar, MapPin, Mail, Phone,
  Edit3, Save, CheckCircle, AlertTriangle, Loader2
} from 'lucide-react';

interface PolizaWizardFormStepProps {
  wizard: any; // Usar el mismo tipo que tu usePolizaWizard
  formData: any;
  setFormData: (data: any) => void;
}

const PolizaWizardFormStep: React.FC<PolizaWizardFormStepProps> = ({ 
  wizard, 
  formData, 
  setFormData 
}) => {
  const [saving, setSaving] = useState(false);

  // Llenar formulario con datos extraídos REALES
  useEffect(() => {
    if (wizard.extractedData) {
      console.log('🔍 DATOS REALES EXTRAÍDOS:', wizard.extractedData);
      
      // Acceder a los datos según la estructura real de tu backend
      // Puede ser wizard.extractedData.datosFormateados o directamente wizard.extractedData
      const datos = wizard.extractedData.datosFormateados || wizard.extractedData;
      
      setFormData((prev: any) => ({
        ...prev,
        // Datos básicos
        numeroPoliza: datos?.numeroPoliza || '',
        asegurado: datos?.asegurado || wizard.selectedCliente?.clinom || '',
        vigenciaDesde: datos?.vigenciaDesde || '',
        vigenciaHasta: datos?.vigenciaHasta || '',
        
        // Datos financieros
        primaComercial: datos?.primaComercial || datos?.prima || '',
        premioTotal: datos?.premioTotal || '',
        plan: datos?.plan || '',
        moneda: datos?.moneda || 'UYU',
        
        // Datos del vehículo
        vehiculo: datos?.vehiculo || '',
        marca: datos?.marca || '',
        modelo: datos?.modelo || '',
        anio: datos?.anio || '',
        matricula: datos?.matricula || '',
        motor: datos?.motor || '',
        chasis: datos?.chasis || '',
        combustible: datos?.combustible || '',
        
        // Datos de contacto
        email: datos?.email || '',
        direccion: datos?.direccion || '',
        localidad: datos?.localidad || '',
        departamento: datos?.departamento || '',
        telefono: datos?.telefono || '',
        
        // Datos del corredor
        corredor: datos?.corredor || '',
        
        // Observaciones
        observaciones: prev.observaciones || `Procesado automáticamente con Azure AI.`
      }));
    }
  }, [wizard.extractedData, wizard.selectedCliente, setFormData]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      console.log('🚀 Enviando datos completos a Velneo:', formData);
      await wizard.createPoliza(formData);
    } catch (error) {
      console.error('❌ Error creando póliza:', error);
    } finally {
      setSaving(false);
    }
  };

  const getFieldStatus = (value: string | number) => {
    if (!value || value === '' || value === 'No detectado') {
      return { icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-50' };
    }
    return { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50' };
  };

  const InputField: React.FC<{
    label: string;
    field: string;
    value: string | number;
    type?: string;
    placeholder?: string;
    required?: boolean;
    icon?: any;
  }> = ({ label, field, value, type = 'text', placeholder, required = false, icon: Icon }) => {
    const status = getFieldStatus(value);
    const StatusIcon = status.icon;
    
    return (
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700">
          {Icon && <Icon className="w-4 h-4 mr-2 text-gray-500" />}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <input
            type={type}
            value={value || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${status.bgColor}`}
          />
          <StatusIcon className={`absolute right-3 top-2.5 w-4 h-4 ${status.color}`} />
        </div>
      </div>
    );
  };

  // Verificar si no hay datos extraídos
  if (!wizard.extractedData) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            No hay datos extraídos
          </h3>
          <p className="text-yellow-700">
            Primero procesa un documento para poder completar el formulario.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Revisar y Completar Información</h2>
        <p className="text-gray-600">Verifica los datos extraídos automáticamente por Azure AI</p>
      </div>

      {/* Resumen del contexto */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-8 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <User className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-900">Cliente:</span>
              <span className="text-sm text-purple-800 ml-1">{wizard.selectedCliente?.clinom || 'No seleccionado'}</span>
            </div>
            <div className="flex items-center">
              <Building2 className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-900">Compañía:</span>
              <span className="text-sm text-purple-800 ml-1">{wizard.selectedCompany?.comnom || 'No seleccionada'}</span>
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-900">Archivo:</span>
              <span className="text-sm text-purple-800 ml-1">{wizard.uploadedFile?.name || 'Sin archivo'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario Completo */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. DATOS BÁSICOS DE LA PÓLIZA */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Datos Básicos de la Póliza</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InputField
              label="Número de Póliza"
              field="numeroPoliza"
              value={formData.numeroPoliza}
              required
              icon={FileText}
            />
            <InputField
              label="Asegurado"
              field="asegurado"
              value={formData.asegurado}
              required
              icon={User}
            />
            <InputField
              label="Plan de Seguro"
              field="plan"
              value={formData.plan}
            />
            <InputField
              label="Vigencia Desde"
              field="vigenciaDesde"
              value={formData.vigenciaDesde}
              type="date"
              required
              icon={Calendar}
            />
            <InputField
              label="Vigencia Hasta"
              field="vigenciaHasta"
              value={formData.vigenciaHasta}
              type="date"
              required
              icon={Calendar}
            />
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                Moneda
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={formData.moneda || 'UYU'}
                onChange={(e) => handleInputChange('moneda', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="UYU">Pesos Uruguayos (UYU)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. INFORMACIÓN FINANCIERA */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Información Financiera</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Prima Comercial"
              field="primaComercial"
              value={formData.primaComercial}
              type="number"
              icon={DollarSign}
            />
            <InputField
              label="Premio Total"
              field="premioTotal"
              value={formData.premioTotal}
              type="number"
              icon={DollarSign}
            />
          </div>
        </div>

        {/* 3. DATOS DEL VEHÍCULO */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <Car className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Datos del Vehículo</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="md:col-span-2 lg:col-span-3">
              <InputField
                label="Descripción Completa del Vehículo"
                field="vehiculo"
                value={formData.vehiculo}
                icon={Car}
              />
            </div>
            <InputField
              label="Marca"
              field="marca"
              value={formData.marca}
              icon={Car}
            />
            <InputField
              label="Modelo"
              field="modelo"
              value={formData.modelo}
            />
            <InputField
              label="Año"
              field="anio"
              value={formData.anio}
              type="number"
            />
            <InputField
              label="Matrícula"
              field="matricula"
              value={formData.matricula}
            />
            <InputField
              label="Motor"
              field="motor"
              value={formData.motor}
            />
            <InputField
              label="Chasis"
              field="chasis"
              value={formData.chasis}
            />
          </div>
        </div>

        {/* 4. DATOS DE CONTACTO */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <Mail className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Datos de Contacto</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Email"
              field="email"
              value={formData.email}
              type="email"
              icon={Mail}
            />
            <InputField
              label="Teléfono"
              field="telefono"
              value={formData.telefono}
              type="tel"
              icon={Phone}
            />
            <InputField
              label="Dirección"
              field="direccion"
              value={formData.direccion}
              icon={MapPin}
            />
            <InputField
              label="Departamento"
              field="departamento"
              value={formData.departamento}
              icon={MapPin}
            />
            <InputField
              label="Localidad"
              field="localidad"
              value={formData.localidad}
              icon={MapPin}
            />
            <InputField
              label="Corredor"
              field="corredor"
              value={formData.corredor}
              icon={Building2}
            />
          </div>
        </div>

        {/* 5. OBSERVACIONES */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
              <Edit3 className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Observaciones</h3>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Observaciones adicionales
            </label>
            <textarea
              value={formData.observaciones || ''}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Información adicional sobre la póliza..."
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando Póliza...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Crear Póliza
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PolizaWizardFormStep;