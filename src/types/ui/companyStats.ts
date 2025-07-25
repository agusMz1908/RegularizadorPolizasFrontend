export interface CompanyStats {
  companyId: string;
  companyName: string;
  companyCode: string;
  documentsToday: number;
  documentsMonth: number;
  costToday: number;
  costMonth: number;
  successRate: number;
  avgProcessingTime: number;
  lastProcessed?: string;
}