export class DocumentGeneratedEvent {
  constructor(
    public readonly documentId: string,
    public readonly businessId: string,
    public readonly companyId: string,
    public readonly templateId: string,
    public readonly profileId: string,
    public readonly snapshotUris: string[],
    public readonly performedBy: string,
  ) {}
}
