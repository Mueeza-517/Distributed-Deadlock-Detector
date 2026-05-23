import styles from './styles.module.css';

const StatsChart = ({
  resolved = 60,
  detected = 40,
}) => {
  const total = resolved + detected;

  const resolvedPercent = Math.round((resolved / total) * 100);
  const detectedPercent = Math.round((detected / total) * 100);

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
            <span>{resolvedPercent}%</span>
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