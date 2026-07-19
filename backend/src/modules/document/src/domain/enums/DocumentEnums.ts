export enum TemplateStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum TemplateVersionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  DEPRECATED = 'DEPRECATED',
  ARCHIVED = 'ARCHIVED',
  ROLLED_BACK = 'ROLLED_BACK',
}

export enum DocumentGenerationStatus {
  PENDING = 'PENDING',
  DRAFT = 'DRAFT',
  GENERATING = 'GENERATING',
  GENERATED = 'GENERATED',
  REVIEWED = 'REVIEWED',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
  VOIDED = 'VOIDED',
  FAILED = 'FAILED',
}

// V2: Tracks the lifecycle of a DOCX import process
export enum TemplateImportStatus {
  PENDING = 'PENDING',
  SCANNING = 'SCANNING',
  SCANNED = 'SCANNED',
  MAPPING_REQUIRED = 'MAPPING_REQUIRED',
  MAPPED = 'MAPPED',
  FAILED = 'FAILED',
}
