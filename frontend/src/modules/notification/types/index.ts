export interface Notification {
  id: string;
  companyId: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  referenceId?: string;
  referenceType?: string;
  isRead: boolean;
  createdAt: string;
}
