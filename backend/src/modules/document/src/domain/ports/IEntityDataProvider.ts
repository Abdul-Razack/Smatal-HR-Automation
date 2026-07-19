export interface EntityDataQuery {
  companyId: string;
  profileId?: string;
  employeeId?: string | null;
  candidateId?: string | null;
  userId?: string | null;
}

export interface IEntityDataProvider {
  getCompanyName(query: EntityDataQuery): Promise<string>;
  getEmployeeFirstName(query: EntityDataQuery): Promise<string>;
  getEmployeeLastName(query: EntityDataQuery): Promise<string>;
  getEmployeeDepartment(query: EntityDataQuery): Promise<string>;
  getCandidateFirstName(query: EntityDataQuery): Promise<string>;
  getCandidateLastName(query: EntityDataQuery): Promise<string>;
  getCustomFieldValue(machineKey: string, query: EntityDataQuery): Promise<string>;
}
