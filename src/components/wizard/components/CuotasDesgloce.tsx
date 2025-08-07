import { cn } from "@/lib/utils";

interface CuotasDesgloseProps {
  cuotas: any[];
  totalCuotas: number;
  valorCuota: number;
  total: number;
  monedaId: number;
  masterData: any;
  isDark: boolean;
}

// Funciones helper locales
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

const calcularFechaVencimiento = (indiceCuota: number): string => {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() + indiceCuota + 1);
  fecha.setDate(5);
  return fecha.toISOString();
};

export const CuotasDesglose = ({ 
  cuotas, 
  totalCuotas, 
  valorCuota, 
  total, 
  monedaId,
  masterData,
  isDark 
}: CuotasDesgloseProps) => {
  // Si hay cuotas del escaneo, usarlas
  const cuotasData = cuotas && cuotas.length > 0 ? cuotas : 
    // Si no, generar cuotas basadas en los datos del formulario
    Array.from({ length: totalCuotas || 1 }, (_, i) => ({
      numero: i + 1,
      monto: valorCuota,
      fechaVencimiento: calcularFechaVencimiento(i),
      estado: 'PENDIENTE'
    }));

  // Obtener símbolo de moneda
  const moneda = masterData?.monedas?.find((m: any) => m.id === monedaId);
  const simboloMoneda = moneda?.simbolo || '$';

  if (cuotasData.length === 0) {
    return (
      <div className={cn(
        "text-center py-4",
        isDark ? "text-gray-400" : "text-gray-600"
      )}>
        No hay información de cuotas disponible
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className={cn(
        "p-4 rounded-lg",
        isDark ? "bg-gray-800/50" : "bg-gray-50"
      )}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className={cn(
              "block font-medium",
              isDark ? "text-gray-400" : "text-gray-600"
            )}>Total de cuotas</span>
            <span className={cn(
              "text-lg font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}>{cuotasData.length}</span>
          </div>
          <div>
            <span className={cn(
              "block font-medium",
              isDark ? "text-gray-400" : "text-gray-600"
            )}>Valor por cuota</span>
            <span className={cn(
              "text-lg font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}>{simboloMoneda} {formatNumber(valorCuota)}</span>
          </div>
          <div>
            <span className={cn(
              "block font-medium",
              isDark ? "text-gray-400" : "text-gray-600"
            )}>Total a pagar</span>
            <span className={cn(
              "text-lg font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}>{simboloMoneda} {formatNumber(total)}</span>
          </div>
          <div>
            <span className={cn(
              "block font-medium",
              isDark ? "text-gray-400" : "text-gray-600"
            )}>Primera cuota</span>
            <span className={cn(
              "text-lg font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}>
              {cuotasData[0]?.fechaVencimiento ? 
                formatDate(cuotasData[0].fechaVencimiento) : 
                'Por definir'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de cuotas */}
      <div className={cn(
        "border rounded-lg overflow-hidden",
        isDark ? "border-gray-700" : "border-gray-200"
      )}>
        <table className="w-full">
          <thead className={cn(
            isDark ? "bg-gray-800" : "bg-gray-50"
          )}>
            <tr>
              <th className={cn(
                "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
                isDark ? "text-gray-400" : "text-gray-700"
              )}>
                Cuota
              </th>
              <th className={cn(
                "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider",
                isDark ? "text-gray-400" : "text-gray-700"
              )}>
                Vencimiento
              </th>
              <th className={cn(
                "px-4 py-3 text-right text-xs font-medium uppercase tracking-wider",
                isDark ? "text-gray-400" : "text-gray-700"
              )}>
                Monto
              </th>
              <th className={cn(
                "px-4 py-3 text-center text-xs font-medium uppercase tracking-wider",
                isDark ? "text-gray-400" : "text-gray-700"
              )}>
                Estado
              </th>
            </tr>
          </thead>
          <tbody className={cn(
            "divide-y",
            isDark ? "divide-gray-700" : "divide-gray-200"
          )}>
            {cuotasData.map((cuota: any, index: number) => (
              <tr key={index} className={cn(
                "transition-colors",
                isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
              )}>
                <td className={cn(
                  "px-4 py-3 text-sm font-medium",
                  isDark ? "text-gray-200" : "text-gray-900"
                )}>
                  Cuota {cuota.numero || index + 1}
                </td>
                <td className={cn(
                  "px-4 py-3 text-sm",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}>
                  {cuota.fechaVencimiento ? 
                    formatDate(cuota.fechaVencimiento) : 
                    'Por definir'}
                </td>
                <td className={cn(
                  "px-4 py-3 text-sm text-right font-medium",
                  isDark ? "text-gray-200" : "text-gray-900"
                )}>
                  {simboloMoneda} {formatNumber(cuota.monto || valorCuota)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    "inline-flex px-2 py-1 text-xs font-semibold rounded-full",
                    cuota.estado === 'PAGADO' 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  )}>
                    {cuota.estado || 'PENDIENTE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};