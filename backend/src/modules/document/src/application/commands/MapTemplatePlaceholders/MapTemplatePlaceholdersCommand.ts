export interface PlaceholderMappingInput {
  /** The raw key as detected in the DOCX (e.g. "candidate.firstName") */
  placeholderKey: string;
  /** UUID of the system FieldDefinition this key maps to */
  fieldDefinitionId: string;
  /** Whether the field is mandatory for generation */
  isRequired: boolean;
  /** Display order in the mapping UI */
  displayOrder: number;
}

/**
 * MapTemplatePlaceholdersCommand — dispatched when Admin confirms
 * placeholder-to-FieldDefinition mappings after a DOCX import.
 */
export class MapTemplatePlaceholdersCommand {
  constructor(
    /** Parent Template UUID */
    public readonly templateId: string,
    /** TemplateVersion UUID to map placeholders for */
    public readonly versionId: string,
    /** Multi-tenant company isolation key */
    public readonly companyId: string,
    /** Complete set of mappings provided by the Admin */
    public readonly mappings: PlaceholderMappingInput[],
    /** User ID of the Admin performing the mapping */
    public readonly performedBy: string,
  ) {}
}
