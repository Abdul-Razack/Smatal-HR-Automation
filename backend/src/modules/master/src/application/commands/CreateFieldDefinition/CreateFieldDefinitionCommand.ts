import { ICommand } from '../../../../../../kernel/cqrs/cqrs.contracts';
import {
  FieldDataType,
  FieldEntityType,
} from '../../../domain/entities/FieldDefinitionAggregate';
import {
  FieldOptionDto,
  FieldValidationDto,
} from '../../dtos/requests/CreateFieldDefinitionRequest';

export class CreateFieldDefinitionCommand implements ICommand {
  constructor(
    public readonly companyId: string,
    public readonly machineKey: string,
    public readonly displayName: string,
    public readonly dataType: FieldDataType,
    public readonly entityType: FieldEntityType,
    public readonly performedBy: string,
    public readonly isRequired: boolean = false,
    public readonly description?: string,
    public readonly defaultValue?: string,
    public readonly displayOrder?: number,
    public readonly groupId?: string,
    public readonly options?: FieldOptionDto[],
    public readonly validations?: FieldValidationDto[],
  ) {}
}
