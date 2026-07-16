'use client';

import { useState } from 'react';
import { LeaveDashboardMetrics } from '@/modules/leave/components/LeaveDashboardMetrics';
import { LeaveCharts } from '@/modules/leave/components/LeaveCharts';
import { ReportFilters } from '@/modules/leave/components/ReportFilters';
import { LeaveReportsTable } from '@/modules/leave/components/LeaveReportsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LeaveReportsPage() {
  const [reportType, setReportType] = useState('ALL');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset page on filter change
  };

  const handleReportTypeChange = (newType: string) => {
    setReportType(newType);
    setFilters({}); // Reset filters on type change
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Leave Reports & Analytics</h2>
        <p className="text-muted-foreground">Monitor leave metrics, trends, and generate detailed reports.</p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard & Trends</TabsTrigger>
          <TabsTrigger value="reports">Detailed Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <LeaveDashboardMetrics />
          <LeaveCharts />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <ReportFilters 
            filters={filters} 
            setFilters={handleFiltersChange} 
            reportType={reportType} 
            setReportType={handleReportTypeChange}
          />
          <LeaveReportsTable 
            reportType={reportType} 
            filters={filters} 
            page={page} 
            setPage={setPage} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
