import { Readable } from 'stream';

export interface RenderResult {
  generatedDocStream: Readable;
  generatedPdfStream?: Readable;

  primaryExtension: string;
  primaryMimeType: string;

  metadata?: Record<string, any>;

  statistics: {
    renderTimeMs: number;
    placeholderCount: number;
    imageCount: number;
  };

  warnings: string[];
}
