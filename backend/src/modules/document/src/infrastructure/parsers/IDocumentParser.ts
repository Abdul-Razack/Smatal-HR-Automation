export interface PlaceholderLocation {
  key: string;
  approximateIndex: number;
}

export interface PlaceholderScanResult {
  /** All unique placeholder keys found (e.g. ["candidate.firstName", "salary"]) */
  detected: string[];
  /** Keys that appear more than once in the document */
  duplicates: string[];
  /** Raw full match strings (e.g. ["{{candidate.firstName}}", "{{salary}}"]) */
  rawMatches: string[];
  /** Placeholders that look like placeholders but contain invalid characters (e.g. {{invalid key}}) */
  invalid: string[];
  /** Keys that could not be mapped to any FieldDefinition (populated during mapping phase) */
  unknown: string[];
  /** Approximate locations of placeholders in the stripped text */
  locations: PlaceholderLocation[];
  /** Total occurrence count across the document */
  totalOccurrences: number;
}

export interface DocumentScanResult {
  placeholders: PlaceholderScanResult;
  imageCount: number;
  hasHeaders: boolean;
  hasFooters: boolean;
  pageCount: number | null;
  embeddedFontNames: string[];
  rawXml?: string;
}

export interface IDocumentParser {
  /**
   * Fully parse a DOCX buffer and return structured metadata.
   * This method must NOT modify the buffer — pure read-only analysis.
   */
  parse(fileBuffer: Buffer): Promise<DocumentScanResult>;

  /**
   * Lightweight check — verify the buffer is a valid OpenXML (ZIP) archive.
   * Throws CorruptedDocxException if the file is invalid.
   */
  validate(fileBuffer: Buffer): Promise<void>;
}
