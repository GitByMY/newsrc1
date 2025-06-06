// Customer Types
export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'active' | 'inactive' | 'lead';
  tags: string[];
  createdAt: Date;
  lastOrderDate?: Date | null;
}

// Order Types
export interface Order {
  _id: string;
  customerId: string;
  orderValue: number;
  date: Date;
  productList: string[];
}

// Campaign Types
export interface Rule {
  field: string;
  operator: string;
  value: string;
  logicGate?: string;
}

export interface Campaign {
  _id: string;
  name: string;
  audienceQuery: Rule[];
  createdAt: Date;
  summary?: string;
  audienceSize?: number;
  sentCount?: number;
  failedCount?: number;
  deliveryRatio?: number;
  status?: 'completed' | 'in-progress' | 'scheduled';
}

// Communication Log Types
export interface CommunicationLog {
  _id: string;
  campaignId: string;
  customerId: string;
  message: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  timestamp: Date;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}