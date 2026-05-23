import './App.css';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import { useDeadlocks } from './hooks/useDeadlocks';

function App() {
  const { deadlocks, loading, error, refresh, simulate } = useDeadlocks();

  return (
    <>
      <Navbar />
      <Dashboard
        deadlocks={deadlocks}
        loading={loading}
        error={error}
        refresh={refresh}
        simulate={simulate}
      />
    </>
  );
}

export default App;
