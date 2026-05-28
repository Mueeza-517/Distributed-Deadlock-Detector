import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

const Neo4jGraphPage = () => {
  const [graphData, setGraphData] = useState(null);
  const [cycleData, setCycleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ FIXED: correct endpoint
      const [graphRes, cycleRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/graph'),
        fetch('http://localhost:8000/api/v1/detect'),
      ]);

      if (!graphRes.ok) throw new Error(`Graph API: HTTP ${graphRes.status}`);
      const graph = await graphRes.json();
      setGraphData(graph);

      if (cycleRes.ok) {
        const cycle = await cycleRes.json();
        setCycleData(cycle);
      }
    } catch (err) {
      console.error('Failed to fetch Neo4j graph data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Position nodes in a circle so they don't overlap
  const getNodePosition = (index, total) => {
    const cx = 350, cy = 220, r = 150;
    const angle = (2 * Math.PI * index) / Math.max(total, 1) - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <i className="fas fa-project-diagram"></i>
        <h1 className={styles.title}>Neo4j Wait-For Graph</h1>
        <button className={styles.refreshBtn} onClick={fetchGraphData} disabled={loading}>
          <i className="fas fa-sync-alt"></i>
          {loading ? ' Loading...' : ' Refresh'}
        </button>
      </div>

      {/* Cycle Detection Banner */}
      {cycleData && (
        <div style={{
          margin: '0 24px 16px',
          padding: '12px 20px',
          borderRadius: '8px',
          background: cycleData.deadlock_detected ? '#3b1a1a' : '#1a3b1a',
          border: `1px solid ${cycleData.deadlock_detected ? '#ef4444' : '#22c55e'}`,
          color: cycleData.deadlock_detected ? '#ef4444' : '#22c55e',
          fontWeight: '600',
          fontSize: '14px',
        }}>
          {cycleData.deadlock_detected
            ? `⚠️ Deadlock Detected! ${cycleData.cycles_found} cycle(s) found in wait-for graph.`
            : '✅ No deadlock detected — system healthy.'}
        </div>
      )}

      <div className={styles.infoCard}>
        <p>
          This graph shows real-time wait-for relationships between transactions in Neo4j.
          Each node is a transaction. An arrow from A → B means A is waiting for B.
          A cycle means deadlock!
        </p>
      </div>

      <div className={styles.graphContainer}>
        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner}></div>
            <p>Loading Neo4j graph data...</p>
          </div>
        ) : error ? (
          <div className={styles.errorWrap}>
            <i className="fas fa-exclamation-triangle"></i>
            <p>Error: {error}</p>
            <small>Check that the backend is running on port 8000</small>
          </div>
        ) : nodes.length === 0 ? (
          <div className={styles.errorWrap}>
            <i className="fas fa-database"></i>
            <p>No graph data yet</p>
            <small>Click "Simulate" on Dashboard to generate deadlock data, then refresh this page.</small>
          </div>
        ) : (
          <div className={styles.graphVisual}>
            <svg viewBox="0 0 700 450" className={styles.graphSvg}>
              <defs>
                <marker id="arrowRed" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                </marker>
              </defs>

              {/* ✅ FIXED: use edges (not relationships), from/to fields */}
              {edges.map((edge, idx) => {
                const fromIdx = nodes.findIndex(n => n.id === edge.from);
                const toIdx = nodes.findIndex(n => n.id === edge.to);
                if (fromIdx === -1 || toIdx === -1) return null;
                const fromPos = getNodePosition(fromIdx, nodes.length);
                const toPos = getNodePosition(toIdx, nodes.length);

                // Midpoint for label
                const mx = (fromPos.x + toPos.x) / 2;
                const my = (fromPos.y + toPos.y) / 2;

                return (
                  <g key={idx}>
                    <line
                      x1={fromPos.x} y1={fromPos.y}
                      x2={toPos.x} y2={toPos.y}
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      strokeDasharray="8,4"
                      markerEnd="url(#arrowRed)"
                    />
                    <text x={mx} y={my - 8} textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">
                      WAITS_FOR
                    </text>
                    {edge.resource && (
                      <text x={mx} y={my + 12} textAnchor="middle" fill="#aaa" fontSize="9">
                        {edge.resource}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* ✅ FIXED: use nodes with id/name fields */}
              {nodes.map((node, idx) => {
                const pos = getNodePosition(idx, nodes.length);
                return (
                  <g key={node.id} onClick={() => setSelectedNode(node)} style={{ cursor: 'pointer' }}>
                    <circle
                      cx={pos.x} cy={pos.y} r={38}
                      fill={selectedNode?.id === node.id ? '#4a3aad' : '#2b225f'}
                      stroke={selectedNode?.id === node.id ? '#a78bfa' : '#fff'}
                      strokeWidth="3"
                    />
                    <text x={pos.x} y={pos.y - 6} textAnchor="middle" fill="white" fontSize="16">📦</text>
                    <text x={pos.x} y={pos.y + 16} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                      {node.name}
                    </text>
                    <text x={pos.x} y={pos.y + 28} textAnchor="middle" fill="#aaa" fontSize="8">
                      ID: {node.id}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className={styles.legend}>
              <div className={styles.legendTitle}>Legend</div>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ background: '#2b225f' }}></div>
                <span>Transaction Node</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendColorRed || styles.legendColor} style={{ background: '#ef4444' }}></div>
                <span>WAITS_FOR (deadlock edge)</span>
              </div>
            </div>

            {selectedNode && (
              <div className={styles.nodeInfo}>
                <div className={styles.nodeInfoHeader}>
                  <h4>Transaction Details</h4>
                  <button onClick={() => setSelectedNode(null)}>✕</button>
                </div>
                <div className={styles.nodeInfoContent}>
                  <p><strong>Name:</strong> {selectedNode.name}</p>
                  <p><strong>TX ID:</strong> {selectedNode.id}</p>
                  <p><strong>Waiting for:</strong> {edges.filter(e => e.from === selectedNode.id).map(e => nodes.find(n => n.id === e.to)?.name || e.to).join(', ') || 'none'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {graphData && (
        <div style={{ display: 'flex', gap: '16px', margin: '16px 24px', flexWrap: 'wrap' }}>
          <div style={{ background: '#1a1a2e', border: '1px solid #2b225f', borderRadius: '8px', padding: '12px 20px', minWidth: '120px' }}>
            <p style={{ color: '#aaa', fontSize: '12px', margin: 0 }}>Total Transactions</p>
            <p style={{ color: '#a78bfa', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{nodes.length}</p>
          </div>
          <div style={{ background: '#1a1a2e', border: '1px solid #2b225f', borderRadius: '8px', padding: '12px 20px', minWidth: '120px' }}>
            <p style={{ color: '#aaa', fontSize: '12px', margin: 0 }}>Wait-for Edges</p>
            <p style={{ color: '#ef4444', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{edges.length}</p>
          </div>
          {cycleData && (
            <div style={{ background: '#1a1a2e', border: `1px solid ${cycleData.deadlock_detected ? '#ef4444' : '#22c55e'}`, borderRadius: '8px', padding: '12px 20px', minWidth: '120px' }}>
              <p style={{ color: '#aaa', fontSize: '12px', margin: 0 }}>Cycles Found</p>
              <p style={{ color: cycleData.deadlock_detected ? '#ef4444' : '#22c55e', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{cycleData.cycles_found}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Neo4jGraphPage;
