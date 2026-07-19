'use client';

import * as React from 'react';
import { Download, FileText, Printer, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
// Removed unused imports

// Export an additional hook to fetch the preview URL
// In useDocumentQueries.ts:
// export function useDocumentPreview(id: string) {
//   return useQuery({
//     queryKey: ['documents', id, 'preview'],
//     queryFn: () => DocumentApiService.getDocumentPreview(id),
//     enabled: !!id,
//   });
// }

interface DocumentViewerModalProps {
  documentId: string | null;
  onClose: () => void;
}

export function DocumentViewerModal({ documentId, onClose }: DocumentViewerModalProps) {
  // We can fetch the document details if we want to show metadata
  // const { data: document } = useGeneratedDocument(documentId || '');

  // For this mock MVP, we'll pretend we have a PDF URL or use a skeleton.
  const [loading, setLoading] = React.useState(true);

  // In a real app we'd fetch the preview URL:
  // const { data: previewData, isLoading: previewLoading } = useDocumentPreview(documentId || '');
  // const pdfUrl = previewData?.previewUrl;

  // Mocking PDF load
  React.useEffect(() => {
    if (documentId) {
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(t);
    }
  }, [documentId]);

  if (!documentId) return null;

  return (
    <Dialog open={!!documentId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col overflow-hidden">
        <div className="sr-only">
          <DialogTitle>Document Viewer</DialogTitle>
          <DialogDescription>Previewing document {documentId}</DialogDescription>
        </div>
        
        {/* Toolbar */}
        <div className="h-14 border-b flex items-center justify-between px-4 bg-muted/20 shrink-0">
          <div className="flex items-center space-x-2 text-sm font-medium">
            <FileText className="w-4 h-4 text-primary" />
            <span>Document Preview</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Viewer Content */}
        <div className="flex-1 bg-muted/10 p-4 md:p-8 overflow-hidden flex justify-center">
          {loading ? (
            <div className="w-full max-w-3xl h-full bg-background shadow-lg rounded animate-pulse" />
          ) : (
            <div className="w-full max-w-3xl h-full bg-background shadow-lg rounded border p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
              <FileText className="w-16 h-16 mb-4 text-muted" />
              <h3 className="text-xl font-semibold text-foreground mb-2">PDF Preview Simulation</h3>
              <p>In a production environment, this area would render the actual PDF blob or iframe using the generated pre-signed URL for document {documentId}.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
