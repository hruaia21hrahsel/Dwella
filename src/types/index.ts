export type Room = {
  id: string;
  name: string;
  floor: string;
  type: 'single' | 'double' | 'triple' | 'dormitory';
  capacity: number;
  baseRent: number;
};

export type Tenant = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  roomId: string;
  moveInDate: string; // ISO date
  rentAmount: number;
  dueDay: number; // day of month rent is due
  status: 'active' | 'inactive';
};

export type Payment = {
  id: string;
  tenantId: string;
  month: number; // 1–12
  year: number;
  amountDue: number;
  amountPaid: number;
  status: 'paid' | 'unpaid' | 'partial';
  paidDate?: string; // ISO date
  notes?: string;
};
