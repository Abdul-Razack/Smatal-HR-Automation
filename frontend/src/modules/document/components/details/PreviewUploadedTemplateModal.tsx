'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiClient as api } from '@/api/client';
import { PreviewTemplateModal } from './PreviewTemplateModal';

export function PreviewUploadedTemplateModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handlePreview = async (mode: 'SAMPLE' | 'LIVE', format: 'HTML' | 'PDF') => {
    if (!file) return;
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);
      formData.append('format', format);
      formData.append('candidateId', 'test-candidate');

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
    } catch (err) {
      console.error('Failed to preview uploaded template', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview Unsaved DOCX</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input 
              type="file" 
              accept=".docx" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Button disabled={!file || isLoading} onClick={() => handlePreview('SAMPLE', 'HTML')}>
              {isLoading ? 'Generating...' : 'Preview'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PreviewTemplateModal
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        previewData={previewData}
        isLoading={isLoading}
        onRefresh={handlePreview}
      />
    </>
  );
}
