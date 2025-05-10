import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CampaignBuilder from './pages/CampaignBuilder';
import CampaignHistory from './pages/CampaignHistory';
import CustomerList from './pages/CustomerList';
import AddCustomer from './pages/AddCustomer';
import Layout from './components/Layout';
import './index.css';
import { Customer } from './types';
import { customerApi, campaignApi, initializeDatabase } from './services/api';

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">The application encountered an error.</p>
            <p className="text-sm text-gray-500 mb-4">Error: {this.state.error?.message || 'Unknown error'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? (
    <Layout>{children}</Layout>
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Initialize database and fetch customers
  useEffect(() => {
    const init = async () => {
      try {
        setInitializing(true);
        // Initialize database
        await initializeDatabase();
        
        // Fetch customers after initialization
        await fetchCustomers();
      } catch (err) {
        console.error('Failed to initialize:', err);
        setError('Failed to initialize application');
      } finally {
        setInitializing(false);
      }
    };

    init();
  }, []);

  // Fetch customers from MongoDB
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerApi.getAll();
      setCustomers(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setError('Failed to load customers from database');
    } finally {
      setLoading(false);
    }
  };

  // Add a new customer to MongoDB
  const handleAddCustomer = async (customer: Omit<Customer, '_id' | 'createdAt' | 'lastOrderDate'>) => {
    try {
      const newCustomer = await customerApi.create(customer);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (err) {
      console.error('Failed to add customer:', err);
      throw err;
    }
  };

  // Delete customers from MongoDB
  const handleDeleteCustomers = async (customerIds: string[]) => {
    try {
      await customerApi.deleteMany(customerIds);
      setCustomers(prev => prev.filter(customer => !customerIds.includes(customer._id)));
    } catch (err) {
      console.error('Failed to delete customers:', err);
      throw err;
    }
  };

  // If still initializing, show loading spinner
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/campaigns/create" element={
              <ProtectedRoute>
                <CampaignBuilder />
              </ProtectedRoute>
            } />
            <Route path="/campaigns/history" element={
              <ProtectedRoute>
                <CampaignHistory />
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}
                    <CustomerList 
                      customers={customers} 
                      onDeleteCustomers={handleDeleteCustomers} 
                    />
                  </>
                )}
              </ProtectedRoute>
            } />
            <Route path="/customers/add" element={
              <ProtectedRoute>
                <AddCustomer 
                  customers={customers} 
                  setCustomers={setCustomers} 
                  onAddCustomer={handleAddCustomer}
                />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;