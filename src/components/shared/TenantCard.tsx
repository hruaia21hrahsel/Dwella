import { Link } from 'react-router-dom';
import { Phone, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Tenant, Room } from '@/types';
import { formatCurrency } from '@/lib/utils';

type Props = {
  tenant: Tenant;
  room?: Room;
};

export function TenantCard({ tenant, room }: Props) {
  return (
    <Link
      to={`/tenants/${tenant.id}`}
      className="block rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold truncate">{tenant.name}</h3>
            <Badge variant={tenant.status === 'active' ? 'success' : 'secondary'}>
              {tenant.status}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{tenant.phone}</span>
          </div>
          {room && (
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Home className="h-3 w-3" />
              <span>{room.name}</span>
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-primary">{formatCurrency(tenant.rentAmount)}</p>
          <p className="text-xs text-muted-foreground">Due day {tenant.dueDay}</p>
        </div>
      </div>
    </Link>
  );
}
