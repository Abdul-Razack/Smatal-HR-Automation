'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentTypeList } from '@/modules/document/components/types/DocumentTypeList';
import { DocumentList } from '@/modules/document/components/list/DocumentList';
import { FileText, Files } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground mt-1">
          Manage organizational document types and review generated employee records.
        </p>
      </div>

      <Tabs defaultValue="types" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="types" className="gap-2">
            <FileText className="h-4 w-4" />
            Document Types
          </TabsTrigger>
          <TabsTrigger value="generated" className="gap-2">
            <Files className="h-4 w-4" />
            Generated Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-4">
          <DocumentTypeList />
        </TabsContent>

        <TabsContent value="generated" className="space-y-4">
          <DocumentList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
