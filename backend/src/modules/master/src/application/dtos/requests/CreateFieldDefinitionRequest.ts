export class FieldOptionDto {
  label: string;
  value: string;
  displayOrder: number;
}
export class FieldValidationDto {
  ruleType: string;
  ruleValue: string;
  errorMessage: string;
}
export class CreateFieldDefinitionRequest {
  machineKey: string;
  displayName: string;
  dataType: string;
  entityType: string;
  isRequired: boolean;
  description?: string;
  defaultValue?: string;
  displayOrder: number;
  groupId?: string;
  options?: FieldOptionDto[];
  validations?: FieldValidationDto[];
}
