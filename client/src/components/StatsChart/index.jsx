import styles from './styles.module.css';

// FIX: props resolved aur detected accept karo — default 0
const StatsChart = ({
  resolved = 0,
  detected = 0,
}) => {
  const total = resolved + detected;

  // Agar koi data nahi toh equal split dikhao
  const resolvedPercent = total > 0 ? Math.round((resolved / total) * 100) : 50;
  const detectedPercent = total > 0 ? Math.round((detected / total) * 100) : 50;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Statistics</h3>
      </div>

      <div className={styles.chartContainer}>
        <div
          className={styles.pie}
          style={{
            background: `conic-gradient(
              #3e39a3 0% ${resolvedPercent}%,
              #2b225f ${resolvedPercent}% 100%
            )`,
          }}
        >
          <div className={styles.innerCircle}>
            <span>{total > 0 ? `${resolvedPercent}%` : '—'}</span>
          </div>
        </div>

        <div className={styles.labels}>
          <div className={styles.labelItem}>
            <span
              className={styles.color}
              style={{ background: '#6c63ff' }}
            />
            <p>Deadlock Resolved</p>
            <strong>{resolved}</strong>
          </div>

          <div className={styles.labelItem}>
            <span
              className={styles.color}
              style={{ background: '#2b225f' }}
            />
            <p>Deadlock Detected</p>
            <strong>{detected}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsChart;