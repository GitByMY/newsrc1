import axios from 'axios';
import { Customer, Campaign, Rule } from '../types';

// Try to get the API URL from environment variables, with fallback
const API_URL = import.meta.env.VITE_API_URL || '/api';

console.log('API URL initialized as:', API_URL);

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    console.error('API request failed:', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      error: error.message
    });
    
    // Don't retry if we've already retried once or it's not a network error
    if (originalRequest._retry || !error.isAxiosError || !error.message.includes('Network Error')) {
      return Promise.reject(error);
    }
    
    originalRequest._retry = true;
    
    console.log('Retrying failed request after delay...');
    
    // Wait a moment before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Retry the request
    return apiClient(originalRequest);
  }
);

// Initialize the database
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('Initializing database...');
    const response = await apiClient.get('/init-db');
    console.log('Database initialization response:', response.data);
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const customerApi = {
  // Get all customers
  getAll: async (): Promise<Customer[]> => {
    try {
      console.log('Fetching customers from:', `${API_URL}/customers`);
      const response = await apiClient.get('/customers');
      console.log('Customers API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Get a single customer
  getById: async (id: string): Promise<Customer> => {
    try {
      const response = await apiClient.get(`/customers?id=${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error);
      throw error;
    }
  },

  // Create a new customer
  create: async (customer: Omit<Customer, '_id' | 'createdAt' | 'lastOrderDate'>): Promise<Customer> => {
    try {
      const response = await apiClient.post('/customers', customer);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Update a customer
  update: async (id: string, customer: Partial<Customer>): Promise<Customer> => {
    try {
      const response = await apiClient.put(`/customers?id=${id}`, customer);
      return response.data;
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error);
      throw error;
    }
  },

  // Delete a customer
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/customers?id=${id}`);
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error);
      throw error;
    }
  },

  // Delete multiple customers
  deleteMany: async (ids: string[]): Promise<void> => {
    try {
      await apiClient.post('/customers?action=delete-many', { ids });
    } catch (error) {
      console.error('Error deleting multiple customers:', error);
      throw error;
    }
  }
};

export const campaignApi = {
  // Get all campaigns
  getAll: async (): Promise<Campaign[]> => {
    try {
      console.log('Fetching campaigns from:', `${API_URL}/campaigns`);
      const response = await apiClient.get('/campaigns');
      console.log('Campaigns API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  // Get a single campaign
  getById: async (id: string): Promise<Campaign> => {
    try {
      const response = await apiClient.get(`/campaigns?id=${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching campaign ${id}:`, error);
      throw error;
    }
  },

  // Create a new campaign
  create: async (campaign: Omit<Campaign, '_id' | 'createdAt'>): Promise<Campaign> => {
    try {
      const response = await apiClient.post('/campaigns', campaign);
      return response.data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  // Update a campaign
  update: async (id: string, campaign: Partial<Campaign>): Promise<Campaign> => {
    try {
      const response = await apiClient.put(`/campaigns?id=${id}`, campaign);
      return response.data;
    } catch (error) {
      console.error(`Error updating campaign ${id}:`, error);
      throw error;
    }
  },

  // Delete a campaign
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/campaigns?id=${id}`);
    } catch (error) {
      console.error(`Error deleting campaign ${id}:`, error);
      throw error;
    }
  }
}; 