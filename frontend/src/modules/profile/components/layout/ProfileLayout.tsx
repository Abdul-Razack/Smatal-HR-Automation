'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

interface ProfileLayoutProps {
  overviewTab: React.ReactNode;
  workflowTab?: React.ReactNode;
  documentsTab?: React.ReactNode;
  timelineTab?: React.ReactNode;
  dynamicFieldsTab?: React.ReactNode;
  customTabs?: { value: string; label: string; content: React.ReactNode }[];
}

export function ProfileLayout({
  overviewTab,
  workflowTab,
  documentsTab,
  timelineTab,
  dynamicFieldsTab,
  customTabs = [],
}: ProfileLayoutProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <div className="border-b mb-6">
        <TabsList className="bg-transparent h-auto p-0 flex flex-wrap justify-start gap-4">
          <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2">
            Overview
          </TabsTrigger>
          {dynamicFieldsTab && (
            <TabsTrigger value="dynamic-fields" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2">
              Dynamic Fields
            </TabsTrigger>
          )}
          {workflowTab && (
            <TabsTrigger value="workflow" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2">
              Workflow
            </TabsTrigger>
          )}
          {documentsTab && (
            <TabsTrigger value="documents" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2">
              Documents
            </TabsTrigger>
          )}
          {timelineTab && (
            <TabsTrigger value="timeline" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2">
              Timeline
            </TabsTrigger>
          )}
          {customTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3 pt-2">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="overview">
        {overviewTab}
      </TabsContent>

      {dynamicFieldsTab && (
        <TabsContent value="dynamic-fields">
          <Card className="p-6">
            {dynamicFieldsTab}
          </Card>
        </TabsContent>
      )}

      {workflowTab && (
        <TabsContent value="workflow">
          {workflowTab}
        </TabsContent>
      )}

      {documentsTab && (
        <TabsContent value="documents">
          <Card className="p-6">
            {documentsTab}
          </Card>
        </TabsContent>
      )}

      {timelineTab && (
        <TabsContent value="timeline">
          <Card className="p-6">
            {timelineTab}
          </Card>
        </TabsContent>
      )}

      {customTabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
