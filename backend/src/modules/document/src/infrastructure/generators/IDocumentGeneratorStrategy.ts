import { TemplateVersionEntity } from '../../domain/entities/TemplateVersionEntity';
import { DocumentRenderContext } from '../../domain/models/DocumentRenderContext';
import { Readable } from 'stream';

export interface GenerationResult {
  stream: Readable;
  mimeType: string;
  extension: string;
  metadata?: Record<string, any>;
  warnings: string[];
}

export interface IDocumentGeneratorStrategy {
  /**
   * Identifies whether this strategy handles the given content type.
   */
  supports(contentType: string): boolean;

  /**
   * Generates a document from the template stream and resolved placeholders.
   * @param templateStream The raw template file stream
   * @param context The rendering context (placeholders, tenant, etc)
   * @returns GenerationResult containing the stream
   */
  generate(
    templateStream: Readable,
    context: DocumentRenderContext,
  ): Promise<GenerationResult>;
}
