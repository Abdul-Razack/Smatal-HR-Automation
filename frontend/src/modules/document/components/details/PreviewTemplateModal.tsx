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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEmployee } from '@/modules/employee/hooks/useEmployee';

interface PreviewResponseDto {
  html?: string;
  contentBase64?: string;
  mimeType?: string;
  blobUrl?: string;
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
  onRefresh: (mode: 'SAMPLE' | 'LIVE', format: 'HTML' | 'PDF', employeeId?: string) => void;
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
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string>('');

  const { useEmployees } = useEmployee();
  const { data: employeesData } = useEmployees({ limit: 100 });
  const employees: any[] = Array.isArray(employeesData) ? employeesData : [];

  // Default to first employee when switching to LIVE mode
  React.useEffect(() => {
    if (mode === 'LIVE' && !selectedEmployeeId && employees.length > 0) {
      setSelectedEmployeeId(employees[0].id);
    }
  }, [mode, selectedEmployeeId, employees]);

  React.useEffect(() => {
    if (open && !previewData && !isLoading) {
      onRefresh(mode, format, mode === 'LIVE' ? selectedEmployeeId : undefined);
    }
  }, [open, mode, format, selectedEmployeeId, previewData, isLoading, onRefresh]);

  const handleRefresh = () => {
    onRefresh(mode, format, mode === 'LIVE' ? selectedEmployeeId : undefined);
  };

  const handleModeChange = (newMode: 'SAMPLE' | 'LIVE') => {
    setMode(newMode);
    const empId = newMode === 'LIVE' ? (selectedEmployeeId || employees[0]?.id) : undefined;
    if (newMode === 'LIVE' && !selectedEmployeeId && employees[0]?.id) {
      setSelectedEmployeeId(employees[0].id);
    }
    onRefresh(newMode, format, empId);
  };

  const handleEmployeeChange = (empId: string) => {
    setSelectedEmployeeId(empId);
    onRefresh(mode, format, empId);
  };

  const handleFormatChange = (newFormat: 'HTML' | 'PDF') => {
    setFormat(newFormat);
    onRefresh(mode, newFormat, mode === 'LIVE' ? selectedEmployeeId : undefined);
  };

  const previewHtml =
    previewData?.html ||
    (previewData?.contentBase64 && previewData?.mimeType !== 'application/pdf'
      ? Buffer.from(previewData.contentBase64, 'base64').toString('utf-8')
      : '');

  const pdfBlobUrl = React.useMemo(() => {
    if (previewData?.blobUrl) {
      return previewData.blobUrl;
    }
    if (previewData?.mimeType === 'application/pdf' && previewData?.contentBase64) {
      try {
        const byteCharacters = atob(previewData.contentBase64);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
      } catch (e) {
        console.error('Error creating PDF blob URL', e);
        return null;
      }
    }
    return null;
  }, [previewData?.blobUrl, previewData?.contentBase64, previewData?.mimeType]);

  React.useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between pr-8">
          <DialogTitle>Template Preview</DialogTitle>
          <div className="flex gap-3 items-center flex-wrap">
            <div className="flex items-center space-x-2 bg-muted p-1 rounded-md">
              <Button
                variant={mode === 'SAMPLE' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('SAMPLE')}
              >
                Sample Data
              </Button>
              <Button
                variant={mode === 'LIVE' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('LIVE')}
              >
                Live Data
              </Button>
            </div>

            {mode === 'LIVE' && employees.length > 0 && (
              <div className="w-48">
                <Select value={selectedEmployeeId} onValueChange={handleEmployeeChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id} className="text-xs">
                        {emp.profile?.firstName
                          ? `${emp.profile.firstName} ${emp.profile.lastName || ''}`.trim()
                          : emp.businessId || emp.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2 bg-muted p-1 rounded-md">
              <Button
                variant={format === 'HTML' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleFormatChange('HTML')}
              >
                <FileCode2 className="w-4 h-4 mr-2" />
                HTML
              </Button>
              <Button
                variant={format === 'PDF' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleFormatChange('PDF')}
              >
                <FileType className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
            <Button onClick={handleRefresh} disabled={isLoading} variant="secondary" size="sm">
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
            
            {format === 'HTML' && (previewData?.mimeType === 'text/html' || (!previewData?.mimeType && previewHtml)) ? (
              <iframe
                title="Template HTML Preview"
                srcDoc={previewHtml}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-same-origin"
              />
            ) : format === 'PDF' && (pdfBlobUrl || previewData?.contentBase64) ? (
              <iframe
                title="Template PDF Preview"
                src={pdfBlobUrl || `data:application/pdf;base64,${previewData?.contentBase64}`}
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
