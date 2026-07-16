import { DocumentDetails } from '@/modules/document/components/details/DocumentDetails';

export default async function DocumentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DocumentDetails documentId={id} />;
}
