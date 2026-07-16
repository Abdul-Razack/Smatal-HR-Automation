'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useLeaveReports } from '../hooks/useLeaveReports';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LeaveReportsTableProps {
  reportType: string;
  filters: any;
  page: number;
  setPage: (page: number) => void;
}

export function LeaveReportsTable({ reportType, filters, page, setPage }: LeaveReportsTableProps) {
  const { data, isLoading, error } = useLeaveReports({ type: reportType, page, limit: 10, ...filters });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="p-4 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 border rounded">Failed to load report data.</div>;
  }

  const hasNextPage = data?.rows?.length === 10;
  const hasPrevPage = page > 1;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b bg-muted/50">
              <tr className="border-b transition-colors hover:bg-muted/50">
                {data?.headers?.map((header: string, i: number) => (
                  <th key={i} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {data?.rows?.length === 0 ? (
                <tr>
                  <td colSpan={data?.headers?.length || 5} className="p-4 text-center text-muted-foreground">
                    No data found for the selected filters.
                  </td>
                </tr>
              ) : (
                data?.rows?.map((row: any[], i: number) => (
                  <tr key={i} className="border-b transition-colors hover:bg-muted/50">
                    {row.map((cell: any, j: number) => (
                      <td key={j} className="p-4 align-middle whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Total Records: {data?.totalCount || 0}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!hasNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
