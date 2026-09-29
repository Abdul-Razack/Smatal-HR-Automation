export interface EntityDataQuery {
  companyId: string;
  profileId?: string;
  employeeId?: string | null;
  candidateId?: string | null;
  userId?: string | null;
}

export interface IEntityDataProvider {
  // Company
  getCompanyName(query: EntityDataQuery): Promise<string>;
  getCompanyWebsite(query: EntityDataQuery): Promise<string>;
  getCompanyAddress(query: EntityDataQuery): Promise<string>;
  getCompanyPhone(query: EntityDataQuery): Promise<string>;
  getCompanyEmail(query: EntityDataQuery): Promise<string>;
  getCompanyAuthorizedPerson(query: EntityDataQuery): Promise<string>;
  getCompanyAuthorizedPersonDesignation(query: EntityDataQuery): Promise<string>;
  getCompanyLogo?(query: EntityDataQuery): Promise<string>;
  getCompanySignature?(query: EntityDataQuery): Promise<string>;

  // Employee – identity
  getEmployeeFirstName(query: EntityDataQuery): Promise<string>;
  getEmployeeLastName(query: EntityDataQuery): Promise<string>;
  getEmployeeFullName(query: EntityDataQuery): Promise<string>;
  getEmployeeId(query: EntityDataQuery): Promise<string>;
  getEmployeeNumber(query: EntityDataQuery): Promise<string>;

  // Employee – employment
  getEmployeeDesignation(query: EntityDataQuery): Promise<string>;
  getEmployeeDepartment(query: EntityDataQuery): Promise<string>;
  getEmployeeEmploymentType(query: EntityDataQuery): Promise<string>;
  getEmployeeJoiningDate(query: EntityDataQuery): Promise<string>;
  getEmployeeProbationEndDate(query: EntityDataQuery): Promise<string>;
  getEmployeeConfirmationDate(query: EntityDataQuery): Promise<string>;
  getEmployeeResignationDate(query: EntityDataQuery): Promise<string>;
  getEmployeeLastWorkingDate(query: EntityDataQuery): Promise<string>;
  getEmployeeSalary(query: EntityDataQuery): Promise<string>;
  getEmployeeOfferSalary(query: EntityDataQuery): Promise<string>;

  // Employee – personal
  getEmployeePersonalEmail(query: EntityDataQuery): Promise<string>;
  getEmployeePhone(query: EntityDataQuery): Promise<string>;
  getEmployeeDateOfBirth(query: EntityDataQuery): Promise<string>;
  getEmployeeGender(query: EntityDataQuery): Promise<string>;
  getEmployeeAddress(query: EntityDataQuery): Promise<string>;

  // Candidate
  getCandidateFirstName(query: EntityDataQuery): Promise<string>;
  getCandidateLastName(query: EntityDataQuery): Promise<string>;

  // Custom fields
  getCustomFieldValue(machineKey: string, query: EntityDataQuery): Promise<string>;
}
