'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, FileText } from 'lucide-react';
import { useExportLeaveReport } from '../hooks/useLeaveReports';
import { PermissionGuard } from '@/modules/auth/components/PermissionGuard';

interface ReportFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  reportType: string;
  setReportType: (type: string) => void;
}

export function ReportFilters({ filters, setFilters, reportType, setReportType }: ReportFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const exportReport = useExportLeaveReport();

  const handleApply = () => {
    setFilters(localFilters);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    exportReport.mutate({ format, type: reportType, ...filters });
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Leaves</SelectItem>
                <SelectItem value="MONTHLY">Monthly Report</SelectItem>
                <SelectItem value="DEPARTMENT">Department Report</SelectItem>
                <SelectItem value="BALANCE">Leave Balances</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Status</label>
            <Select 
              value={localFilters.status || 'ALL'} 
              onValueChange={(val) => setLocalFilters({ ...localFilters, status: val === 'ALL' ? undefined : val })}
              disabled={reportType === 'BALANCE'}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Year</label>
            <Input 
              type="number" 
              placeholder="e.g. 2024" 
              value={localFilters.year || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, year: e.target.value })}
            />
          </div>

          <Button onClick={handleApply} className="w-full md:w-auto">
            Apply Filters
          </Button>

          <PermissionGuard permissions={['Leave.Admin']}>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleExport('csv')}
                disabled={exportReport.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExport('pdf')}
                disabled={exportReport.isPending}
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </PermissionGuard>
        </div>
      </CardContent>
    </Card>
  );
}
