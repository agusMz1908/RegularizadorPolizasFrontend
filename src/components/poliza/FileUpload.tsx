import React from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { ProgressBar } from '../common/ProgressBar';
import { ErrorMessage } from '../common/ErrorMessage';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  maxSize?: number;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  disabled = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  className = '',
}) => {
  const {
    isUploading,
    uploadProgress,
    isDragOver,
    error,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    reset,
  } = useFileUpload({
    maxSize,
    onSuccess: onFileSelect,
    onError: (error) => console.error('Upload error:', error),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  if (isUploading) {
    return (
      <div className={`flex items-center justify-center p-12 ${className}`}>
        <div className="text-center w-full max-w-md">
          <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Subiendo archivo...
          </h3>
          <ProgressBar
            progress={uploadProgress}
            label="Progreso de subida"
            variant="blue"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {error && (
        <ErrorMessage
          title="Error al subir archivo"
          message={error.message}
          details={error.details}
          onDismiss={reset}
          className="mb-4"
        />
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={!disabled ? handleDragOver : undefined}
        onDragLeave={!disabled ? handleDragLeave : undefined}
        onDrop={!disabled ? handleDrop : undefined}
        onClick={!disabled ? () => document.getElementById('file-input')?.click() : undefined}
      >
        <Upload className={`w-16 h-16 mx-auto mb-4 ${
          disabled ? 'text-gray-300' : 'text-gray-400'
        }`} />
        
        <h3 className={`text-xl font-semibold mb-2 ${
          disabled ? 'text-gray-400' : 'text-gray-700'
        }`}>
          {isDragOver ? 'Suelta el archivo aquí' : 'Arrastra tu póliza aquí'}
        </h3>
        
        <p className={`mb-4 ${
          disabled ? 'text-gray-400' : 'text-gray-500'
        }`}>
          o haz clic para seleccionar un archivo PDF
        </p>
        
        {!disabled && (
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Seleccionar Archivo
          </button>
        )}
        
        <p className="text-xs text-gray-400 mt-4">
          Máximo {Math.round(maxSize / 1024 / 1024)}MB • Solo archivos PDF
        </p>
      </div>

      <input
        id="file-input"
        type="file"
        accept=".pdf"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
};