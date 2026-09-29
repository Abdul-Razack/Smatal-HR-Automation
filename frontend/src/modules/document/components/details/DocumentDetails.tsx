'use client';

import * as React from 'react';
import { useDocument } from '../../hooks/useDocument';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Eye, FileText, History, ShieldCheck, Clock, User, Building, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SnapshotViewer } from './SnapshotViewer';
import { DocumentApiService } from '../../api/DocumentApiService';
import { DocumentViewerModal } from '@/components/common/DocumentViewerModal';
import { GeneratedDocumentDto } from '../../types';

export function DocumentDetails({ documentId }: { documentId: string }) {
  const { useGeneratedDocument, useEmployeeDocuments } = useDocument();
  const { data: doc, isLoading } = useGeneratedDocument(documentId);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [previewVersionId, setPreviewVersionId] = React.useState<string | null>(null);

  // If this document belongs to an employee, fetch their history to display version timeline
  const employeeId = doc?.entityType === 'EMPLOYEE' ? doc?.entityId : '';
  const { data: employeeDocs = [] } = useEmployeeDocuments(employeeId || '');

  // Filter employee docs for the same document type to show chronological version progression
  const relatedVersions = React.useMemo(() => {
    if (!doc || !employeeDocs.length) return [];
    const filtered = employeeDocs.filter(
      (d) => d.documentTypeId === doc.documentTypeId,
    );
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.generatedAt || a.createdAt).getTime();
      const dateB = new Date(b.generatedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [doc, employeeDocs]);

  const handleDownload = async (targetDoc?: GeneratedDocumentDto) => {
    const documentToDownload = targetDoc || doc;
    if (!documentToDownload) return;
    try {
      const name = (documentToDownload.documentTypeName || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${documentToDownload.businessId}_${name}_v${documentToDownload.templateVersionNumber || 1}.pdf`;
      await DocumentApiService.downloadDocumentFile(documentToDownload.id, 'pdf', filename);
    } catch (err: any) {
      alert(err?.message || 'Failed to download PDF document');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading document details...</div>;
  if (!doc) return <div className="p-8 text-center text-destructive">Document not found</div>;

  const generatedDateStr = doc.generatedAt || doc.createdAt;
  const formattedGeneratedDate = generatedDateStr
    ? new Date(generatedDateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-4">
          <Link href="/hr/documents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">
                {doc.documentTypeName || 'HR Document'}
              </h2>
              <Badge variant="outline" className="font-mono text-xs">
                v{doc.templateVersionNumber || 1}
              </Badge>
              <Badge
                variant={
                  doc.status === 'GENERATED' || doc.status === 'SIGNED' ? 'default' : 'secondary'
                }
              >
                {doc.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              Reference: {doc.businessId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
            <Eye className="mr-2 h-4 w-4 text-primary" /> Preview PDF
          </Button>

          <Button variant="default" size="sm" onClick={() => handleDownload()}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      <Tabs defaultValue="metadata" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="metadata"
            className="data-[state=active]:border-b-2 rounded-none data-[state=active]:border-primary px-6 py-3"
          >
            Provenance & Metadata
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:border-b-2 rounded-none data-[state=active]:border-primary px-6 py-3"
          >
            Version History ({relatedVersions.length || 1})
          </TabsTrigger>
          <TabsTrigger
            value="snapshot"
            className="data-[state=active]:border-b-2 rounded-none data-[state=active]:border-primary px-6 py-3"
          >
            Snapshot Payload
          </TabsTrigger>
        </TabsList>

        <div className="pt-6">
          {/* Metadata & Provenance Tab */}
          <TabsContent value="metadata">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Document Provenance
                  </CardTitle>
                  <CardDescription>
                    Exact template version and generation context used for this snapshot.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium">Document Type</p>
                      <p className="font-semibold text-sm">{doc.documentTypeName || 'Standard Document'}</p>
                      {doc.documentTypeCode && (
                        <p className="text-xs text-muted-foreground font-mono">{doc.documentTypeCode}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium">Document Reference</p>
                      <p className="font-mono text-sm font-semibold">{doc.businessId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium">Template</p>
                      <p className="font-medium text-sm">{doc.templateName || 'Standard Template'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium">Template Version</p>
                      <Badge variant="outline" className="font-mono text-xs mt-0.5">
                        v{doc.templateVersionNumber || 1}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium">Generated At</p>
                      <p className="font-medium text-sm">{formattedGeneratedDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium">Generated By</p>
                      <p className="font-medium text-sm">{doc.generatedBy ? doc.generatedBy.substring(0, 8) : 'System'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium">Status</p>
                      <Badge variant="outline" className="text-xs mt-0.5">{doc.status}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-medium">Company</p>
                      <p className="font-medium text-sm">{doc.companyName || 'Tenant Organization'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Target Entity Information
                  </CardTitle>
                  <CardDescription>
                    Employee details linked to this generated document.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm text-muted-foreground">Entity Type</span>
                    <span className="font-medium text-sm">{doc.entityType}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm text-muted-foreground">Employee Name</span>
                    <span className="font-semibold text-sm">{doc.employeeName || 'N/A'}</span>
                  </div>
                  {doc.employeeNumber && (
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm text-muted-foreground">Employee ID</span>
                      <span className="font-mono text-sm font-semibold">{doc.employeeNumber}</span>
                    </div>
                  )}
                  {doc.entityType === 'EMPLOYEE' && doc.entityId && (
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm text-muted-foreground">Employee Profile</span>
                      <Link
                        href={`/hr/employees/${doc.entityId}`}
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        View Profile
                      </Link>
                    </div>
                  )}
                  <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>
                      Historical immutability active: Stored binary PDF snapshots cannot be edited or modified.
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Version History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <History className="h-4 w-4 text-primary" />
                      Chronological Snapshot History
                    </CardTitle>
                    <CardDescription>
                      All historical versions of this document type generated for this employee. Each entry is a separate immutable record.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 divide-y">
                {relatedVersions.length > 0 ? (
                  relatedVersions.map((versionDoc) => {
                    const isCurrent = versionDoc.id === doc.id;
                    const vDateStr = versionDoc.generatedAt || versionDoc.createdAt;
                    const vFormattedDate = vDateStr
                      ? new Date(vDateStr).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A';

                    return (
                      <div
                        key={versionDoc.id}
                        className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          isCurrent ? 'bg-primary/5 border-l-4 border-l-primary' : 'bg-background'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {versionDoc.documentTypeName || 'Document'}
                            </span>
                            <Badge
                              variant={isCurrent ? 'default' : 'outline'}
                              className="font-mono text-xs"
                            >
                              v{versionDoc.templateVersionNumber || 1}
                            </Badge>
                            {isCurrent && (
                              <Badge variant="secondary" className="text-xs">
                                Viewing Current
                              </Badge>
                            )}
                            <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {versionDoc.businessId}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              Generated: {vFormattedDate}
                            </span>
                            <span>Template: {versionDoc.templateName || 'Standard Template'}</span>
                            {versionDoc.generatedBy && (
                              <span>By: {versionDoc.generatedBy.substring(0, 8)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              if (isCurrent) {
                                setIsPreviewOpen(true);
                              } else {
                                setPreviewVersionId(versionDoc.id);
                              }
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1 text-primary" />
                            View PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleDownload(versionDoc)}
                          >
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Download
                          </Button>
                          {!isCurrent && (
                            <Link href={`/hr/documents/${versionDoc.id}`}>
                              <Button variant="ghost" size="sm" className="h-8 text-xs">
                                Open
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    Only 1 immutable snapshot has been generated for this document type.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Snapshot Payload Tab */}
          <TabsContent value="snapshot">
            <SnapshotViewer snapshotData={doc.snapshots?.[0]} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Main Document Viewer Modal */}
      <DocumentViewerModal
        documentId={isPreviewOpen ? doc.id : null}
        onClose={() => setIsPreviewOpen(false)}
      />

      {/* Version Document Viewer Modal */}
      <DocumentViewerModal
        documentId={previewVersionId}
        onClose={() => setPreviewVersionId(null)}
      />
    </div>
  );
}
