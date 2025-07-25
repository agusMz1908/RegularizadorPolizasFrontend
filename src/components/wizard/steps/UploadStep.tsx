// src/components/wizard/steps/UploadStep.tsx

import React, { useRef } from 'react';
import { Upload, FileText, X, Target, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { StepLayout } from '../shared/StepLayout';

interface UploadStepProps {
  uploadedFile: File | null;
  processing: boolean;
  onFileSelect: (file: File | null) => void;
  onProcess: (file: File) => void;
  onNext: () => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export const UploadStep: React.FC<UploadStepProps> = ({
  uploadedFile,
  processing,
  onFileSelect,
  onProcess,
  onNext,
  onBack,
  isDarkMode
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar archivo
      if (file.type !== 'application/pdf') {
        alert('Por favor selecciona un archivo PDF');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('El archivo es muy grande. Máximo 10MB');
        return;
      }
      
      onFileSelect(file);
    }
  };

  const handleProcess = () => {
    if (uploadedFile && !processing) {
      onProcess(uploadedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type !== 'application/pdf') {
        alert('Por favor selecciona un archivo PDF');
        return;
      }
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <StepLayout
      title="Subir Póliza"
      description="Sube el PDF para procesar con Azure Document Intelligence"
      icon={Upload}
      color="purple"
      isDarkMode={isDarkMode}
      onNext={uploadedFile && !processing ? handleProcess : undefined}
      onBack={onBack}
      nextLabel={processing ? "PROCESANDO..." : "PROCESAR CON IA"}
      backLabel="Volver a operación"
      nextDisabled={!uploadedFile || processing}
      loading={processing}
    >
      <div className="p-8 space-y-8">
        {/* Zona de drop mejorada */}
        <div 
          className={`border-3 border-dashed rounded-3xl p-12 text-center transition-all duration-300 group cursor-pointer ${
            isDarkMode 
              ? 'border-gray-600 hover:border-purple-500 hover:bg-purple-900/30' 
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
          } ${processing ? 'opacity-50 pointer-events-none' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={openFileDialog}
        >
          <div className="space-y-6">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform ${
              isDarkMode 
                ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50' 
                : 'bg-gradient-to-br from-purple-100 to-pink-100'
            }`}>
              <Upload className={`w-12 h-12 ${
                isDarkMode 
                  ? 'text-purple-400 group-hover:text-purple-300' 
                  : 'text-purple-600 group-hover:text-purple-700'
              }`} />
            </div>
            
            <div>
              <h3 className={`text-2xl font-bold ${
                isDarkMode 
                  ? 'text-white group-hover:text-purple-300' 
                  : 'text-gray-900 group-hover:text-purple-900'
              } mb-2 transition-colors`}>
                {uploadedFile ? 'Cambiar archivo' : 'Arrastra tu archivo aquí'}
              </h3>
              <p className={`text-lg mb-6 ${
                isDarkMode 
                  ? 'text-gray-400 group-hover:text-gray-300' 
                  : 'text-gray-600 group-hover:text-gray-800'
              } transition-colors`}>
                o haz click para seleccionar desde tu computadora
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={processing}
              />
              
              <div className={`inline-flex items-center px-8 py-4 rounded-2xl cursor-pointer transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-purple-700 to-pink-700 text-white hover:from-purple-600 hover:to-pink-600' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
              } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <FileText className="w-6 h-6 mr-3" />
                {uploadedFile ? 'Cambiar PDF' : 'Seleccionar PDF'}
              </div>
            </div>

            {/* Especificaciones del archivo */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Target className="w-4 h-4 text-green-500" />
                <span>Tamaño máximo: 10MB</span>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Solo archivos PDF</span>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>Procesamiento con IA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Archivo seleccionado - Card mejorada */}
        {uploadedFile && (
          <div className={`p-6 rounded-2xl border-2 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-700' 
              : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Icono del archivo */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }`}>
                  <FileText className="w-6 h-6 text-white" />
                </div>
                
                {/* Info del archivo */}
                <div>
                  <p className={`font-bold text-lg ${
                    isDarkMode 
                      ? 'text-purple-200' 
                      : 'text-purple-900'
                  }`}>
                    {uploadedFile.name}
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`${
                      isDarkMode 
                        ? 'text-purple-400' 
                        : 'text-purple-700'
                    }`}>
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <span className={`flex items-center space-x-1 ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      <Target className="w-3 h-3" />
                      <span>Listo para procesar</span>
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Botón eliminar */}
              {!processing && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className={`w-10 h-10 rounded-xl transition-colors flex items-center justify-center ${
                    isDarkMode 
                      ? 'bg-red-900 hover:bg-red-800 text-red-300' 
                      : 'bg-red-100 hover:bg-red-200 text-red-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className={`rounded-xl p-4 ${
          isDarkMode 
            ? 'bg-blue-900/20 border border-blue-800/30' 
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start space-x-3">
            <AlertCircle className={`w-5 h-5 mt-0.5 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <div>
              <h4 className={`font-semibold mb-1 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-800'
              }`}>
                Procesamiento con Azure Document Intelligence
              </h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-blue-400' : 'text-blue-700'
              }`}>
                El sistema extraerá automáticamente los datos de la póliza usando inteligencia artificial. 
                Esto puede tomar unos segundos dependiendo del tamaño del archivo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

export default UploadStep;