import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ProjectCard from '../components/ProjectCard/ProjectCard';
import { projects } from '../data/projects';
import styles from './Projects.module.css';

export default function Projects() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');

  const filters = [
    { key: 'all', label: t('projects.filter_all') },
    { key: 'frontend', label: t('projects.filter_frontend') },
    { key: 'backend', label: t('projects.filter_backend') },
    { key: 'fullstack', label: t('projects.filter_fullstack') },
  ];

  const filtered = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <section className="section">
        <div className="container">
          <motion.h2 className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('projects.title')}
          </motion.h2>
          <motion.p className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {t('projects.subtitle')}
          </motion.p>

          <div className={styles.filters}>
            {filters.map((f) => (
              <button
                key={f.key}
                className={`${styles.filterBtn} ${filter === f.key ? styles.active : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <motion.div className={styles.grid} layout>
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  delay={i * 0.1}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
