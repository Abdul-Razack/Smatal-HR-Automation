import { Entity } from '../../../../../kernel/domain/Entity';
import { Identifier } from '../../../../../kernel/domain/Identifier';

export interface EmploymentHistoryProps {
  employeeId: string;
  companyId: Identifier<string>;
  changeType: string;
  previousValue?: string | null;
  newValue?: string | null;
  effectiveDate: Date;
  notes?: string | null;
  createdAt: Date;
  createdBy: string;
}

export class EmploymentHistoryEntity extends Entity<EmploymentHistoryProps> {
  private constructor(props: EmploymentHistoryProps, id: Identifier<string>) {
    super(props, id);
  }

  static create(
    props: EmploymentHistoryProps,
    id?: Identifier<string>,
  ): EmploymentHistoryEntity {
    return new EmploymentHistoryEntity(
      props, 
      id ?? new Identifier<string>(crypto.randomUUID())
    );
  }

  static reconstitute(
    props: EmploymentHistoryProps,
    id: Identifier<string>,
  ): EmploymentHistoryEntity {
    return new EmploymentHistoryEntity(props, id);
  }

  get employeeId(): string {
    return this.props.employeeId;
  }
  
  get companyId(): Identifier<string> {
    return this.props.companyId;
  }
  
  get changeType(): string {
    return this.props.changeType;
  }
  
  get previousValue(): string | null | undefined {
    return this.props.previousValue;
  }
  
  get newValue(): string | null | undefined {
    return this.props.newValue;
  }
  
  get effectiveDate(): Date {
    return this.props.effectiveDate;
  }
  
  get notes(): string | null | undefined {
    return this.props.notes;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }
}
