import { Injectable } from '@nestjs/common';
import {
  IValidator,
  ValidationResult,
} from '../../validation/validation.contracts';
import { DomainException } from '../../domain/DomainException';

@Injectable()
export class ValidationPipeline {
  constructor(private readonly validators: IValidator<any>[]) {}

  public async validate<T>(target: T): Promise<void> {
    const results: ValidationResult[] = [];

    for (const validator of this.validators) {
      const result = await validator.validate(target);
      if (!result.isValid) {
        results.push(result);
      }
    }

    if (results.length > 0) {
      const errors = results.flatMap((r) => r.errors);
      throw new DomainException(
        `Validation failed: ${JSON.stringify(errors)}`,
        'VALIDATION_FAILED',
      );
    }
  }
}
