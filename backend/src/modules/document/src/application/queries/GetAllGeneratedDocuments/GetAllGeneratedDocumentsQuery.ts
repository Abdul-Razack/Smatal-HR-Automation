import { GeneratedDocumentFilters } from '../../../domain/repositories/IGeneratedDocumentRepository';

export class GetAllGeneratedDocumentsQuery {
  constructor(
    public readonly companyId: string,
    public readonly filters?: GeneratedDocumentFilters,
  ) {}
}
