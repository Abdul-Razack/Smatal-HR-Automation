'use client';

import * as React from 'react';
import { useDocument } from '@/modules/document/hooks/useDocument';
import { GeneratedDocumentDto } from '@/modules/document/types';
import { DocumentApiService } from '@/modules/document/api/DocumentApiService';
import { DocumentViewerModal } from '@/components/common/DocumentViewerModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  FileText,
  Eye,
  Download,
  Clock,
  History,
  ShieldCheck,
  Calendar,
  User,
  Plus,
} from 'lucide-react';
import { useModalStore } from '@/shared/modals/useModalStore';
import { DocumentGenerateForm } from '@/modules/document/components/forms/DocumentGenerateForm';
import { GenerateDocumentFormData } from '@/modules/document/schemas';

interface EmployeeDocumentsTabProps {
  employeeId: string;
  employeeName?: string | null;
  employeeNumber?: string | null;
}

export function EmployeeDocumentsTab({
  employeeId,
  employeeName,
  employeeNumber,
}: EmployeeDocumentsTabProps) {
  const { useEmployeeDocuments } = useDocument();
  const { data: documents = [], isLoading } = useEmployeeDocuments(employeeId);
  const [viewingDocumentId, setViewingDocumentId] = React.useState<string | null>(null);
  const openModal = useModalStore((state) => state.openModal);

  const handleGenerateDocument = () => {
    const defaultValues: Partial<GenerateDocumentFormData> = {
      entityType: 'EMPLOYEE',
      entityId: employeeId,
    };

    openModal({
      id: 'generate-document',
      title: 'Generate Document',
      type: 'dialog',
      content: <DocumentGenerateForm defaultValues={defaultValues} />,
    });
  };

  const handleDownload = async (doc: GeneratedDocumentDto) => {
    try {
      const docName = (doc.documentTypeName || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${employeeNumber || 'EMP'}_${docName}_v${doc.templateVersionNumber || 1}.pdf`;
      await DocumentApiService.downloadDocumentFile(doc.id, 'pdf', filename);
    } catch (err: any) {
      alert(err?.message || 'Failed to download PDF document');
    }
  };

  // Group documents by Document Type Name (or Document Type ID)
  const groupedDocuments = React.useMemo(() => {
    const groups: { [key: string]: GeneratedDocumentDto[] } = {};
    for (const doc of documents) {
      const key = doc.documentTypeName || doc.documentTypeId || 'Uncategorized';
      if (!groups[key]) groups[key] = [];
      groups[key].push(doc);
    }

    // Sort entries within each group chronologically (newest first)
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => {
        const dateA = new Date(a.generatedAt || a.createdAt).getTime();
        const dateB = new Date(b.generatedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
    }

    return groups;
  }, [documents]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        <div className="h-24 w-full bg-muted/60 animate-pulse rounded-lg" />
        <div className="h-24 w-full bg-muted/60 animate-pulse rounded-lg" />
      </div>
    );
  }

  const groupKeys = Object.keys(groupedDocuments);

  if (groupKeys.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center py-12">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">No Documents Generated</CardTitle>
          <CardDescription className="max-w-md mx-auto text-sm mb-4">
            No documents have been generated for this employee yet. When HR documents (such as
            Appointment, Confirmation, or Relieving Letters) are generated, their immutable
            snapshots and version provenance will appear here.
          </CardDescription>
          <div>
            <Button onClick={handleGenerateDocument} className="gap-2">
              <Plus className="h-4 w-4" />
              Generate Document
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Employee Documents & Provenance</h3>
          <p className="text-sm text-muted-foreground">
            Complete chronological history of generated immutable document snapshots for this employee.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleGenerateDocument} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Generate Document
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground hidden sm:flex">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>All historical snapshots are immutable</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {groupKeys.map((typeName) => {
          const docsInGroup = groupedDocuments[typeName];
          const latestDoc = docsInGroup[0];
          const hasMultipleVersions = docsInGroup.length > 1;

          return (
            <Card key={typeName} className="overflow-hidden border">
              <CardHeader className="bg-muted/30 pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base font-semibold">{typeName}</CardTitle>
                    {hasMultipleVersions && (
                      <Badge variant="outline" className="text-xs font-normal">
                        <History className="h-3 w-3 mr-1" />
                        {docsInGroup.length} historical snapshots
                      </Badge>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Latest: v{latestDoc.templateVersionNumber || 1}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-0 divide-y">
                {docsInGroup.map((doc, index) => {
                  const isLatest = index === 0;
                  const dateStr = doc.generatedAt || doc.createdAt;
                  const formattedDate = dateStr
                    ? new Date(dateStr).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A';

                  return (
                    <div
                      key={doc.id}
                      className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                        isLatest ? 'bg-background' : 'bg-muted/10'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {doc.documentTypeName || typeName}
                          </span>
                          <Badge
                            variant={isLatest ? 'default' : 'outline'}
                            className="font-mono text-xs"
                          >
                            v{doc.templateVersionNumber || 1}
                          </Badge>
                          <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {doc.businessId}
                          </span>
                          <Badge
                            variant={
                              doc.status === 'GENERATED' || doc.status === 'SIGNED'
                                ? 'outline'
                                : 'secondary'
                            }
                            className="text-xs uppercase"
                          >
                            {doc.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Generated: {formattedDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            Template: {doc.templateName || 'Standard Template'} (v{doc.templateVersionNumber || 1})
                          </span>
                          {doc.generatedBy && (
                            <span className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              By: {doc.generatedBy.substring(0, 8)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-medium"
                          onClick={() => setViewingDocumentId(doc.id)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1 text-primary" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-medium"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DocumentViewerModal
        documentId={viewingDocumentId}
        onClose={() => setViewingDocumentId(null)}
      />
    </div>
  );
}
