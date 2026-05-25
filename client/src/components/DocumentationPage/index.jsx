import React from 'react';
import styles from './styles.module.css';

const DocumentationPage = () => {
  return (
    <div className={styles.container}>
      
      {/* Title */}
      <div className={styles.titleSection}>
        <i className="fas fa-file-alt"></i>
        <h1>Documentation</h1>
      </div>

      {/* Why This Project? */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <i className="fas fa-question-circle"></i>
          <h2>Why This Project?</h2>
        </div>
        <div className={styles.whyGrid}>
          <div className={styles.whyItem}>
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Problem</h3>
            <p>In distributed systems, deadlocks freeze transactions. Traditional databases detect deadlocks AFTER they happen, causing delays and performance issues.</p>
          </div>
          <div className={styles.whyItem}>
            <i className="fas fa-lightbulb"></i>
            <h3>Solution</h3>
            <p>An AI-powered system that detects deadlocks in real-time and provides human-readable explanations with actionable fixes.</p>
          </div>
          <div className={styles.whyItem}>
            <i className="fas fa-rocket"></i>
            <h3>Impact</h3>
            <p>Reduce system downtime, improve database performance, and prevent transaction conflicts before they occur.</p>
          </div>
        </div>
      </div>

      {/* Technologies Used */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <i className="fas fa-microchip"></i>
          <h2>Technologies Used</h2>
        </div>
        <div className={styles.techGrid}>
          <div className={styles.techItem}>
            <i className="fab fa-react"></i>
            <div>
              <h4>React + Vite</h4>
              <p>Frontend framework with fast build tool and hot reload</p>
            </div>
          </div>
          <div className={styles.techItem}>
            <i className="fab fa-python"></i>
            <div>
              <h4>FastAPI</h4>
              <p>High-performance Python backend with automatic API docs</p>
            </div>
          </div>
          <div className={styles.techItem}>
            <i className="fas fa-database"></i>
            <div>
              <h4>PostgreSQL</h4>
              <p>Transaction metadata and lock history storage</p>
            </div>
          </div>
          <div className={styles.techItem}>
            <i className="fas fa-project-diagram"></i>
            <div>
              <h4>Neo4j</h4>
              <p>Wait-for graph construction and cycle detection</p>
            </div>
          </div>
          <div className={styles.techItem}>
            <i className="fas fa-leaf"></i>
            <div>
              <h4>MongoDB</h4>
              <p>Logs and AI explanations storage</p>
            </div>
          </div>
          <div className={styles.techItem}>
            <i className="fas fa-robot"></i>
            <div>
              <h4>HuggingFace LLM</h4>
              <p>AI-powered deadlock analysis and explanations</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <i className="fas fa-cogs"></i>
          <h2>How It Works</h2>
        </div>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNum}>1</div>
            <div>
              <h4>Data Collection</h4>
              <p>Every lock acquisition and transaction is logged in PostgreSQL with timestamps, resources, and transaction IDs across distributed nodes.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNum}>2</div>
            <div>
              <h4>Graph Construction</h4>
              <p>Neo4j builds a "wait-for graph" where nodes represent transactions and resources, and edges represent waiting relationships.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNum}>3</div>
            <div>
              <h4>Cycle Detection</h4>
              <p>When a cycle is detected in the graph, a deadlock is identified. The system analyzes involved transactions and resources.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNum}>4</div>
            <div>
              <h4>AI Analysis</h4>
              <p>LLM generates structured analysis including situation, root cause, victim selection, resolution, and prevention tips.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNum}>5</div>
            <div>
              <h4>Real-time Dashboard</h4>
              <p>React dashboard displays deadlocks, statistics, transaction conflicts, and database health in real-time.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DocumentationPage;