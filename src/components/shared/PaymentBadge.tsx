import { Badge } from '@/components/ui/badge';
import type { Payment } from '@/types';

type Props = { status: Payment['status'] };

export function PaymentBadge({ status }: Props) {
  if (status === 'paid') return <Badge variant="success">Paid</Badge>;
  if (status === 'partial') return <Badge variant="warning">Partial</Badge>;
  return <Badge variant="destructive">Unpaid</Badge>;
}
