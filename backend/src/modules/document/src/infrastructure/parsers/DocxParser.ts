import { Injectable, Logger } from '@nestjs/common';
import * as AdmZip from 'adm-zip';
import { IDocumentParser, DocumentScanResult } from './IDocumentParser';
import { PlaceholderScanner } from './PlaceholderScanner';
import { CorruptedDocxException } from '../../domain/exceptions/DocumentV2Exceptions';

/**
 * DocxParser — parses DOCX (OpenXML) files by treating them as ZIP archives.
 *
 * A DOCX file is a ZIP containing:
 *   - word/document.xml          (main body content)
 *   - word/header{N}.xml         (headers)
 *   - word/footer{N}.xml         (footers)
 *   - word/media/               (embedded images)
 *   - word/fonts/               (embedded fonts)
 *
 * This parser is strictly READ-ONLY — it never mutates the buffer.
 */
@Injectable()
export class DocxParser implements IDocumentParser {
  private readonly logger = new Logger(DocxParser.name);

  constructor(private readonly scanner: PlaceholderScanner) {}

  /** Validate that the buffer is a well-formed OpenXML ZIP archive */
  async validate(fileBuffer: Buffer): Promise<void> {
    try {
      // OLE signature indicating password-protected/encrypted file: D0 CF 11 E0
      if (
        fileBuffer.length >= 4 &&
        fileBuffer[0] === 0xd0 &&
        fileBuffer[1] === 0xcf &&
        fileBuffer[2] === 0x11 &&
        fileBuffer[3] === 0xe0
      ) {
        throw new CorruptedDocxException(
          'File is password-protected or encrypted. Please remove encryption before uploading.',
        );
      }

      // DOCX magic bytes: PK (ZIP signature) = 0x50 0x4B
      if (
        fileBuffer.length < 4 ||
        fileBuffer[0] !== 0x50 ||
        fileBuffer[1] !== 0x4b
      ) {
        throw new CorruptedDocxException(
          'File does not start with a ZIP/PK signature (not a valid DOCX).',
        );
      }

      const zip = new AdmZip(fileBuffer);
      const entries = zip.getEntries().map((e) => e.entryName);

      // A valid DOCX must contain word/document.xml
      if (!entries.includes('word/document.xml')) {
        throw new CorruptedDocxException(
          'Missing required entry: word/document.xml',
        );
      }

      // Must contain [Content_Types].xml
      if (!entries.includes('[Content_Types].xml')) {
        throw new CorruptedDocxException(
          'Missing required entry: [Content_Types].xml',
        );
      }
    } catch (err: any) {
      if (err instanceof CorruptedDocxException) throw err;
      throw new CorruptedDocxException(err.message);
    }
  }

  /** Full parse — extract placeholders, images, headers, footers from the DOCX */
  async parse(fileBuffer: Buffer): Promise<DocumentScanResult> {
    await this.validate(fileBuffer);

    const zip = new AdmZip(fileBuffer);

    // ── Extract main document XML ─────────────────────────────────────────
    const documentEntry = zip.getEntry('word/document.xml');
    const documentXml = documentEntry?.getData().toString('utf-8') ?? '';

    // ── Collect all XML for placeholder scanning (body + headers + footers)
    let fullXml = documentXml;
    const entries = zip.getEntries();
    let imageCount = 0;
    let hasHeaders = false;
    let hasFooters = false;
    const embeddedFontNames: string[] = [];

    for (const entry of entries) {
      const name = entry.entryName;

      if (name.match(/^word\/header\d*\.xml$/)) {
        hasHeaders = true;
        fullXml += entry.getData().toString('utf-8');
      }

      if (name.match(/^word\/footer\d*\.xml$/)) {
        hasFooters = true;
        fullXml += entry.getData().toString('utf-8');
      }

      if (name.startsWith('word/media/')) {
        imageCount++;
      }

      if (name === 'word/fontTable.xml') {
        const fontXml = entry.getData().toString('utf-8');
        const fontMatches = fontXml.matchAll(/w:name w:val="([^"]+)"/g);
        for (const m of fontMatches) {
          embeddedFontNames.push(m[1]);
        }
      }
    }

    // ── Scan all text for placeholders ────────────────────────────────────
    // Remove XML tags before scanning so {{key}} split across tags is recoverable
    const cleanText = fullXml.replace(/<[^>]+>/g, '');
    const placeholders = this.scanner.scan(cleanText);

    this.logger.log(
      `DocxParser: detected ${placeholders.detected.length} unique placeholders, ` +
        `${imageCount} images, hasHeaders=${hasHeaders}, hasFooters=${hasFooters}`,
    );

    return {
      placeholders,
      imageCount,
      hasHeaders,
      hasFooters,
      pageCount: null, // Cannot determine page count without rendering
      embeddedFontNames,
      rawXml: documentXml,
    };
  }
}
