'use client';

import * as React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useAnalytics } from '@/modules/analytics/hooks/useAnalytics';
import Link from 'next/link';

export function GlobalSearchDropdown() {
  const [query, setQuery] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const { useSearch } = useAnalytics();
  
  // Custom debouncing hook logic inline for simplicity
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isLoading } = useSearch(debouncedQuery, 10);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative hidden md:block" ref={dropdownRef}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        placeholder="Search..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="h-9 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />

      {isOpen && query.length > 2 && (
        <div className="absolute top-full mt-2 w-[400px] rounded-md border bg-popover shadow-md z-50 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <div className="p-2">
                <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Results (Awaiting backend categorization)</div>
                {results.map((result: any) => (
                  <Link
                    key={result.id}
                    href={result.url || '#'}
                    onClick={() => setIsOpen(false)}
                    className="block px-2 py-2 hover:bg-muted rounded-sm"
                  >
                    <div className="font-medium text-sm">{result.title}</div>
                    <div className="text-xs text-muted-foreground">{result.subtitle || result.type}</div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
