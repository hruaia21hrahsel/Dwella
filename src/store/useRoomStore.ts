import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Room } from '@/types';
import { generateId } from '@/lib/utils';

type RoomStore = {
  rooms: Room[];
  addRoom: (data: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, data: Partial<Omit<Room, 'id'>>) => void;
  deleteRoom: (id: string) => void;
  getRoomById: (id: string) => Room | undefined;
};

export const useRoomStore = create<RoomStore>()(
  persist(
    (set, get) => ({
      rooms: [],

      addRoom: (data) =>
        set((state) => ({
          rooms: [...state.rooms, { ...data, id: generateId() }],
        })),

      updateRoom: (id, data) =>
        set((state) => ({
          rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...data } : r)),
        })),

      deleteRoom: (id) =>
        set((state) => ({
          rooms: state.rooms.filter((r) => r.id !== id),
        })),

      getRoomById: (id) => get().rooms.find((r) => r.id === id),
    }),
    { name: 'dwella-rooms' }
  )
);
