import React, { useState } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Customer } from '../types';
import { customerApi } from '../services/api';

interface CustomerListProps {
  customers: Customer[];
  onDeleteCustomers?: (customerIds: string[]) => Promise<void>;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onDeleteCustomers }) => {
  const navigate = useNavigate();
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [enableSelection, setEnableSelection] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show selection UI if delete functionality is available
  const showSelectionUI = !!onDeleteCustomers;

  const getSortedCustomers = () => {
    return [...customers]; // Simplified as sorting is not used
  };

  const toggleSelection = () => {
    setEnableSelection(!enableSelection);
    // Clear selections when toggling off
    if (enableSelection) {
      setSelectedCustomers([]);
    }
  };

  const toggleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCustomers.length === sortedCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(sortedCustomers.map(customer => customer._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (!onDeleteCustomers || selectedCustomers.length === 0) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await onDeleteCustomers(selectedCustomers);
      setSelectedCustomers([]);
    } catch (err) {
      console.error('Failed to delete customers:', err);
      setError('Failed to delete selected customers. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const sortedCustomers = getSortedCustomers();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="sm:flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => navigate('/customers/add')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Customer
          </button>
        </div>
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

      {showSelectionUI && (
        <div className="bg-white shadow-soft rounded-lg p-4">
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableSelection"
                checked={enableSelection}
                onChange={toggleSelection}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="enableSelection" className="ml-2 block text-sm text-gray-700">
                Enable Selection
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-soft rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {showSelectionUI && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.length === sortedCustomers.length && sortedCustomers.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCustomers.map((customer) => (
                <tr key={customer._id}>
                  {showSelectionUI && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer._id)}
                        onChange={() => toggleSelectCustomer(customer._id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${customer.status === 'active' ? 'bg-green-100 text-green-800' : 
                        customer.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {customer.tags && customer.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-0.5 bg-primary-100 text-primary-800 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedCustomers.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500 text-sm">No customers found.</p>
          </div>
        )}
        {showSelectionUI && selectedCustomers.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
            </div>
            <button
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isDeleting ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;