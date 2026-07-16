export interface TemplateVersion {
  id: string;
  versionNumber: number;
  content: string;
  isPublished: boolean;
  publishedAt?: string;
}

export interface Template {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: string;
  currentVersion?: TemplateVersion;
}
