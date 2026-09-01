export enum OfferStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  GENERATED = 'GENERATED',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export const OFFER_STATUS_TRANSITIONS: Record<OfferStatus, OfferStatus[]> = {
  [OfferStatus.DRAFT]: [OfferStatus.APPROVED, OfferStatus.GENERATED],
  [OfferStatus.APPROVED]: [OfferStatus.GENERATED],
  [OfferStatus.GENERATED]: [OfferStatus.SENT, OfferStatus.WITHDRAWN],
  [OfferStatus.SENT]: [OfferStatus.ACCEPTED, OfferStatus.REJECTED, OfferStatus.WITHDRAWN],
  [OfferStatus.ACCEPTED]: [],
  [OfferStatus.REJECTED]: [],
  [OfferStatus.WITHDRAWN]: [],
};
