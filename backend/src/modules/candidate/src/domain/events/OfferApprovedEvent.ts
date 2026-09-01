export class OfferApprovedEvent {
  constructor(
    public readonly offerId: string,
    public readonly candidateId: string,
    public readonly companyId: string,
    public readonly documentTypeId: string,
    public readonly performedBy: string,
  ) {}
}
