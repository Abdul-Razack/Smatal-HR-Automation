'use client';

import * as React from 'react';
import { PlaceholderDto } from '@/modules/document/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FieldDefinition {
  id: string;
  name: string;
  type: string;
}

interface PlaceholderMappingTableProps {
  placeholders: PlaceholderDto[];
  fieldDefinitions: FieldDefinition[];
  onSaveMappings: (mappings: { placeholderKey: string; fieldDefinitionId: string }[]) => void;
  isLoading?: boolean;
}

export function PlaceholderMappingTable({
  placeholders,
  fieldDefinitions,
  onSaveMappings,
  isLoading
}: PlaceholderMappingTableProps) {
  const [mappings, setMappings] = React.useState<Record<string, string>>({});

  // We use a ref to prevent overwriting user's manual selections if the parent re-renders 
  // and passes a new array reference for fieldDefinitions.
  const hasInitializedRef = React.useRef(false);

  React.useEffect(() => {
    if (hasInitializedRef.current) return;
    if (!fieldDefinitions || fieldDefinitions.length === 0) return;
    if (!placeholders || placeholders.length === 0) return;

    // Initialize mapping state based on what's already mapped OR try to auto-map
    const initialMappings: Record<string, string> = {};
    
    // Helper to normalize strings for comparison (removes spaces, punctuation, lowercase)
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Track which fields we've already auto-mapped or loaded to avoid duplicates
    const mappedFieldIds = new Set<string>();

    placeholders.forEach(p => {
      // 1. If it's already mapped by the backend, keep it
      if (p.fieldDefinitionId) {
        initialMappings[p.placeholderKey] = p.fieldDefinitionId;
        mappedFieldIds.add(p.fieldDefinitionId);
      } 
      // 2. Otherwise, attempt to auto-map based on name similarity
      else {
        const normalizedPlaceholder = normalize(p.placeholderKey);
        
        // Find a field whose normalized name matches, and which hasn't been mapped yet
        const bestMatch = fieldDefinitions.find(fd => {
           if (mappedFieldIds.has(fd.id)) return false;
           return normalize(fd.name) === normalizedPlaceholder || normalize(fd.id.replace(/^custom\./, '')) === normalizedPlaceholder;
        });
        
        if (bestMatch) {
          initialMappings[p.placeholderKey] = bestMatch.id;
          mappedFieldIds.add(bestMatch.id);
        }
      }
    });
    
    setMappings(initialMappings);
    hasInitializedRef.current = true;
  }, [placeholders, fieldDefinitions]);

  const handleMap = (key: string, fieldId: string) => {
    setMappings(prev => ({ ...prev, [key]: fieldId }));
  };

  const handleSave = () => {
    const payload = Object.entries(mappings).map(([key, id]) => {
      const ph = placeholders.find(p => p.placeholderKey === key);
      return {
        placeholderKey: key,
        fieldDefinitionId: id,
        isRequired: !!ph?.isRequired
      };
    });
    onSaveMappings(payload);
  };

  if (!placeholders || placeholders.length === 0) {
    return <div className="text-muted-foreground text-sm py-4">No placeholders detected in this version.</div>;
  }

  // Get all currently mapped field definition IDs
  const mappedFieldIds = Object.values(mappings);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placeholder Key (in DOCX)</TableHead>
              <TableHead>Requirement</TableHead>
              <TableHead>Mapped System Field</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {placeholders.map((ph) => {
              const currentMapping = mappings[ph.placeholderKey];
              
              // Filter available fields: show it if it's the one currently selected by THIS placeholder, 
              // OR if it's not selected by any placeholder yet.
              const availableFields = fieldDefinitions.filter(
                (fd) => fd.id === currentMapping || !mappedFieldIds.includes(fd.id)
              );

              return (
                <TableRow key={ph.placeholderKey}>
                  <TableCell className="font-mono text-sm">{ph.placeholderKey}</TableCell>
                  <TableCell>
                    {ph.isRequired ? (
                      <Badge variant="destructive">Required</Badge>
                    ) : (
                      <Badge variant="secondary">Optional</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={currentMapping || ''}
                      onValueChange={(val) => handleMap(ph.placeholderKey, val)}
                    >
                      <SelectTrigger className="w-[300px]" aria-label={`Select mapping for ${ph.placeholderKey}`}>
                        <SelectValue placeholder="Select a field to map..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFields.map((fd) => (
                          <SelectItem key={fd.id} value={fd.id}>
                            {fd.name} <span className="text-muted-foreground text-xs">({fd.type})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          Save Mappings
        </Button>
      </div>
    </div>
  );
}
