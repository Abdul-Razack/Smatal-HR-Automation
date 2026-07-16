import { ICommand } from '@nestjs/cqrs';

export class RejectOfferCommand implements ICommand {
  constructor(
    public readonly offerId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}
}
