'use client';

import * as React from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function ReportViewer() {
  const [reportType, setReportType] = React.useState<string>('candidate');
  const { useReport } = useAnalytics();
  const { data: reportData, isLoading, error } = useReport(reportType);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Reports</h2>
          <p className="text-muted-foreground">View and export analytical reports</p>
        </div>
        <Button variant="outline" disabled>
          <Download className="mr-2 h-4 w-4" /> Export Data
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Report Criteria</CardTitle>
          <div className="w-64">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="candidate">Candidate Pipeline</SelectItem>
                <SelectItem value="employee">Employee Roster</SelectItem>
                <SelectItem value="workflow">Workflow Execution</SelectItem>
                <SelectItem value="document">Generated Documents</SelectItem>
                <SelectItem value="organization">Organization Hierarchy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border mt-4">
            <div className="w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    {isLoading ? (
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Loading Headers...</th>
                    ) : reportData?.headers?.length ? (
                      reportData.headers.map((h, i) => (
                        <th key={i} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">
                          {h}
                        </th>
                      ))
                    ) : (
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">No Data Available</th>
                    )}
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {isLoading ? (
                    <tr>
                      <td className="p-4 align-middle text-center" colSpan={100}>Loading report data...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td className="p-4 align-middle text-center text-destructive" colSpan={100}>Failed to load report</td>
                    </tr>
                  ) : reportData?.rows?.length ? (
                    reportData.rows.map((row, i) => (
                      <tr key={i} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        {row.map((cell, j) => (
                          <td key={j} className="p-4 align-middle whitespace-nowrap">{cell}</td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-4 align-middle text-center text-muted-foreground h-24" colSpan={100}>
                        No records found for the selected criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {reportData?.totalCount !== undefined && (
            <div className="mt-4 text-sm text-muted-foreground">
              Total Records: {reportData.totalCount}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
