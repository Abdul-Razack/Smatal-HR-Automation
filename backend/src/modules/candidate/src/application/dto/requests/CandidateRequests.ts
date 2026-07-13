import { IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCandidateRequest {
  @ApiProperty({
    description: 'Profile ID of the person being added as a candidate',
  })
  @IsUUID()
  profileId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  referredBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  appliedDate?: string;
}

export class UpdateCandidateRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  referredBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  appliedDate?: string;
}

export class RejectCandidateRequest {
  @ApiPropertyOptional({ description: 'Rejection reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class WithdrawCandidateRequest {
  @ApiPropertyOptional({ description: 'Withdrawal reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ConvertCandidateRequest {
  @ApiProperty({ description: 'Date the employee officially joins' })
  @IsDateString()
  joinedDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  designationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  reportsToId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  probationEndDate?: string;
}
