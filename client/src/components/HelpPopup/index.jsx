import React, { useEffect } from 'react';
import styles from './styles.module.css';

const HelpPopup = ({ isOpen, onClose }) => {
  // ESC key se close karne ke liye
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <i className="fas fa-question-circle"></i>
          </div>
          <h2 className={styles.title}>Help & Instructions</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {/* Content */}
        <div className={styles.content}>
          <div className={styles.section}>
            <h3>
              <i className="fas fa-info-circle"></i>
              About
            </h3>
            <p>
              This system detects and resolves database deadlocks in distributed environments 
              using PostgreSQL, Neo4j, and MongoDB.
            </p>
          </div>

          <div className={styles.section}>
            <h3>
              <i className="fas fa-play-circle"></i>
              How to Use
            </h3>
            <ul>
              <li><strong>Simulate:</strong> Click the Simulate button to create a test deadlock</li>
              <li><strong>Refresh:</strong> Click Refresh to fetch latest deadlocks from database</li>
              <li><strong>View Details:</strong> Click on any deadlock card to expand and see AI analysis</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3>
              <i className="fas fa-database"></i>
              Databases Used
            </h3>
            <div className={styles.dbTags}>
              <span className={styles.dbTag}>PostgreSQL</span>
              <span className={styles.dbTag}>Neo4j</span>
              <span className={styles.dbTag}>MongoDB</span>
            </div>
          </div>

          <div className={styles.section}>
            <h3>
              <i className="fas fa-chart-line"></i>
              Dashboard Features
            </h3>
            <ul>
              <li>Real-time deadlock monitoring</li>
              <li>AI-powered deadlock explanations</li>
              <li>Transaction conflict analysis</li>
              <li>Database health status</li>
            </ul>
          </div>
        </div>

        {/* Footer with Close Button */}
        <div className={styles.footer}>
          <button className={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPopup;