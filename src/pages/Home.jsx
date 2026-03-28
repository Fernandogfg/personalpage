import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTypingEffect } from '../hooks/useTypingEffect';
import styles from './Home.module.css';

export default function Home() {
  const { t } = useTranslation();
  const roles = t('hero.roles', { returnObjects: true });
  const typedText = useTypingEffect(roles);

  return (
    <motion.div
      className={styles.hero}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.content}>
        <motion.p
          className={styles.greeting}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {t('hero.greeting')}
        </motion.p>

        <motion.h1
          className={styles.name}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {t('hero.name')}
        </motion.h1>

        <motion.div
          className={styles.typingWrapper}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <span className={styles.typedText}>{typedText}</span>
          <span className={styles.cursor}>|</span>
        </motion.div>

        <motion.div
          className={styles.buttons}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Link to="/projects" className="btn btn-primary">
            {t('hero.cta_projects')}
          </Link>
          <a href="#" className="btn btn-outline">
            {t('hero.cta_cv')}
          </a>
        </motion.div>
      </div>

      <motion.div
        className={styles.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <div className={styles.chevron}></div>
      </motion.div>
    </motion.div>
  );
}
