'use client';

import React, { useState } from 'react';
import { useAnalytics } from '@/modules/analytics/hooks/useAnalytics';
import { CandidateReportFilters } from './CandidateReportFilters';
import { CandidateCharts } from './CandidateCharts';
import { CandidateReportsTable } from './CandidateReportsTable';
import { useExport } from '@/modules/export/hooks/useExport';

export function CandidateReports() {
  const [reportType, setReportType] = useState('ATS_PIPELINE');
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  const { useReport } = useAnalytics();
  const { data, isLoading } = useReport(reportType, filters);
  
  // Dummy export hook if useExport exists, otherwise we just console.log for now
  // Real implementation will use standard Smatal export services
  const handleExportCsv = () => {
    console.log('Exporting CSV for', reportType, data);
    // useExport().exportCsv(data)
  };

  const handleExportPdf = () => {
    console.log('Exporting PDF for', reportType, data);
    // useExport().exportPdf(data)
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'ATS_PIPELINE': return 'Candidate Pipeline & Funnel Report';
      case 'ATS_INTERVIEW': return 'Interview Status Report';
      case 'ATS_OFFER': return 'Offer Tracking Report';
      default: return 'Recruitment Report';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Recruitment Analytics & Reports</h2>
        <p className="text-muted-foreground">Comprehensive tracking of pipeline, interviews, and offers.</p>
      </div>

      <CandidateReportFilters 
        reportType={reportType} 
        setReportType={setReportType}
        onFilterChange={setFilters} 
      />

      <CandidateCharts data={data} isLoading={isLoading} />

      <CandidateReportsTable 
        title={getReportTitle()}
        data={data} 
        isLoading={isLoading}
        onExportCsv={handleExportCsv}
        onExportPdf={handleExportPdf}
      />
    </div>
  );
}
