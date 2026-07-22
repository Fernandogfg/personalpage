import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import styles from './ModeToggle.module.css';

export default function ModeToggle() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isClient = location.pathname.startsWith('/client');

  const handleToggle = () => {
    navigate(isClient ? '/' : '/client');
  };

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={handleToggle}
      aria-label={isClient ? 'Switch to recruiter view' : 'Switch to client view'}
    >
      <span className={`${styles.label} ${isClient ? styles.activeLabel : ''}`}>
        {t('mode_toggle.clients')}
      </span>
      <div className={styles.track}>
        <motion.div
          className={styles.thumb}
          animate={{ x: isClient ? 0 : 24 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
      <span className={`${styles.label} ${!isClient ? styles.activeLabel : ''}`}>
        {t('mode_toggle.recruiters')}
      </span>
    </button>
  );
}