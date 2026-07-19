import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient as api } from '@/api/client';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditorValidationPanelProps {
  content: string; // HTML content or text
}

export function EditorValidationPanel({ content }: EditorValidationPanelProps) {
  const { data: placeholders = [] } = useQuery({
    queryKey: ['global-placeholders'],
    queryFn: async () => {
      const res = await api.get('/templates/placeholders');
      return res.data.data as any[];
    },
  });

  const validation = useMemo(() => {
    // Basic regex to find {{something}}
    const matches = content.match(/\{\{([^}]+)\}\}/g) || [];
    const keys = Array.from(new Set(matches.map(m => m.slice(2, -2).trim())));
    
    const valid: string[] = [];
    const invalid: string[] = [];

    const placeholderKeys = new Set(placeholders.map(p => p.key));

    keys.forEach(k => {
      if (placeholderKeys.has(k)) {
        valid.push(k);
      } else {
        invalid.push(k);
      }
    });

    return { valid, invalid };
  }, [content, placeholders]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">Live Validation</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Scans content for placeholders.
        </p>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {validation.invalid.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center text-destructive">
                <AlertCircle className="w-4 h-4 mr-1" /> 
                Unknown ({validation.invalid.length})
              </h4>
              <ul className="text-xs space-y-1">
                {validation.invalid.map((key, i) => (
                  <li key={i} className="font-mono bg-destructive/10 text-destructive p-1 rounded px-2">{`{{${key}}}`}</li>
                ))}
              </ul>
            </div>
          )}

          {validation.valid.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center text-green-600">
                <CheckCircle2 className="w-4 h-4 mr-1" /> 
                Valid ({validation.valid.length})
              </h4>
              <ul className="text-xs space-y-1">
                {validation.valid.map((key, i) => (
                  <li key={i} className="font-mono bg-green-50 text-green-700 p-1 rounded px-2">{`{{${key}}}`}</li>
                ))}
              </ul>
            </div>
          )}

          {validation.valid.length === 0 && validation.invalid.length === 0 && (
            <div className="flex items-center text-muted-foreground text-sm space-x-2">
              <Info className="w-4 h-4" />
              <span>No placeholders detected.</span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
