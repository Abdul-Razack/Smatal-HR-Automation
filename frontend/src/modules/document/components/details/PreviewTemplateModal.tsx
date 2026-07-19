'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle2, FileType, FileCode2 } from 'lucide-react';
// Removed unused Alert import

interface PreviewResponseDto {
  contentBase64: string;
  mimeType: string;
  resolvedKeys: string[];
  unresolvedKeys: string[];
  errors: string[];
  warnings: string[];
}

interface PreviewTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewData: PreviewResponseDto | null;
  isLoading: boolean;
  onRefresh: (mode: 'SAMPLE' | 'LIVE', format: 'HTML' | 'PDF') => void;
}

export function PreviewTemplateModal({
  open,
  onOpenChange,
  previewData,
  isLoading,
  onRefresh,
}: PreviewTemplateModalProps) {
  const [mode, setMode] = React.useState<'SAMPLE' | 'LIVE'>('SAMPLE');
  const [format, setFormat] = React.useState<'HTML' | 'PDF'>('HTML');

  React.useEffect(() => {
    if (open && !previewData && !isLoading) {
      onRefresh(mode, format);
    }
  }, [open, mode, format, previewData, isLoading, onRefresh]);

  const handleRefresh = () => {
    onRefresh(mode, format);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Template Preview</DialogTitle>
          <div className="flex gap-4 items-center">
            <div className="flex items-center space-x-2 bg-muted p-1 rounded-md">
              <Button
                variant={mode === 'SAMPLE' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('SAMPLE')}
              >
                Sample Data
              </Button>
              <Button
                variant={mode === 'LIVE' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('LIVE')}
              >
                Live Data
              </Button>
            </div>
            <div className="flex items-center space-x-2 bg-muted p-1 rounded-md">
              <Button
                variant={format === 'HTML' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFormat('HTML')}
              >
                <FileCode2 className="w-4 h-4 mr-2" />
                HTML
              </Button>
              <Button
                variant={format === 'PDF' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFormat('PDF')}
              >
                <FileType className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
            <Button onClick={handleRefresh} disabled={isLoading} variant="secondary">
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
          {/* Main Preview Area */}
          <div className="flex-1 bg-white border rounded-md overflow-hidden relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <p className="text-muted-foreground animate-pulse">Generating preview...</p>
              </div>
            )}
            
            {previewData?.mimeType === 'text/html' ? (
              <div 
                className="w-full h-full p-8 overflow-auto prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: Buffer.from(previewData.contentBase64, 'base64').toString('utf-8')
                }}
              />
            ) : previewData?.mimeType === 'application/pdf' ? (
              <iframe
                src={`data:application/pdf;base64,${previewData.contentBase64}`}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No preview generated yet.
              </div>
            )}
          </div>

          {/* Validation Sidebar */}
          <div className="w-80 flex flex-col gap-4 overflow-hidden border rounded-md bg-muted/30">
            <div className="p-4 border-b font-medium bg-muted/50">
              Validation Results
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {previewData?.errors && previewData.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center text-destructive">
                      <AlertCircle className="w-4 h-4 mr-1" /> 
                      Errors ({previewData.errors.length})
                    </h4>
                    <ul className="text-xs space-y-1">
                      {previewData.errors.map((err, i) => (
                        <li key={i} className="text-destructive bg-destructive/10 p-2 rounded">{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {previewData?.warnings && previewData.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center text-amber-600">
                      <AlertCircle className="w-4 h-4 mr-1" /> 
                      Warnings ({previewData.warnings.length})
                    </h4>
                    <ul className="text-xs space-y-1">
                      {previewData.warnings.map((warn, i) => (
                        <li key={i} className="text-amber-700 bg-amber-50 p-2 rounded">{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {previewData?.unresolvedKeys && previewData.unresolvedKeys.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center text-destructive">
                      Unresolved Placeholders
                    </h4>
                    <ul className="text-xs space-y-1">
                      {previewData.unresolvedKeys.map((key, i) => (
                        <li key={i} className="font-mono bg-destructive/10 text-destructive p-1 rounded px-2">{`{{${key}}}`}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {previewData?.resolvedKeys && previewData.resolvedKeys.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center text-green-600">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> 
                      Resolved ({previewData.resolvedKeys.length})
                    </h4>
                    <ul className="text-xs space-y-1">
                      {previewData.resolvedKeys.map((key, i) => (
                        <li key={i} className="font-mono bg-green-50 text-green-700 p-1 rounded px-2">{`{{${key}}}`}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {!previewData && !isLoading && (
                  <p className="text-sm text-muted-foreground">Run preview to see validation results.</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
