const SERVER_URL = 'http://localhost:8000';

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

  // ─────────────────────────────────────────
  // 1. HEALTH CHECK
  // ─────────────────────────────────────────
  healthCheck: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/health`);
      return await response.json();
    } catch {
      return { status: 'offline', message: 'Server not reachable' };
    }
  },

  // ─────────────────────────────────────────
  // 2. GET ALL DEADLOCKS
  // ─────────────────────────────────────────
  getDeadlocks: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/v1/deadlocks`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.log('⚠️ Backend not available, using mock data');
      return { deadlocks: mockDeadlocks };
    }
  },

  // ─────────────────────────────────────────
  // 3. SIMULATE DEADLOCK
  // ─────────────────────────────────────────
  simulateDeadlock: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/v1/deadlocks/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error) {
      console.log('🔄 Simulating mock deadlock');
      const newDeadlock = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        transactions: [
          `Txn_${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
          `Txn_${Math.random().toString(36).substr(2, 3).toUpperCase()}`
        ],
        llm_explanation: '🆕 New deadlock simulated! Circular wait detected between transactions.',
        suggested_fix: 'Kill the transaction that acquired its lock last to break the cycle.'
      };
      mockDeadlocks = [newDeadlock, ...mockDeadlocks];
      return { success: true, deadlock: newDeadlock };
    }
  },

  // ─────────────────────────────────────────
  // 4. GET LOGS (MongoDB)
  // ─────────────────────────────────────────
  getLogs: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/v1/logs`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.log('⚠️ Could not fetch logs');
      return { logs: [] };
    }
  },

  // ─────────────────────────────────────────
  // 5. GET ALL TRANSACTIONS (PostgreSQL)
  // ─────────────────────────────────────────
  getTransactions: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/v1/transactions`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.log('⚠️ Could not fetch transactions');
      return { transactions: [] };
    }
  },

  // ─────────────────────────────────────────
  // 6. GET WAITING LOCKS (PostgreSQL)
  // ─────────────────────────────────────────
  getWaitingLocks: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/v1/locks/waiting`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.log('⚠️ Could not fetch waiting locks');
      return { waiting_locks: [] };
    }
  },

  // ─────────────────────────────────────────
  // 7. GET NODES (PostgreSQL node_registry)
  // ─────────────────────────────────────────
  getNodes: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/v1/nodes`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.log('⚠️ Could not fetch nodes');
      return { nodes: [] };
    }
  },

  // ─────────────────────────────────────────
  // 8. GET STATS (PostgreSQL analytics)
  // ─────────────────────────────────────────
  getStats: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/v1/stats`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.log('⚠️ Could not fetch stats');
      return {
        total_deadlocks: 0,
        avg_resolution_ms: 0,
        most_affected_resource: 'N/A',
        resolved_percentage: 100,
        active_nodes: 3
      };
    }
  },

  // ─────────────────────────────────────────
  // 9. GET LLM EXPLANATION BY EVENT ID (MongoDB)
  // ─────────────────────────────────────────
  getExplanation: async (eventId) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/v1/explanation/${eventId}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.log(`⚠️ Could not fetch explanation for event ${eventId}`);
      return null;
    }
  },

  // ─────────────────────────────────────────
  // 10. GET WAIT-FOR GRAPH (Neo4j)
  // ─────────────────────────────────────────
  getGraph: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/v1/graph`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.log('⚠️ Could not fetch Neo4j graph');
      return { nodes: [], edges: [] };
    }
  },

  // ─────────────────────────────────────────
  // 11. DETECT CYCLE (Neo4j)
  // ─────────────────────────────────────────
  detectCycle: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/v1/detect`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.log('⚠️ Could not run cycle detection');
      return { cycles_found: 0, deadlock_detected: false, cycles: [] };
    }
  }

};