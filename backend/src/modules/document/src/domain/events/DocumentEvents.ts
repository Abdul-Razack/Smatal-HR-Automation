export class DocumentGenerationStartedEvent {
  constructor(
    public readonly documentId: string,
    public readonly businessId: string,
    public readonly companyId: string,
    public readonly templateId: string,
    public readonly performedBy: string,
    public readonly startedAt: Date,
  ) {}
}

export class DocumentGenerationCompletedEvent {
  constructor(
    public readonly documentId: string,
    public readonly businessId: string,
    public readonly companyId: string,
    public readonly templateId: string,
    public readonly profileId: string,
    public readonly snapshotUris: string[],
    public readonly renderTimeMs: number,
    public readonly performedBy: string,
  ) {}
}

export class DocumentGenerationFailedEvent {
  constructor(
    public readonly documentId: string,
    public readonly businessId: string,
    public readonly companyId: string,
    public readonly templateId: string,
    public readonly errorReason: string,
    public readonly performedBy: string,
  ) {}
}

export class DocumentDownloadedEvent {
  constructor(
    public readonly documentId: string,
    public readonly companyId: string,
    public readonly downloadedBy: string,
    public readonly snapshotUri: string,
    public readonly downloadedAt: Date,
  ) {}
}

export class TemplateRenderedEvent {
  constructor(
    public readonly templateId: string,
    public readonly templateVersionId: string,
    public readonly companyId: string,
    public readonly placeholderCount: number,
    public readonly renderTimeMs: number,
  ) {}
}
