export interface PolizaDto {
  id: number;
  comcod: number;        // ID de compañía
  seccod: number;        // ID de sección
  clinro: number;        // ID de cliente
  conpol: string;        // Número de póliza
  confchdes: string;     // Fecha desde
  confchhas: string;     // Fecha hasta
  convig: string;        // Estado vigencia
  conmaraut: string;     // Marca auto
  conanioaut: number;    // Año auto
  combustibles: string;  // Combustible
  conpremio: number;     // Premio/monto
  conend?: string;       // Endoso
  conpadre?: number;     // ID póliza padre (para renovaciones)
  // Campos adicionales según necesidad
  comAlias?: string;     // Alias de compañía para display
  seccionNombre?: string; // Nombre de sección para display
}