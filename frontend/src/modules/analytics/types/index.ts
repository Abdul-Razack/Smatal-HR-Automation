export interface RecentHire {
  id: string;
  businessId: string;
  name: string;
  joinedAt: string;
}

export interface NewJoinerItem {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  designation: string;
  joiningDate: string;
}

export interface UpcomingConfirmationItem {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  department?: string;
  confirmationDate: string;
}

export interface NoticePeriodItem {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  department?: string;
  lastWorkingDate?: string;
}

export interface RecentRelievedItem {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  department?: string;
  relievedDate?: string;
}

export interface DashboardMetrics {
  totalEmployees?: number;
  activeEmployees?: number;
  probationEmployees?: number;
  confirmedEmployees?: number;
  noticePeriodEmployees?: number;
  relievedEmployees?: number;
  lifecycleBreakdown?: {
    OFFER: number;
    JOINED: number;
    PROBATION: number;
    CONFIRMED: number;
    NOTICE_PERIOD: number;
    RELIEVED: number;
  };
  newJoinersThisMonth?: NewJoinerItem[];
  upcomingConfirmations?: UpcomingConfirmationItem[];
  noticePeriodList?: NoticePeriodItem[];
  pendingResignations?: number;
  recentRelieved?: RecentRelievedItem[];
  runningWorkflows?: number;
  completedWorkflows?: number;
  generatedDocuments?: number;
  recentHires?: RecentHire[];
  totalCandidates?: number;
  activeCandidates?: number;
  convertedCandidates?: number;
  pendingApprovals?: number;
  recentActivities?: any[];
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
