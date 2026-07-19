import { IEntityDataProvider, EntityDataQuery } from '../../domain/ports/IEntityDataProvider';

export class PreviewDataProvider implements IEntityDataProvider {
  constructor(
    private readonly mode: 'SAMPLE' | 'LIVE',
    private readonly liveProvider: IEntityDataProvider,
  ) {}

  async getCompanyName(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'Smatal Technologies';
    return this.liveProvider.getCompanyName(query);
  }

  async getEmployeeFirstName(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'John';
    return this.liveProvider.getEmployeeFirstName(query);
  }

  async getEmployeeLastName(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'Doe';
    return this.liveProvider.getEmployeeLastName(query);
  }

  async getEmployeeDepartment(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'IT Department';
    return this.liveProvider.getEmployeeDepartment(query);
  }

  async getCandidateFirstName(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'Jane';
    return this.liveProvider.getCandidateFirstName(query);
  }

  async getCandidateLastName(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'Smith';
    return this.liveProvider.getCandidateLastName(query);
  }

  async getCustomFieldValue(machineKey: string, query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return `[Sample ${machineKey}]`;
    return this.liveProvider.getCustomFieldValue(machineKey, query);
  }
}
