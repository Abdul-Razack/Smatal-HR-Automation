export interface DocumentType {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface FieldGroup {
  id: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface FieldValidation {
  type: string;
  value: string;
  message?: string;
}

export interface FieldOption {
  label: string;
  value: string;
  isDefault?: boolean;
}

export interface FieldDefinition {
  id: string;
  machineKey: string;
  displayName: string;
  dataType: string;
  entityType: string;
  isRequired: boolean;
  description?: string;
  defaultValue?: string;
  displayOrder?: number;
  groupId?: string;
  options?: FieldOption[];
  validations?: FieldValidation[];
}
