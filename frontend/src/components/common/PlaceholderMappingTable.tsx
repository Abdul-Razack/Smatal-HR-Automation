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

  React.useEffect(() => {
    // Initialize mapping state based on what's already mapped
    const initialMappings: Record<string, string> = {};
    placeholders.forEach(p => {
      if (p.fieldDefinitionId) {
        initialMappings[p.placeholderKey] = p.fieldDefinitionId;
      }
    });
    setMappings(initialMappings);
  }, [placeholders]);

  const handleMap = (key: string, fieldId: string) => {
    setMappings(prev => ({ ...prev, [key]: fieldId }));
  };

  const handleSave = () => {
    const payload = Object.entries(mappings).map(([key, id]) => ({
      placeholderKey: key,
      fieldDefinitionId: id
    }));
    onSaveMappings(payload);
  };

  if (!placeholders || placeholders.length === 0) {
    return <div className="text-muted-foreground text-sm py-4">No placeholders detected in this version.</div>;
  }

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
            {placeholders.map((ph) => (
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
                    value={mappings[ph.placeholderKey] || ''}
                    onValueChange={(val) => handleMap(ph.placeholderKey, val)}
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Select a field to map..." />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldDefinitions.map((fd) => (
                        <SelectItem key={fd.id} value={fd.id}>
                          {fd.name} <span className="text-muted-foreground text-xs">({fd.type})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
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
