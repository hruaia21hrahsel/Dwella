import type { Payment, Tenant } from '@/types';
import { generateId } from './utils';

export function createPaymentRecord(tenant: Tenant, month: number, year: number): Payment {
  return {
    id: generateId(),
    tenantId: tenant.id,
    month,
    year,
    amountDue: tenant.rentAmount,
    amountPaid: 0,
    status: 'unpaid',
  };
}

export function computePaymentStatus(amountDue: number, amountPaid: number): Payment['status'] {
  if (amountPaid <= 0) return 'unpaid';
  if (amountPaid >= amountDue) return 'paid';
  return 'partial';
}
