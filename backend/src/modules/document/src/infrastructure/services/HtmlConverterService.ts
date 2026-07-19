import { Injectable, Logger } from '@nestjs/common';
import * as mammoth from 'mammoth';

export interface HtmlConversionResult {
  html: string;
  messages: any[];
}

@Injectable()
export class HtmlConverterService {
  private readonly logger = new Logger(HtmlConverterService.name);

  /**
   * Converts a DOCX buffer to an HTML string using Mammoth.
   */
  public async convertDocxToHtml(buffer: Buffer): Promise<HtmlConversionResult> {
    try {
      // Mammoth supports extracting raw HTML from the DOCX structure
      const result = await mammoth.convertToHtml({ buffer });
      
      if (result.messages && result.messages.length > 0) {
        this.logger.warn(`Mammoth conversion warnings: ${JSON.stringify(result.messages)}`);
      }

      return {
        html: result.value,
        messages: result.messages || [],
      };
    } catch (error: any) {
      this.logger.error(`DOCX to HTML conversion failed: ${error.message}`);
      throw new Error('Failed to convert DOCX to HTML for preview.');
    }
  }
}
