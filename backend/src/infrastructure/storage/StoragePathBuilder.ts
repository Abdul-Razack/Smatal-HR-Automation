export class StoragePathBuilder {
  static buildTemplatePath(
    companyId: string,
    templateId: string,
    versionId: string,
    originalFilename: string,
  ): string {
    const extension = originalFilename.split('.').pop() || 'docx';
    return `templates/${companyId}/${templateId}/${versionId}/original.${extension}`;
  }

  static buildGeneratedDocumentPath(
    companyId: string,
    employeeId: string | null | undefined,
    documentId: string,
    extension: string,
  ): string {
    const entityDir = employeeId ? `employees/${employeeId}` : 'general';
    return `documents/${companyId}/${entityDir}/${documentId}/generated.${extension}`;
  }
}
