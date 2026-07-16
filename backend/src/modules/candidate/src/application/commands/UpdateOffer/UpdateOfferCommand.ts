import { ICommand } from '@nestjs/cqrs';

export class UpdateOfferCommand implements ICommand {
  constructor(
    public readonly offerId: string,
    public readonly companyId: string,
    public readonly baseSalary: number | null | undefined,
    public readonly currency: string | null | undefined,
    public readonly joiningDate: Date | null | undefined,
    public readonly validUntil: Date | null | undefined,
    public readonly notes: string | null | undefined,
    public readonly performedBy: string,
  ) {}
}
