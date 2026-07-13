export class GetTemplateQuery {
  constructor(
    public readonly companyId: string,
    public readonly templateId: string,
  ) {}
}
