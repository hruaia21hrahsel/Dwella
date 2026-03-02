import { useEffect } from 'react';
import { Users, DoorOpen, TrendingUp, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/shared/StatCard';
import { PaymentBadge } from '@/components/shared/PaymentBadge';
import { useTenantStore } from '@/store/useTenantStore';
import { useRoomStore } from '@/store/useRoomStore';
import { usePaymentStore } from '@/store/usePaymentStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const tenants = useTenantStore((s) => s.tenants);
  const rooms = useRoomStore((s) => s.rooms);
  const { ensurePaymentsForMonth, getPaymentsForMonth } = usePaymentStore();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    ensurePaymentsForMonth(month, year);
  }, [ensurePaymentsForMonth, month, year]);

  const activeTenants = tenants.filter((t) => t.status === 'active');
  const occupiedRoomIds = new Set(activeTenants.map((t) => t.roomId));
  const monthPayments = getPaymentsForMonth(month, year);

  const collected = monthPayments.reduce((sum, p) => sum + p.amountPaid, 0);
  const pending = monthPayments.reduce(
    (sum, p) => sum + Math.max(0, p.amountDue - p.amountPaid),
    0
  );

  // Overdue: unpaid/partial tenants where today >= dueDay
  const today = now.getDate();
  const overdueTenants = activeTenants.filter((t) => {
    if (today < t.dueDay) return false;
    const payment = monthPayments.find((p) => p.tenantId === t.id);
    return !payment || payment.status === 'unpaid' || payment.status === 'partial';
  });

  // Recent payments (paid/partial, sorted by paidDate desc)
  const recentPayments = monthPayments
    .filter((p) => p.status !== 'unpaid' && p.paidDate)
    .sort((a, b) => (b.paidDate ?? '').localeCompare(a.paidDate ?? ''))
    .slice(0, 5);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {now.toLocaleString('default', { month: 'long' })} {year}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard title="Active Tenants" value={activeTenants.length} icon={Users} />
        <StatCard
          title="Rooms Occupied"
          value={`${occupiedRoomIds.size} / ${rooms.length}`}
          icon={DoorOpen}
        />
        <StatCard
          title="Collected"
          value={formatCurrency(collected)}
          icon={TrendingUp}
          iconClassName="bg-green-500"
        />
        <StatCard
          title="Pending"
          value={formatCurrency(pending)}
          icon={AlertCircle}
          iconClassName="bg-red-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Overdue tenants */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            Overdue ({overdueTenants.length})
          </h2>
          {overdueTenants.length === 0 ? (
            <p className="text-sm text-muted-foreground">All tenants are up to date.</p>
          ) : (
            <ul className="space-y-2">
              {overdueTenants.map((t) => {
                const p = monthPayments.find((pay) => pay.tenantId === t.id);
                return (
                  <li key={t.id}>
                    <Link
                      to={`/tenants/${t.id}`}
                      className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">Due day {t.dueDay}</p>
                      </div>
                      <div className="text-right">
                        {p ? (
                          <PaymentBadge status={p.status} />
                        ) : (
                          <PaymentBadge status="unpaid" />
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatCurrency(t.rentAmount)}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recent payments */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Recent Payments</h2>
          {recentPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentPayments.map((p) => {
                const tenant = tenants.find((t) => t.id === p.tenantId);
                return (
                  <li key={p.id} className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{tenant?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.paidDate ? formatDate(p.paidDate) : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-700">
                        {formatCurrency(p.amountPaid)}
                      </p>
                      <PaymentBadge status={p.status} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
