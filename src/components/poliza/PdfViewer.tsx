import React, { useState } from 'react';
import { Download, ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';

interface PdfViewerProps {
  pdfUrl: string;
  fileName?: string;
  className?: string;
  height?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  fileName = 'documento.pdf',
  className = '',
  height = '500px',
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const content = (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Vista Previa del Documento</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Descargar PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleFullscreen}
              className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Pantalla completa"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="p-4">
        <iframe
          src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          className="w-full border border-gray-200 rounded"
          style={{ height: isFullscreen ? '80vh' : height }}
          title="Visor de PDF"
        />
      </div>
      
      <div className="px-4 pb-4 text-xs text-gray-500">
        {fileName}
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="w-full h-full max-w-6xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
};