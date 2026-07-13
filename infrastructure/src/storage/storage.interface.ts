export interface FileMetadata {
  filename: string;
  mimetype: string;
  size: number;
  url: string;
}

export interface IStorageService {
  upload(file: Buffer, filename: string, mimetype: string): Promise<FileMetadata>;
  download(filename: string): Promise<Buffer>;
  delete(filename: string): Promise<void>;
  getMetadata(filename: string): Promise<FileMetadata>;
}
