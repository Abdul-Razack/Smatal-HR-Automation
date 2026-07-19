export interface PlaceholderMetadata {
  key: string;
  label: string;
  entity: string;
  dataType: string;
  isRequired: boolean;
  description: string | null;
  exampleValue: string | null;
  source: 'SYSTEM' | 'CUSTOM';
}
