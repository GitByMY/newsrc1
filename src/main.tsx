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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
            <h1 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h1>
            <p className="mb-4 text-gray-700">The application failed to initialize properly.</p>
            <p className="mb-4 text-red-500">Error: {this.state.error?.message || 'Unknown error'}</p>
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
      <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
        <div class="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h1 class="text-xl font-bold text-red-600 mb-2">Critical Error</h1>
          <p class="mb-4 text-gray-700">The application failed to initialize.</p>
          <p class="mb-4 text-red-500">${error instanceof Error ? error.message : 'Unknown error'}</p>
          <button 
            onclick="window.location.reload()" 
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Application
          </button>
        </div>
      </div>
    `;
  }
}
