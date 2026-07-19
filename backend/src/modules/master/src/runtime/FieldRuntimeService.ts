import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

export interface PlaceholderSpec {
  fieldDefinitionId: string;
  placeholderKey: string;
  isRequired: boolean;
  defaultValue?: string;
}

@Injectable()
export class FieldRuntimeService {
  private readonly logger = new Logger(FieldRuntimeService.name);

  constructor(private readonly prisma: PrismaService) {}

  public async validateFieldDefinitions(
    companyId: string,
    definitionIds: string[],
  ): Promise<string[]> {
    if (definitionIds.length === 0) return [];
    
    // Separate system fields and custom fields
    const systemFields = definitionIds.filter(id => !id.startsWith('custom.'));
    const customFields = definitionIds.filter(id => id.startsWith('custom.'));
    
    // System fields are inherently valid
    const validIds = new Set<string>(systemFields);
    
    if (customFields.length > 0) {
      // Extract the machine keys (remove 'custom.')
      const machineKeys = customFields.map(id => id.replace(/^custom\./, ''));
      
      const validDbFields = await this.prisma.fieldDefinition.findMany({
        where: {
          machineKey: { in: machineKeys },
          companyId,
          isDeleted: false,
        },
        select: { machineKey: true },
      });
      
      validDbFields.forEach(f => {
        validIds.add(`custom.${f.machineKey}`);
      });
    }

    return definitionIds.filter((id) => !validIds.has(id));
  }

  public async resolveDocumentPlaceholders(
    companyId: string,
    profileId: string,
    placeholders: PlaceholderSpec[],
    candidateId?: string | null,
    employeeId?: string | null,
  ): Promise<Record<string, string>> {
    const resolved: Record<string, string> = {};
    const missing: string[] = [];
    const definitionIds = placeholders.map((p) => p.fieldDefinitionId);

    const fieldDefs = await this.prisma.fieldDefinition.findMany({
      where: { id: { in: definitionIds }, companyId },
    });

    const orConditions: any[] = [{ profileId }];
    if (candidateId) orConditions.push({ candidateId });
    if (employeeId) orConditions.push({ employeeId });

    const fieldValues = await this.prisma.fieldValue.findMany({
      where: {
        companyId,
        fieldDefinitionId: { in: definitionIds },
        OR: orConditions,
      },
    });

    for (const placeholder of placeholders) {
      const def = fieldDefs.find(
        (d: any) => d.id === placeholder.fieldDefinitionId,
      );
      const valueRecord = fieldValues.find(
        (fv: any) => fv.fieldDefinitionId === placeholder.fieldDefinitionId,
      );

      // Value Resolution Strategy
      let resolvedValue = this.resolveDynamicValue(valueRecord);

      // Computed Field Strategy (future support)
      if (!resolvedValue && (def as any)?.fieldType === 'COMPUTED') {
        resolvedValue = this.resolveComputedField(def);
      }

      // Default Value Strategy
      if (!resolvedValue) {
        resolvedValue = this.resolveDefaultValue(placeholder, def);
      }

      // Validation / Required Detector Strategy
      if (this.detectRequiredViolation(resolvedValue, placeholder)) {
        missing.push(placeholder.placeholderKey);
      }

      resolved[placeholder.placeholderKey] = resolvedValue;
    }

    if (missing.length > 0) {
      throw new Error(
        `Missing required field values for placeholders: ${missing.join(', ')}`,
      );
    }

    return resolved;
  }

  private resolveDynamicValue(valueRecord: any): string {
    if (!valueRecord || !valueRecord.valueData) return '';
    const data: any = valueRecord.valueData;
    return typeof data === 'object'
      ? (data.value ?? data.text ?? '')
      : String(data);
  }

  private resolveDefaultValue(placeholder: PlaceholderSpec, def: any): string {
    if (placeholder.defaultValue) return placeholder.defaultValue;

    // Check if the definition has a default config
    if (def?.validationRules) {
      const rules = def.validationRules;
      if (rules.defaultValue) return String(rules.defaultValue);
    }
    return '';
  }

  private resolveComputedField(def: any): string {
    // Advanced logic to evaluate formula expressions
    return '[Computed Value]';
  }

  private detectRequiredViolation(
    value: string,
    placeholder: PlaceholderSpec,
  ): boolean {
    return !value && placeholder.isRequired;
  }
}
