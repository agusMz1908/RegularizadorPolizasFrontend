export interface RecentActivity {
  id: string;
  documentName: string;
  companyName: string;
  status: 'processing' | 'completed' | 'error' | 'sent_to_velneo';
  timestamp: string;
  processingTime?: number;
}