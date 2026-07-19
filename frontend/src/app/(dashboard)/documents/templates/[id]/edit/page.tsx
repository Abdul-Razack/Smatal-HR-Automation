'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TemplateEditor } from '@/modules/document/components/editor/TemplateEditor';
import { PreviewTemplateModal } from '@/modules/document/components/details/PreviewTemplateModal';
import { useTemplate, useUploadTemplateVersion } from '@/modules/document/hooks/useDocumentQueries';
import { apiClient as api } from '@/api/client';

export default function TemplateEditorPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const { data: template, isLoading, isError } = useTemplate(templateId);
  const uploadVersion = useUploadTemplateVersion(templateId);

  const [content, setContent] = React.useState('');
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<any>(null);
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);

  React.useEffect(() => {
    // Basic setup: if there's a draft or published version, load its HTML if available
    // Currently, our versions might be DOCX only. If they are DOCX, we would ideally fetch the HTML rendition.
    // For now, if the version is HTML, we load it. Otherwise start empty.
    if (template?.versions && template.versions.length > 0) {
      const activeOrDraft = template.versions.find(v => v.status === 'DRAFT' || v.status === 'PUBLISHED');
      if (activeOrDraft && activeOrDraft.contentType === 'html') {
        // Ideally we fetch the actual content from activeOrDraft.storageUri if it was accessible
        // Stubbing as empty since we don't have a direct HTML content field in the DTO yet
        // In a real scenario we'd do a fetch(storageUri)
        setContent('<p>Loaded existing HTML content...</p>');
      }
    }
  }, [template]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (isError || !template) {
    return <div>Failed to load template.</div>;
  }

  const handleSave = async () => {
    try {
      const htmlBlob = new Blob([content], { type: 'text/html' });
      const file = new File([htmlBlob], 'template.html', { type: 'text/html' });
      await uploadVersion.mutateAsync({
        file,
        notes: 'Updated via Browser Editor',
      });
      toast.success('Template version saved successfully!');
      router.push(`/documents/templates/${templateId}`);
    } catch (error) {
      toast.error('Failed to save template version.');
    }
  };

  const handlePreviewRefresh = async (mode: 'SAMPLE' | 'LIVE', format: 'HTML' | 'PDF') => {
    setIsPreviewLoading(true);
    try {
      const htmlBlob = new Blob([content], { type: 'text/html' });
      const file = new File([htmlBlob], 'template.html', { type: 'text/html' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);
      formData.append('format', format);
      formData.append('contentType', 'html');

      const response = await api.post('/templates/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: format === 'PDF' ? 'blob' : 'json'
      });
      
      if (format === 'PDF') {
        const headers = response.headers;
        const reader = new FileReader();
        reader.readAsDataURL(response.data);
        reader.onloadend = () => {
          const base64data = reader.result?.toString().split(',')[1];
          setPreviewData({
            contentBase64: base64data,
            mimeType: 'application/pdf',
            errors: JSON.parse(headers['x-validation-errors'] || '[]'),
            warnings: JSON.parse(headers['x-validation-warnings'] || '[]'),
            resolvedKeys: JSON.parse(headers['x-resolved-keys'] || '[]'),
            unresolvedKeys: JSON.parse(headers['x-unresolved-keys'] || '[]'),
          });
          if (!isPreviewOpen) setIsPreviewOpen(true);
        };
      } else {
        setPreviewData({
          contentBase64: Buffer.from(response.data.data.html || '').toString('base64'),
          mimeType: 'text/html',
          errors: response.data.data.errors,
          warnings: response.data.data.warnings,
          resolvedKeys: response.data.data.resolvedKeys,
          unresolvedKeys: response.data.data.unresolvedKeys,
        });
        if (!isPreviewOpen) setIsPreviewOpen(true);
      }
    } catch (error) {
      toast.error('Failed to prepare preview.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handlePreview = () => {
    handlePreviewRefresh('SAMPLE', 'HTML');
  };

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/documents/templates/${templateId}`)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Editing: {template.name}</h2>
            <p className="text-sm text-muted-foreground font-mono">Browser Editor Mode</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button>
          <Button size="sm" onClick={handleSave} disabled={uploadVersion.isPending}>
            <Save className="mr-2 h-4 w-4" /> {uploadVersion.isPending ? 'Saving...' : 'Save Version'}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <TemplateEditor
          initialContent={content}
          onChange={setContent}
        />
      </div>

      {isPreviewOpen && (
        <PreviewTemplateModal
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          previewData={previewData}
          isLoading={isPreviewLoading}
          onRefresh={handlePreviewRefresh}
        />
      )}
    </div>
  );
}
