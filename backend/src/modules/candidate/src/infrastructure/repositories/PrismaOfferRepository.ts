import { Injectable, Inject } from '@nestjs/common';
import { IOfferRepository } from '../../domain/repositories/IOfferRepository';
import { OfferAggregate } from '../../domain/aggregates/OfferAggregate';
import { OfferMapper } from '../mappers/OfferMapper';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';

@Injectable()
export class PrismaOfferRepository implements IOfferRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private get client() {
    return this.prisma;
  }

  async findById(id: string): Promise<OfferAggregate | null> {
    const raw = await (this.client as any).offerLetter.findUnique({
      where: { id, isDeleted: false },
    });
    if (!raw) return null;
    return OfferMapper.toDomain(raw);
  }

  async findByCandidateId(candidateId: string): Promise<OfferAggregate[]> {
    const raws = await (this.client as any).offerLetter.findMany({
      where: { candidateId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
    return raws.map(OfferMapper.toDomain);
  }

  async save(offer: OfferAggregate): Promise<void> {
    const data = OfferMapper.toPersistence(offer);

    const existing = await (this.client as any).offerLetter.findUnique({
      where: { id: data.id },
    });

    if (existing) {
      await (this.client as any).offerLetter.update({
        where: { id: data.id },
        data,
      });
    } else {
      await (this.client as any).offerLetter.create({
        data,
      });
    }
  }

  async delete(id: string): Promise<void> {
    await (this.client as any).offerLetter.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }
}
