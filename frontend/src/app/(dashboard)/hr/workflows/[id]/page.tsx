import { WorkflowInstanceDetails } from '@/modules/workflow/components/details/WorkflowInstanceDetails';

export default async function WorkflowInstancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkflowInstanceDetails instanceId={id} />;
}
