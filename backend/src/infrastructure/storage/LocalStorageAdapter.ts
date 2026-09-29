import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import {
  IStorageService,
  StorageMetadata,
  StorageUploadResult,
} from './IStorageService';

/**
 * LocalStorageAdapter — for development and testing only.
 * Stores files on the local filesystem under the process CWD.
 *
 * ⚠ WARNING: Do NOT use in production. Breaks under horizontal scaling.
 * This adapter exists to allow the engine to function without cloud setup.
 */
@Injectable()
export class LocalStorageAdapter implements IStorageService {
  private readonly baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'storage');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private resolveSafePath(key: string): string {
    const cleanKey = key.replace(/^local:\/\//, '');
    const resolvedPath = path.resolve(this.baseDir, cleanKey);
    const resolvedBase = path.resolve(this.baseDir);
    if (!resolvedPath.startsWith(resolvedBase + path.sep) && resolvedPath !== resolvedBase) {
      throw new Error('Access denied: Invalid storage path or path traversal detected');
    }
    return resolvedPath;
  }

  async upload(
    key: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<StorageUploadResult> {
    const filePath = this.resolveSafePath(key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, buffer);

    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    return {
      uri: `local://${key}`,
      checksum,
      sizeBytes: buffer.length,
    };
  }

  async uploadStream(
    key: string,
    stream: import('stream').Readable,
    _mimeType: string,
  ): Promise<StorageUploadResult> {
    const filePath = this.resolveSafePath(key);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(filePath)) {
      throw new Error(`Storage: Cannot overwrite existing file at ${key}`);
    }

    const hash = crypto.createHash('sha256');
    const writeStream = fs.createWriteStream(filePath);
    let sizeBytes = 0;

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => {
        hash.update(chunk);
        sizeBytes += chunk.length;
      });

      stream
        .pipe(writeStream)
        .on('finish', () => {
          resolve({
            uri: `local://${key}`,
            checksum: hash.digest('hex'),
            sizeBytes,
          });
        })
        .on('error', (err) => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          reject(err);
        });
    });
  }

  async download(uri: string): Promise<Buffer> {
    const filePath = this.resolveSafePath(uri);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Storage: File not found for uri: ${uri}`);
    }
    return fs.readFileSync(filePath);
  }

  async downloadStream(uri: string): Promise<import('stream').Readable> {
    const filePath = this.resolveSafePath(uri);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Storage: File not found for uri: ${uri}`);
    }
    return fs.createReadStream(filePath);
  }

  async delete(uri: string): Promise<void> {
    const filePath = this.resolveSafePath(uri);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async exists(uri: string): Promise<boolean> {
    const filePath = this.resolveSafePath(uri);
    return fs.existsSync(filePath);
  }

  async getPresignedUrl(uri: string, _expirySeconds: number): Promise<string> {
    // Local: just return the URI as-is (not a real presigned URL)
    return uri;
  }

  async getMetadata(uri: string): Promise<StorageMetadata> {
    const filePath = this.resolveSafePath(uri);
    const stat = fs.statSync(filePath);
    const buffer = fs.readFileSync(filePath);
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    return {
      uri,
      sizeBytes: stat.size,
      mimeType: 'application/octet-stream',
      checksum,
      lastModified: stat.mtime,
    };
  }
}
