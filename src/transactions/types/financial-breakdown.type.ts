import { Types } from 'mongoose';

export type FinancialBreakdownCommission = {
  _id: Types.ObjectId | null;
  agencyAmount: number | null;
  agents: Array<{
    agentId: Types.ObjectId;
    role: 'listing' | 'selling';
    amount: number;
    name?: string;
    surname?: string;
    email?: string;
  }> | null;
};

export type FinancialBreakdownItem = {
  _id: Types.ObjectId;
  name: string;
  description: string;
  commission: FinancialBreakdownCommission | null;
};
