import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  MinLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkflowDefinitionRequest {
  @ApiProperty() @IsString() @MinLength(1) name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsString() entityType: string;
  @ApiPropertyOptional() @IsOptional() @IsString() processCode?: string;
}

export class UpdateWorkflowDefinitionRequest {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class AddWorkflowStageRequest {
  @ApiProperty() @IsString() @MinLength(1) name: string;
  @ApiProperty() @IsString() @MinLength(1) code: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsNumber() @Min(0) displayOrder: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isTerminal?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFinal?: boolean;
}

export class StartWorkflowInstanceRequest {
  @ApiProperty() @IsUUID() workflowDefinitionId: string;
  @ApiProperty() @IsString() entityType: string;
  @ApiProperty() @IsUUID() entityId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() candidateId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
}

export class AdvanceWorkflowStageRequest {
  @ApiProperty() @IsUUID() nextStageId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}

export class ApproveWorkflowStageRequest {
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}

export class RejectWorkflowStageRequest {
  @ApiProperty() @IsString() @MinLength(1) reason: string;
}

export class ReturnWorkflowStageRequest {
  @ApiProperty() @IsUUID() targetStageId: string;
  @ApiProperty() @IsString() @MinLength(1) reason: string;
}

export class CancelWorkflowInstanceRequest {
  @ApiProperty() @IsString() @MinLength(1) reason: string;
}
