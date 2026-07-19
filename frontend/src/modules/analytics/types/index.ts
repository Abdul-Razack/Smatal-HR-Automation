export interface RecentHire {
  id: string;
  businessId: string;
  name: string;
  joinedAt: string;
}

export interface DashboardMetrics {
  totalCandidates?: number;
  activeCandidates?: number;
  convertedCandidates?: number;
  totalEmployees?: number;
  activeEmployees?: number;
  runningWorkflows?: number;
  completedWorkflows?: number;
  generatedDocuments?: number;
  pendingApprovals?: number;
  recentActivities?: any[];
  recentHires?: RecentHire[];
  interviewsToday?: number;
  offersPending?: number;
  offersAccepted?: number;
  recentCandidates?: any[];
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  url: string;
}

export interface ReportData {
  headers: string[];
  rows: any[][];
  totalCount: number;
}
