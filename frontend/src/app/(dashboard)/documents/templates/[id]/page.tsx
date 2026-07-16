'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, FileEdit, Trash2, FilePlus2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusChip } from '@/components/common/StatusChip';
import { UploadDropzone } from '@/components/common/UploadDropzone';
import { VersionTimeline } from '@/components/common/VersionTimeline';
import { PlaceholderMappingTable } from '@/components/common/PlaceholderMappingTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Skeleton } from '@/components/ui/skeleton';

import {
  useTemplate,
  useUploadTemplateVersion,
  usePublishVersion,
  useDeleteTemplate,
  useMapPlaceholders,
} from '@/modules/document/hooks/useDocumentQueries';

// Mock field definitions for mapping (since this belongs to a different module in reality)
const MOCK_FIELD_DEFINITIONS = [
  { id: 'fd-1', name: 'Candidate First Name', type: 'STRING' },
  { id: 'fd-2', name: 'Candidate Last Name', type: 'STRING' },
  { id: 'fd-3', name: 'Offer Salary', type: 'CURRENCY' },
  { id: 'fd-4', name: 'Start Date', type: 'DATE' },
  { id: 'fd-5', name: 'Company Name', type: 'STRING' },
];

export default function TemplateDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const { data: template, isLoading, isError } = useTemplate(templateId);
  
  const uploadVersion = useUploadTemplateVersion(templateId);
  const publishVersion = usePublishVersion(templateId);
  const deleteTemplate = useDeleteTemplate();
  const mapPlaceholders = useMapPlaceholders(templateId);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('versions');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError || !template) {
    return <div>Failed to load template.</div>;
  }

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    try {
      await uploadVersion.mutateAsync({ file: files[0] });
      toast.success('Version uploaded successfully! It is currently scanning.');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload version.');
    }
  };

  const handlePublish = async (versionId: string) => {
    try {
      await publishVersion.mutateAsync(versionId);
      toast.success('Version published and set as active!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to publish version.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTemplate.mutateAsync(templateId);
      toast.success('Template deleted.');
      router.push('/documents/templates');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete template.');
    }
  };

  const handleSaveMappings = async (versionId: string, mappings: any[]) => {
    try {
      await mapPlaceholders.mutateAsync({ versionId, mappings });
      toast.success('Placeholders mapped successfully.');
    } catch (error: any) {
      toast.error('Failed to map placeholders.');
    }
  };

  // Find the latest draft version that might require mapping
  const latestDraft = template.versions?.find(v => v.status === 'DRAFT' || v.importStatus === 'MAPPING_REQUIRED');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/documents/templates')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h2 className="text-2xl font-bold tracking-tight">{template.name}</h2>
              <StatusChip status={template.status} />
            </div>
            <p className="text-sm text-muted-foreground font-mono">ID: {template.businessId}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <FileEdit className="mr-2 h-4 w-4" /> Edit Details
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-6">Overview</TabsTrigger>
          <TabsTrigger value="versions" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-6">Versions</TabsTrigger>
          {latestDraft && latestDraft.placeholders && latestDraft.placeholders.length > 0 && (
            <TabsTrigger value="placeholders" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-3 px-6 text-yellow-600">
              Map Placeholders
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p className="text-sm">{template.description || 'No description provided.'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Document Type</h4>
                <p className="text-sm font-mono">{template.documentTypeId}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Created At</h4>
                <p className="text-sm">{new Date(template.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Versions</h4>
                <p className="text-sm">{template.versions?.length || 0}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="versions" className="pt-6 space-y-8">
          <div className="bg-muted/30 p-6 rounded-lg border border-dashed">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FilePlus2 className="w-5 h-5 mr-2 text-primary" />
              Upload New Version
            </h3>
            <UploadDropzone
              onDrop={handleUpload}
              maxSize={10485760} // 10MB
            />
            {uploadVersion.isPending && <p className="text-sm mt-2 text-primary animate-pulse">Uploading and scanning...</p>}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Version History</h3>
            <VersionTimeline 
              versions={template.versions || []} 
              onPublish={handlePublish}
              onRollback={(v) => console.log('rollback', v)}
              onDownload={(v) => console.log('download', v)}
              isLoading={publishVersion.isPending}
            />
          </div>
        </TabsContent>

        {latestDraft && latestDraft.placeholders && (
          <TabsContent value="placeholders" className="pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Map Placeholders for Version {latestDraft.versionNumber}</h3>
              <p className="text-sm text-muted-foreground">
                We detected fields in your DOCX file. Map them to system fields to allow dynamic document generation.
              </p>
            </div>
            <PlaceholderMappingTable 
              placeholders={latestDraft.placeholders}
              fieldDefinitions={MOCK_FIELD_DEFINITIONS}
              onSaveMappings={(mappings) => handleSaveMappings(latestDraft.id, mappings)}
              isLoading={mapPlaceholders.isPending}
            />
          </TabsContent>
        )}
      </Tabs>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Template?"
        description="This action cannot be undone. All versions and generated documents tied to this template may become orphaned."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
