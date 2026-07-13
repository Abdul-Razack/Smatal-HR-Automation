import {
  IReadRepository,
  IWriteRepository,
} from '../../../../../kernel/repositories/repository.contracts';
import { FieldDefinitionAggregate } from '../entities/FieldDefinitionAggregate';

export interface IFieldDefinitionRepository
  extends
    IReadRepository<FieldDefinitionAggregate>,
    IWriteRepository<FieldDefinitionAggregate> {
  findByMachineKey(
    companyId: string,
    machineKey: string,
  ): Promise<FieldDefinitionAggregate | null>;
  findByBusinessId(
    businessId: string,
  ): Promise<FieldDefinitionAggregate | null>;
}
