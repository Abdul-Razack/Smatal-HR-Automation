'use client';

import * as React from 'react';
import { Download, FileText, Printer, X, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DocumentApiService } from '@/modules/document/api/DocumentApiService';

interface DocumentViewerModalProps {
  documentId: string | null;
  onClose: () => void;
}

export function DocumentViewerModal({ documentId, onClose }: DocumentViewerModalProps) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (!documentId) {
      setPdfUrl(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    DocumentApiService.getDocumentPreviewBlob(documentId, 'pdf')
      .then((blob) => {
        if (!active) return;
        createdUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        setPdfUrl(createdUrl);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || 'Failed to load PDF preview.');
        setLoading(false);
      });

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [documentId]);

  const handleDownload = async () => {
    if (!documentId) return;
    try {
      await DocumentApiService.downloadDocumentFile(documentId, 'pdf');
    } catch (err: any) {
      alert(err?.message || 'Failed to download document');
    }
  };

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        return;
      } catch {
        // Fallback if cross-origin or blocked
      }
    }
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  if (!documentId) return null;

  return (
    <Dialog open={!!documentId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent hideCloseButton className="max-w-5xl h-[90vh] p-0 flex flex-col overflow-hidden">
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
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={loading || !!error || !pdfUrl}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={loading || !!error}
            >
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
        <div className="flex-1 bg-muted/10 p-2 md:p-6 overflow-hidden flex justify-center">
          {loading ? (
            <div className="w-full max-w-4xl h-full bg-background shadow-lg rounded animate-pulse flex flex-col items-center justify-center">
              <FileText className="w-12 h-12 text-muted-foreground animate-bounce mb-3" />
              <p className="text-muted-foreground text-sm">Rendering real PDF...</p>
            </div>
          ) : error ? (
            <div className="w-full max-w-4xl h-full bg-background shadow-lg rounded border p-8 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-12 h-12 text-destructive mb-3" />
              <h3 className="text-lg font-semibold mb-1">Preview Unavailable</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={() => handleDownload()}>
                <Download className="w-4 h-4 mr-2" /> Download File Instead
              </Button>
            </div>
          ) : pdfUrl ? (
            <div className="w-full max-w-4xl h-full bg-background shadow-lg rounded border overflow-hidden">
              <iframe
                ref={iframeRef}
                src={pdfUrl}
                className="w-full h-full border-none"
                title="Real PDF Viewer"
              />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
