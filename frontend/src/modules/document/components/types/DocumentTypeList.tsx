'use client';

import * as React from 'react';
import { useDocument } from '../../hooks/useDocument';
import { DocumentTypeDto } from '../../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Edit3, Power, CheckCircle2, XCircle } from 'lucide-react';
import { DocumentTypeModal } from './DocumentTypeModal';

export function DocumentTypeList() {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<DocumentTypeDto | null>(null);

  const { useDocumentTypes, updateDocumentTypeStatus } = useDocument();

  const activeParam =
    statusFilter === 'ACTIVE'
      ? true
      : statusFilter === 'INACTIVE'
      ? false
      : undefined;

  const {
    data: documentTypes = [],
    isLoading,
    isRefetching,
  } = useDocumentTypes({
    search: search.trim() || undefined,
    isActive: activeParam,
  });

  const handleCreate = () => {
    setSelectedType(null);
    setModalOpen(true);
  };

  const handleEdit = (dt: DocumentTypeDto) => {
    setSelectedType(dt);
    setModalOpen(true);
  };

  const handleToggleStatus = async (dt: DocumentTypeDto) => {
    await updateDocumentTypeStatus.mutateAsync({
      id: dt.id,
      isActive: !dt.isActive,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">HR Document Types</h2>
          <p className="text-sm text-muted-foreground">
            Standardized document classifications supporting employee lifecycle events and document generation.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Document Type
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, or description..."
            className="pl-9"
          />
        </div>
        <div className="w-full sm:w-[180px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active Only</SelectItem>
              <SelectItem value="INACTIVE">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Document Type</TableHead>
              <TableHead className="w-[12%]">Status</TableHead>
              <TableHead className="w-[38%]">Description</TableHead>
              <TableHead className="w-[20%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Loading document types...
                </TableCell>
              </TableRow>
            ) : documentTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No document types found.
                </TableCell>
              </TableRow>
            ) : (
              documentTypes.map((dt) => (
                <TableRow key={dt.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-foreground">{dt.name}</span>
                      <code className="text-xs text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.5 rounded w-fit">
                        {dt.code}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell>
                    {dt.isActive ? (
                      <Badge
                        variant="default"
                        className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30 gap-1.5 font-normal"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-rose-500/15 text-rose-700 dark:text-rose-400 hover:bg-rose-500/25 border-rose-500/30 gap-1.5 font-normal"
                      >
                        <XCircle className="h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {dt.description || '—'}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(dt)}
                        className="gap-1.5 h-8 text-xs"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant={dt.isActive ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleToggleStatus(dt)}
                        disabled={updateDocumentTypeStatus.isPending}
                        className={`gap-1.5 h-8 text-xs ${
                          dt.isActive
                            ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                        title={dt.isActive ? 'Deactivate Document Type' : 'Activate Document Type'}
                      >
                        <Power className="h-3.5 w-3.5" />
                        {dt.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DocumentTypeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        documentType={selectedType}
      />
    </div>
  );
}
