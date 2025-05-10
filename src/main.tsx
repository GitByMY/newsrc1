import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Error boundary component for catching render errors
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App initialization error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">The application failed to initialize properly.</p>
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

// Hide loading spinner when app is mounted
function hideLoadingSpinner() {
  const loadingElement = document.getElementById('app-loading');
  if (loadingElement) {
    loadingElement.classList.add('fade-out');
    setTimeout(() => {
      loadingElement.style.display = 'none';
    }, 300);
  }
}

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );

  // Hide loading spinner after a short delay
  setTimeout(hideLoadingSpinner, 500);
} catch (error) {
  console.error('Failed to render application:', error);
  hideLoadingSpinner();
  
  // Show error message
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; padding: 20px;">
        <div style="text-align: center; padding: 20px; max-width: 500px; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #dc2626; font-size: 1.5rem; margin-bottom: 1rem;">Critical Error</h2>
          <p style="margin-bottom: 1rem;">The application failed to initialize.</p>
          <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1rem;">${error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onclick="window.location.reload()" style="background-color: #4f46e5; color: white; padding: 0.5rem 1rem; border-radius: 0.25rem; border: none; cursor: pointer;">
            Reload Application
          </button>
        </div>
      </div>
    `;
  }
}
