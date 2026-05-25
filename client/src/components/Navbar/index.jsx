import { useState } from 'react';
import styles from './styles.module.css';
import HelpPopup from '../HelpPopup';

const NavItem = ({ icon, label, active, onClick }) => (
  <div
    className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
    onClick={onClick}
  >
    <span className={styles.navIcon}>{icon}</span>
    <span>{label}</span>
  </div>
);

const Navbar = ({ onPageChange }) => {
  const [activeItem, setActiveItem] = useState('overview');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Saare menu items - Sab dikhenge
  const menuItems = [
    { id: 'overview', icon: <i className="fas fa-chart-pie"></i>, label: 'Overview' },
    { id: 'analytics', icon: <i className="fas fa-chart-line"></i>, label: 'Analytics' },
    { id: 'documentation', icon: <i className="fas fa-file-alt"></i>, label: 'Documentation' },
    { id: 'deadlocks', icon: <i className="fas fa-exclamation-triangle"></i>, label: 'Deadlocks' },
    { id: 'shared', icon: <i className="fas fa-share-alt"></i>, label: 'Shared' },
  ];

  const handleMenuItemClick = (id) => {
    setActiveItem(id);
    if (onPageChange) {
      onPageChange(id);
    }
  };

  const handleHelpClick = () => {
    setIsHelpOpen(true);
  };

  return (
    <>
      <aside className={styles.sidebar}>
        {/* Logo Section */}
        <div className={styles.logoWrap}>
          <div>
            <p className={styles.logoTitle}>DEADLOCK</p>
            <p className={styles.logoSub}>DETECTOR</p>
          </div>
        </div>

        {/* Navigation Menu - Saare items yahan dikhenge */}
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <NavItem 
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeItem === item.id}
              onClick={() => handleMenuItemClick(item.id)}
            />
          ))}
        </nav>

        {/* Bottom Section */}
        <div className={styles.navBottom}>
          {/* Help Button */}
          <NavItem 
            icon={<i className="fas fa-question-circle"></i>} 
            label="Help" 
            active={activeItem === 'help'} 
            onClick={handleHelpClick}
          />
          
          {/* User Card */}
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

      {/* Help Popup */}
      <HelpPopup isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
};

export default Navbar;