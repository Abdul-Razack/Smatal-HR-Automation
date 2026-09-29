'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DocumentTypeDto } from '../../types';
import { useDocument } from '../../hooks/useDocument';

interface DocumentTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType?: DocumentTypeDto | null;
}

export function DocumentTypeModal({
  open,
  onOpenChange,
  documentType,
}: DocumentTypeModalProps) {
  const isEditing = !!documentType;
  const { createDocumentType, updateDocumentType } = useDocument();

  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [errors, setErrors] = React.useState<{ name?: string; code?: string }>({});

  React.useEffect(() => {
    if (documentType) {
      setName(documentType.name);
      setCode(documentType.code);
      setDescription(documentType.description || '');
    } else {
      setName('');
      setCode('');
      setDescription('');
    }
    setErrors({});
  }, [documentType, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; code?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!isEditing && !code.trim()) newErrors.code = 'Code is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (isEditing && documentType) {
        await updateDocumentType.mutateAsync({
          id: documentType.id,
          data: {
            name: name.trim(),
            description: description.trim() || null,
          },
        });
      } else {
        await createDocumentType.mutateAsync({
          name: name.trim(),
          code: code.trim().toUpperCase().replace(/\s+/g, '_'),
          description: description.trim() || undefined,
        });
      }
      onOpenChange(false);
    } catch {
      // Error handled in hook's onError toast
    }
  };

  const isPending = createDocumentType.isPending || updateDocumentType.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Document Type' : 'Create Document Type'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update document type metadata and description.'
                : 'Define a new standardized HR document type for your organization.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="doc-type-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="doc-type-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Appointment Letter"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doc-type-code">
                Code / Type <span className="text-destructive">*</span>
              </Label>
              <Input
                id="doc-type-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. APPOINTMENT_LETTER"
                disabled={isEditing}
                className={isEditing ? 'bg-muted cursor-not-allowed uppercase' : 'uppercase'}
              />
              {isEditing ? (
                <p className="text-xs text-muted-foreground">
                  Document type code is immutable once created.
                </p>
              ) : errors.code ? (
                <p className="text-xs text-destructive">{errors.code}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Unique uppercase identifier (e.g. OFFER_LETTER)
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="doc-type-description">Description</Label>
              <Textarea
                id="doc-type-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief HR purpose of this document type..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'Saving...'
                : isEditing
                ? 'Save Changes'
                : 'Create Document Type'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
