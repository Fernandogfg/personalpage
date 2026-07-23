import { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import Modal from '../Modal/Modal';
import styles from './CertificateCard.module.css';

const TILT_MAX = 14;
const springConfig = { stiffness: 150, damping: 18 };

export default function CertificateCard({ title, description, duration, icon, file, delay = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(py, [0, 1], [TILT_MAX, -TILT_MAX]), springConfig);
  const rotateY = useSpring(useTransform(px, [0, 1], [-TILT_MAX, TILT_MAX]), springConfig);

  const glareX = useTransform(px, [0, 1], ['0%', '100%']);
  const glareY = useTransform(py, [0, 1], ['0%', '100%']);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(0, 212, 255, 0.15), transparent 50%)`;

  const onMove = useCallback((e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }, [px, py]);

  const reset = useCallback(() => {
    px.set(0.5);
    py.set(0.5);
  }, [px, py]);

  return (
    <>
      <div className={styles.scene}>
        <motion.div
          ref={ref}
          className={styles.card}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay }}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          onMouseMove={onMove}
          onMouseLeave={reset}
          onClick={() => setIsOpen(true)}
        >
          <div className={styles.cardContent} style={{ transform: 'translateZ(30px)' }}>
            <div className={styles.iconArea}>
              <span className={styles.icon}>{icon}</span>
            </div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
            <span className={styles.duration}>{duration}</span>
          </div>
          <motion.div className={styles.glare} style={{ backgroundImage: glare }} />
        </motion.div>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className={styles.modalContent}>
          <div className={styles.modalIcon}>{icon}</div>
          <h2 className={styles.modalTitle}>{title}</h2>
          <p className={styles.modalDesc}>{description}</p>
          <div className={styles.modalDuration}>
            <span className={styles.durationLabel}>Duração:</span>
            <span className={styles.durationValue}>{duration}</span>
          </div>
          {file && file.match(/\.(jpg|jpeg|png|webp)$/i) ? (
            <>
              <img src={file} alt={title} className={styles.certImage} />
              <a href={file} target="_blank" rel="noopener noreferrer" className={styles.viewLink}>
                🔍 Ver em tamanho completo
              </a>
            </>
          ) : file ? (
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
