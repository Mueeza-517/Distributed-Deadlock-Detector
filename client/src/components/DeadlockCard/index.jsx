import { useState } from 'react';
import styles from './styles.module.css';

const statusConfig = {
  active:   { label: 'Active',   color: styles.statusRed    },
  detected: { label: 'Detected', color: styles.statusRed    },
  pending:  { label: 'Pending',  color: styles.statusOrange },
  resolved: { label: 'Resolved', color: styles.statusGreen  },
};

const parseSections = (text) => {
  if (!text) return {};
  const sections = {};
  const names = [
    "SITUATION", "ROOT CAUSE",
    "VICTIM SELECTION", "RESOLUTION", "PREVENTION"
  ];
  names.forEach((name, i) => {
    const start = text.indexOf(`## ${name}:`);
    const end = i < names.length - 1
      ? text.indexOf(`## ${names[i + 1]}:`)
      : text.length;
    if (start !== -1) {
      sections[name] = text.slice(start + name.length + 4, end).trim();
    }
  });
  return sections;
};

const DeadlockCard = ({ deadlock, index }) => {
  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(false);

  const status = statusConfig[deadlock.status] || statusConfig.detected;

  const formatTime = (ts) => {
    if (!ts) return '—';
    try { return new Date(ts).toLocaleString(); }
    catch { return ts; }
  };

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/explanation/${deadlock.id}`
      );
      const data = await res.json();
      setPopup(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const sections = popup ? parseSections(popup.llm_response) : {};

  return (
    <>
      <div
        className={styles.card}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        <div className={styles.left}>
          <div className={styles.indexBadge}>#{index + 1}</div>
          <div>
            <p className={styles.txId}>
              Transaction ID:{' '}
              <strong>
                {deadlock.transaction_id || deadlock.id || `TXN-${index + 1}`}
              </strong>
            </p>
            <p className={styles.timestamp}>
              <i className="far fa-clock"></i> {formatTime(deadlock.timestamp)}
            </p>
          </div>
        </div>
        <div className={styles.right}>
          <span className={`${styles.statusBadge} ${status.color}`}>
            {loading ? <i className="fas fa-spinner fa-pulse"></i> : status.label}
          </span>
        </div>
      </div>

      {popup && (
        <div className={styles.popupBox} onClick={(e) => e.stopPropagation()}>
          <div className={styles.popupBox} onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className={styles.popupHeader}>
              <div className={styles.headerIcon}>
                <i className="fas fa-robot"></i>
              </div>
              <h2 className={styles.popupTitle}>AI Deadlock Analysis</h2>
              <button className={styles.closeBtn} onClick={() => setPopup(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className={styles.popupContent}>
              {/* Event ID */}
              <div className={styles.eventId}>
                <i className="fas fa-hashtag"></i>
                <span>Event #{deadlock.id}</span>
              </div>

              {[
                { key: 'SITUATION', icon: <i className="fas fa-info-circle"></i> },
                { key: 'ROOT CAUSE', icon: <i className="fas fa-search"></i> },
                { key: 'VICTIM SELECTION', icon: <i className="fas fa-crosshairs"></i> },
                { key: 'RESOLUTION', icon: <i className="fas fa-check-circle"></i> },
                { key: 'PREVENTION', icon: <i className="fas fa-shield-alt"></i> },
              ].map(({ key, icon }) =>
                sections[key] ? (
                  <div key={key} className={styles.section}>
                    <div className={styles.sectionTitle}>
                      {icon} {key}
                    </div>
                    <div className={styles.sectionBody}>
                      {sections[key]}
                    </div>
                  </div>
                ) : null
              )}

              {popup.suggested_fix && (
                <div className={styles.fixBox}>
                  <div className={styles.fixTitle}>
                    <i className="fas fa-exclamation-triangle"></i> Suggested Fix
                  </div>
                  <div className={styles.fixBody}>{popup.suggested_fix}</div>
                </div>
              )}
            </div>

            <div className={styles.popupFooter}>
              <button className={styles.footerCloseBtn} onClick={() => setPopup(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeadlockCard;