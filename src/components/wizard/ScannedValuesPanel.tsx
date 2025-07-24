import { FileText, Info } from "lucide-react";

const ScannedValuesPanel: React.FC<{
  scannedData?: any;
  isDarkMode: boolean;
}> = ({ scannedData, isDarkMode }) => {
  const vehicleData = scannedData?.datosVehiculo;
  
  const scannedFields = [
    {
      label: 'COMBUSTIBLE',
      value: vehicleData?.combustible,
    },
    {
      label: 'DESTINO',
      value: vehicleData?.destino,
    },
    {
      label: 'CATEGORIA',
      value: vehicleData?.categoria,
    },
    {
      label: 'CALIDAD',
      value: vehicleData?.calidad,
    }
  ];

  const hasScannedData = scannedFields.some(field => field.value);

  return (
    <div className={`rounded-2xl p-6 ${
      isDarkMode 
        ? 'bg-gray-800/80 border border-gray-700/50' 
        : 'bg-gray-100 border border-gray-300'
    }`}>
      <h3 className={`text-lg font-bold flex items-center ${
        isDarkMode ? 'text-gray-200' : 'text-gray-800'
      } mb-4 text-2xl`}>
        <FileText className="w-5 h-5 mr-2" />
        Valores Escaneados - Usar de referencia para los siguientes campos:
      </h3>

      {!hasScannedData ? (
        <div className={`text-center py-6 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            No se encontraron valores de vehículo en el documento escaneado
          </p>
          <p className="text-xs mt-1 opacity-75">
            Complete los campos manualmente usando los combos
          </p>
        </div>
      ) : (
        <div className="space-y-4">        
          <div className="grid grid-cols-2 gap-4">
            {scannedFields.map((field, index) => (
              <div key={index} className={`p-4 rounded-lg ${
                isDarkMode 
                    ? 'bg-gray-700/50 border border-gray-600/50' 
                    : 'bg-white border border-gray-200 shadow-sm'
            }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                <span className={`text-sm font-text-2xl font-bold  ${
                    isDarkMode ? 'text-white' : 'text-gray-400'
                }`}>
                    {field.label}:
                </span>
                </div>
                
                <div>
                {field.value ? (
                    <span className={`text-base font-bold ${
                    isDarkMode ? 'text-yellow-300' : 'text-emerald-600'
                    }`}>
                    {field.value}
                    </span>
                ) : (
                    <span className={`text-sm italic ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    } font-bold text-2xl`}>
                    No detectado
                    </span>
                )}
                </div>
            </div>
            </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScannedValuesPanel;