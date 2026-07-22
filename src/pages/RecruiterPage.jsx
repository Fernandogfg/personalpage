import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTypingEffect } from '../hooks/useTypingEffect';
import Timeline from '../components/Timeline/Timeline';
import SkillCard from '../components/SkillCard/SkillCard';
import ProjectCard from '../components/ProjectCard/ProjectCard';
import CertificateCard from '../components/CertificateCard/CertificateCard';
import FloatingContactButton from '../components/FloatingContactButton/FloatingContactButton';
import { skills } from '../data/skills';
import { projects } from '../data/projects';
import { certificates } from '../data/certificates';
import { useState } from 'react';
import styles from './RecruiterPage.module.css';

function ScrollArrow() {
  return (
    <motion.div
      className={styles.scrollArrow}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.6 }}
    >
      <motion.div
        className={styles.arrowIcon}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </motion.div>
    </motion.div>
  );
}

function RecruiterHero() {
  const { t, i18n } = useTranslation();
  const roles = t('recruiter_hero.roles', { returnObjects: true });
  const typedText = useTypingEffect(roles);

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <motion.p
          className={styles.greeting}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {t('recruiter_hero.greeting')}
        </motion.p>
        <motion.h1
          className={styles.name}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {t('recruiter_hero.name')}
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <a href={i18n.language === 'en' ? '/CV_Fernando_Gabriel_EN.pdf' : '/CV_Fernando_Gabriel.pdf'} download className="btn btn-primary">
            {t('recruiter_hero.cta_cv')}
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function AboutSection() {
  const { t } = useTranslation();
  const infoCards = [
    { icon: '📍', label: t('about.location') },
    { icon: '🎓', label: t('about.education') },
    { icon: '🌐', label: t('about.languages') },
  ];

  return (
    <section className="section" id="about">
      <div className="container">
        <div className={styles.aboutHeader}>
          <motion.h2 className="section-title"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            {t('about.title')}
          </motion.h2>
          <ScrollArrow />
        </div>
        <motion.p className="section-subtitle"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.1 }}>
          {t('about.subtitle')}
        </motion.p>
        <motion.p className={styles.description}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.2 }}>
          {t('about.description')}
        </motion.p>

        <div className={styles.infoCards}>
          {infoCards.map((card, i) => (
            <motion.div key={i} className={`${styles.infoCard} glass glow-card`}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}>
              <span className={styles.infoIcon}>{card.icon}</span>
              <span className={styles.infoLabel}>{card.label}</span>
            </motion.div>
          ))}
        </div>
        <Timeline />
      </div>
    </section>
  );
}

function SkillsSection() {
  const { t } = useTranslation();
  const categories = [
    { key: 'frontend', label: t('skills.frontend'), data: skills.frontend },
    { key: 'backend', label: t('skills.backend'), data: skills.backend },
    { key: 'tools', label: t('skills.tools'), data: skills.tools },
  ];

  return (
    <section className="section" id="skills">
      <div className="container">
        <motion.h2 className="section-title"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {t('skills.title')}
        </motion.h2>
        <motion.p className="section-subtitle"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.1 }}>
          {t('skills.subtitle')}
        </motion.p>

        {categories.map((category) => (
          <div key={category.key} className={styles.category}>
            <motion.h3 className={styles.categoryTitle}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              {category.label}
            </motion.h3>
            <div className={styles.skillsGrid}>
              {category.data.map((skill, i) => (
                <SkillCard key={skill.name} name={skill.name} level={skill.level} delay={i * 0.1} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectsSection() {
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
    <section className="section" id="projects">
      <div className="container">
        <motion.h2 className="section-title"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {t('projects.title')}
        </motion.h2>
        <motion.p className="section-subtitle"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.1 }}>
          {t('projects.subtitle')}
        </motion.p>

        <div className={styles.filters}>
          {filters.map((f) => (
            <button key={f.key}
              className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
              onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        <motion.div className={styles.projectsGrid} layout>
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} delay={i * 0.1} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CertificatesSection() {
  const { t, i18n } = useTranslation();

  return (
    <section className="section" id="certificates">
      <div className="container">
        <motion.h2 className="section-title"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {t('certificates.title')}
        </motion.h2>
        <motion.p className="section-subtitle"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.1 }}>
          {t('certificates.subtitle')}
        </motion.p>

        <div className={styles.certsGrid}>
          {certificates.map((cert, i) => (
            <CertificateCard
              key={cert.id}
              title={t(`certificates.items.${cert.id}.title`)}
              description={t(`certificates.items.${cert.id}.desc`)}
              duration={t(`certificates.items.${cert.id}.duration`)}
              icon={cert.icon}
              delay={i * 0.1}
            />
          ))}
        </div>

        <motion.div className={styles.cvButton}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <a href={i18n.language === 'en' ? '/CV_Fernando_Gabriel_EN.pdf' : '/CV_Fernando_Gabriel.pdf'} download className="btn btn-outline">
            {t('recruiter_hero.cta_cv')}
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default function RecruiterPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <RecruiterHero />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <CertificatesSection />
      <FloatingContactButton href="mailto:fernandofgfg10@gmail.com" />
    </motion.div>
  );
}
