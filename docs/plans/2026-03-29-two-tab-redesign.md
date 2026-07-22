# Two-Tab Portfolio Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the portfolio from 6 separate pages into 2 single-page scrollable views (Clientes / Recrutadores) toggled via a switch in the navbar.

**Architecture:** Two route-based pages (`/` for Clientes, `/recruiter` for Recrutadores). Each page is a vertical scroll of sections reusing existing components. A new ModeToggle component in the navbar switches between routes. The existing 6 page routes are removed.

**Tech Stack:** React 18, React Router v7, Framer Motion, react-i18next, CSS Modules

---

### Task 1: Add i18n keys for new content

**Files:**
- Modify: `src/i18n/pt.json`
- Modify: `src/i18n/en.json`

**Step 1: Add new keys to pt.json**

Replace the entire `nav` section and add new sections. The full updated JSON:

```json
{
  "nav": {
    "clients": "Clientes",
    "recruiters": "Recrutadores"
  },
  "mode_toggle": {
    "clients": "Clientes",
    "recruiters": "Recrutadores"
  },
  "client_hero": {
    "headline": "Transformo suas ideias em soluções digitais",
    "subtitle": "Desenvolvimento web profissional com foco em resultados",
    "cta": "Solicitar Orçamento"
  },
  "services": {
    "title": "Serviços",
    "subtitle": "O que posso fazer por você",
    "items": {
      "websites": {
        "title": "Sites & Landing Pages",
        "desc": "Sites modernos, responsivos e otimizados para conversão"
      },
      "webapps": {
        "title": "Aplicações Web",
        "desc": "Sistemas web completos com frontend e backend integrados"
      },
      "apis": {
        "title": "APIs & Backend",
        "desc": "APIs RESTful robustas e escaláveis para seu negócio"
      },
      "maintenance": {
        "title": "Manutenção & Suporte",
        "desc": "Atualizações, correções e melhorias contínuas no seu projeto"
      }
    }
  },
  "client_contact": {
    "title": "Vamos Trabalhar Juntos?",
    "subtitle": "Conte-me sobre seu projeto",
    "project_label": "Descreva seu projeto",
    "project_placeholder": "Conte sobre o que você precisa...",
    "budget_label": "Orçamento estimado",
    "budget_placeholder": "Ex: R$ 2.000 - R$ 5.000"
  },
  "recruiter_hero": {
    "greeting": "Olá, eu sou",
    "name": "Fernando Gabriel",
    "roles": ["Desenvolvedor Full Stack", "Entusiasta React", "Solucionador de Problemas"],
    "cta_cv": "Baixar CV"
  }
}
```

Keep all existing keys (`hero`, `about`, `skills`, `projects`, `certificates`, `contact`, `footer`) — they are still used. Only replace the `nav` section and add the new sections above.

**Step 2: Add same keys to en.json**

```json
{
  "nav": {
    "clients": "Clients",
    "recruiters": "Recruiters"
  },
  "mode_toggle": {
    "clients": "Clients",
    "recruiters": "Recruiters"
  },
  "client_hero": {
    "headline": "Turning your ideas into digital solutions",
    "subtitle": "Professional web development focused on results",
    "cta": "Request a Quote"
  },
  "services": {
    "title": "Services",
    "subtitle": "What I can do for you",
    "items": {
      "websites": {
        "title": "Websites & Landing Pages",
        "desc": "Modern, responsive sites optimized for conversion"
      },
      "webapps": {
        "title": "Web Applications",
        "desc": "Complete web systems with integrated frontend and backend"
      },
      "apis": {
        "title": "APIs & Backend",
        "desc": "Robust and scalable RESTful APIs for your business"
      },
      "maintenance": {
        "title": "Maintenance & Support",
        "desc": "Ongoing updates, fixes and improvements for your project"
      }
    }
  },
  "client_contact": {
    "title": "Let's Work Together?",
    "subtitle": "Tell me about your project",
    "project_label": "Describe your project",
    "project_placeholder": "Tell me what you need...",
    "budget_label": "Estimated budget",
    "budget_placeholder": "Ex: $500 - $2,000"
  },
  "recruiter_hero": {
    "greeting": "Hi, I'm",
    "name": "Fernando Gabriel",
    "roles": ["Full Stack Developer", "React Enthusiast", "Problem Solver"],
    "cta_cv": "Download CV"
  }
}
```

Same rule: keep existing keys, replace `nav`, add new sections.

**Step 3: Verify app still runs**

Run: `cd "site próprio" && npm run dev`
Expected: App starts without i18n errors

**Step 4: Commit**

```bash
git add src/i18n/pt.json src/i18n/en.json
git commit -m "feat: add i18n keys for two-tab redesign (services, client hero, recruiter hero)"
```

---

### Task 2: Create ModeToggle component

**Files:**
- Create: `src/components/ModeToggle/ModeToggle.jsx`
- Create: `src/components/ModeToggle/ModeToggle.module.css`

**Step 1: Create ModeToggle.jsx**

```jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import styles from './ModeToggle.module.css';

export default function ModeToggle() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isRecruiter = location.pathname.startsWith('/recruiter');

  const handleToggle = () => {
    navigate(isRecruiter ? '/' : '/recruiter');
  };

  return (
    <div className={styles.toggle} onClick={handleToggle} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleToggle()}
      aria-label={isRecruiter ? 'Switch to client view' : 'Switch to recruiter view'}
    >
      <span className={`${styles.label} ${!isRecruiter ? styles.activeLabel : ''}`}>
        {t('mode_toggle.clients')}
      </span>
      <div className={styles.track}>
        <motion.div
          className={styles.thumb}
          animate={{ x: isRecruiter ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
      <span className={`${styles.label} ${isRecruiter ? styles.activeLabel : ''}`}>
        {t('mode_toggle.recruiters')}
      </span>
    </div>
  );
}
```

**Step 2: Create ModeToggle.module.css**

```css
.toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}

.activeLabel {
  color: var(--color-accent);
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.4);
}

.track {
  width: 48px;
  height: 24px;
  border-radius: 12px;
  background: rgba(0, 212, 255, 0.15);
  border: 1px solid rgba(0, 212, 255, 0.3);
  padding: 2px;
  position: relative;
}

.thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

@media (max-width: 768px) {
  .label {
    font-size: 0.7rem;
  }
  .track {
    width: 40px;
    height: 20px;
  }
  .thumb {
    width: 16px;
    height: 16px;
  }
}
```

**Step 3: Commit**

```bash
git add src/components/ModeToggle/
git commit -m "feat: create ModeToggle component with animated switch"
```

---

### Task 3: Create ServicesSection component

**Files:**
- Create: `src/components/ServicesSection/ServicesSection.jsx`
- Create: `src/components/ServicesSection/ServicesSection.module.css`

**Step 1: Create ServicesSection.jsx**

```jsx
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
```

**Step 2: Create ServicesSection.module.css**

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.card {
  padding: 2rem;
  text-align: center;
  transition: transform var(--transition-fast);
}

.card:hover {
  transform: translateY(-5px);
}

.icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 1rem;
}

.cardTitle {
  font-family: var(--font-heading);
  font-size: 1.2rem;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.cardDesc {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}
```

**Step 3: Commit**

```bash
git add src/components/ServicesSection/
git commit -m "feat: create ServicesSection component for client view"
```

---

### Task 4: Create ClientPage (single-page scrollable)

**Files:**
- Create: `src/pages/ClientPage.jsx`
- Create: `src/pages/ClientPage.module.css`

**Step 1: Create ClientPage.jsx**

This page composes: ClientHero + ServicesSection + Projects (inline) + Contact (adapted).

```jsx
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTypingEffect } from '../hooks/useTypingEffect';
import ServicesSection from '../components/ServicesSection/ServicesSection';
import ProjectCard from '../components/ProjectCard/ProjectCard';
import SocialLinks from '../components/SocialLinks/SocialLinks';
import { projects } from '../data/projects';
import { useState } from 'react';
import styles from './ClientPage.module.css';

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
          <a href="#contact" className="btn btn-primary">
            {t('client_hero.cta')}
          </a>
        </motion.div>
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const body = `Projeto: ${form.project}%0AOrçamento: ${form.budget}%0A%0A${form.message}`;
    const mailto = `mailto:fernandofgfg10@gmail.com?subject=Orçamento - ${form.name}&body=${body}%0A%0AFrom: ${form.email}`;
    window.location.href = mailto;
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
            <button type="submit" className="btn btn-primary">
              {t('contact.send')}
            </button>
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
    </motion.div>
  );
}
```

**Step 2: Create ClientPage.module.css**

```css
/* Hero */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.heroContent {
  max-width: 700px;
}

.headline {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 5vw, 3.5rem);
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.2rem;
  color: var(--color-text-muted);
  margin-bottom: 2rem;
}

/* Projects section (inline reuse of filter styles) */
.filters {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filterBtn {
  padding: 0.5rem 1.5rem;
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 9999px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.9rem;
}

.filterBtn:hover {
  border-color: var(--color-accent);
  color: var(--color-text);
}

.filterActive {
  background: rgba(0, 212, 255, 0.1);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.projectsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Contact */
.contactGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-top: 2rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 500;
}

.input,
.textarea {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.15);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 0.95rem;
  transition: border-color var(--transition-fast);
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: var(--color-accent);
}

.textarea {
  resize: vertical;
}

.contactInfo {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
}

.infoTitle {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  color: var(--color-accent);
}

.infoText {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.socialSection {
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .contactGrid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .projectsGrid {
    grid-template-columns: 1fr;
  }
}
```

**Step 3: Commit**

```bash
git add src/pages/ClientPage.jsx src/pages/ClientPage.module.css
git commit -m "feat: create ClientPage with hero, services, projects, and contact sections"
```

---

### Task 5: Create RecruiterPage (single-page scrollable)

**Files:**
- Create: `src/pages/RecruiterPage.jsx`
- Create: `src/pages/RecruiterPage.module.css`

**Step 1: Create RecruiterPage.jsx**

Composes: RecruiterHero + About (inline) + Skills (inline) + Projects (inline) + Certificates (inline).

```jsx
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTypingEffect } from '../hooks/useTypingEffect';
import Timeline from '../components/Timeline/Timeline';
import SkillCard from '../components/SkillCard/SkillCard';
import ProjectCard from '../components/ProjectCard/ProjectCard';
import CertificateCard from '../components/CertificateCard/CertificateCard';
import { skills } from '../data/skills';
import { projects } from '../data/projects';
import { certificates } from '../data/certificates';
import { useState } from 'react';
import styles from './RecruiterPage.module.css';

function RecruiterHero() {
  const { t } = useTranslation();
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
          <a href="#" className="btn btn-primary">
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
        <motion.h2 className="section-title"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          {t('about.title')}
        </motion.h2>
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
  const { t } = useTranslation();

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
            <CertificateCard key={cert.id} certificate={cert} delay={i * 0.1} />
          ))}
        </div>

        <motion.div className={styles.cvButton}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <a href="#" className="btn btn-outline">
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
    </motion.div>
  );
}
```

**Step 2: Create RecruiterPage.module.css**

```css
/* Hero (similar to old Home) */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.heroContent {
  max-width: 700px;
}

.greeting {
  font-size: 1.2rem;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

.name {
  font-family: var(--font-heading);
  font-size: clamp(2.5rem, 6vw, 4rem);
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.typingWrapper {
  font-size: 1.3rem;
  color: var(--color-accent);
  margin-bottom: 2rem;
  min-height: 2rem;
}

.typedText {
  color: var(--color-accent);
}

.cursor {
  animation: blink 1s infinite;
  color: var(--color-accent);
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* About section */
.description {
  font-size: 1.05rem;
  color: var(--color-text-muted);
  max-width: 700px;
  margin: 0 auto 2rem;
  line-height: 1.7;
  text-align: center;
}

.infoCards {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.infoCard {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
}

.infoIcon {
  font-size: 1.5rem;
}

.infoLabel {
  font-size: 0.95rem;
  color: var(--color-text);
}

/* Skills */
.category {
  margin-bottom: 2rem;
}

.categoryTitle {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  color: var(--color-accent);
  margin-bottom: 1rem;
}

.skillsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

/* Projects */
.filters {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filterBtn {
  padding: 0.5rem 1.5rem;
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 9999px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.9rem;
}

.filterBtn:hover {
  border-color: var(--color-accent);
  color: var(--color-text);
}

.filterActive {
  background: rgba(0, 212, 255, 0.1);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.projectsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Certificates */
.certsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.cvButton {
  text-align: center;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .infoCards {
    flex-direction: column;
    align-items: center;
  }
  .skillsGrid,
  .projectsGrid,
  .certsGrid {
    grid-template-columns: 1fr;
  }
}
```

**Step 3: Commit**

```bash
git add src/pages/RecruiterPage.jsx src/pages/RecruiterPage.module.css
git commit -m "feat: create RecruiterPage with about, skills, projects, and certificates sections"
```

---

### Task 6: Update Navbar to use ModeToggle (remove old nav links)

**Files:**
- Modify: `src/components/Navbar/Navbar.jsx`
- Modify: `src/components/Navbar/Navbar.module.css`

**Step 1: Rewrite Navbar.jsx**

Replace the entire file content with:

```jsx
import { Link } from 'react-router-dom';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import ModeToggle from '../ModeToggle/ModeToggle';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        FG
      </Link>

      <ModeToggle />

      <div className={styles.rightSection}>
        <LanguageToggle />
      </div>
    </nav>
  );
}
```

**Step 2: Simplify Navbar.module.css**

Remove navLinks, hamburger, mobileMenu, overlay, mobileNavLink styles. Keep only:

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  background: rgba(17, 17, 40, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 212, 255, 0.1);
  z-index: 1000;
  transition: all var(--transition-fast);
}

.logo {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-decoration: none;
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.logo:hover {
  transform: scale(1.05);
}

.rightSection {
  display: flex;
  align-items: center;
  gap: 1rem;
}
```

**Step 3: Commit**

```bash
git add src/components/Navbar/
git commit -m "refactor: simplify Navbar to logo + ModeToggle + language toggle"
```

---

### Task 7: Update App.jsx routing (2 routes only)

**Files:**
- Modify: `src/App.jsx`

**Step 1: Rewrite App.jsx**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout/Layout';
import ClientPage from './pages/ClientPage';
import RecruiterPage from './pages/RecruiterPage';

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ClientPage />} />
            <Route path="recruiter" element={<RecruiterPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
```

**Step 2: Verify the app runs**

Run: `cd "site próprio" && npm run dev`
Expected: App starts, `/` shows ClientPage, `/recruiter` shows RecruiterPage, toggle switches between them.

**Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "refactor: update routing to two-tab structure (client + recruiter)"
```

---

### Task 8: Clean up old page files

**Files:**
- Delete: `src/pages/Home.jsx`, `src/pages/Home.module.css`
- Delete: `src/pages/About.jsx`, `src/pages/About.module.css`
- Delete: `src/pages/Skills.jsx`, `src/pages/Skills.module.css`
- Delete: `src/pages/Projects.jsx`, `src/pages/Projects.module.css`
- Delete: `src/pages/Certificates.jsx`, `src/pages/Certificates.module.css`
- Delete: `src/pages/Contact.jsx`, `src/pages/Contact.module.css`

**Step 1: Remove old page files**

```bash
rm src/pages/Home.jsx src/pages/Home.module.css
rm src/pages/About.jsx src/pages/About.module.css
rm src/pages/Skills.jsx src/pages/Skills.module.css
rm src/pages/Projects.jsx src/pages/Projects.module.css
rm src/pages/Certificates.jsx src/pages/Certificates.module.css
rm src/pages/Contact.jsx src/pages/Contact.module.css
```

**Step 2: Verify app still builds**

Run: `cd "site próprio" && npm run build`
Expected: Build succeeds with no import errors

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove old page files replaced by two-tab structure"
```

---

### Task 9: Final verification and build test

**Step 1: Run dev server and verify both routes**

Run: `cd "site próprio" && npm run dev`
Expected: Both `/` and `/recruiter` render correctly

**Step 2: Run production build**

Run: `cd "site próprio" && npm run build`
Expected: Build succeeds with no errors or warnings

**Step 3: Verify toggle works**

Navigate to `/`, click toggle → should go to `/recruiter`. Click again → back to `/`.
