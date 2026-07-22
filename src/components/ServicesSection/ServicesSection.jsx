import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import styles from './ServicesSection.module.css';

const serviceIcons = {
  websites: '🌐',
  webapps: '⚡',
  apis: '🔗',
  maintenance: '🔧',
};

export default function ServicesSection() {
  const { t } = useTranslation();
  const serviceKeys = ['websites', 'webapps', 'apis', 'maintenance'];

  return (
    <section className="section" id="services">
      <div className="container">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('services.title')}
        </motion.h2>
        <motion.p
          className="section-subtitle"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {t('services.subtitle')}
        </motion.p>

        <div className={styles.grid}>
          {serviceKeys.map((key, i) => (
            <motion.div
              key={key}
              className={`${styles.card} glass glow-card`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            >
              <span className={styles.icon}>{serviceIcons[key]}</span>
              <h3 className={styles.cardTitle}>
                {t(`services.items.${key}.title`)}
              </h3>
              <p className={styles.cardDesc}>
                {t(`services.items.${key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}