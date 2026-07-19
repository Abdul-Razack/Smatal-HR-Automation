import { ApiProperty } from '@nestjs/swagger';

export class GlobalPlaceholderResponseDto {
  @ApiProperty({ example: 'employee.firstName' })
  key: string;

  @ApiProperty({ example: 'Employee First Name' })
  label: string;

  @ApiProperty({ example: 'EMPLOYEE' })
  entity: string;

  @ApiProperty({ example: 'TEXT' })
  dataType: string;

  @ApiProperty({ example: true })
  isRequired: boolean;

  @ApiProperty({ example: 'First name of the employee', nullable: true })
  description: string | null;

  @ApiProperty({ example: 'John', nullable: true })
  exampleValue: string | null;

  @ApiProperty({ example: 'SYSTEM', enum: ['SYSTEM', 'CUSTOM'] })
  source: string;
}
