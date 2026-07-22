import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import styles from './ModeToggle.module.css';

export default function ModeToggle() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isRecruiter = location.pathname.startsWith('/recruiter');

  const handleToggle = () => {
    navigate(isRecruiter ? '/' : '/recruiter');
  };

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={handleToggle}
      aria-label={isRecruiter ? 'Switch to client view' : 'Switch to recruiter view'}
    >
      <span className={`${styles.label} ${!isRecruiter ? styles.activeLabel : ''}`}>
        {t('mode_toggle.clients')}
      </span>
      <div className={styles.track}>
        <motion.div
          className={styles.thumb}
          animate={{ x: isRecruiter ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
      <span className={`${styles.label} ${isRecruiter ? styles.activeLabel : ''}`}>
        {t('mode_toggle.recruiters')}
      </span>
    </button>
  );
}