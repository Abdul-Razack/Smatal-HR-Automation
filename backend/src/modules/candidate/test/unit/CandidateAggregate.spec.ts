import { CandidateAggregate } from '../../src/domain/aggregates/CandidateAggregate';
import { CandidateStatus } from '../../src/domain/enums/CandidateStatus';
import { Identifier } from '../../../../kernel/domain/Identifier';
import {
  CandidateCreatedEvent,
  CandidateStatusChangedEvent,
  CandidateConvertedEvent,
} from '../../src/domain/events/CandidateEvents';
import {
  InvalidCandidateStatusTransitionException,
  CandidateAlreadyConvertedException,
  CandidateNotSelectedException,
} from '../../src/domain/exceptions/CandidateExceptions';

describe('CandidateAggregate', () => {
  const makeCandidate = (
    status: CandidateStatus = CandidateStatus.DRAFT,
  ): CandidateAggregate => {
    return CandidateAggregate.create(
      {
        businessId: 'CAND_000001',
        companyId: new Identifier<string>('company-1'),
        profileId: 'profile-1',
        status,
        source: null,
        referredBy: null,
        notes: null,
        appliedDate: null,
        version: 1,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      },
      new Identifier<string>('candidate-1'),
      'user-1',
    );
  };

  describe('create', () => {
    it('should create with DRAFT status', () => {
      const candidate = makeCandidate();
      expect(candidate.status).toBe(CandidateStatus.DRAFT);
      expect(candidate.businessId).toBe('CAND_000001');
    });

    it('should emit CandidateCreatedEvent on create', () => {
      const candidate = makeCandidate();
      expect(candidate.domainEvents).toHaveLength(1);
      expect(candidate.domainEvents[0]).toBeInstanceOf(CandidateCreatedEvent);
    });
  });

  describe('status lifecycle', () => {
    it('should transition DRAFT → APPLIED on submit', () => {
      const candidate = makeCandidate(CandidateStatus.DRAFT);
      candidate.clearEvents();
      candidate.submit('user-1');
      expect(candidate.status).toBe(CandidateStatus.APPLIED);
      const event = candidate.domainEvents.find(
        (e: any) => e instanceof CandidateStatusChangedEvent,
      ) as CandidateStatusChangedEvent;
      expect(event).toBeDefined();
      expect(event.newStatus).toBe(CandidateStatus.APPLIED);
    });

    it('should transition APPLIED → SCREENING on screen', () => {
      const candidate = makeCandidate(CandidateStatus.APPLIED);
      candidate.screen('user-1');
      expect(candidate.status).toBe(CandidateStatus.SCREENING);
    });

    it('should transition SCREENING → INTERVIEWING → SELECTED', () => {
      const candidate = makeCandidate(CandidateStatus.SCREENING);
      candidate.startInterviewing('user-1');
      expect(candidate.status).toBe(CandidateStatus.INTERVIEWING);
      candidate.select('user-1');
      expect(candidate.status).toBe(CandidateStatus.SELECTED);
    });

    it('should throw when invalid transition attempted', () => {
      const candidate = makeCandidate(CandidateStatus.DRAFT);
      expect(() => candidate.screen('user-1')).toThrow(
        InvalidCandidateStatusTransitionException,
      );
    });

    it('should allow rejection from APPLIED', () => {
      const candidate = makeCandidate(CandidateStatus.APPLIED);
      candidate.reject('user-1', 'Not a fit');
      expect(candidate.status).toBe(CandidateStatus.REJECTED);
    });

    it('should allow withdrawal from DRAFT', () => {
      const candidate = makeCandidate(CandidateStatus.DRAFT);
      candidate.withdraw('user-1', 'Changed mind');
      expect(candidate.status).toBe(CandidateStatus.WITHDRAWN);
    });
  });

  describe('markConverted', () => {
    it('should convert a SELECTED candidate and emit CandidateConvertedEvent', () => {
      const candidate = makeCandidate(CandidateStatus.SELECTED);
      candidate.clearEvents();
      candidate.markConverted('employee-1', 'user-1');
      expect(candidate.status).toBe(CandidateStatus.CONVERTED);
      const event = candidate.domainEvents.find(
        (e: any) => e instanceof CandidateConvertedEvent,
      ) as CandidateConvertedEvent;
      expect(event).toBeDefined();
      expect(event.employeeId).toBe('employee-1');
    });

    it('should throw if already converted', () => {
      const candidate = makeCandidate(CandidateStatus.SELECTED);
      candidate.markConverted('emp-1', 'user-1');
      expect(() => candidate.markConverted('emp-2', 'user-1')).toThrow(
        CandidateAlreadyConvertedException,
      );
    });

    it('should throw if not selected', () => {
      const candidate = makeCandidate(CandidateStatus.APPLIED);
      expect(() => candidate.markConverted('emp-1', 'user-1')).toThrow(
        CandidateNotSelectedException,
      );
    });
  });

  describe('softDelete', () => {
    it('should mark as deleted', () => {
      const candidate = makeCandidate();
      candidate.softDelete('user-1');
      expect(candidate.isDeleted).toBe(true);
      expect(candidate.deletedBy).toBe('user-1');
      expect(candidate.deletedAt).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update fields and increment version', () => {
      const candidate = makeCandidate();
      const initialVersion = candidate.version;
      candidate.update('New notes', 'LinkedIn', null, null, 'user-1');
      expect(candidate.notes).toBe('New notes');
      expect(candidate.source).toBe('LinkedIn');
      expect(candidate.version).toBe(initialVersion + 1);
    });
  });
});
