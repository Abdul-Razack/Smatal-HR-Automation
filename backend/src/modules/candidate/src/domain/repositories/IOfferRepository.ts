import { OfferAggregate } from '../aggregates/OfferAggregate';

export interface IOfferRepository {
  findById(id: string): Promise<OfferAggregate | null>;
  save(offer: OfferAggregate): Promise<void>;
  delete(id: string): Promise<void>;
  findByCandidateId(candidateId: string): Promise<OfferAggregate[]>;
}
