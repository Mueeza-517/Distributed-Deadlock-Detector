import DeadlockCard from '../DeadlockCard';
import styles from './styles.module.css';

const DeadlockList = ({ deadlocks = [] }) => {
  if (deadlocks.length === 0) {
    return (
      <div className={styles.empty}>
        <p>🎉 No deadlocks detected right now!</p>
        <p className={styles.emptySub}>System is running smoothly.</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {deadlocks.map((d, i) => (
        <DeadlockCard key={d.id || d.transaction_id || i} deadlock={d} index={i} />
      ))}
    </div>
  );
};

export default DeadlockList;
