import { useState, useEffect, useCallback } from 'react';
import { deadlockAPI } from '../services/api';

export function useDeadlocks(pollingInterval = 5000) {
  const [deadlocks, setDeadlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchDeadlocks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await deadlockAPI.getDeadlocks();
      setDeadlocks(data.deadlocks || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const simulateDeadlock = useCallback(async () => {
    setLoading(true);
    try {
      await deadlockAPI.simulateDeadlock();
      await fetchDeadlocks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchDeadlocks]);

  useEffect(() => {
    fetchDeadlocks();
    const interval = setInterval(fetchDeadlocks, pollingInterval);
    return () => clearInterval(interval);
  }, [fetchDeadlocks, pollingInterval]);

  return {
    deadlocks,
    loading,
    error,
    lastUpdated,
    refresh: fetchDeadlocks,
    simulate: simulateDeadlock,
  };
}
