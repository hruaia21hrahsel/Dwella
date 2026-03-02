import { useState } from 'react';
import { Plus, Pencil, Trash2, DoorOpen, BedDouble } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { useRoomStore } from '@/store/useRoomStore';
import { useTenantStore } from '@/store/useTenantStore';
import { formatCurrency } from '@/lib/utils';
import type { Room } from '@/types';

const ROOM_TYPES = ['single', 'double', 'triple', 'dormitory'] as const;

const emptyForm: Omit<Room, 'id'> = {
  name: '',
  floor: '',
  type: 'single',
  capacity: 1,
  baseRent: 0,
};

export function Rooms() {
  const { rooms, addRoom, updateRoom, deleteRoom } = useRoomStore();
  const tenants = useTenantStore((s) => s.tenants);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState<Omit<Room, 'id'>>(emptyForm);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(room: Room) {
    setEditing(room);
    setForm({ name: room.name, floor: room.floor, type: room.type, capacity: room.capacity, baseRent: room.baseRent });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateRoom(editing.id, form);
    } else {
      addRoom(form);
    }
    setDialogOpen(false);
  }

  function confirmDelete(id: string) {
    setDeleteId(id);
  }

  function handleDelete() {
    if (deleteId) {
      deleteRoom(deleteId);
      setDeleteId(null);
    }
  }

  function getOccupancy(roomId: string) {
    return tenants.filter((t) => t.roomId === roomId && t.status === 'active').length;
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4" /> Add Room
        </Button>
      </div>

      {rooms.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="No rooms yet"
          description="Add your first room to get started."
          action={<Button onClick={openAdd}><Plus className="h-4 w-4" /> Add Room</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => {
            const occ = getOccupancy(room.id);
            const isFull = occ >= room.capacity;
            return (
              <div key={room.id} className="rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{room.name}</h3>
                    <p className="text-xs text-muted-foreground">Floor: {room.floor || '—'}</p>
                  </div>
                  <div className="flex gap-1 shrink-0 ml-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(room)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => confirmDelete(room.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="capitalize">{room.type}</Badge>
                    <Badge variant={isFull ? 'destructive' : 'success'}>
                      <BedDouble className="h-3 w-3 mr-1" />
                      {occ}/{room.capacity}
                    </Badge>
                  </div>
                  <span className="font-semibold text-primary">{formatCurrency(room.baseRent)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Room' : 'Add Room'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Room Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Room 101"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Floor</Label>
                <Input
                  value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: e.target.value })}
                  placeholder="Ground"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as Room['type'] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Base Rent (₹) *</Label>
              <Input
                type="number"
                min={0}
                value={form.baseRent}
                onChange={(e) => setForm({ ...form, baseRent: Number(e.target.value) })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? 'Update' : 'Add Room'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              This will permanently delete the room. Tenants assigned to this room will need to be reassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
