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

    // ── System ────────────────────────────────────────────────────────────
    if (metadata.entity === 'SYSTEM') {
      if (key === 'system.currentDate') {
        return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
      }
      if (key === 'system.currentUser') {
        return 'HR Administrator';
      }
    }

    // ── Company ───────────────────────────────────────────────────────────
    if (metadata.entity === 'COMPANY') {
      if (key === 'company.name') return dataProvider.getCompanyName(context);
      if (key === 'company.website') return dataProvider.getCompanyWebsite(context);
      if (key === 'company.address') return dataProvider.getCompanyAddress(context);
      if (key === 'company.phone') return dataProvider.getCompanyPhone(context);
      if (key === 'company.email') return dataProvider.getCompanyEmail(context);
      if (key === 'company.authorizedPerson') return dataProvider.getCompanyAuthorizedPerson(context);
      if (key === 'company.authorizedPersonDesignation') return dataProvider.getCompanyAuthorizedPersonDesignation(context);
      if (key === 'company.logo') return dataProvider.getCompanyLogo ? dataProvider.getCompanyLogo(context) : '';
      if (key === 'company.signature') return dataProvider.getCompanySignature ? dataProvider.getCompanySignature(context) : '';
    }

    // ── Employee ──────────────────────────────────────────────────────────
    if (metadata.entity === 'EMPLOYEE') {
      // Identity
      if (key === 'employee.firstName') return dataProvider.getEmployeeFirstName(context);
      if (key === 'employee.lastName') return dataProvider.getEmployeeLastName(context);
      if (key === 'employee.fullName') return dataProvider.getEmployeeFullName(context);
      if (key === 'employee.employeeId') return dataProvider.getEmployeeId(context);
      if (key === 'employee.employeeNumber') return dataProvider.getEmployeeNumber(context);
      // Employment
      if (key === 'employee.designation') return dataProvider.getEmployeeDesignation(context);
      if (key === 'employee.department') return dataProvider.getEmployeeDepartment(context);
      if (key === 'employee.employmentType') return dataProvider.getEmployeeEmploymentType(context);
      if (key === 'employee.joiningDate') return dataProvider.getEmployeeJoiningDate(context);
      if (key === 'employee.probationEndDate') return dataProvider.getEmployeeProbationEndDate(context);
      if (key === 'employee.confirmationDate') return dataProvider.getEmployeeConfirmationDate(context);
      if (key === 'employee.resignationDate') return dataProvider.getEmployeeResignationDate(context);
      if (key === 'employee.lastWorkingDate') return dataProvider.getEmployeeLastWorkingDate(context);
      if (key === 'employee.salary') return dataProvider.getEmployeeSalary(context);
      if (key === 'employee.offerSalary') return dataProvider.getEmployeeOfferSalary(context);
      // Personal
      if (key === 'employee.personalEmail') return dataProvider.getEmployeePersonalEmail(context);
      if (key === 'employee.phone') return dataProvider.getEmployeePhone(context);
      if (key === 'employee.dateOfBirth') return dataProvider.getEmployeeDateOfBirth(context);
      if (key === 'employee.gender') return dataProvider.getEmployeeGender(context);
      if (key === 'employee.address') return dataProvider.getEmployeeAddress(context);
    }

    // ── Candidate ─────────────────────────────────────────────────────────
    if (metadata.entity === 'CANDIDATE') {
      if (key === 'candidate.firstName') return dataProvider.getCandidateFirstName(context);
      if (key === 'candidate.lastName') return dataProvider.getCandidateLastName(context);
      if (key === 'candidate.fullName') {
        const first = await dataProvider.getCandidateFirstName(context);
        const last = await dataProvider.getCandidateLastName(context);
        return `${first} ${last}`.trim();
      }
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
