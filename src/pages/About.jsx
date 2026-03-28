import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Timeline from '../components/Timeline/Timeline';
import styles from './About.module.css';

export default function About() {
  const { t } = useTranslation();

  const infoCards = [
    { icon: '📍', label: t('about.location') },
    { icon: '🎓', label: t('about.education') },
    { icon: '🌐', label: t('about.languages') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <section className="section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t('about.title')}
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t('about.subtitle')}
          </motion.p>

          <motion.p
            className={styles.description}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('about.description')}
          </motion.p>

          <div className={styles.infoCards}>
            {infoCards.map((card, i) => (
              <motion.div
                key={i}
                className={`${styles.infoCard} glass glow-card`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              >
                <span className={styles.infoIcon}>{card.icon}</span>
                <span className={styles.infoLabel}>{card.label}</span>
              </motion.div>
            ))}
          </div>

          <Timeline />
        </div>
      </section>
    </motion.div>
  );
}
