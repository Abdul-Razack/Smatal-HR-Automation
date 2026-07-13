import {
  IReadRepository,
  IWriteRepository,
} from '../../../../../kernel/repositories/repository.contracts';
import { FieldGroupEntity } from '../entities/FieldGroupEntity';

export interface IFieldGroupRepository
  extends
    IReadRepository<FieldGroupEntity>,
    IWriteRepository<FieldGroupEntity> {
  findByName(companyId: string, name: string): Promise<FieldGroupEntity | null>;
}
