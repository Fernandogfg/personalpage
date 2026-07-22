import { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '../Modal/Modal';
import styles from './CertificateCard.module.css';

export default function CertificateCard({ title, description, duration, icon, file, delay = 0 }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ y: -4 }}
        onClick={() => setIsOpen(true)}
      >
        <div className={styles.iconArea}>
          <span className={styles.icon}>{icon}</span>
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        <span className={styles.duration}>{duration}</span>
      </motion.div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className={styles.modalContent}>
          <div className={styles.modalIcon}>{icon}</div>
          <h2 className={styles.modalTitle}>{title}</h2>
          <p className={styles.modalDesc}>{description}</p>
          <div className={styles.modalDuration}>
            <span className={styles.durationLabel}>Duração:</span>
            <span className={styles.durationValue}>{duration}</span>
          </div>
          {file ? (
            <a href={file} target="_blank" rel="noopener noreferrer" className={styles.viewLink}>
              📄 Ver certificado
            </a>
          ) : (
            <p className={styles.modalPlaceholder}>
              Certificado ainda não digitalizado
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
