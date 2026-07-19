import { OfferAggregate } from '../../domain/aggregates/OfferAggregate';
import { Identifier } from '../../../../../kernel/domain/Identifier';
type PrismaOffer = any;
import { OfferStatus } from '../../domain/enums/OfferStatus';
import { Prisma } from '@prisma/client';

export class OfferMapper {
  static toDomain(raw: PrismaOffer): OfferAggregate {
    return OfferAggregate.reconstitute(
      {
        businessId: raw.businessId,
        companyId: new Identifier(raw.companyId),
        candidateId: raw.candidateId,
        status: raw.status as OfferStatus,
        baseSalary: raw.baseSalary ? raw.baseSalary.toNumber() : null,
        currency: raw.currency,
        joiningDate: raw.joiningDate,
        validUntil: raw.validUntil,
        notes: raw.notes,
        generatedDocumentId: raw.generatedDocumentId,
        isDeleted: raw.isDeleted,
        deletedAt: raw.deletedAt,
        deletedBy: raw.deletedBy,
        version: raw.version,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        createdBy: raw.createdBy,
        updatedBy: raw.updatedBy,
      },
      new Identifier(raw.id),
    );
  }

  static toPersistence(offer: OfferAggregate): PrismaOffer {
    return {
      id: offer.id.toString(),
      businessId: offer.businessId,
      companyId: offer.companyId.toString(),
      candidateId: offer.candidateId,
      status: offer.status as any,
      baseSalary: offer.baseSalary != null ? new Prisma.Decimal(offer.baseSalary) : null,
      currency: offer.currency ?? null,
      joiningDate: offer.joiningDate ?? null,
      validUntil: offer.validUntil ?? null,
      notes: offer.notes ?? null,
      generatedDocumentId: offer.generatedDocumentId ?? null,
      isDeleted: offer.isDeleted,
      deletedAt: offer.deletedAt ?? null,
      deletedBy: offer.deletedBy ?? null,
      version: offer.version,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      createdBy: offer.createdBy,
      updatedBy: offer.updatedBy,
    };
  }
}
