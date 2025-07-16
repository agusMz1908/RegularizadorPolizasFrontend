import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import PolizaDetailsForm from '../components/poliza/PolizaDetailsForm';

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
  duration?: number;
}

const DocumentScannerWithDetails: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [paso, setPaso] = useState<'upload' | 'processing' | 'details'>('upload');

  // Manejo de selección de archivo
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Por favor seleccione un archivo PDF válido.');
      setFile(null);
    }
  }, []);

  // Manejo de drag and drop
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Por favor seleccione un archivo PDF válido.');
      setFile(null);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  // Procesar documento
  const procesarDocumento = async () => {
    if (!file) return;

    setUploading(true);
    setPaso('processing');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://localhost:7191/api/AzureDocument/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResultado(data);
      setPaso('details');
      
    } catch (err) {
      console.error('Error procesando documento:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar el documento');
      setPaso('upload');
    } finally {
      setUploading(false);
    }
  };

  // Handlers para PolizaDetailsForm
  const handleSavePoliza = async (datosActualizados: any) => {
    try {
      console.log('Guardando póliza actualizada:', datosActualizados);
      
      const response = await fetch('https://localhost:7191/api/poliza/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosActualizados)
      });

      if (response.ok) {
        alert('Cambios guardados exitosamente');
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      console.error('Error guardando:', error);
      alert('Error al guardar los cambios');
    }
  };

  const handleSendToVelneo = async (datos: any) => {
    try {
      console.log('Enviando a Velneo:', datos);
      
      const response = await fetch('https://localhost:7191/api/velneo/send-poliza', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      if (response.ok) {
        alert('Póliza enviada a Velneo exitosamente');
        handleVolver();
      } else {
        throw new Error('Error al enviar a Velneo');
      }
    } catch (error) {
      console.error('Error enviando a Velneo:', error);
      alert('Error al enviar a Velneo');
    }
  };

  const handleVolver = () => {
    setFile(null);
    setResultado(null);
    setError(null);
    setPaso('upload');
    setUploading(false);
  };

  const reiniciar = () => {
    setFile(null);
    setResultado(null);
    setError(null);
    setPaso('upload');
    setUploading(false);
  };

  // Pantalla de procesamiento
  if (paso === 'processing') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Procesando Documento</h2>
            <p className="text-gray-600 mb-4">
              Extrayendo información de: <span className="font-medium">{file?.name}</span>
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                ⚙️ Analizando con Azure Document Intelligence...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de detalles
  if (paso === 'details' && resultado) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header con navegación */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleVolver}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver al escáner</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Documento procesado exitosamente
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de detalles */}
        <PolizaDetailsForm
          datos={resultado}
          onSave={handleSavePoliza}
          onCancel={handleVolver}
          onSendToVelneo={handleSendToVelneo}
        />
      </div>
    );
  }

  // Pantalla principal de carga
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h1 className="text-xl font-semibold text-white flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            Escanear Documentos
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            Sube documentos PDF para procesamiento automático
          </p>
        </div>

        {/* Área de carga */}
        <div className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              file 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <div className="flex flex-col items-center">
              {file ? (
                <>
                  <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
                  <p className="text-lg font-medium text-green-800 mb-2">
                    Archivo seleccionado
                  </p>
                  <p className="text-sm text-green-600 mb-4">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Arrastra tu archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Solo archivos PDF (máximo 10MB)
                  </p>
                </>
              )}
              
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                {file ? 'Cambiar archivo' : 'Seleccionar archivo'}
              </label>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={reiniciar}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reiniciar
            </button>

            <button
              onClick={procesarDocumento}
              disabled={!file || uploading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center ${
                !file || uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Procesar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">¿Qué hace este proceso?</p>
            <ul className="space-y-1 text-xs">
              <li>1. 📄 Extrae información automáticamente usando Azure Document Intelligence</li>
              <li>2. 🔍 Valida datos extraídos y muestra nivel de confianza</li>
              <li>3. ✏️ Permite editar y corregir información antes del envío</li>
              <li>4. 🚀 Envía los datos validados a Velneo para completar el proceso</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentScannerWithDetails;