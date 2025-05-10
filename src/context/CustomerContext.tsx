import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define customer type
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSpend: number;
  lastOrderDate?: string;
  visitCount: number;
  createdAt: string;
}

// Mock customer data
const mockCustomers = [
  {
    id: '1',
    name: 'Jordan Smith',
    email: 'jordan@example.com',
    phone: '+1 (555) 123-4567',
    totalSpend: 12450,
    lastOrderDate: '2025-03-10',
    visitCount: 28,
    createdAt: '2024-08-15'
  },
  {
    id: '2',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '+1 (555) 987-6543',
    totalSpend: 8320,
    lastOrderDate: '2025-02-22',
    visitCount: 17,
    createdAt: '2024-09-23'
  },
  {
    id: '3',
    name: 'Morgan Williams',
    email: 'morgan@example.com',
    phone: '+1 (555) 234-5678',
    totalSpend: 21540,
    lastOrderDate: '2025-03-18',
    visitCount: 34,
    createdAt: '2024-07-11'
  },
  {
    id: '4',
    name: 'Taylor Davis',
    email: 'taylor@example.com',
    phone: '+1 (555) 345-6789',
    totalSpend: 5620,
    lastOrderDate: '2025-01-05',
    visitCount: 9,
    createdAt: '2024-11-03'
  },
  {
    id: '5',
    name: 'Jamie Wilson',
    email: 'jamie@example.com',
    phone: '+1 (555) 456-7890',
    totalSpend: 15780,
    lastOrderDate: '2025-03-02',
    visitCount: 22,
    createdAt: '2024-10-18'
  },
  {
    id: '6',
    name: 'Riley Brown',
    email: 'riley@example.com',
    phone: '+1 (555) 567-8901',
    totalSpend: 3240,
    lastOrderDate: '2024-12-12',
    visitCount: 7,
    createdAt: '2024-11-29'
  },
  {
    id: '7',
    name: 'Casey Martinez',
    email: 'casey@example.com',
    phone: '+1 (555) 678-9012',
    totalSpend: 18970,
    lastOrderDate: '2025-02-28',
    visitCount: 31,
    createdAt: '2024-08-07'
  },
  {
    id: '8',
    name: 'Avery Thomas',
    email: 'avery@example.com',
    phone: '+1 (555) 789-0123',
    totalSpend: 7490,
    lastOrderDate: '2025-01-17',
    visitCount: 14,
    createdAt: '2024-10-22'
  }
];

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  deleteCustomers: (customerIds: string[]) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: String(Date.now()),
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
  };

  const deleteCustomers = (customerIds: string[]) => {
    setCustomers(prevCustomers => 
      prevCustomers.filter(customer => !customerIds.includes(customer.id))
    );
  };

  return (
    <CustomerContext.Provider value={{ customers, addCustomer, deleteCustomers }}>
      {children}
    </CustomerContext.Provider>
  );
}; 