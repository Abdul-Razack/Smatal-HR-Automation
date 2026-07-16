export class GetAllGeneratedDocumentsQuery {
  constructor(
    public readonly companyId: string,
    public readonly filters?: {
      profileId?: string;
      candidateId?: string;
      employeeId?: string;
    },
  ) {}
}
