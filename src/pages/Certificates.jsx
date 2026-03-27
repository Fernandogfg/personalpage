import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CertificateCard from '../components/CertificateCard/CertificateCard';
import { certificates } from '../data/certificates';
import styles from './Certificates.module.css';

export default function Certificates() {
  const { t } = useTranslation();

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
            {t('certificates.title')}
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t('certificates.subtitle')}
          </motion.p>

          <div className={styles.grid}>
            {certificates.map((cert, i) => (
              <CertificateCard
                key={cert.id}
                certificate={cert}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
