import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import styles from './Timeline.module.css';

const timelineKeys = ['2017a', '2017b', '2022', '2022b', 'now'];

export default function Timeline() {
  const { t } = useTranslation();

  return (
    <div className={styles.timeline}>
      <div className={styles.line} />
      {timelineKeys.map((key, index) => (
        <motion.div
          key={key}
          className={`${styles.entry} ${index % 2 === 0 ? styles.left : styles.right}`}
          initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <div className={styles.badge}>{key === 'now' ? '✦' : key.replace(/[ab]$/, '')}</div>
          <div className={`${styles.card} glass glow-card`}>
            <h3 className={styles.cardTitle}>
              {t(`about.timeline.${key}.title`)}
            </h3>
            <p className={styles.cardDesc}>
              {t(`about.timeline.${key}.desc`)}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
