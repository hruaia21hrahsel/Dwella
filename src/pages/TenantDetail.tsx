import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Phone, Mail, Home, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PaymentBadge } from '@/components/shared/PaymentBadge';
import { useTenantStore } from '@/store/useTenantStore';
import { useRoomStore } from '@/store/useRoomStore';
import { usePaymentStore } from '@/store/usePaymentStore';
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils';
import type { Tenant } from '@/types';

export function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTenantById, updateTenant, deleteTenant } = useTenantStore();
  const rooms = useRoomStore((s) => s.rooms);
  const getRoomById = useRoomStore((s) => s.getRoomById);
  const getPaymentsForTenant = usePaymentStore((s) => s.getPaymentsForTenant);

  const tenant = getTenantById(id ?? '');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState<Omit<Tenant, 'id'>>(
    tenant
      ? { name: tenant.name, phone: tenant.phone, email: tenant.email, roomId: tenant.roomId, moveInDate: tenant.moveInDate, rentAmount: tenant.rentAmount, dueDay: tenant.dueDay, status: tenant.status }
      : { name: '', phone: '', email: '', roomId: '', moveInDate: '', rentAmount: 0, dueDay: 1, status: 'active' }
  );

  if (!tenant) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Tenant not found.</p>
        <Link to="/tenants" className="text-primary text-sm mt-2 inline-block">← Back to Tenants</Link>
      </div>
    );
  }

  const room = getRoomById(tenant.roomId);
  const payments = getPaymentsForTenant(tenant.id);

  function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    updateTenant(tenant!.id, form);
    setEditOpen(false);
  }

  function handleDelete() {
    deleteTenant(tenant!.id);
    navigate('/tenants');
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold flex-1">{tenant.name}</h1>
        <Button variant="outline" size="icon" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="text-destructive" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Info card */}
      <div className="rounded-lg border bg-card p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={tenant.status === 'active' ? 'success' : 'secondary'}>{tenant.status}</Badge>
        </div>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0" />
            <span>{tenant.phone}</span>
          </div>
          {tenant.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span>{tenant.email}</span>
            </div>
          )}
          {room && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Home className="h-4 w-4 shrink-0" />
              <span>{room.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Moved in {formatDate(tenant.moveInDate)} · Due day {tenant.dueDay}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="font-semibold text-primary">{formatCurrency(tenant.rentAmount)}/month</span>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div>
        <h2 className="font-semibold mb-3">Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payment records yet.</p>
        ) : (
          <ul className="space-y-2">
            {payments.map((p) => (
              <li key={p.id} className="rounded-lg border bg-card px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{getMonthName(p.month)} {p.year}</p>
                  {p.paidDate && (
                    <p className="text-xs text-muted-foreground">Paid {formatDate(p.paidDate)}</p>
                  )}
                  {p.notes && <p className="text-xs text-muted-foreground italic">{p.notes}</p>}
                </div>
                <div className="text-right shrink-0">
                  <PaymentBadge status={p.status} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(p.amountPaid)} / {formatCurrency(p.amountDue)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Phone *</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Room</Label>
                <Select value={form.roomId} onValueChange={(v) => setForm({ ...form, roomId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                  <SelectContent>
                    {rooms.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Move-in Date</Label>
                <Input type="date" value={form.moveInDate} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Due Day</Label>
                <Input type="number" min={1} max={28} value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Rent (₹)</Label>
                <Input type="number" min={0} value={form.rentAmount} onChange={(e) => setForm({ ...form, rentAmount: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Tenant['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tenant</DialogTitle>
            <DialogDescription>
              This will permanently delete {tenant.name} and all their payment records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
