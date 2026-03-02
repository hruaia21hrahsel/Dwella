import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Payment } from '@/types';
import { createPaymentRecord, computePaymentStatus } from '@/lib/paymentUtils';
import { useTenantStore } from './useTenantStore';

type PaymentStore = {
  payments: Payment[];
  ensurePaymentsForMonth: (month: number, year: number) => void;
  updatePayment: (id: string, data: Partial<Omit<Payment, 'id'>>) => void;
  deletePaymentsForTenant: (tenantId: string) => void;
  getPaymentsForMonth: (month: number, year: number) => Payment[];
  getPaymentsForTenant: (tenantId: string) => Payment[];
};

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      payments: [],

      ensurePaymentsForMonth: (month, year) => {
        const activeTenants = useTenantStore.getState().getActiveTenants();
        const existing = get().payments;
        const newPayments: Payment[] = [];

        for (const tenant of activeTenants) {
          const alreadyExists = existing.some(
            (p) => p.tenantId === tenant.id && p.month === month && p.year === year
          );
          if (!alreadyExists) {
            newPayments.push(createPaymentRecord(tenant, month, year));
          }
        }

        if (newPayments.length > 0) {
          set((state) => ({ payments: [...state.payments, ...newPayments] }));
        }
      },

      updatePayment: (id, data) => {
        set((state) => ({
          payments: state.payments.map((p) => {
            if (p.id !== id) return p;
            const updated = { ...p, ...data };
            // Recompute status if amounts changed
            if (data.amountPaid !== undefined || data.amountDue !== undefined) {
              updated.status = computePaymentStatus(updated.amountDue, updated.amountPaid);
            }
            return updated;
          }),
        }));
      },

      deletePaymentsForTenant: (tenantId) =>
        set((state) => ({
          payments: state.payments.filter((p) => p.tenantId !== tenantId),
        })),

      getPaymentsForMonth: (month, year) =>
        get().payments.filter((p) => p.month === month && p.year === year),

      getPaymentsForTenant: (tenantId) =>
        get().payments
          .filter((p) => p.tenantId === tenantId)
          .sort((a, b) => (a.year !== b.year ? b.year - a.year : b.month - a.month)),
    }),
    { name: 'dwella-payments' }
  )
);

export { computePaymentStatus };
