import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { Result } from '../../../../../../kernel/result/Result';
import { Parser } from 'json2csv';
import { PdfConverterService } from '../../../../../document/src/infrastructure/services/PdfConverterService';
import { QueryBus } from '@nestjs/cqrs';
import { GetLeaveReportsQuery } from '../GetLeaveReports/GetLeaveReportsQuery';

export class ExportLeaveReportQuery implements IQuery {
  constructor(
    public readonly companyId: string,
    public readonly reportType: string,
    public readonly filters: any,
    public readonly format: 'csv' | 'pdf',
  ) {}
}

@QueryHandler(ExportLeaveReportQuery)
@Injectable()
export class ExportLeaveReportHandler implements IQueryHandler<ExportLeaveReportQuery> {
  private readonly logger = new Logger(ExportLeaveReportHandler.name);

  constructor(
    private readonly queryBus: QueryBus,
    private readonly pdfConverter: PdfConverterService,
  ) {}

  async execute(
    query: ExportLeaveReportQuery,
  ): Promise<
    Result<{ buffer: Buffer; contentType: string; filename: string }>
  > {
    try {
      // 1. Fetch raw data using existing report query without limits
      const reportResult = await this.queryBus.execute(
        new GetLeaveReportsQuery(
          query.companyId,
          query.reportType,
          query.filters,
          1,
          10000,
        ), // large limit for export
      );

      if (reportResult.isFailure) {
        return Result.fail(reportResult.errorValue);
      }

      const { headers, rows } = reportResult.getValue();

      if (query.format === 'csv') {
        // Map rows back to objects for json2csv
        const dataForCsv = rows.map((row: any[]) => {
          const obj: any = {};
          headers.forEach((h: string, i: number) => {
            obj[h] = row[i];
          });
          return obj;
        });

        const parser = new Parser({ fields: headers });
        const csvString = parser.parse(dataForCsv);

        return Result.ok({
          buffer: Buffer.from(csvString, 'utf-8'),
          contentType: 'text/csv',
          filename: `leave-report-${Date.now()}.csv`,
        });
      }

      if (query.format === 'pdf') {
        const htmlContent = this.generateHtmlTable(
          query.reportType,
          headers,
          rows,
        );
        const pdfBuffer = await this.pdfConverter.convertToPdf(
          Buffer.from(htmlContent, 'utf-8'),
          'html',
        );

        return Result.ok({
          buffer: pdfBuffer,
          contentType: 'application/pdf',
          filename: `leave-report-${Date.now()}.pdf`,
        });
      }

      return Result.fail(`Unsupported format: ${query.format}`);
    } catch (error: any) {
      this.logger.error(`Error exporting report: ${error.message}`);
      return Result.fail(error.message);
    }
  }

  private generateHtmlTable(
    title: string,
    headers: string[],
    rows: any[][],
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f2f2f2; color: #333; }
        </style>
      </head>
      <body>
        <h1>${title.toUpperCase()} REPORT</h1>
        <table>
          <thead>
            <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }
}
