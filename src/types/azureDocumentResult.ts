export interface AzureDocumentResult {
  archivo: string;
  timestamp: string;
  tiempoProcesamiento: number;
  estado: string;
  campos: Record<string, string>;
  confianza?: number;
  errores?: string[];
}