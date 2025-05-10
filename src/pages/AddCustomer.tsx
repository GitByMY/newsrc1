import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { Customer } from '../types';

interface AddCustomerProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  onAddCustomer?: (customer: Omit<Customer, '_id' | 'createdAt' | 'lastOrderDate'>) => Promise<Customer>;
}

const AddCustomer: React.FC<AddCustomerProps> = ({ customers, setCustomers, onAddCustomer }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'active' as const,
    tags: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (onAddCustomer) {
        await onAddCustomer(formData);
      } else {
        // Fallback to local state management if no API function is provided
        const newCustomer: Customer = {
          _id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          status: formData.status,
          tags: formData.tags,
          lastOrderDate: null,
          createdAt: new Date()
        };
        setCustomers(prev => [...prev, newCustomer]);
      }
      
      // Navigate back to the customer list
      navigate('/customers');
    } catch (err) {
      setError('Failed to add customer. Please try again.');
      console.error('Error adding customer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.trim()) {
      const tags = value.split(',').map(tag => tag.trim());
      setFormData(prev => ({
        ...prev,
        tags
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        tags: []
      }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-soft rounded-lg p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Company
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="company"
                  id="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="mt-1">
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags (comma separated)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="tags"
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={handleTagChange}
                  placeholder="retail, premium, etc."
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Customer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCustomer;