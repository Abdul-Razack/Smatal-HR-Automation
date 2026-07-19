import { Injectable, Logger } from '@nestjs/common';
import { IEntityDataProvider } from '../ports/IEntityDataProvider';
import { PlaceholderRegistryService } from './PlaceholderRegistryService';
import { PlaceholderMetadata } from '../models/PlaceholderMetadata';

export interface ResolutionContext {
  companyId: string;
  profileId: string;
  candidateId?: string | null;
  employeeId?: string | null;
  userId?: string | null;
}

export interface ResolutionResult {
  resolvedValues: Record<string, string>;
  resolvedKeys: string[];
  unresolvedKeys: string[];
  errors: string[];
  warnings: string[];
}

@Injectable()
export class AutomaticResolverService {
  private readonly logger = new Logger(AutomaticResolverService.name);

  constructor(
    private readonly registryService: PlaceholderRegistryService,
  ) {}

  public async resolvePlaceholders(
    keys: string[],
    context: ResolutionContext,
    dataProvider: IEntityDataProvider,
  ): Promise<ResolutionResult> {
    const result: ResolutionResult = {
      resolvedValues: {},
      resolvedKeys: [],
      unresolvedKeys: [],
      errors: [],
      warnings: [],
    };

    if (!keys || keys.length === 0) return result;

    // 1. Fetch metadata for all keys via Registry
    const allMetadata = await this.registryService.getPlaceholders(context.companyId);
    const metadataMap = new Map<string, PlaceholderMetadata>();
    for (const m of allMetadata) {
      metadataMap.set(m.key, m);
    }

    // 2. Validate keys
    for (const key of keys) {
      if (!metadataMap.has(key)) {
        result.unresolvedKeys.push(key);
        result.errors.push(`Unknown placeholder: ${key}`);
      }
    }



    // 3. Resolve each known key
    for (const key of keys) {
      if (result.unresolvedKeys.includes(key)) continue;

      const metadata = metadataMap.get(key)!;
      let value = '';

      if (metadata.source === 'SYSTEM') {
        value = await this.resolveSystemPlaceholder(metadata, context, dataProvider);
      } else {
        value = await this.resolveCustomPlaceholder(metadata, context, dataProvider);
      }

      // Check required
      if (!value && metadata.isRequired) {
        result.errors.push(`Missing required placeholder value for: ${key}`);
        result.unresolvedKeys.push(key);
        continue;
      } else if (!value) {
        result.warnings.push(`Optional placeholder missing value: ${key}`);
      }

      result.resolvedValues[key] = value || (metadata.exampleValue || '');
      result.resolvedKeys.push(key);
    }

    return result;
  }

  private async resolveSystemPlaceholder(
    metadata: PlaceholderMetadata,
    context: ResolutionContext,
    dataProvider: IEntityDataProvider,
  ): Promise<string> {
    const key = metadata.key;

    if (metadata.entity === 'SYSTEM') {
      if (key === 'system.currentDate') {
        return new Date().toLocaleDateString();
      }
      if (key === 'system.currentUser') {
        return 'System User'; // Would query User table ideally
      }
    }

    if (metadata.entity === 'COMPANY') {
      if (key === 'company.name') {
        return dataProvider.getCompanyName(context);
      }
    }

    if (metadata.entity === 'EMPLOYEE' && context.employeeId) {
      if (key === 'employee.firstName') return dataProvider.getEmployeeFirstName(context);
      if (key === 'employee.lastName') return dataProvider.getEmployeeLastName(context);
      if (key === 'employee.department') return dataProvider.getEmployeeDepartment(context);
    }

    if (metadata.entity === 'CANDIDATE' && context.candidateId) {
      if (key === 'candidate.firstName') return dataProvider.getCandidateFirstName(context);
      if (key === 'candidate.lastName') return dataProvider.getCandidateLastName(context);
    }
    
    return '';
  }

  private async resolveCustomPlaceholder(
    metadata: PlaceholderMetadata,
    context: ResolutionContext,
    dataProvider: IEntityDataProvider,
  ): Promise<string> {
    const machineKey = metadata.key.replace('custom.', '');
    return dataProvider.getCustomFieldValue(machineKey, context);
  }
}
