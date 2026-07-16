import { Badge } from '@/components/ui/badge';

interface StatusChipProps {
  status: string;
}

export function StatusChip({ status }: StatusChipProps) {
  let color = 'bg-gray-500';

  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'PUBLISHED':
    case 'COMPLETED':
    case 'GENERATED':
      color = 'bg-green-500';
      break;
    case 'DRAFT':
    case 'PENDING':
    case 'SCANNING':
    case 'PROCESSING':
    case 'GENERATING':
      color = 'bg-yellow-500';
      break;
    case 'ARCHIVED':
    case 'DEPRECATED':
    case 'VOIDED':
    case 'ROLLED_BACK':
      color = 'bg-gray-500';
      break;
    case 'FAILED':
    case 'REJECTED':
      color = 'bg-red-500';
      break;
    default:
      color = 'bg-gray-500';
  }

  return (
    <Badge className={`${color} text-white hover:${color}`}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
