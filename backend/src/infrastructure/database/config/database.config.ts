import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface DatabaseConfig {
  url: string;
  poolSize: number;
  connectionTimeout: number;
  ssl: boolean;
  logging: boolean;
}

export const databaseValidationSchema = {
  DATABASE_URL: Joi.string().required(),
  DATABASE_POOL_SIZE: Joi.number().default(10),
  DATABASE_TIMEOUT: Joi.number().default(5000),
  DATABASE_SSL: Joi.boolean().default(false),
  DATABASE_LOGGING: Joi.boolean().default(
    process.env.NODE_ENV !== 'production',
  ),
};

export const databaseConfig = registerAs('database', (): DatabaseConfig => ({
  url: process.env.DATABASE_URL!,
  poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
  connectionTimeout: parseInt(process.env.DATABASE_TIMEOUT || '5000', 10),
  ssl: process.env.DATABASE_SSL === 'true',
  logging:
    process.env.DATABASE_LOGGING !== 'false' &&
    process.env.NODE_ENV !== 'production',
}));
