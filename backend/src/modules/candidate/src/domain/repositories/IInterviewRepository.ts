import { InterviewAggregate } from '../aggregates/InterviewAggregate';

export interface IInterviewRepository {
  findById(id: string): Promise<InterviewAggregate | null>;
  save(interview: InterviewAggregate): Promise<void>;
  delete(id: string): Promise<void>;
  findByCandidateId(candidateId: string): Promise<InterviewAggregate[]>;
}
