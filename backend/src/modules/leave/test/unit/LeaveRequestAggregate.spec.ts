import { LeaveRequestAggregate, LeaveRequestProps } from '../../src/domain/aggregates/LeaveRequestAggregate';
import { LeaveStatus, LeaveDurationType } from '../../src/domain/enums/LeaveEnums';
import { DateRange } from '../../src/domain/value-objects/DateRange';
import { LeaveDuration } from '../../src/domain/value-objects/LeaveDuration';
import { Identifier } from '../../../../kernel/domain/Identifier';

describe('LeaveRequestAggregate', () => {
  const getDefaultProps = (): LeaveRequestProps => ({
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
  });

  it('should successfully create a LeaveRequest with domain events', () => {
    const id = new Identifier<string>('id1');
    const leave = LeaveRequestAggregate.create(getDefaultProps(), id, 'emp1');
    
    expect(leave.employeeId.toString()).toBe('emp1');
    expect(leave.companyId.toString()).toBe('company1');
    expect(leave.status).toBe(LeaveStatus.PENDING);
    expect(leave.reason).toBe('Vacation');
    
    const events = leave.domainEvents;
    expect(events.length).toBe(1);
    expect(events[0].constructor.name).toBe('LeaveAppliedEvent');
  });

  it('should allow status update to APPROVED if currently PENDING', () => {
    const leave = LeaveRequestAggregate.create(getDefaultProps(), new Identifier<string>('id1'), 'emp1');
    leave.approve('approverId');
    
    expect(leave.status).toBe(LeaveStatus.APPROVED);
    expect(leave.updatedBy).toBe('approverId');
  });

  it('should allow status update to REJECTED if currently PENDING', () => {
    const leave = LeaveRequestAggregate.create(getDefaultProps(), new Identifier<string>('id1'), 'emp1');
    leave.reject('approverId');
    
    expect(leave.status).toBe(LeaveStatus.REJECTED);
    expect(leave.updatedBy).toBe('approverId');
  });

  it('should prevent status update to APPROVED if already CANCELLED', () => {
    const leave = LeaveRequestAggregate.create(getDefaultProps(), new Identifier<string>('id1'), 'emp1');
    leave.cancel('emp1'); // Employee cancels it
    
    expect(() => leave.approve('approverId')).toThrow('Only pending leave requests can be approved.');
  });

  it('should record LeaveCancelledEvent when cancelled', () => {
    const leave = LeaveRequestAggregate.create(getDefaultProps(), new Identifier<string>('id1'), 'emp1');
    leave.clearEvents(); // clear creation events
    
    leave.cancel('emp1');
    
    const events = leave.domainEvents;
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].constructor.name).toBe('LeaveCancelledEvent');
  });
});
