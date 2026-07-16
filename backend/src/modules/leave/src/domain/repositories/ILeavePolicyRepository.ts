import { IRepository } from '../../../../../kernel/repositories/repository.contracts';
import { LeavePolicy } from '../entities/LeavePolicy';

export interface ILeavePolicyRepository extends IRepository<LeavePolicy> {}
