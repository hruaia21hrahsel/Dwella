import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tenant } from '@/types';
import { generateId } from '@/lib/utils';

type TenantStore = {
  tenants: Tenant[];
  addTenant: (data: Omit<Tenant, 'id'>) => void;
  updateTenant: (id: string, data: Partial<Omit<Tenant, 'id'>>) => void;
  deleteTenant: (id: string) => void;
  getTenantById: (id: string) => Tenant | undefined;
  getActiveTenants: () => Tenant[];
};

export const useTenantStore = create<TenantStore>()(
  persist(
    (set, get) => ({
      tenants: [],

      addTenant: (data) =>
        set((state) => ({
          tenants: [...state.tenants, { ...data, id: generateId() }],
        })),

      updateTenant: (id, data) =>
        set((state) => ({
          tenants: state.tenants.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),

      deleteTenant: (id) =>
        set((state) => ({
          tenants: state.tenants.filter((t) => t.id !== id),
        })),

      getTenantById: (id) => get().tenants.find((t) => t.id === id),

      getActiveTenants: () => get().tenants.filter((t) => t.status === 'active'),
    }),
    { name: 'dwella-tenants' }
  )
);
