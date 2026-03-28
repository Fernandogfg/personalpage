import { motion } from 'framer-motion';
import styles from './SkillCard.module.css';

export default function SkillCard({ name, level, delay = 0 }) {
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div className={styles.header}>
        <span className={styles.name}>{name}</span>
        <span className={styles.level}>{level}%</span>
      </div>
      <div className={styles.barBg}>
        <motion.div
          className={styles.barFill}
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: delay + 0.3, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}
