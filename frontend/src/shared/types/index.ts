// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ApiResponse
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Table
export interface TableColumn<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
  enableSorting?: boolean;
  enableHiding?: boolean;
}

export interface SortState {
  id: string;
  desc: boolean;
}

// Form
export type FormFieldType = 
  | 'text' 
  | 'textarea' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'phone' 
  | 'date' 
  | 'time' 
  | 'datetime' 
  | 'checkbox' 
  | 'switch' 
  | 'radio' 
  | 'select' 
  | 'multi-select' 
  | 'autocomplete' 
  | 'file' 
  | 'image' 
  | 'rich-text' 
  | 'hidden';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  defaultValue?: any;
  options?: { label: string; value: string | number }[];
  colSpan?: number;
}

// Modal
export type ModalType = 'dialog' | 'confirm' | 'delete' | 'success' | 'error' | 'warning' | 'info' | 'fullscreen' | 'drawer' | 'side-panel';

export interface ModalConfig {
  id: string;
  type: ModalType;
  title: string;
  description?: string;
  content?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  isOpen?: boolean;
}

// File Upload
export interface FileUploadInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  status: 'uploading' | 'success' | 'error';
}

// Dashboard & Statistics
export interface StatisticCardData {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: any; // Lucide Icon
}
