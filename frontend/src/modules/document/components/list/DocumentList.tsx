'use client';

import * as React from 'react';
import { useDocument } from '../../hooks/useDocument';
import { DataTable } from '@/shared/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { GeneratedDocumentDto } from '../../types';
import { Button } from '@/components/ui/button';
import { Eye, Download, ExternalLink, Filter, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { DocumentApiService } from '../../api/DocumentApiService';
import { DocumentViewerModal } from '@/components/common/DocumentViewerModal';

export function DocumentList() {
  const { useGeneratedDocuments, useDocumentTypes } = useDocument();

  // Filter States
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedDocType, setSelectedDocType] = React.useState<string>('ALL');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const { data: docTypes = [] } = useDocumentTypes({ isActive: true });

  const queryFilters = React.useMemo(() => ({
    search: searchTerm || undefined,
    documentTypeId: selectedDocType !== 'ALL' ? selectedDocType : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  }), [searchTerm, selectedDocType, startDate, endDate]);

  const { data: documents = [], isLoading } = useGeneratedDocuments(queryFilters);
  const [viewingDocumentId, setViewingDocumentId] = React.useState<string | null>(null);

  const handleDownload = async (id: string, businessId: string, docTypeName?: string) => {
    try {
      const cleanName = docTypeName ? docTypeName.replace(/[^a-zA-Z0-9_-]/g, '_') : 'document';
      await DocumentApiService.downloadDocumentFile(id, 'pdf', `${businessId}_${cleanName}.pdf`);
    } catch (err: any) {
      alert(err?.message || 'Failed to download PDF document');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDocType('ALL');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = searchTerm !== '' || selectedDocType !== 'ALL' || startDate !== '' || endDate !== '';

  const columns: ColumnDef<GeneratedDocumentDto>[] = [
    {
      accessorKey: 'documentTypeName',
      header: 'Document',
      cell: ({ row }) => {
        const title = row.original.documentTypeName || 'HR Document';
        const businessId = row.original.businessId;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{title}</span>
            <span className="text-xs text-muted-foreground font-mono">{businessId}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'employeeName',
      header: 'Employee',
      cell: ({ row }) => {
        const name = row.original.employeeName || (row.original.entityType === 'EMPLOYEE' ? 'Employee' : 'Candidate');
        const number = row.original.employeeNumber;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            {number && <span className="text-xs text-muted-foreground font-mono">{number}</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'templateName',
      header: 'Template',
      cell: ({ row }) => {
        const tmpl = row.original.templateName || 'Standard Template';
        return <span className="text-sm text-muted-foreground">{tmpl}</span>;
      },
    },
    {
      accessorKey: 'templateVersionNumber',
      header: 'Version',
      cell: ({ row }) => {
        const ver = row.original.templateVersionNumber || 1;
        return (
          <Badge variant="outline" className="font-mono text-xs">
            v{ver}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'generatedAt',
      header: 'Generated',
      cell: ({ row }) => {
        const dateStr = (row.original as any).generatedAt || row.original.createdAt;
        const formattedDate = dateStr
          ? new Date(dateStr).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'N/A';
        const by = row.original.generatedBy;
        return (
          <div className="flex flex-col">
            <span className="text-sm">{formattedDate}</span>
            {by && <span className="text-xs text-muted-foreground">By {by.substring(0, 8)}</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const variant =
          status === 'GENERATED' || status === 'SIGNED'
            ? 'default'
            : status === 'FAILED'
            ? 'destructive'
            : 'secondary';
        return <Badge variant={variant as any}>{status}</Badge>;
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={() => setViewingDocumentId(row.original.id)}
            >
              <Eye className="h-3.5 w-3.5 mr-1 text-primary" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={() =>
                handleDownload(
                  row.original.id,
                  row.original.businessId,
                  row.original.documentTypeName,
                )
              }
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Download
            </Button>
            <Link href={`/hr/documents/${row.original.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="View Document Details">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
        <p className="text-muted-foreground">Generated HR Documents & Version History</p>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-4 rounded-lg border">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Input
              placeholder="Search documents, employees, or IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm"
            />
          </div>

          <div className="w-full sm:w-[220px]">
            <Select value={selectedDocType} onValueChange={setSelectedDocType}>
              <SelectTrigger>
                <SelectValue placeholder="All Document Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Document Types</SelectItem>
                {docTypes.map((dt) => (
                  <SelectItem key={dt.id} value={dt.id}>
                    {dt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[140px] text-xs"
              title="Start Date"
            />
            <span className="text-muted-foreground text-xs">to</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[140px] text-xs"
              title="End Date"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs text-muted-foreground h-9"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset Filters
          </Button>
        )}
      </div>

      {/* Global Document Table */}
      <DataTable
        columns={columns}
        data={documents}
        isLoading={isLoading}
      />

      <DocumentViewerModal
        documentId={viewingDocumentId}
        onClose={() => setViewingDocumentId(null)}
      />
    </div>
  );
}
