import { ICommand } from '@nestjs/cqrs';

export class AcceptOfferCommand implements ICommand {
  constructor(
    public readonly offerId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}
}
