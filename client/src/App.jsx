import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import DocumentationPage from './components/DocumentationPage';
import AnalyticsPage from './components/AnalyticsPage';  // ← Add this import
import { useDeadlocks } from './hooks/useDeadlocks';

function App() {
  const [currentPage, setCurrentPage] = useState('overview');
  const { deadlocks, loading, error, refresh, simulate } = useDeadlocks();

  const renderPage = () => {
    // Analytics Page 
    if (currentPage === 'analytics') {
      return <AnalyticsPage deadlocks={deadlocks} />;
    }
    // Documentation Page
    if (currentPage === 'documentation') {
      return <DocumentationPage />;
    }
    // Default: Dashboard 
    return (
      <Dashboard
        deadlocks={deadlocks}
        loading={loading}
        error={error}
        refresh={refresh}
        simulate={simulate}
      />
    );
  };

  return (
    <>
      <Navbar onPageChange={setCurrentPage} />
      {renderPage()}
    </>
  );
}

export default App;