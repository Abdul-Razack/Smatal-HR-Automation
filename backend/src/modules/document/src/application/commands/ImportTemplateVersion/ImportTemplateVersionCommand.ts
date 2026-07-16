/**
 * ImportTemplateVersionCommand — dispatched when an Admin uploads a DOCX file
 * to create a new Template Version via the V2 Import Engine.
 */
export class ImportTemplateVersionCommand {
  constructor(
    /** The parent Template UUID to attach this version to */
    public readonly templateId: string,
    /** Multi-tenant company isolation key */
    public readonly companyId: string,
    /** The raw DOCX file buffer from the multipart upload */
    public readonly fileBuffer: Buffer,
    /** Original filename from the client (e.g. "Offer Letter.docx") */
    public readonly originalFilename: string,
    /** MIME type from the upload (must be the DOCX MIME type) */
    public readonly mimeType: string,
    /** File size in bytes */
    public readonly fileSize: number,
    /** Optional release notes for this version */
    public readonly notes: string | undefined,
    /** User ID of the Admin performing the import */
    public readonly performedBy: string,
  ) {}
}
