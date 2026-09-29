import { ICommand } from '@smatal/kernel/cqrs/cqrs.contracts';

export class UploadCompanyBrandingCommand implements ICommand {
  constructor(
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly userRole: string,
    public readonly type: 'logo' | 'signature',
    public readonly fileBuffer: Buffer,
    public readonly mimeType: string,
    public readonly originalFilename: string,
    public readonly fileSizeBytes: number,
  ) {}
}
