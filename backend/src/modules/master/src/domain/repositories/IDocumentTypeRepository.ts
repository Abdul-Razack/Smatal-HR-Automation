import {
  IReadRepository,
  IWriteRepository,
} from '../../../../../kernel/repositories/repository.contracts';
import { DocumentTypeEntity } from '../entities/DocumentTypeEntity';

export interface IDocumentTypeRepository
  extends
    IReadRepository<DocumentTypeEntity>,
    IWriteRepository<DocumentTypeEntity> {
  findByCode(
    companyId: string,
    code: string,
  ): Promise<DocumentTypeEntity | null>;
  findByBusinessId(businessId: string): Promise<DocumentTypeEntity | null>;
}
