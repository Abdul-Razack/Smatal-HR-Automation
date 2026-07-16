import { Injectable } from '@nestjs/common';
import {
  IDocumentGeneratorStrategy,
  GenerationResult,
} from './IDocumentGeneratorStrategy';
import { DocumentRenderContext } from '../../domain/models/DocumentRenderContext';
import { Readable } from 'stream';

@Injectable()
export class HtmlGeneratorStrategy implements IDocumentGeneratorStrategy {
  supports(contentType: string): boolean {
    return contentType === 'html';
  }

  async generate(
    templateStream: Readable,
    context: DocumentRenderContext,
  ): Promise<GenerationResult> {
    const startTime = Date.now();

    // Read the stream into a string
    let html = '';
    for await (const chunk of templateStream) {
      html += chunk.toString('utf-8');
    }

    const placeholderKeys = Object.keys(context.placeholders);

    for (const key of placeholderKeys) {
      const value = context.placeholders[key];
      // Validation should ideally happen before this point, but just in case:
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'g');
      html = html.replace(regex, value ?? '');
    }

    // Convert the replaced HTML back into a stream
    const outStream = Readable.from([Buffer.from(html, 'utf-8')]);

    return {
      stream: outStream,
      mimeType: 'text/html',
      extension: '.html',
      warnings: [],
      metadata: {
        placeholderCount: placeholderKeys.length,
      },
    };
  }
}
