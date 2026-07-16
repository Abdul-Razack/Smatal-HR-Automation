import { Injectable } from '@nestjs/common';
import { IStorageService } from './IStorageService';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { S3StorageAdapter } from './S3StorageAdapter';
import { StorageRetryDecorator } from './StorageRetryDecorator';

export type StorageProvider = 'local' | 's3';

/**
 * StorageFactory — resolves the correct IStorageService implementation
 * based on the STORAGE_PROVIDER environment variable.
 *
 * Default is 'local' for development convenience.
 * Set STORAGE_PROVIDER=s3 in production.
 */
@Injectable()
export class StorageFactory {
  constructor(
    private readonly localAdapter: LocalStorageAdapter,
    private readonly s3Adapter: S3StorageAdapter,
  ) {}

  getService(provider?: StorageProvider): IStorageService {
    const resolvedProvider =
      provider ?? (process.env.STORAGE_PROVIDER as StorageProvider) ?? 'local';

    let adapter: IStorageService;
    switch (resolvedProvider) {
      case 's3':
        adapter = this.s3Adapter;
        break;
      case 'local':
      default:
        adapter = this.localAdapter;
        break;
    }

    return new StorageRetryDecorator(adapter, 3, 500);
  }
}
