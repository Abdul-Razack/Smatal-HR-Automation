import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import type { Browser } from 'puppeteer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const puppeteerModule = require('puppeteer');
const puppeteer = (puppeteerModule as any).default || puppeteerModule;
import { HtmlConverterService } from './HtmlConverterService';

export interface PdfGenerationOptions {
  format?: 'a4' | 'letter' | 'A4' | 'Letter';
  landscape?: boolean;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
}

@Injectable()
export class PdfGenerationService implements OnModuleDestroy {
  private readonly logger = new Logger(PdfGenerationService.name);
  private browserInstance: Browser | null = null;
  private isLaunching = false;

  constructor(private readonly htmlConverter: HtmlConverterService) {}

  async onModuleDestroy(): Promise<void> {
    await this.closeBrowser();
  }

  private async getBrowser(): Promise<Browser> {
    if (this.browserInstance && this.browserInstance.isConnected()) {
      return this.browserInstance;
    }

    if (this.isLaunching) {
      // Small backoff to avoid concurrent browser launches
      let attempts = 0;
      while (this.isLaunching && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }
      if (this.browserInstance && this.browserInstance.isConnected()) {
        return this.browserInstance;
      }
    }

    this.isLaunching = true;
    try {
      this.logger.log('Launching headless Chromium browser instance...');

      // Resolve Chrome/Chromium executable path:
      // 1. Use PUPPETEER_EXECUTABLE_PATH env var if set
      // 2. Scan known system Chrome/Chromium binary locations
      // 3. Fall back to Puppeteer default (bundled Chromium)
      let executablePath: string | undefined =
        process.env.PUPPETEER_EXECUTABLE_PATH;

      if (!executablePath) {
        const fs = require('fs');
        const systemChromePaths = [
          '/usr/bin/google-chrome',
          '/usr/bin/google-chrome-stable',
          '/usr/bin/chromium-browser',
          '/usr/bin/chromium',
          '/snap/bin/chromium',
        ];
        for (const p of systemChromePaths) {
          if (fs.existsSync(p)) {
            executablePath = p;
            this.logger.log(`Using system browser: ${executablePath}`);
            break;
          }
        }
      }

      const browser: Browser = await puppeteer.launch({
        headless: true,
        executablePath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
        ],
      });

      this.browserInstance = browser;

      browser.on('disconnected', () => {
        this.logger.warn('Chromium browser instance disconnected.');
        this.browserInstance = null;
      });

      return browser;
    } catch (err: any) {
      this.logger.error(`Failed to launch browser: ${err.message}`);
      throw new Error('PDF Generation Engine is currently unavailable');
    } finally {
      this.isLaunching = false;
    }
  }

  private async closeBrowser(): Promise<void> {
    if (this.browserInstance) {
      try {
        await this.browserInstance.close();
      } catch (e: any) {
        this.logger.warn(`Error closing browser: ${e.message}`);
      }
      this.browserInstance = null;
    }
  }

  /**
   * Sanitizes template HTML: removes executable scripts, inline event handlers,
   * iframes, and javascript: links to prevent template-based XSS/code execution.
   */
  public sanitizeHtml(rawHtml: string): string {
    if (!rawHtml) return '';

    return rawHtml
      // Strip <script>...</script> tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Strip <iframe...>...</iframe> tags
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      // Strip <object...> and <embed...> tags
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^>]*>/gi, '')
      // Strip inline event handlers like onload, onerror, onclick, etc.
      .replace(/\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
      // Strip javascript: pseudo-protocols
      .replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href="#"');
  }

  /**
   * Wraps sanitized HTML in a print-ready document structure with HR-grade styling.
   */
  public formatDocumentHtml(bodyHtml: string, options?: PdfGenerationOptions): string {
    const isLandscape = options?.landscape ?? false;
    const size = `${options?.format ?? 'A4'} ${isLandscape ? 'landscape' : 'portrait'}`;
    const isLetterhead = bodyHtml.includes('page-container') || bodyHtml.includes('@page');
    const marginTop = options?.marginTop ?? (isLetterhead ? '0mm' : '20mm');
    const marginRight = options?.marginRight ?? (isLetterhead ? '0mm' : '15mm');
    const marginBottom = options?.marginBottom ?? (isLetterhead ? '0mm' : '20mm');
    const marginLeft = options?.marginLeft ?? (isLetterhead ? '0mm' : '15mm');

    // If bodyHtml is already a complete HTML document, avoid double wrapping
    if (bodyHtml.trim().toLowerCase().startsWith('<!doctype html') || bodyHtml.trim().toLowerCase().startsWith('<html')) {
      return bodyHtml;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Document</title>
  <style>
    @page {
      size: ${size};
      margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft};
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      color: #1a1a1a;
      background-color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #0f172a;
      font-weight: 700;
      margin-top: 1.2em;
      margin-bottom: 0.5em;
      page-break-after: avoid;
      break-after: avoid;
    }
    h1 { font-size: 18pt; line-height: 1.3; }
    h2 { font-size: 15pt; line-height: 1.35; }
    h3 { font-size: 13pt; line-height: 1.4; }
    p {
      margin-top: 0;
      margin-bottom: 0.8em;
      page-break-inside: auto;
    }
    strong, b {
      font-weight: 600;
      color: #000000;
    }
    em, i {
      font-style: italic;
    }
    u {
      text-decoration: underline;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.2em 0;
      page-break-inside: auto;
      break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    thead {
      display: table-header-group;
    }
    tfoot {
      display: table-footer-group;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
      font-size: 10pt;
      vertical-align: top;
    }
    th {
      background-color: #f8fafc;
      font-weight: 600;
      color: #334155;
    }
    ul, ol {
      margin: 0.5em 0 0.8em 1.5em;
      padding: 0;
    }
    li {
      margin-bottom: 0.3em;
    }
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 1.5em 0;
    }
    blockquote {
      margin: 1em 0;
      padding-left: 1em;
      border-left: 3px solid #cbd5e1;
      color: #475569;
    }
    .page-break {
      page-break-before: always;
      break-before: always;
    }
    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Corporate & Standard Letterhead Classes */
    .page-container {
      position: relative;
      width: 210mm;
      min-height: 297mm;
      padding: 12mm 18mm 14mm 18mm;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #ffffff;
      box-sizing: border-box;
      overflow: hidden;
    }
    .top-accent-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #f59e0b 100%);
    }
    .watermark-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 360px;
      height: 360px;
      opacity: 0.04;
      pointer-events: none;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .watermark-container img {
      width: 100%;
      height: auto;
      display: block;
    }
    .letterhead-header {
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      border-bottom: 2px solid #0f172a;
    }
    .brand-block {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      height: 48px;
      width: auto;
      display: block;
    }
    .brand-text h1 {
      margin: 0;
      font-size: 19px;
      font-weight: 800;
      letter-spacing: -0.01em;
      color: #0f172a;
      line-height: 1.1;
    }
    .contact-block {
      text-align: right;
      font-size: 8.5px;
      line-height: 1.5;
      color: #475569;
      max-width: 320px;
    }
    .contact-block strong {
      color: #0f172a;
    }
    .letterhead-body {
      position: relative;
      z-index: 2;
      flex-grow: 1;
      padding: 16px 0;
      font-size: 10.5pt;
      line-height: 1.55;
      color: #334155;
    }
    .letterhead-body p {
      margin: 0 0 10px 0;
    }
    .letterhead-body h4 {
      color: #0f172a;
      margin: 10px 0 3px 0;
      font-size: 11pt;
    }
    .letterhead-footer {
      position: relative;
      z-index: 2;
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 8.5px;
      color: #64748b;
      line-height: 1.4;
    }
    .bottom-accent-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, #10b981 0%, #06b6d4 100%);
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
  }

  /**
   * Generates a genuine PDF buffer from HTML content.
   */
  public async generateFromHtml(
    html: string,
    options?: PdfGenerationOptions,
  ): Promise<Buffer> {
    const sanitized = this.sanitizeHtml(html);
    const formattedHtml = this.formatDocumentHtml(sanitized, options);

    const isLetterhead = sanitized.includes('page-container') || sanitized.includes('@page');
    const marginTop = options?.marginTop ?? (isLetterhead ? '0mm' : '20mm');
    const marginRight = options?.marginRight ?? (isLetterhead ? '0mm' : '15mm');
    const marginBottom = options?.marginBottom ?? (isLetterhead ? '0mm' : '20mm');
    const marginLeft = options?.marginLeft ?? (isLetterhead ? '0mm' : '15mm');

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Hard disable script execution in Chromium for security
      await page.setJavaScriptEnabled(false);

      await page.setContent(formattedHtml, {
        waitUntil: 'load',
        timeout: 30000,
      });

      const pdfUint8Array = await page.pdf({
        format: (options?.format ? options.format.toLowerCase() : 'a4') as any,
        landscape: options?.landscape ?? false,
        printBackground: true,
        margin: {
          top: marginTop,
          right: marginRight,
          bottom: marginBottom,
          left: marginLeft,
        },
      });

      const pdfBuffer = Buffer.from(pdfUint8Array);

      // Server-side PDF validation
      this.validatePdfBuffer(pdfBuffer);

      return pdfBuffer;
    } catch (err: any) {
      this.logger.error(`HTML to PDF generation failed: ${err.message}`);
      throw new Error(`PDF generation failed: ${err.message}`);
    } finally {
      await page.close().catch(() => {});
    }
  }

  /**
   * Converts a DOCX buffer to genuine PDF bytes by running DOCX -> HTML -> PDF.
   */
  public async generateFromDocx(
    docxBuffer: Buffer,
    options?: PdfGenerationOptions,
  ): Promise<Buffer> {
    try {
      const htmlResult = await this.htmlConverter.convertDocxToHtml(docxBuffer);
      return await this.generateFromHtml(htmlResult.html, options);
    } catch (err: any) {
      this.logger.error(`DOCX to PDF generation failed: ${err.message}`);
      throw new Error(`DOCX to PDF conversion failed: ${err.message}`);
    }
  }

  /**
   * Validates that the buffer is non-empty and begins with %PDF- header.
   */
  public validatePdfBuffer(buffer: Buffer): boolean {
    if (!Buffer.isBuffer(buffer) || buffer.length < 5) {
      throw new Error('Generated PDF buffer is empty or corrupted');
    }

    const header = buffer.subarray(0, 5).toString('utf-8');
    if (header !== '%PDF-') {
      throw new Error(`Invalid PDF header: expected '%PDF-', got '${header}'`);
    }

    return true;
  }
}
