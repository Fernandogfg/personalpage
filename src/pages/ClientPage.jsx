import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ServicesSection from '../components/ServicesSection/ServicesSection';
import ProjectCard from '../components/ProjectCard/ProjectCard';
import SocialLinks from '../components/SocialLinks/SocialLinks';
import FloatingContactButton from '../components/FloatingContactButton/FloatingContactButton';
import { projects } from '../data/projects';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import styles from './ClientPage.module.css';

function ScrollArrow() {
  return (
    <motion.div
      className={styles.scrollArrow}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.6 }}
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

function ClientHero() {
  const { t } = useTranslation();

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <motion.h1
          className={styles.headline}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {t('client_hero.headline')}
        </motion.h1>
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {t('client_hero.subtitle')}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <a href="#contact" className={`btn btn-primary ${styles.ctaButton}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {t('client_hero.cta')}
          </a>
        </motion.div>
      </div>
      <ScrollArrow />
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
              className={`${styles.filterBtn} ${filter === f.key ? styles.filterActive : ''}`}
              onClick={() => setFilter(f.key)}
            >
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

function ClientContact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', project: '', budget: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    if (supabase) {
      const { error } = await supabase.from('messages').insert({
        name: form.name,
        email: form.email,
        project: form.project,
        budget: form.budget,
        message: form.message,
        source: 'client',
      });

      if (error) {
        setStatus('error');
        return;
      }

      setForm({ name: '', email: '', project: '', budget: '', message: '' });
      setStatus('sent');
    } else {
      const subject = encodeURIComponent(`Orçamento - ${form.name}`);
      const body = encodeURIComponent(
        `Projeto: ${form.project}\nOrçamento: ${form.budget}\n\n${form.message}\n\nDe: ${form.name} <${form.email}>`
      );
      window.location.href = `mailto:fernandofgfg10@gmail.com?subject=${subject}&body=${body}`;
      setStatus('idle');
    }
  };

  return (
    <section className="section" id="contact">
      <div className="container">
        <motion.h2 className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t('client_contact.title')}
        </motion.h2>
        <motion.p className="section-subtitle"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {t('client_contact.subtitle')}
        </motion.p>

        <div className={styles.contactGrid}>
          <motion.form
            className={styles.form}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.field}>
              <label className={styles.label}>{t('contact.name_label')}</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                placeholder={t('contact.name_placeholder')} className={styles.input} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('contact.email_label')}</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder={t('contact.email_placeholder')} className={styles.input} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('client_contact.project_label')}</label>
              <textarea name="project" value={form.project} onChange={handleChange}
                placeholder={t('client_contact.project_placeholder')} className={styles.textarea} rows={3} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('client_contact.budget_label')}</label>
              <input type="text" name="budget" value={form.budget} onChange={handleChange}
                placeholder={t('client_contact.budget_placeholder')} className={styles.input} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('contact.message_label')}</label>
              <textarea name="message" value={form.message} onChange={handleChange}
                placeholder={t('contact.message_placeholder')} className={styles.textarea} rows={4} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? t('contact.sending') : t('contact.send')}
            </button>
            {status === 'sent' && <p className={styles.successMsg}>{t('contact.success')}</p>}
            {status === 'error' && <p className={styles.errorMsg}>{t('contact.error')}</p>}
          </motion.form>

          <motion.div
            className={styles.contactInfo}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className={styles.infoTitle}>Fernando Gabriel</h3>
            <p className={styles.infoText}>Campo Grande, MS - Brasil</p>
            <p className={styles.infoText}>fernandofgfg10@gmail.com</p>
            <p className={styles.infoText}>+55 67 99177-7181</p>
            <div className={styles.socialSection}>
              <SocialLinks />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function ClientPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ClientHero />
      <ServicesSection />
      <ProjectsSection />
      <ClientContact />
      <FloatingContactButton href="#contact" />
    </motion.div>
  );
}
