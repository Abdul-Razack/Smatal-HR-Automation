'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff7300'];

interface CandidateChartsProps {
  data: any;
  isLoading: boolean;
}

export function CandidateCharts({ data, isLoading }: CandidateChartsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
          <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
          <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  // Aggregate data for charts
  const statusCounts = (data?.rows || []).reduce((acc: any, row: any) => {
    // Assuming status is usually at index 3 or 4 based on report type, but let's use the Headers array
    const statusIndex = data.headers.findIndex((h: string) => h.toLowerCase().includes('status'));
    if (statusIndex >= 0) {
      const status = row[statusIndex];
      acc[status] = (acc[status] || 0) + 1;
    }
    return acc;
  }, {});

  const statusData = Object.keys(statusCounts).map(key => ({
    name: key,
    value: statusCounts[key]
  }));

  // Dummy monthly trend logic if we have dates
  const dateIndex = data?.headers?.findIndex((h: string) => h.toLowerCase().includes('date') || h.toLowerCase().includes('at'));
  const monthCounts = (data?.rows || []).reduce((acc: any, row: any) => {
    if (dateIndex >= 0 && row[dateIndex]) {
      try {
        const d = new Date(row[dateIndex]);
        const m = d.toLocaleString('default', { month: 'short' });
        acc[m] = (acc[m] || 0) + 1;
      } catch (e) {}
    }
    return acc;
  }, {});

  const trendData = Object.keys(monthCounts).map(key => ({
    name: key,
    value: monthCounts[key]
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No status data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" name="Records" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No trend data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
