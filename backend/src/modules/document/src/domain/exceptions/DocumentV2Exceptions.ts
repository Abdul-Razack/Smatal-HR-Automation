import { DomainException } from '../../../../../kernel/domain/DomainException';

/**
 * Thrown when an uploaded file has an unsupported MIME type.
 * Only application/vnd.openxmlformats-officedocument.wordprocessingml.document is accepted.
 */
export class InvalidMimeTypeException extends DomainException {
  constructor(mimeType: string) {
    super(
      `Unsupported MIME type: "${mimeType}". Only DOCX files are accepted.`,
      'INVALID_MIME_TYPE',
    );
  }
}

/**
 * Thrown when an uploaded file has an invalid or disallowed extension.
 */
export class InvalidFileExtensionException extends DomainException {
  constructor(extension: string) {
    super(
      `Unsupported file extension: "${extension}". Only .docx files are accepted.`,
      'INVALID_FILE_EXTENSION',
    );
  }
}

/**
 * Thrown when the uploaded file exceeds the maximum allowed size.
 */
export class FileTooLargeException extends DomainException {
  constructor(maxSizeBytes: number) {
    super(
      `File exceeds the maximum allowed size of ${Math.round(maxSizeBytes / 1024 / 1024)}MB.`,
      'FILE_TOO_LARGE',
    );
  }
}

/**
 * Thrown when no file is received in the upload request.
 */
export class EmptyFileException extends DomainException {
  constructor() {
    super('No file was provided in the request.', 'EMPTY_FILE');
  }
}

/**
 * Thrown when the uploaded file is not a valid OpenXML (ZIP) archive.
 */
export class CorruptedDocxException extends DomainException {
  constructor(detail?: string) {
    super(
      `The uploaded file is not a valid DOCX (OpenXML) document.${detail ? ` Detail: ${detail}` : ''}`,
      'CORRUPTED_DOCX',
    );
  }
}

/**
 * Thrown when duplicate placeholder keys are found within the same template version.
 */
export class DuplicatePlaceholderException extends DomainException {
  constructor(keys: string[]) {
    super(
      `Duplicate placeholder keys detected: ${keys.join(', ')}`,
      'DUPLICATE_PLACEHOLDER',
    );
  }
}

/**
 * Thrown when a placeholder in the template cannot be matched to any FieldDefinition.
 */
export class UnresolvablePlaceholderException extends DomainException {
  constructor(key: string) {
    super(
      `Placeholder "{{${key}}}" cannot be resolved — no matching FieldDefinition found.`,
      'UNRESOLVABLE_PLACEHOLDER',
    );
  }
}

/**
 * Thrown when a required placeholder mapping is missing before template publishing.
 */
export class IncompletePlaceholderMappingException extends DomainException {
  constructor(unmappedKeys: string[]) {
    super(
      `Cannot publish template: the following placeholders are unmapped: ${unmappedKeys.join(', ')}`,
      'INCOMPLETE_PLACEHOLDER_MAPPING',
    );
  }
}

/**
 * Thrown when pre-render template validation fails.
 */
export class TemplateValidationException extends DomainException {
  constructor(reason: string) {
    super(`Template validation failed: ${reason}`, 'TEMPLATE_VALIDATION_ERROR');
  }
}

/**
 * Thrown when placeholders cannot be resolved during generation.
 */
export class PlaceholderResolutionException extends DomainException {
  constructor(reason: string) {
    super(
      `Placeholder resolution failed: ${reason}`,
      'PLACEHOLDER_RESOLUTION_ERROR',
    );
  }
}

/**
 * Thrown when the generator strategy fails to render the document.
 */
export class RenderingException extends DomainException {
  constructor(reason: string) {
    super(`Document rendering failed: ${reason}`, 'RENDERING_ERROR');
  }
}

/**
 * Thrown when an error occurs while interacting with the storage layer.
 */
export class StorageException extends DomainException {
  constructor(reason: string) {
    super(`Storage operation failed: ${reason}`, 'STORAGE_ERROR');
  }
}

/**
 * Thrown when PDF conversion fails.
 */
export class PdfConversionException extends DomainException {
  constructor(reason: string) {
    super(`PDF conversion failed: ${reason}`, 'PDF_CONVERSION_ERROR');
  }
}

/**
 * Thrown when document generation exceeds the allowed timeout.
 */
export class GenerationTimeoutException extends DomainException {
  constructor(timeoutMs: number) {
    super(`Generation timed out after ${timeoutMs}ms`, 'GENERATION_TIMEOUT');
  }
}

/**
 * Thrown when snapshot creation logic fails.
 */
export class SnapshotCreationException extends DomainException {
  constructor(reason: string) {
    super(`Snapshot creation failed: ${reason}`, 'SNAPSHOT_CREATION_ERROR');
  }
}
