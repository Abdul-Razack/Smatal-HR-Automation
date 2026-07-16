import { Readable } from 'stream';

export interface StorageUploadResult {
  uri: string;
  checksum: string;
  sizeBytes: number;
}

export interface StorageMetadata {
  uri: string;
  sizeBytes: number;
  mimeType: string;
  checksum: string;
  lastModified: Date;
}

/**
 * IStorageService — abstract contract for all cloud/local storage adapters.
 * Business logic must always depend on this interface, never concrete adapters.
 */
export interface IStorageService {
  /**
   * Upload a file buffer to the storage backend.
   * @param key    Logical path (e.g., "templates/{tenantId}/{versionId}/original.docx")
   * @param buffer The raw binary content
   * @param mimeType MIME type of the file
   * @returns StorageUploadResult containing the full URI, checksum, and size
   */
  upload(
    key: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<StorageUploadResult>;

  /**
   * Upload a file stream to the storage backend efficiently.
   * Calculates checksums concurrently during streaming.
   */
  uploadStream(
    key: string,
    stream: Readable,
    mimeType: string,
  ): Promise<StorageUploadResult>;

  /**
   * Download a file as a Buffer from the storage backend.
   * @param uri The full URI previously returned from upload()
   */
  download(uri: string): Promise<Buffer>;

  /**
   * Download a file as a readable stream for efficient processing.
   */
  downloadStream(uri: string): Promise<Readable>;

  /**
   * Permanently delete a file from the storage backend.
   */
  delete(uri: string): Promise<void>;

  /**
   * Check if a file exists in the storage backend.
   */
  exists(uri: string): Promise<boolean>;

  /**
   * Generate a time-limited pre-signed URL for direct download by a client browser.
   * @param uri          The full URI of the file
   * @param expirySeconds Time-to-live in seconds for the generated URL
   */
  getPresignedUrl(uri: string, expirySeconds: number): Promise<string>;

  /**
   * Retrieve metadata for a stored file without downloading the content.
   */
  getMetadata(uri: string): Promise<StorageMetadata>;
}
