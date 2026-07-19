'use client';

import * as React from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface UploadDropzoneProps extends Omit<DropzoneOptions, 'onDrop'> {
  onDrop: (acceptedFiles: File[]) => void;
  className?: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
}

export function UploadDropzone({
  onDrop,
  className,
  accept = {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 1,
  ...props
}: UploadDropzoneProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const handleDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        onDrop(acceptedFiles);
      }
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: handleDrop,
    accept,
    maxSize,
    maxFiles,
    ...props,
  });

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    onDrop([]);
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        isDragReject ? 'border-destructive bg-destructive/5' : '',
        className
      )}
    >
      <input {...getInputProps({ 'aria-label': 'Choose Files' })} />
      
      {selectedFile ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center p-4 bg-muted rounded-md relative group">
            <FileIcon className="h-8 w-8 text-primary mr-3" />
            <div className="flex flex-col text-left mr-8">
              <span className="text-sm font-medium truncate max-w-[200px]">
                {selectedFile.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={clearFile}
              aria-label="Clear selected file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2 text-muted-foreground">
          <div className="p-4 bg-primary/10 rounded-full text-primary">
            <UploadCloud className="h-8 w-8" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              {isDragActive
                ? 'Drop the file here'
                : 'Drag & drop a file here, or click to select'}
            </p>
            <p className="text-xs mt-1">
              Supports .DOCX (Max 10MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
