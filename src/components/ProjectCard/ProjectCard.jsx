import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import styles from './ProjectCard.module.css';

export default function ProjectCard({ project, delay = 0 }) {
  const { t, i18n } = useTranslation();
  const desc = i18n.language === 'en' ? project.descriptionEn : project.description;

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8 }}
      layout
    >
      <div className={styles.imageArea}>
        {project.image ? (
          <img src={project.image} alt={project.title} />
        ) : (
          <div
            className={styles.placeholder}
            style={project.gradient ? { background: project.gradient } : undefined}
          >
            <span className={styles.placeholderIcon}>
              {project.icon || '</>'}
            </span>
          </div>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.description}>{desc}</p>
        <div className={styles.tags}>
          {project.tags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
        <div className={styles.links}>
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" className={styles.link}>
              {t('projects.view_code')}
            </a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noopener noreferrer" className={styles.link}>
              {t('projects.view_demo')}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
