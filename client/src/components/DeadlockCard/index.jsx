import styles from './styles.module.css';

const statusConfig = {
  active:   { label: 'Active',   color: styles.statusRed    },
  detected: { label: 'Detected', color: styles.statusRed    },
  pending:  { label: 'Pending',  color: styles.statusOrange },
  resolved: { label: 'Resolved', color: styles.statusGreen  },
};

const DeadlockCard = ({ deadlock, index }) => {
  const status = statusConfig[deadlock.status] || statusConfig.detected;

  const formatTime = (ts) => {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <div className={styles.indexBadge}>#{index + 1}</div>
        <div>
          <p className={styles.txId}>
            Transaction ID: <strong>{deadlock.transaction_id || deadlock.id || `TXN-${index + 1}`}</strong>
          </p>
          <p className={styles.timestamp}>🕐 {formatTime(deadlock.timestamp)}</p>
        </div>
      </div>
      <div className={styles.right}>
        <span className={`${styles.statusBadge} ${status.color}`}>
          {status.label}
        </span>
      </div>
    </div>
  );
};

export default DeadlockCard;
