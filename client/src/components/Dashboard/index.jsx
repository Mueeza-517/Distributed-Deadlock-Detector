import { useMemo } from 'react';
import styles from './styles.module.css';
import DeadlockList from '../DeadlockList';
import StatsChart from '../StatsChart';

const Dashboard = ({ deadlocks = [], loading, error, refresh, simulate }) => {
  const totalDetected = deadlocks.length;

  const resolved = deadlocks.filter(d => d.status === 'resolved').length;
  const active = loading ? 1 : 0;
  const pending = 0;

  const serverLocation = deadlocks[0]?.server_location || deadlocks[0]?.location || 'Lahore, PK';

  const chartResolved = resolved;
  const chartDetected = totalDetected;

  const databasesUsed = [
    { name: 'PostgreSQL', type: 'Relational', purpose: 'Transaction Metadata', icon: 'fa-database' },
    { name: 'Neo4j', type: 'Graph', purpose: 'Wait-for Graph', icon: 'fa-project-diagram' },
    { name: 'MongoDB', type: 'Document', purpose: 'Logs & Explanations', icon: 'fa-leaf' }
  ];

  return (
    <div className={styles.mainArea}>
      <div className={styles.topbar}>
        <div>
          <p className={styles.breadcrumb}>Dashboard / Overview</p>
          <h1 className={styles.pageTitle}>Welcome, Admin! </h1>
          <p className={styles.pageSub}>Here is the overview of your Deadlock Detector</p>
        </div>
        <div className={styles.topbarRight}>
          <button className={styles.refreshBtn} onClick={refresh} disabled={loading}>
            <i className="fas fa-sync-alt"></i>
            {loading ? ' Loading...' : ' Refresh'}
          </button>
          <button className={styles.simulateBtn} onClick={simulate} disabled={loading}>
            <i className="fas fa-bolt"></i>
            Simulate
          </button>
        </div>
      </div>

      <div className={styles.content}>

        {error && (
          <div className={styles.errorBanner}>
            <i className="fas fa-exclamation-triangle"></i>
            API Error: {error} — showing cached data
          </div>
        )}

        <div className={styles.statsRow}>
          <div className={`${styles.statCard} ${styles.statPurple}`}>
            <div className={styles.statIcon}>
              <i className="fas fa-search"></i>
            </div>
            <div>
              <p className={styles.statLabel}>Total Detected</p>
              <p className={styles.statValue}>{totalDetected}</p>
              <p className={styles.statChange}>↑ Live from API</p>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statPurple}`}>
            <div className={styles.statIcon}>
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <div>
              <p className={styles.statLabel}>Active Deadlocks</p>
              <p className={styles.statValue}>{active}</p>
              <p className={styles.statChange}>{active > 0 ? 'Detecting...' : 'All resolved'}</p>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statPurple}`}>
            <div className={styles.statIcon}>
              <i className="fas fa-check-circle"></i>
            </div>
            <div>
              <p className={styles.statLabel}>Resolved</p>
              <p className={styles.statValue}>{resolved}</p>
              <p className={styles.statChange}>Successfully cleared</p>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statPurple}`}>
            <div className={styles.statIcon}>
              <i className="fas fa-hourglass-half"></i>
            </div>
            <div>
              <p className={styles.statLabel}>Pending</p>
              <p className={styles.statValue}>{pending}</p>
              <p className={styles.statChange}>Awaiting resolution</p>
            </div>
          </div>
        </div>

        <div className={styles.midRow}>

          <div className={styles.card} style={{ flex: 1.5 }}>
            <div className={styles.cardHeader}>
              <p className={styles.cardTitle}>
                <i className="fas fa-chart-line"></i> Visual Representation
              </p>
            </div>
            <StatsChart resolved={chartResolved} detected={chartDetected} />
          </div>

          <div className={styles.databaseCard} style={{ flex: 1 }}>
            <div className={styles.cardHeader}>
              <p className={styles.cardTitle}>
                <i className="fas fa-database"></i> Databases Used In Resolving Deadlock
              </p>
            </div>
            
            <div className={styles.dbList}>
              {databasesUsed.map((db, idx) => (
                <div key={idx} className={styles.dbItem}>
                  <div className={styles.dbIcon}>
                    <i className={`fas ${db.icon}`}></i>
                  </div>
                  <div className={styles.dbInfo}>
                    <div className={styles.dbName}>{db.name}</div>
                    <div className={styles.dbType}>{db.type}</div>
                    <div className={styles.dbPurpose}>{db.purpose}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card} style={{ flex: 0.8 }}>
            <div className={styles.cardHeader}>
              <p className={styles.cardTitle}>
                <i className="fas fa-server"></i> Server Location
              </p>
            </div>
            
            <div className={styles.locationGlobeCenter}>
              <i className="fas fa-map-marker-alt"></i>
            </div>
            
            <div className={styles.locationCityCenter}>
              {serverLocation}
            </div>
         
            <div className={styles.locationStatusCenter}>
              <span className={styles.greenDot}></span>
              Online & Monitoring
            </div>
            
            <div className={styles.locationStatsNew}>
              <div className={styles.locStatNew}>
                <p className={styles.locStatValNew}>{totalDetected}</p>
                <p className={styles.locStatLabelNew}>Total Events</p>
              </div>
              <div className={styles.locStatDividerNew} />
              <div className={styles.locStatNew}>
                <p className={styles.locStatValNew}>{active}</p>
                <p className={styles.locStatLabelNew}>Active Now</p>
              </div>
              <div className={styles.locStatDividerNew} />
              <div className={styles.locStatNew}>
                <p className={styles.locStatValNew}>{resolved}</p>
                <p className={styles.locStatLabelNew}>Resolved</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardTitle}>
              <i className="fas fa-bug"></i> Deadlock Log — All Transactions
            </p>
            <span className={styles.cardBadge}>{totalDetected} total</span>
          </div>
          
          {loading && (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner}></div>
              <p><i className="fas fa-spinner fa-pulse"></i> Fetching deadlocks from API...</p>
            </div>
          )}
          
          <DeadlockList deadlocks={deadlocks} />
          
        </div>

      </div>
    </div>
  );
};

export default Dashboard;