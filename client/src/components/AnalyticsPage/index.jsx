import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { deadlockAPI } from '../../services/api';
import styles from './styles.module.css';

const AnalyticsPage = ({ deadlocks = [] }) => {
  const [stats, setStats] = useState({
    total_deadlocks: 0,
    avg_resolution_ms: 0,
    most_affected_resource: 'N/A',
    active_nodes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await deadlockAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for charts (will be replaced with real data from backend)
  const monthlyData = [
    { month: 'Jan', deadlocks: 29, resolved: 25 },
    { month: 'Feb', deadlocks: 35, resolved: 32 },
    { month: 'Mar', deadlocks: 42, resolved: 38 },
    { month: 'Apr', deadlocks: 38, resolved: 36 },
    { month: 'May', deadlocks: 45, resolved: 42 },
    { month: 'Jun', deadlocks: 52, resolved: 48 }
  ];

  const hourlyData = [
    { hour: '00', deadlocks: 4 },
    { hour: '04', deadlocks: 2 },
    { hour: '08', deadlocks: 7 },
    { hour: '12', deadlocks: 12 },
    { hour: '16', deadlocks: 9 },
    { hour: '20', deadlocks: 5 }
  ];

  return (
    <div className={styles.container}>
      
      {/* Title */}
      <div className={styles.titleSection}>
        <i className="fas fa-chart-line"></i>
        <h1>Analytics</h1>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <i className="fas fa-chart-simple"></i>
          <div>
            <p className={styles.statLabel}>Total Deadlocks</p>
            <p className={styles.statValue}>{stats.total_deadlocks}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <i className="fas fa-clock"></i>
          <div>
            <p className={styles.statLabel}>Avg Resolution</p>
            <p className={styles.statValue}>{stats.avg_resolution_ms}ms</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <i className="fas fa-database"></i>
          <div>
            <p className={styles.statLabel}>Most Affected</p>
            <p className={styles.statValue}>{stats.most_affected_resource}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <i className="fas fa-microchip"></i>
          <div>
            <p className={styles.statLabel}>Active Nodes</p>
            <p className={styles.statValue}>{stats.active_nodes}</p>
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <i className="fas fa-chart-bar"></i>
          <h3>Monthly Deadlock Trends</h3>
        </div>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eaff" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8a8fba' }} />
              <YAxis tick={{ fontSize: 11, fill: '#8a8fba' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', borderRadius: 8, border: '1px solid #e8eaff' }}
                labelStyle={{ color: '#1a1f3a' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="deadlocks" fill="#2b225f" name="Detected" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" fill="#3e39a3" name="Resolved" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Pattern Chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <i className="fas fa-chart-line"></i>
          <h3>Hourly Deadlock Pattern</h3>
        </div>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eaff" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#8a8fba' }} />
              <YAxis tick={{ fontSize: 11, fill: '#8a8fba' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', borderRadius: 8, border: '1px solid #e8eaff' }}
                labelStyle={{ color: '#1a1f3a' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line 
                type="monotone" 
                dataKey="deadlocks" 
                stroke="#2b225f" 
                strokeWidth={2}
                name="Deadlocks"
                dot={{ fill: '#2b225f', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsPage;