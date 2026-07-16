import { ICommand } from '@nestjs/cqrs';

export class GenerateOfferCommand implements ICommand {
  constructor(
    public readonly candidateId: string,
    public readonly companyId: string,
    public readonly baseSalary: number,
    public readonly currency: string,
    public readonly joiningDate: Date,
    public readonly validUntil: Date,
    public readonly notes: string | null | undefined,
    public readonly performedBy: string,
  ) {}
}
