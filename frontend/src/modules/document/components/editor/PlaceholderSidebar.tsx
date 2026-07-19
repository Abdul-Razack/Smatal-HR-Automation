import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiClient as api } from '@/api/client';

interface PlaceholderItem {
  key: string;
  label: string;
  entity: string;
  description?: string | null;
}

interface PlaceholderSidebarProps {
  onInsert: (key: string) => void;
}

export function PlaceholderSidebar({ onInsert }: PlaceholderSidebarProps) {
  const [search, setSearch] = React.useState('');

  const { data: placeholders = [], isLoading } = useQuery({
    queryKey: ['global-placeholders'],
    queryFn: async () => {
      const res = await api.get('/templates/placeholders');
      return res.data.data as PlaceholderItem[];
    },
  });

  const filtered = placeholders.filter(
    (p) =>
      p.key.toLowerCase().includes(search.toLowerCase()) ||
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.entity.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, curr) => {
    if (!acc[curr.entity]) acc[curr.entity] = [];
    acc[curr.entity].push(curr);
    return acc;
  }, {} as Record<string, PlaceholderItem[]>);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b space-y-2">
        <h3 className="font-semibold text-sm">Placeholders</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8 h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="p-2 space-y-4">
            {Object.entries(grouped).map(([entity, items]) => (
              <div key={entity}>
                <h4 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {entity}
                </h4>
                <div className="space-y-1">
                  {items.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => onInsert(`{{${item.key}}}`)}
                      className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded-md transition-colors group flex flex-col"
                      title={item.description || undefined}
                    >
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono truncate">
                        {item.key}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-2 text-sm text-muted-foreground text-center">
                No placeholders found.
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
