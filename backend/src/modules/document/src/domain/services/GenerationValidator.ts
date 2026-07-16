import { Injectable, Logger } from '@nestjs/common';
import { GeneratedDocumentAggregate } from '../aggregates/GeneratedDocumentAggregate';
import { TemplateAggregate } from '../aggregates/TemplateAggregate';
import { TemplateVersionEntity } from '../entities/TemplateVersionEntity';
import { DocumentRenderContext } from '../models/DocumentRenderContext';
import {
  TemplateValidationException,
  PlaceholderResolutionException,
} from '../exceptions/DocumentV2Exceptions';
import { TemplateVersionStatus } from '../enums/DocumentEnums';

@Injectable()
export class GenerationValidator {
  private readonly logger = new Logger(GenerationValidator.name);

  validatePreRender(
    document: GeneratedDocumentAggregate,
    template: TemplateAggregate,
    activeVersion: TemplateVersionEntity,
    context: DocumentRenderContext,
  ): void {
    // 1. Validate Tenant & Company Match
    if (
      template.companyId !== context.companyId ||
      document.companyId !== context.companyId
    ) {
      throw new TemplateValidationException(
        `Tenant mismatch between template, document, and context.`,
      );
    }

    // 2. Validate Template Status
    if (activeVersion.status !== TemplateVersionStatus.PUBLISHED) {
      throw new TemplateValidationException(
        `Cannot generate document. Template version is not PUBLISHED.`,
      );
    }

    // 3. Validate Placeholders
    const missingPlaceholders: string[] = [];

    for (const placeholder of activeVersion.placeholders) {
      const value = context.placeholders[placeholder.placeholderKey];
      if (
        (value === undefined || value === null || value === '') &&
        placeholder.isRequired
      ) {
        missingPlaceholders.push(placeholder.placeholderKey);
      }
    }

    if (missingPlaceholders.length > 0) {
      throw new PlaceholderResolutionException(
        `Missing required placeholder values for keys: ${missingPlaceholders.join(', ')}`,
      );
    }
  }
}
