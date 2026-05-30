import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

const Neo4jGraphPage = () => {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => { fetchGraphData(); }, []);

  const fetchGraphData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/v1/graph');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const graph = await res.json();

      const allNodes = graph.nodes || [];
      const allEdges = graph.edges || [];
      const nodesInCycle = new Set();
      const edgesInCycle = [];

      allEdges.forEach(edge => {
        const hasReverse = allEdges.some(e => e.from === edge.to && e.to === edge.from);
        if (hasReverse) {
          nodesInCycle.add(edge.from);
          nodesInCycle.add(edge.to);
          if (!edgesInCycle.some(e => e.from === edge.from && e.to === edge.to))
            edgesInCycle.push(edge);
          const rev = allEdges.find(e => e.from === edge.to && e.to === edge.from);
          if (rev && !edgesInCycle.some(e => e.from === rev.from && e.to === rev.to))
            edgesInCycle.push(rev);
        }
      });

      setGraphData({
        nodes: nodesInCycle.size > 0 ? allNodes.filter(n => nodesInCycle.has(n.id)) : [],
        edges: edgesInCycle,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (name) => {
    if (!name) return '';
    if (name.includes('_')) return 'TX-' + name.split('_').slice(1).join('_').toUpperCase();
    if (name.toUpperCase().startsWith('TX-')) return name.toUpperCase();
    return 'TX-' + name.toUpperCase();
  };

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  const SVG_SIZE = 550;
  const CX = SVG_SIZE / 2;
  const CY = SVG_SIZE / 2;

  const getNodeR = (n) => {
    if (n <= 2) return 38;
    if (n <= 4) return 34;
    if (n <= 6) return 30;
    return 26;
  };

  const getLayoutR = (n) => {
    if (n <= 2) return 140;
    if (n <= 4) return 160;
    if (n <= 6) return 180;
    return 200;
  };

  const NODE_R = getNodeR(nodes.length);
  const LAYOUT_R = getLayoutR(nodes.length);
  const ARROW_COLOR = '#2b225f';

  const getNodePos = (idx, total) => {
    const angle = (2 * Math.PI * idx) / total - Math.PI / 2;
    return {
      x: CX + LAYOUT_R * Math.cos(angle),
      y: CY + LAYOUT_R * Math.sin(angle),
    };
  };

  const getNodeFontSize = (n) => {
    if (n <= 2) return 12;
    if (n <= 4) return 11;
    if (n <= 6) return 10;
    return 9;
  };
  const NODE_FONT = getNodeFontSize(nodes.length);

  const renderEdges = () => {
    if (nodes.length < 2) return null;

    return edges.map((edge, idx) => {
      const fi = nodes.findIndex(n => n.id === edge.from);
      const ti = nodes.findIndex(n => n.id === edge.to);
      if (fi === -1 || ti === -1) return null;

      const fp = getNodePos(fi, nodes.length);
      const tp = getNodePos(ti, nodes.length);

      const dx = tp.x - fp.x;
      const dy = tp.y - fp.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 1) return null;
      
      const ux = dx / dist;
      const uy = dy / dist;
      
      const mx = (fp.x + tp.x) / 2;
      const my = (fp.y + tp.y) / 2;

      const hasReverse = edges.some(e => e.from === edge.to && e.to === edge.from);

      let curveOffset = 0;
      if (hasReverse) {
        curveOffset = edge.from < edge.to ? -45 : 45;
      }

      const perpX = -uy;
      const perpY = ux;
      const ctrlX = mx + perpX * curveOffset;
      const ctrlY = my + perpY * curveOffset;

      const startX = fp.x + ux * NODE_R;
      const startY = fp.y + uy * NODE_R;
      const endX = tp.x - ux * NODE_R;
      const endY = tp.y - uy * NODE_R;

      const markerId = `arr-${edge.from}-${edge.to}-${idx}`;

      return (
        <g key={`${edge.from}-${edge.to}-${idx}`}>
          <defs>
            <marker
              id={markerId}
              markerWidth="7"
              markerHeight="5"
              refX="6"
              refY="2.5"
              orient="auto"
            >
              <polygon points="0 0, 7 2.5, 0 5" fill={ARROW_COLOR} />
            </marker>
          </defs>
          
          <path
            d={`M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`}
            fill="none"
            stroke={ARROW_COLOR}
            strokeWidth="1.8"
            markerEnd={`url(#${markerId})`}
          />
          
          {dist > 50 && (
            <text
              x={ctrlX + perpX * (curveOffset > 0 ? 18 : -18)}
              y={ctrlY + perpY * (curveOffset > 0 ? 18 : -18)}
              textAnchor="middle"
              fill={ARROW_COLOR}
              fontSize="8"
              fontWeight="700"
            >
              WAITS_FOR
            </text>
          )}
        </g>
      );
    });
  };

  const renderNodes = () => {
    if (nodes.length === 0) return null;

    return nodes.map((node, idx) => {
      const pos = getNodePos(idx, nodes.length);
      const display = getDisplayName(node.name);
      const sel = selectedNode?.id === node.id;

      return (
        <g
          key={node.id}
          onClick={() => setSelectedNode(sel ? null : node)}
          style={{ cursor: 'pointer' }}
        >
          <circle
            cx={pos.x}
            cy={pos.y}
            r={NODE_R}
            fill={ARROW_COLOR}
            stroke={sel ? ' #3e39a3' : '#3d3380'}
            strokeWidth="2"
          />
          <text
            x={pos.x}
            y={pos.y + 2}
            textAnchor="middle"
            fill="white"
            fontSize={NODE_FONT}
            fontWeight="700"
          >
            {display}
          </text>
          <text
            x={pos.x}
            y={pos.y + NODE_FONT + 4}
            textAnchor="middle"
            fill=" #ffffff"
            fontSize={NODE_FONT - 2}
          >
            ID: {node.id}
          </text>
        </g>
      );
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <i className="fas fa-project-diagram" />
          <h1 className={styles.title}>Wait-for Graph</h1>
        </div>
        <button className={styles.refreshBtn} onClick={fetchGraphData} disabled={loading}>
          <i className={`fas fa-sync-alt ${loading ? styles.spinning : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className={styles.divider} />

      {!loading && nodes.length > 0 && (
        <div className={styles.infoContainer}>
          <i className="fas fa-exclamation-triangle" style={{ color: '#2b225f', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
          <p className={styles.infoText}>
             Deadlock detected! A circular wait has been identified between{' '} 
            <strong>{nodes.length} transactions</strong>.
          </p>
        </div>
      )}

      <div className={styles.graphCard}>
        {loading ? (
          <div className={styles.centerState}>
            <div className={styles.spinner} />
            <p>Fetching graph data...</p>
          </div>
        ) : error ? (
          <div className={styles.centerState}>
            <div className={styles.errorIcon}>!</div>
            <p className={styles.errorText}>Connection failed: {error}</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className={styles.centerState}>
            <i className="fas fa-check-circle" style={{ fontSize: 34, color: '#6ee7b7' }} />
            <p>No deadlock detected</p>
            <small>Simulate a deadlock to visualize</small>
          </div>
        ) : (
          <div className={styles.graphBody}>
            <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className={styles.svg}>
              {renderEdges()}
              {renderNodes()}
            </svg>

            {selectedNode && (
              <div className={styles.infoPanel}>
                <div className={styles.infoPanelHeader}>
                  <span className={styles.infoPanelTitle}>{getDisplayName(selectedNode.name)}</span>
                  <button className={styles.infoPanelClose} onClick={() => setSelectedNode(null)}>✕</button>
                </div>
                <div className={styles.infoPanelRow}>
                  <span className={styles.infoPanelLabel}>TX ID</span>
                  <span className={styles.infoPanelValue}>{selectedNode.id}</span>
                </div>
                <div className={styles.infoPanelRow}>
                  <span className={styles.infoPanelLabel}>Waiting For</span>
                  <span className={styles.infoPanelValue}>
                    {edges.filter(e => e.from === selectedNode.id).map(e => getDisplayName(nodes.find(n => n.id === e.to)?.name)).join(', ') || '—'}
                  </span>
                </div>
                <div className={styles.infoPanelRow}>
                  <span className={styles.infoPanelLabel}>Waited By</span>
                  <span className={styles.infoPanelValue}>
                    {edges.filter(e => e.to === selectedNode.id).map(e => getDisplayName(nodes.find(n => n.id === e.from)?.name)).join(', ') || '—'}
                  </span>
                </div>
              </div>
            )}

            <div className={styles.legend}>
              <div className={styles.legendRow}>
                <span className={styles.legendCircle} />
                <span>Transaction Node</span>
              </div>
              <div className={styles.legendRow}>
                <span className={styles.legendArrow}>→</span>
                <span>WAITS_FOR (Deadlock Edge)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Neo4jGraphPage;