import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

const Neo4jGraphPage = () => {
  const [graphData, setGraphData] = useState(null);
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
      const response = await fetch('http://localhost:8000/api/v1/neo4j/graph');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setGraphData(data);
    } catch (err) {
      console.error('Failed to fetch Neo4j graph data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getNodeColor = (type) => {
    if (type === 'transaction') return '#2b225f';
    return '#f59e0b';
  };

  const getNodePosition = (nodeId) => {
    const positions = {
      'Tx_1': { x: 150, y: 200 },
      'Tx_2': { x: 550, y: 200 },
      'Res_1': { x: 250, y: 350 },
      'Res_2': { x: 450, y: 350 },
    };
    return positions[nodeId] || { x: 350, y: 250 };
  };

  return (
    <div className={styles.container}>
      
      {/* Title Section */}
      <div className={styles.titleSection}>
        <i className="fas fa-project-diagram"></i>
        <h1 className={styles.title}>Graph</h1>
        <button className={styles.refreshBtn} onClick={fetchGraphData} disabled={loading}>
          <i className="fas fa-sync-alt"></i>
          {loading ? ' Loading...' : ' Refresh'}
        </button>
      </div>

      <div className={styles.infoCard}>
        <p>
          This graph shows the wait-for relationships between transactions and resources in real-time. 
          Neo4j builds this graph by analyzing lock acquisition patterns across distributed nodes. 
          Green edges represent HOLDING relationships, while red dashed edges represent WAITING_FOR relationships. 
          When a circular wait (cycle) is detected in this graph, a deadlock is identified.
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
            <small>Unable to load graph data from server</small>
          </div>
        ) : graphData ? (
          <div className={styles.graphVisual}>
            <svg viewBox="0 0 700 450" className={styles.graphSvg}>
              <defs>
                <marker id="arrowGreen" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
                </marker>
                <marker id="arrowRed" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                </marker>
              </defs>

              {graphData?.relationships?.map((rel, idx) => {
                const fromPos = getNodePosition(rel.from);
                const toPos = getNodePosition(rel.to);
                const isWaiting = rel.type === 'WAITING_FOR';
                
                return (
                  <g key={idx}>
                    <line
                      x1={fromPos.x}
                      y1={fromPos.y}
                      x2={toPos.x}
                      y2={toPos.y}
                      stroke={isWaiting ? '#ef4444' : '#22c55e'}
                      strokeWidth="3"
                      strokeDasharray={isWaiting ? "8,5" : "none"}
                      markerEnd={`url(#arrow${isWaiting ? 'Red' : 'Green'})`}
                    />
                    <text
                      x={(fromPos.x + toPos.x) / 2}
                      y={(fromPos.y + toPos.y) / 2 - 8}
                      textAnchor="middle"
                      fill={isWaiting ? '#ef4444' : '#22c55e'}
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {rel.type}
                    </text>
                  </g>
                );
              })}

              {graphData?.nodes?.map((node) => {
                const pos = getNodePosition(node.id);
                const isTransaction = node.type === 'transaction';
                
                return (
                  <g key={node.id} onClick={() => setSelectedNode(node)} style={{ cursor: 'pointer' }}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isTransaction ? 35 : 30}
                      fill={getNodeColor(node.type)}
                      stroke="#fff"
                      strokeWidth="3"
                    />
                    <text x={pos.x} y={pos.y - 5} textAnchor="middle" fill="white" fontSize="14">
                      {isTransaction ? '📦' : '🗄️'}
                    </text>
                    <text x={pos.x} y={pos.y + 20} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className={styles.legend}>
              <div className={styles.legendTitle}>Legend</div>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ background: '#2b225f' }}></div>
                <span>Transaction</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ background: '#f59e0b' }}></div>
                <span>Resource</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ background: '#22c55e' }}></div>
                <span>HOLDING</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendColorRed}></div>
                <span>WAITING_FOR</span>
              </div>
            </div>

            {selectedNode && (
              <div className={styles.nodeInfo}>
                <div className={styles.nodeInfoHeader}>
                  <h4>Node Details</h4>
                  <button onClick={() => setSelectedNode(null)}>✕</button>
                </div>
                <div className={styles.nodeInfoContent}>
                  <p><strong>Name:</strong> {selectedNode.name}</p>
                  <p><strong>Type:</strong> {selectedNode.type || 'unknown'}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.errorWrap}>
            <i className="fas fa-database"></i>
            <p>No graph data available</p>
            <small>Waiting for data from Neo4j database</small>
          </div>
        )}
      </div>

    </div>
  );
};

export default Neo4jGraphPage;