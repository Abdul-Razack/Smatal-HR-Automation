'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Save, Eye, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TemplateEditor } from '@/modules/document/components/editor/TemplateEditor';
import { PreviewTemplateModal } from '@/modules/document/components/details/PreviewTemplateModal';
import { useTemplate, useSaveHtmlVersion } from '@/modules/document/hooks/useDocumentQueries';
import { apiClient as api } from '@/api/client';

export default function TemplateEditorPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const { data: template, isLoading, isError } = useTemplate(templateId);
  const saveHtmlVersion = useSaveHtmlVersion(templateId);

  const [content, setContent] = React.useState('');
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<any>(null);
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);

  React.useEffect(() => {
    if (template?.versions && template.versions.length > 0) {
      // Find latest version with contentType === 'html'
      const htmlVersions = template.versions.filter((v: any) => v.contentType === 'html');
      const latestHtml = [...htmlVersions].sort((a: any, b: any) => b.versionNumber - a.versionNumber)[0];
      if (latestHtml?.content) {
        setContent(latestHtml.content);
      } else {
        // No HTML version yet (e.g. imported DOCX template) — fetch converted HTML from backend
        api.get(`/templates/${templateId}/content`)
          .then((res) => {
            const payload = res.data?.data?.data ?? res.data?.data ?? res.data;
            if (payload?.content) {
              setContent(payload.content);
            }
          })
          .catch((err) => {
            console.error('Failed to load initial template content:', err);
          });
      }
    }
  }, [template, templateId]);

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
    if (!content || !content.trim() || content === '<p></p>') {
      toast.error('Template content cannot be empty.');
      return;
    }
    try {
      const res = await saveHtmlVersion.mutateAsync({
        content,
        notes: 'Updated via Browser Editor',
      });
      toast.success(`Template version v${res.versionNumber} saved successfully!`);
      router.push(`/documents/templates/${templateId}`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to save template version.';
      toast.error(msg);
    }
  };

  const handlePreviewRefresh = async (
    mode: 'SAMPLE' | 'LIVE',
    format: 'HTML' | 'PDF',
    employeeId?: string,
  ) => {
    setIsPreviewLoading(true);
    try {
      const htmlBlob = new Blob([content], { type: 'text/html' });
      const file = new File([htmlBlob], 'template.html', { type: 'text/html' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);
      formData.append('format', format);
      formData.append('contentType', 'html');
      if (employeeId) formData.append('employeeId', employeeId);

      const response = await api.post('/templates/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: format === 'PDF' ? 'blob' : 'json',
      });

      if (format === 'PDF') {
        const headers = response.headers;
        const pdfBlob = response.data instanceof Blob 
          ? response.data 
          : new Blob([response.data], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(pdfBlob);

        const reader = new FileReader();
        reader.readAsDataURL(pdfBlob);
        reader.onloadend = () => {
          const base64data = reader.result?.toString().split(',')[1];
          setPreviewData({
            blobUrl,
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
        const resData = response.data?.data?.data ?? response.data?.data ?? response.data;
        setPreviewData({
          html: resData?.html || '',
          contentBase64: Buffer.from(resData?.html || '').toString('base64'),
          mimeType: 'text/html',
          errors: resData?.errors || [],
          warnings: resData?.warnings || [],
          resolvedKeys: resData?.resolvedKeys || [],
          unresolvedKeys: resData?.unresolvedKeys || [],
        });
        if (!isPreviewOpen) setIsPreviewOpen(true);
      }
    } catch (error: any) {
      toast.error('Failed to prepare preview: ' + (error?.response?.data?.message || error?.message));
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
    handlePreviewRefresh('SAMPLE', 'HTML');
  };

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => router.push(`/documents/templates/${templateId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Template</span>
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Editing: {template.name}</h2>
            <p className="text-xs text-muted-foreground font-mono">Browser Editor Mode</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saveHtmlVersion.isPending}>
            <Save className="mr-2 h-4 w-4" /> {saveHtmlVersion.isPending ? 'Saving...' : 'Save Version'}
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
