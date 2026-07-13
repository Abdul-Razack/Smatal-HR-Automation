import { Injectable } from '@nestjs/common';
import { TemplateAggregate } from '../aggregates/TemplateAggregate';
import { GeneratedDocumentAggregate } from '../aggregates/GeneratedDocumentAggregate';
import { DocumentGenerationStatus } from '../enums/DocumentEnums';

@Injectable()
export class DocumentDomainService {
  public validateTemplateForGeneration(template: TemplateAggregate): void {
    const activeVersion = template.getActiveVersion();
    if (!activeVersion) {
      throw new Error(
        `Template ${template.id.toValue()} has no active published version.`,
      );
    }
  }

  public assertCanGenerateDocument(document: GeneratedDocumentAggregate): void {
    if (
      document.status !== DocumentGenerationStatus.PENDING &&
      document.status !== DocumentGenerationStatus.DRAFT
    ) {
      throw new Error(
        `Cannot start generation for document in status ${document.status}`,
      );
    }
  }
}
