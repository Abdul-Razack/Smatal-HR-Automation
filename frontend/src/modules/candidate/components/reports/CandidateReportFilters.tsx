'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CandidateReportFiltersProps {
  onFilterChange: (filters: Record<string, any>) => void;
  reportType: string;
  setReportType: (type: string) => void;
}

export function CandidateReportFilters({ onFilterChange, reportType, setReportType }: CandidateReportFiltersProps) {
  const [status, setStatus] = React.useState<string>('ALL');

  const handleApply = () => {
    const filters: any = {};
    if (status && status !== 'ALL') filters.status = status;
    onFilterChange(filters);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ATS_PIPELINE">Pipeline & Funnel Report</SelectItem>
                <SelectItem value="ATS_INTERVIEW">Interview Report</SelectItem>
                <SelectItem value="ATS_OFFER">Offer Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="APPLIED">Applied</SelectItem>
                <SelectItem value="SCREENING">Screening</SelectItem>
                <SelectItem value="INTERVIEWING">Interviewing</SelectItem>
                <SelectItem value="SELECTED">Selected</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Select defaultValue="this_year">
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleApply} className="w-full md:w-auto">
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
