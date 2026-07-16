import { DocxParser } from './DocxParser';
import { PlaceholderScanner } from './PlaceholderScanner';
import { CorruptedDocxException } from '../../domain/exceptions/DocumentV2Exceptions';

describe('DocxParser', () => {
  let parser: DocxParser;

  beforeEach(() => {
    parser = new DocxParser(new PlaceholderScanner());
  });

  describe('validate()', () => {
    it('should throw CorruptedDocxException for non-ZIP buffers', async () => {
      const invalidBuffer = Buffer.from('This is not a docx file');
      await expect(parser.validate(invalidBuffer)).rejects.toThrow(
        CorruptedDocxException,
      );
    });

    it('should throw CorruptedDocxException for empty buffers', async () => {
      const emptyBuffer = Buffer.alloc(0);
      await expect(parser.validate(emptyBuffer)).rejects.toThrow(
        CorruptedDocxException,
      );
    });

    it('should throw CorruptedDocxException for PDF magic bytes', async () => {
      // PDF starts with %PDF- (0x25 0x50 0x44 0x46)
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);
      await expect(parser.validate(pdfBuffer)).rejects.toThrow(
        CorruptedDocxException,
      );
    });
  });

  describe('parse() with a real DOCX-like buffer', () => {
    it('should throw CorruptedDocxException when buffer is not valid DOCX', async () => {
      const randomBuffer = Buffer.from('random data that is not a docx');
      await expect(parser.parse(randomBuffer)).rejects.toThrow(
        CorruptedDocxException,
      );
    });
  });
});
