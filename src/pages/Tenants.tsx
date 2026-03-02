import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { TenantCard } from '@/components/shared/TenantCard';
import { useTenantStore } from '@/store/useTenantStore';
import { useRoomStore } from '@/store/useRoomStore';
import type { Tenant } from '@/types';

const emptyForm: Omit<Tenant, 'id'> = {
  name: '',
  phone: '',
  email: '',
  roomId: '',
  moveInDate: new Date().toISOString().split('T')[0],
  rentAmount: 0,
  dueDay: 1,
  status: 'active',
};

export function Tenants() {
  const { tenants, addTenant } = useTenantStore();
  const rooms = useRoomStore((s) => s.rooms);
  const getRoomById = useRoomStore((s) => s.getRoomById);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Omit<Tenant, 'id'>>(emptyForm);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addTenant(form);
    setDialogOpen(false);
    setForm(emptyForm);
  }

  const filtered = tenants.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.includes(search);
    const matchFilter = filter === 'all' || t.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tenants</h1>
        <Button onClick={() => { setForm(emptyForm); setDialogOpen(true); }} size="sm">
          <Plus className="h-4 w-4" /> Add Tenant
        </Button>
      </div>

      {/* Filters */}
      {tenants.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Search name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex gap-1">
            {(['all', 'active', 'inactive'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
      )}

      {tenants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No tenants yet"
          description="Add your first tenant to start tracking rent."
          action={
            <Button onClick={() => { setForm(emptyForm); setDialogOpen(true); }}>
              <Plus className="h-4 w-4" /> Add Tenant
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No tenants match your search.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} room={getRoomById(tenant.roomId)} />
          ))}
        </div>
      )}

      {/* Add Tenant Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Tenant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Full Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ramesh Kumar"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone *</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email ?? ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="optional"
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Room *</Label>
                <Select
                  value={form.roomId}
                  onValueChange={(v) => setForm({ ...form, roomId: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Move-in Date</Label>
                <Input
                  type="date"
                  value={form.moveInDate}
                  onChange={(e) => setForm({ ...form, moveInDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Due Day (1–28)</Label>
                <Input
                  type="number"
                  min={1}
                  max={28}
                  value={form.dueDay}
                  onChange={(e) => setForm({ ...form, dueDay: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Monthly Rent (₹) *</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.rentAmount}
                  onChange={(e) => setForm({ ...form, rentAmount: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as Tenant['status'] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!form.roomId}>Add Tenant</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
