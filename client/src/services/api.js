// Server URL (backend 8000 port pe chalega)
const SERVER_URL = 'http://localhost:8000';

// Mock data for testing (jab tak backend ready nahi)
let mockDeadlocks = [
  {
    id: 1,
    timestamp: new Date().toISOString(),
    transactions: ['Txn_A', 'Txn_B'],
    llm_explanation: '⚠️ Deadlock detected! Transaction A waiting for Resource X (held by B), Transaction B waiting for Resource Y (held by A). This is a circular wait condition.',
    suggested_fix: 'Kill Transaction B (lower priority) to break the cycle.'
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 120000).toISOString(),
    transactions: ['Txn_X', 'Txn_Y'],
    llm_explanation: '🔄 Circular deadlock between two transactions. Each holds a resource the other needs.',
    suggested_fix: 'Release resources from the transaction that started later.'
  }
];

export const deadlockAPI = {
  // Get all deadlocks from server
  getDeadlocks: async () => {
    try {
      // Try to connect to real backend
      const response = await fetch(`${SERVER_URL}/api/v1/deadlocks`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.log('⚠️ Backend not available, using mock data');
      // Return mock data if backend is not ready
      return { deadlocks: mockDeadlocks };
    }
  },

  // Simulate a new deadlock
  simulateDeadlock: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/v1/deadlocks/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error) {
      console.log('🔄 Simulating mock deadlock');
      // Create a new mock deadlock
      const newDeadlock = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        transactions: [
          `Txn_${Math.random().toString(36).substr(2, 3).toUpperCase()}`, 
          `Txn_${Math.random().toString(36).substr(2, 3).toUpperCase()}`
        ],
        llm_explanation: '🆕 New deadlock simulated! Circular wait detected between transactions. Each transaction is waiting for a resource held by the other.',
        suggested_fix: 'Kill the transaction that acquired its lock last to break the cycle.'
      };
      mockDeadlocks = [newDeadlock, ...mockDeadlocks];
      return { success: true, deadlock: newDeadlock };
    }
  },

  // Check if server is alive
  healthCheck: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/health`);
      return await response.json();
    } catch {
      return { status: 'offline', message: 'Server not reachable' };
    }
  }
};