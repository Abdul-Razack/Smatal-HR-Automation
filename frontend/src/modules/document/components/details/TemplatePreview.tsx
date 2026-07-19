'use client';

import * as React from 'react';
import { useDocument } from '../../hooks/useDocument';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PreviewTemplateModal } from './PreviewTemplateModal';
import { PreviewUploadedTemplateModal } from './PreviewUploadedTemplateModal';
import { Eye, Upload } from 'lucide-react';
import { apiClient as api } from '@/api/client';

export function TemplatePreview({ templateId }: { templateId: string }) {
  const { useTemplate } = useDocument();
  const { data: template, isLoading: isTemplateLoading } = useTemplate(templateId);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [isUploadPreviewOpen, setIsUploadPreviewOpen] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<any>(null);
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);

  const fetchPreview = async (mode: 'SAMPLE' | 'LIVE', format: 'HTML' | 'PDF') => {
    setIsPreviewLoading(true);
    try {
      const response = await api.post(`/templates/${templateId}/preview`, {
        mode,
        format,
        candidateId: 'test-candidate', // Mock ID for testing
      }, {
        responseType: format === 'PDF' ? 'blob' : 'json'
      });
      
      if (format === 'PDF') {
        const headers = response.headers;
        
        // Use FileReader to convert blob to base64 for the iframe preview
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
      }
    } catch (err) {
      console.error('Failed to fetch preview', err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  if (isTemplateLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!template) {
    return null;
  }

  const activeVersion = template.versions?.find(v => v.status === 'PUBLISHED');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Template Information</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsUploadPreviewOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Preview Unsaved
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsPreviewOpen(true)}
            disabled={!activeVersion}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Document
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Template Name</p>
            <p className="font-medium">{template.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Version</p>
            <p className="font-medium text-xs break-all">{activeVersion?.id || 'None'}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Description</p>
          <p className="text-sm">{template.description || 'No description provided'}</p>
        </div>
      </CardContent>

      <PreviewTemplateModal
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        previewData={previewData}
        isLoading={isPreviewLoading}
        onRefresh={fetchPreview}
      />

      <PreviewUploadedTemplateModal 
        open={isUploadPreviewOpen} 
        onOpenChange={setIsUploadPreviewOpen} 
      />
    </Card>
  );
}
