import { Injectable, Logger } from '@nestjs/common';
import {
  IStorageService,
  StorageMetadata,
  StorageUploadResult,
} from './IStorageService';
import { Readable } from 'stream';

@Injectable()
export class StorageRetryDecorator implements IStorageService {
  private readonly logger = new Logger(StorageRetryDecorator.name);

  constructor(
    private readonly inner: IStorageService,
    private readonly maxRetries: number = 3,
    private readonly baseDelayMs: number = 500,
  ) {}

  private async withRetry<T>(
    operationName: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        return await operation();
      } catch (error: any) {
        attempt++;
        if (attempt >= this.maxRetries) {
          this.logger.error(
            `Storage operation [${operationName}] failed after ${this.maxRetries} attempts. Last error: ${error.message}`,
          );
          throw error; // Let it throw after max retries
        }

        const delay = this.baseDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
        this.logger.warn(
          `Storage operation [${operationName}] failed. Retrying in ${delay}ms... (Attempt ${attempt}/${this.maxRetries})`,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error('Unreachable');
  }

  async upload(
    key: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<StorageUploadResult> {
    return this.withRetry('upload', () =>
      this.inner.upload(key, buffer, mimeType),
    );
  }

  async uploadStream(
    key: string,
    stream: Readable,
    mimeType: string,
  ): Promise<StorageUploadResult> {
    // Note: Retrying a stream upload is dangerous if the stream cannot be restarted.
    // Usually, streams are consumed. We will try to rely on the underlying client's retry (e.g., AWS SDK) for streams,
    // or we just wrap it and if it fails, it fails unless the stream is replayable.
    return this.withRetry('uploadStream', () =>
      this.inner.uploadStream(key, stream, mimeType),
    );
  }

  async download(uri: string): Promise<Buffer> {
    return this.withRetry('download', () => this.inner.download(uri));
  }

  async downloadStream(uri: string): Promise<Readable> {
    return this.withRetry('downloadStream', () =>
      this.inner.downloadStream(uri),
    );
  }

  async delete(uri: string): Promise<void> {
    return this.withRetry('delete', () => this.inner.delete(uri));
  }

  async exists(uri: string): Promise<boolean> {
    return this.withRetry('exists', () => this.inner.exists(uri));
  }

  async getPresignedUrl(uri: string, expirySeconds: number): Promise<string> {
    return this.withRetry('getPresignedUrl', () =>
      this.inner.getPresignedUrl(uri, expirySeconds),
    );
  }

  async getMetadata(uri: string): Promise<StorageMetadata> {
    return this.withRetry('getMetadata', () => this.inner.getMetadata(uri));
  }
}
