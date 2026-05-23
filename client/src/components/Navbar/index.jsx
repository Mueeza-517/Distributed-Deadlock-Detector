import { useState } from 'react';
import styles from './styles.module.css';

const NavItem = ({ icon, label, active, onClick }) => (
  <div
    className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
    onClick={onClick}
  >
    <span className={styles.navIcon}>{icon}</span>
    <span>{label}</span>
  </div>
);

const Navbar = () => {
  const [activeItem, setActiveItem] = useState('overview');

  const menuItems = [
    { id: 'overview', icon: <i className="fas fa-chart-pie"></i>, label: 'Business Overview' },
    { id: 'analytics', icon: <i className="fas fa-chart-line"></i>, label: 'Analytics' },
    { id: 'transactions', icon: <i className="fas fa-exchange-alt"></i>, label: 'Transactions' },
    { id: 'deadlocks', icon: <i className="fas fa-exclamation-triangle"></i>, label: 'Deadlocks' },
    { id: 'shared', icon: <i className="fas fa-share-alt"></i>, label: 'Shared' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoWrap}>
        <div>
          <p className={styles.logoTitle}>DEADLOCK</p>
          <p className={styles.logoSub}>DETECTOR</p>
        </div>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <NavItem 
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeItem === item.id}
            onClick={() => setActiveItem(item.id)}
          />
        ))}
      </nav>

      <div className={styles.navBottom}>
        <NavItem icon={<i className="fas fa-question-circle"></i>} label="Help" active={activeItem === 'help'} onClick={() => setActiveItem('help')} />
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            <i className="fas fa-user"></i>
          </div>
          <div>
            <p className={styles.userName}>Admin</p>
            <p className={styles.userRole}>Deadlock Monitor</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Navbar;