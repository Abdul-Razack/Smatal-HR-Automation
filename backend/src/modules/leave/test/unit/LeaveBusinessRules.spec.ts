import { LeaveBusinessRules, LeavePolicyValidationException } from '../../src/domain/services/LeaveBusinessRules';
import { LeaveRequestAggregate, LeaveRequestProps } from '../../src/domain/aggregates/LeaveRequestAggregate';
import { LeavePolicy, LeavePolicyProps } from '../../src/domain/entities/LeavePolicy';
import { LeaveStatus, LeaveDurationType, LeaveAccrualType, CarryForwardType } from '../../src/domain/enums/LeaveEnums';
import { DateRange } from '../../src/domain/value-objects/DateRange';
import { LeaveDuration } from '../../src/domain/value-objects/LeaveDuration';
import { Identifier } from '../../../../kernel/domain/Identifier';

describe('LeaveBusinessRules', () => {
  let rules: LeaveBusinessRules;

  const defaultRequestProps: LeaveRequestProps = {
    employeeId: new Identifier<string>('emp1'),
    companyId: new Identifier<string>('company1'),
    businessId: 'LR-1234',
    leaveTypeId: new Identifier<string>('type1'),
    status: LeaveStatus.PENDING,
    dateRange: DateRange.create(new Date('2024-01-10'), new Date('2024-01-12')),
    duration: LeaveDuration.create(3, LeaveDurationType.FULL_DAY),
    reason: 'Vacation',
    isDeleted: false,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'emp1',
    updatedBy: 'emp1',
  };

  const defaultPolicyProps: LeavePolicyProps = {
    leaveTypeId: new Identifier<string>('type1'),
    companyId: new Identifier<string>('company1'),
    businessId: 'LP-1234',
    name: 'Sick Leave',
    description: '',
    annualEntitlement: 10,
    accrualType: LeaveAccrualType.YEARLY,
    carryForwardType: CarryForwardType.NONE,
    maxCarryForwardDays: null,
    requiresAttachment: false,
    minDaysForAttachment: null,
    isActive: true,
    isDeleted: false,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin',
    updatedBy: 'admin',
  };

  beforeEach(() => {
    rules = new LeaveBusinessRules();
  });

  describe('validateAgainstPolicy', () => {
    it('should throw exception if policy is inactive', () => {
      const leave = LeaveRequestAggregate.create(defaultRequestProps, new Identifier<string>('id1'), 'emp1');
      const policy = LeavePolicy.create({ ...defaultPolicyProps, isActive: false }, new Identifier<string>('id1'));

      expect(() => rules.validateAgainstPolicy(leave, policy)).toThrow(LeavePolicyValidationException);
      expect(() => rules.validateAgainstPolicy(leave, policy)).toThrow(/not active/);
    });

    it('should throw exception if attachment is required but missing', () => {
      const leave = LeaveRequestAggregate.create({
        ...defaultRequestProps,
        duration: LeaveDuration.create(5, LeaveDurationType.FULL_DAY),
      }, new Identifier<string>('id1'), 'emp1');

      const policy = LeavePolicy.create({
        ...defaultPolicyProps,
        requiresAttachment: true,
        minDaysForAttachment: 3,
      }, new Identifier<string>('id1'));

      expect(() => rules.validateAgainstPolicy(leave, policy)).toThrow(LeavePolicyValidationException);
      expect(() => rules.validateAgainstPolicy(leave, policy)).toThrow(/Attachment is required/);
    });

    it('should pass if attachment is required and provided', () => {
      const leave = LeaveRequestAggregate.create({
        ...defaultRequestProps,
        duration: LeaveDuration.create(5, LeaveDurationType.FULL_DAY),
        attachmentUrl: 'https://example.com/doc.pdf',
      }, new Identifier<string>('id1'), 'emp1');

      const policy = LeavePolicy.create({
        ...defaultPolicyProps,
        requiresAttachment: true,
        minDaysForAttachment: 3,
      }, new Identifier<string>('id1'));

      expect(() => rules.validateAgainstPolicy(leave, policy)).not.toThrow();
    });
  });

  describe('validateOverlaps', () => {
    it('should throw exception if overlapping leaves exist', () => {
      const overlappingLeave = LeaveRequestAggregate.create(defaultRequestProps, new Identifier<string>('existing_id_123'), 'emp1');

      expect(() => rules.validateOverlaps([overlappingLeave], 'new_leave_id')).toThrow(LeavePolicyValidationException);
      expect(() => rules.validateOverlaps([overlappingLeave], 'new_leave_id')).toThrow(/overlaps/);
    });

    it('should ignore overlap if it is the same leave request (update scenario)', () => {
      const existingLeave = LeaveRequestAggregate.create(defaultRequestProps, new Identifier<string>('existing_id_123'), 'emp1');

      // Pass the same ID so the filter ignores it
      expect(() => rules.validateOverlaps([existingLeave], 'existing_id_123')).not.toThrow();
    });
  });
});
