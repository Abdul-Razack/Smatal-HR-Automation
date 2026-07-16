import { Injectable } from '@nestjs/common';
import {
  IStorageService,
  StorageMetadata,
  StorageUploadResult,
} from './IStorageService';

/**
 * S3StorageAdapter — production-grade cloud storage adapter for AWS S3.
 *
 * NOTE: This is a stub implementation. Wire it up with the @aws-sdk/client-s3
 * package and an S3-compatible service when deploying to production.
 *
 * The interface contract is fully defined; only the AWS SDK calls need to be filled in.
 */
@Injectable()
export class S3StorageAdapter implements IStorageService {
  private readonly bucket: string;
  private readonly region: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET ?? 'smatal-documents';
    this.region = process.env.AWS_REGION ?? 'ap-south-1';
  }

  async upload(
    _key: string,
    _buffer: Buffer,
    _mimeType: string,
  ): Promise<StorageUploadResult> {
    // TODO: Inject @aws-sdk/client-s3 PutObjectCommand
    throw new Error(
      'S3StorageAdapter.upload() not implemented. Configure AWS credentials and use the @aws-sdk/client-s3 package.',
    );
  }

  async uploadStream(
    _key: string,
    _stream: import('stream').Readable,
    _mimeType: string,
  ): Promise<StorageUploadResult> {
    // TODO: Inject @aws-sdk/lib-storage Upload
    throw new Error('S3StorageAdapter.uploadStream() not implemented.');
  }

  async download(_uri: string): Promise<Buffer> {
    // TODO: Inject @aws-sdk/client-s3 GetObjectCommand
    throw new Error('S3StorageAdapter.download() not implemented.');
  }

  async downloadStream(_uri: string): Promise<import('stream').Readable> {
    // TODO: Inject @aws-sdk/client-s3 GetObjectCommand and return Body as stream
    throw new Error('S3StorageAdapter.downloadStream() not implemented.');
  }

  async delete(_uri: string): Promise<void> {
    // TODO: Inject @aws-sdk/client-s3 DeleteObjectCommand
    throw new Error('S3StorageAdapter.delete() not implemented.');
  }

  async exists(_uri: string): Promise<boolean> {
    // TODO: Inject @aws-sdk/client-s3 HeadObjectCommand
    throw new Error('S3StorageAdapter.exists() not implemented.');
  }

  async getPresignedUrl(_uri: string, _expirySeconds: number): Promise<string> {
    // TODO: Inject @aws-sdk/s3-request-presigner getSignedUrl()
    throw new Error('S3StorageAdapter.getPresignedUrl() not implemented.');
  }

  async getMetadata(_uri: string): Promise<StorageMetadata> {
    // TODO: Inject @aws-sdk/client-s3 HeadObjectCommand
    throw new Error('S3StorageAdapter.getMetadata() not implemented.');
  }

  /** Returns the S3 bucket and region for logging/diagnostics */
  getBucketInfo(): { bucket: string; region: string } {
    return { bucket: this.bucket, region: this.region };
  }
}
