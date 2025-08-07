import { cn } from '@/lib/utils';
import { Sparkles, CheckCircle } from 'lucide-react';

interface ResumenOperacionProps {
  scannedData: any;
  operationType: string;
  selectedClient: any;
  selectedCompany: any;
  isDark: boolean;
}

export const ResumenOperacion = ({ 
  scannedData, 
  operationType, 
  selectedClient,
  selectedCompany,
  isDark 
}: ResumenOperacionProps) => {
  const fechaCreacion = new Date().toLocaleString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={cn(
      "space-y-3 p-4 rounded-lg",
      isDark ? "bg-gray-800/30" : "bg-blue-50/50"
    )}>
      {/* Leyenda de IA */}
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          isDark ? "bg-blue-900/30" : "bg-blue-100"
        )}>
          <Sparkles className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1">
          <p className={cn(
            "text-sm font-medium",
            isDark ? "text-blue-400" : "text-blue-700"
          )}>
            Póliza procesada con Inteligencia Artificial
          </p>
          <p className={cn(
            "text-xs mt-1",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            {scannedData ? 
              `Documento escaneado y procesado automáticamente con ${Math.round(scannedData.porcentajeCompletitud || 0)}% de precisión` :
              'Datos ingresados manualmente en el formulario'
            }
          </p>
        </div>
      </div>

      {/* Información de la operación */}
      <div className={cn(
        "grid grid-cols-2 gap-4 pt-3 border-t",
        isDark ? "border-gray-700" : "border-gray-200"
      )}>
        <div>
          <span className={cn(
            "block text-xs font-medium",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>Tipo de operación</span>
          <span className={cn(
            "text-sm font-semibold",
            isDark ? "text-gray-200" : "text-gray-900"
          )}>{operationType}</span>
        </div>
        <div>
          <span className={cn(
            "block text-xs font-medium",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>Fecha de creación</span>
          <span className={cn(
            "text-sm font-semibold",
            isDark ? "text-gray-200" : "text-gray-900"
          )}>{fechaCreacion}</span>
        </div>
        <div>
          <span className={cn(
            "block text-xs font-medium",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>Cliente</span>
          <span className={cn(
            "text-sm font-semibold",
            isDark ? "text-gray-200" : "text-gray-900"
          )}>{selectedClient?.clinom || 'No especificado'}</span>
        </div>
        <div>
          <span className={cn(
            "block text-xs font-medium",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>Compañía</span>
          <span className={cn(
            "text-sm font-semibold",
            isDark ? "text-gray-200" : "text-gray-900"
          )}>{selectedCompany?.comalias || 'BSE'}</span>
        </div>
      </div>

      {/* Notas del escaneo si existen */}
      {scannedData?.datosVelneo?.observaciones?.notasEscaneado && (
        <div className={cn(
          "pt-3 border-t",
          isDark ? "border-gray-700" : "border-gray-200"
        )}>
          <span className={cn(
            "block text-xs font-medium mb-2",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>Notas del procesamiento</span>
          <ul className="space-y-1">
            {scannedData.datosVelneo.observaciones.notasEscaneado.map((nota: string, index: number) => (
              <li key={index} className={cn(
                "text-xs flex items-start gap-2",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{nota}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};