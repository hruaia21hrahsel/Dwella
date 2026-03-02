import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { PaymentBadge } from '@/components/shared/PaymentBadge';
import { usePaymentStore } from '@/store/usePaymentStore';
import { useTenantStore } from '@/store/useTenantStore';
import { useRoomStore } from '@/store/useRoomStore';
import { formatCurrency, getMonthName } from '@/lib/utils';
import type { Payment } from '@/types';

export function Payments() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { ensurePaymentsForMonth, getPaymentsForMonth, updatePayment } = usePaymentStore();
  const tenants = useTenantStore((s) => s.tenants);
  const getRoomById = useRoomStore((s) => s.getRoomById);

  const [payDialog, setPayDialog] = useState<Payment | null>(null);
  const [payForm, setPayForm] = useState({ amountPaid: 0, paidDate: now.toISOString().split('T')[0], notes: '' });

  useEffect(() => {
    ensurePaymentsForMonth(month, year);
  }, [ensurePaymentsForMonth, month, year]);

  const payments = getPaymentsForMonth(month, year);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  function openPayDialog(p: Payment) {
    setPayDialog(p);
    setPayForm({
      amountPaid: p.amountPaid > 0 ? p.amountPaid : p.amountDue,
      paidDate: p.paidDate ?? now.toISOString().split('T')[0],
      notes: p.notes ?? '',
    });
  }

  function handlePaySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!payDialog) return;
    updatePayment(payDialog.id, {
      amountPaid: payForm.amountPaid,
      paidDate: payForm.paidDate,
      notes: payForm.notes || undefined,
    });
    setPayDialog(null);
  }

  const totalDue = payments.reduce((s, p) => s + p.amountDue, 0);
  const totalCollected = payments.reduce((s, p) => s + p.amountPaid, 0);

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payments</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-28 text-center">
            {getMonthName(month)} {year}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary bar */}
      {payments.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <div className="rounded-md bg-muted px-3 py-1.5 text-sm">
            <span className="text-muted-foreground">Due: </span>
            <span className="font-semibold">{formatCurrency(totalDue)}</span>
          </div>
          <div className="rounded-md bg-green-50 px-3 py-1.5 text-sm">
            <span className="text-muted-foreground">Collected: </span>
            <span className="font-semibold text-green-700">{formatCurrency(totalCollected)}</span>
          </div>
          <div className="rounded-md bg-red-50 px-3 py-1.5 text-sm">
            <span className="text-muted-foreground">Pending: </span>
            <span className="font-semibold text-red-700">{formatCurrency(Math.max(0, totalDue - totalCollected))}</span>
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment records"
          description="Add active tenants to generate payment records for this month."
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Tenant</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Room</th>
                <th className="text-right px-4 py-3 font-medium">Amount</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((p) => {
                const tenant = tenants.find((t) => t.id === p.tenantId);
                const room = tenant ? getRoomById(tenant.roomId) : undefined;
                return (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{tenant?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">Due day {tenant?.dueDay}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                      {room?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-medium">{formatCurrency(p.amountPaid)}</p>
                      <p className="text-xs text-muted-foreground">of {formatCurrency(p.amountDue)}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PaymentBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPayDialog(p)}
                      >
                        {p.status === 'unpaid' ? 'Mark Paid' : 'Edit'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Dialog */}
      <Dialog open={!!payDialog} onOpenChange={() => setPayDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Record Payment — {tenants.find((t) => t.id === payDialog?.tenantId)?.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePaySubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Amount Paid (₹)</Label>
              <Input
                type="number"
                min={0}
                max={payDialog?.amountDue}
                value={payForm.amountPaid}
                onChange={(e) => setPayForm({ ...payForm, amountPaid: Number(e.target.value) })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Due: {formatCurrency(payDialog?.amountDue ?? 0)}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={payForm.paidDate}
                onChange={(e) => setPayForm({ ...payForm, paidDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Textarea
                value={payForm.notes}
                onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                placeholder="e.g. Paid via UPI"
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPayDialog(null)}>Cancel</Button>
              <Button type="submit">Save Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
