# Portfolio "Cosmos Dev" Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a multi-page React portfolio site with dark futuristic "Cosmos Dev" aesthetic, interactive particles, animations, and bilingual PT/EN support.

**Architecture:** React 18 + Vite SPA with React Router v6 for multi-page navigation. Framer Motion handles all animations (page transitions, scroll reveals, hover effects). Canvas API renders interactive particle background. react-i18next manages bilingual content. CSS Modules + CSS custom properties for theming.

**Tech Stack:** React 18, Vite, React Router v6, Framer Motion, react-i18next, Canvas API, CSS Modules

---

### Task 1: Scaffold Vite + React Project

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`

**Step 1: Initialize Vite project**

Run:
```bash
cd "/sessions/exciting-eager-wright/mnt/site próprio"
npm create vite@latest . -- --template react
```

**Step 2: Install dependencies**

Run:
```bash
npm install react-router-dom framer-motion react-i18next i18next
```

**Step 3: Verify dev server starts**

Run:
```bash
npm run dev -- --host 0.0.0.0 &
sleep 3
curl -s http://localhost:5173 | head -20
```
Expected: HTML response with Vite app

**Step 4: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Vite + React project with dependencies"
```

---

### Task 2: Global Styles + Design Tokens

**Files:**
- Create: `src/styles/variables.css`
- Create: `src/styles/reset.css`
- Create: `src/styles/global.css`
- Modify: `src/main.jsx` (import global styles)
- Modify: `index.html` (add Google Fonts links)

**Step 1: Create CSS variables (design tokens)**

`src/styles/variables.css`:
```css
:root {
  /* Colors — Cyan Neon palette, blue family only */
  --color-bg: #0a0a1a;
  --color-surface: #111128;
  --color-accent: #00d4ff;
  --color-secondary: #0066ff;
  --color-text: #e0e8ff;
  --color-text-muted: #8892b0;

  /* Effects */
  --glass-bg: rgba(17, 17, 40, 0.8);
  --glass-blur: blur(12px);
  --glow-accent: 0 0 20px rgba(0, 212, 255, 0.3);
  --glow-accent-strong: 0 0 40px rgba(0, 212, 255, 0.5);
  --gradient-accent: linear-gradient(135deg, #00d4ff, #0066ff);

  /* Typography */
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --section-padding: 5rem 2rem;
  --container-max: 1200px;
  --border-radius: 12px;
  --border-radius-sm: 8px;

  /* Transitions */
  --transition-fast: 0.2s ease;
  --transition-medium: 0.4s ease;
  --transition-slow: 0.6s ease;
}
```

**Step 2: Create CSS reset**

`src/styles/reset.css`:
```css
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  font-size: 16px;
}

body {
  font-family: var(--font-body);
  background-color: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

a {
  color: var(--color-accent);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-secondary);
}

img {
  max-width: 100%;
  display: block;
}

button {
  cursor: pointer;
  font-family: inherit;
  border: none;
  background: none;
}

ul, ol {
  list-style: none;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1.2;
}
```

**Step 3: Create global styles**

`src/styles/global.css`:
```css
@import './variables.css';
@import './reset.css';

.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 2rem;
}

.section {
  padding: var(--section-padding);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.section-title {
  font-size: clamp(2rem, 5vw, 3rem);
  margin-bottom: 1rem;
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 1.1rem;
  color: var(--color-text-muted);
  margin-bottom: 3rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius-sm);
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 1rem;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--gradient-accent);
  color: var(--color-bg);
}

.btn-primary:hover {
  box-shadow: var(--glow-accent-strong);
  transform: translateY(-2px);
}

.btn-outline {
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  background: transparent;
}

.btn-outline:hover {
  background: rgba(0, 212, 255, 0.1);
  box-shadow: var(--glow-accent);
  transform: translateY(-2px);
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid rgba(0, 212, 255, 0.1);
  border-radius: var(--border-radius);
}

.glow-card {
  transition: all var(--transition-medium);
}

.glow-card:hover {
  box-shadow: var(--glow-accent);
  transform: translateY(-4px);
  border-color: rgba(0, 212, 255, 0.3);
}
```

**Step 4: Update index.html with Google Fonts**

Add to `<head>` in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
```

**Step 5: Update main.jsx to import styles**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**Step 6: Verify styles load in browser**

Run dev server, check that background is dark (#0a0a1a) and fonts load.

**Step 7: Commit**

```bash
git add src/styles/ index.html src/main.jsx
git commit -m "feat: add global styles, design tokens, and typography"
```

---

### Task 3: i18n Setup (Bilingual PT/EN)

**Files:**
- Create: `src/i18n/pt.json`
- Create: `src/i18n/en.json`
- Create: `src/i18n/index.js`
- Modify: `src/main.jsx` (import i18n)

**Step 1: Create Portuguese translations**

`src/i18n/pt.json`:
```json
{
  "nav": {
    "home": "Início",
    "about": "Sobre",
    "skills": "Skills",
    "projects": "Projetos",
    "certificates": "Certificados",
    "contact": "Contato"
  },
  "hero": {
    "greeting": "Olá, eu sou",
    "name": "Fernando Gabriel",
    "roles": ["Desenvolvedor Full Stack", "Entusiasta React", "Solucionador de Problemas"],
    "cta_projects": "Ver Projetos",
    "cta_cv": "Baixar CV"
  },
  "about": {
    "title": "Sobre Mim",
    "subtitle": "Minha jornada na tecnologia",
    "description": "Desenvolvedor Full Stack Junior apaixonado por criar soluções web inovadoras. Atualmente cursando Ciência da Computação na Universidade Estácio de Sá, com experiência internacional no Canadá e formação intensiva em desenvolvimento Full Stack pela Mach1.",
    "location": "Campo Grande, MS",
    "education": "Ciência da Computação",
    "languages": "Português & Inglês",
    "timeline": {
      "2017": { "title": "Engenharia Ambiental", "desc": "Início na UFMS — base analítica e resolução de problemas" },
      "2018": { "title": "Vancouver, Canadá", "desc": "Diploma de Negócios e Inglês Avançado na LCC" },
      "2022": { "title": "Ciência da Computação", "desc": "Início do bacharelado na Universidade Estácio de Sá" },
      "2024": { "title": "Full Stack Mach1", "desc": "Formação intensiva em desenvolvimento web Full Stack" },
      "now": { "title": "Dev Full Stack Jr.", "desc": "Construindo o futuro, uma linha de código por vez" }
    }
  },
  "skills": {
    "title": "Skills",
    "subtitle": "Tecnologias que domino",
    "frontend": "Frontend",
    "backend": "Backend",
    "tools": "Ferramentas"
  },
  "projects": {
    "title": "Projetos",
    "subtitle": "O que tenho construído",
    "filter_all": "Todos",
    "filter_frontend": "Frontend",
    "filter_backend": "Backend",
    "filter_fullstack": "Full Stack",
    "view_code": "Código",
    "view_demo": "Demo"
  },
  "certificates": {
    "title": "Certificados",
    "subtitle": "Formações e conquistas",
    "items": {
      "fisk": { "title": "Inglês Completo — Fisk", "desc": "6 anos de estudo, concluído em 2016", "duration": "6 anos" },
      "lcc_english": { "title": "Inglês Avançado — LCC Vancouver", "desc": "Curso intensivo no Canadá", "duration": "4 meses" },
      "lcc_business": { "title": "Diploma de Negócios — LCC Vancouver", "desc": "Programa de negócios internacional", "duration": "3 meses" },
      "senac": { "title": "Microsoft Office — SENAC", "desc": "Campo Grande, MS", "duration": "Completo" },
      "mach1": { "title": "Full Stack Development — Mach1", "desc": "Formação intensiva em desenvolvimento web", "duration": "1 ano" }
    }
  },
  "contact": {
    "title": "Contato",
    "subtitle": "Vamos conversar?",
    "name_label": "Nome",
    "email_label": "Email",
    "message_label": "Mensagem",
    "send": "Enviar Mensagem",
    "name_placeholder": "Seu nome",
    "email_placeholder": "seu@email.com",
    "message_placeholder": "Sua mensagem..."
  },
  "footer": {
    "made_with": "Feito com",
    "by": "por Fernando Gabriel"
  }
}
```

**Step 2: Create English translations**

`src/i18n/en.json`:
```json
{
  "nav": {
    "home": "Home",
    "about": "About",
    "skills": "Skills",
    "projects": "Projects",
    "certificates": "Certificates",
    "contact": "Contact"
  },
  "hero": {
    "greeting": "Hi, I'm",
    "name": "Fernando Gabriel",
    "roles": ["Full Stack Developer", "React Enthusiast", "Problem Solver"],
    "cta_projects": "View Projects",
    "cta_cv": "Download CV"
  },
  "about": {
    "title": "About Me",
    "subtitle": "My journey in technology",
    "description": "Junior Full Stack Developer passionate about building innovative web solutions. Currently pursuing a Computer Science degree at Estácio de Sá University, with international experience in Canada and intensive Full Stack training at Mach1.",
    "location": "Campo Grande, MS",
    "education": "Computer Science",
    "languages": "Portuguese & English",
    "timeline": {
      "2017": { "title": "Environmental Engineering", "desc": "Started at UFMS — analytical foundation and problem-solving" },
      "2018": { "title": "Vancouver, Canada", "desc": "Business Diploma and Advanced English at LCC" },
      "2022": { "title": "Computer Science", "desc": "Started BS degree at Estácio de Sá University" },
      "2024": { "title": "Full Stack Mach1", "desc": "Intensive Full Stack web development training" },
      "now": { "title": "Jr. Full Stack Dev", "desc": "Building the future, one line of code at a time" }
    }
  },
  "skills": {
    "title": "Skills",
    "subtitle": "Technologies I work with",
    "frontend": "Frontend",
    "backend": "Backend",
    "tools": "Tools"
  },
  "projects": {
    "title": "Projects",
    "subtitle": "What I've been building",
    "filter_all": "All",
    "filter_frontend": "Frontend",
    "filter_backend": "Backend",
    "filter_fullstack": "Full Stack",
    "view_code": "Code",
    "view_demo": "Demo"
  },
  "certificates": {
    "title": "Certificates",
    "subtitle": "Education & achievements",
    "items": {
      "fisk": { "title": "Complete English — Fisk", "desc": "6 years of study, completed in 2016", "duration": "6 years" },
      "lcc_english": { "title": "Advanced English — LCC Vancouver", "desc": "Intensive course in Canada", "duration": "4 months" },
      "lcc_business": { "title": "Business Diploma — LCC Vancouver", "desc": "International business program", "duration": "3 months" },
      "senac": { "title": "Microsoft Office — SENAC", "desc": "Campo Grande, MS", "duration": "Complete" },
      "mach1": { "title": "Full Stack Development — Mach1", "desc": "Intensive web development training", "duration": "1 year" }
    }
  },
  "contact": {
    "title": "Contact",
    "subtitle": "Let's talk?",
    "name_label": "Name",
    "email_label": "Email",
    "message_label": "Message",
    "send": "Send Message",
    "name_placeholder": "Your name",
    "email_placeholder": "your@email.com",
    "message_placeholder": "Your message..."
  },
  "footer": {
    "made_with": "Made with",
    "by": "by Fernando Gabriel"
  }
}
```

**Step 3: Create i18n config**

`src/i18n/index.js`:
```js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from './pt.json';
import en from './en.json';

i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: pt },
    en: { translation: en }
  },
  lng: 'pt',
  fallbackLng: 'pt',
  interpolation: { escapeValue: false }
});

export default i18n;
```

**Step 4: Import i18n in main.jsx**

Add `import './i18n';` before App import in `src/main.jsx`.

**Step 5: Verify i18n loads**

Test in a component with `useTranslation()` hook.

**Step 6: Commit**

```bash
git add src/i18n/
git commit -m "feat: add i18n setup with PT/EN translations"
```

---

### Task 4: Router + App Layout + Navbar

**Files:**
- Create: `src/components/Navbar/Navbar.jsx`
- Create: `src/components/Navbar/Navbar.module.css`
- Create: `src/components/Layout/Layout.jsx`
- Create: `src/components/LanguageToggle/LanguageToggle.jsx`
- Create: `src/components/LanguageToggle/LanguageToggle.module.css`
- Create placeholder pages: `src/pages/Home.jsx`, `src/pages/About.jsx`, `src/pages/Skills.jsx`, `src/pages/Projects.jsx`, `src/pages/Certificates.jsx`, `src/pages/Contact.jsx`
- Modify: `src/App.jsx` (add router)

**Step 1: Create placeholder pages**

Each page file follows this pattern (replace name accordingly):
```jsx
const Home = () => <div className="section"><h1>Home</h1></div>;
export default Home;
```

**Step 2: Create LanguageToggle component**

Simple PT | EN toggle using `i18n.changeLanguage()`. Styled as a pill button in the navbar.

**Step 3: Create Navbar component**

- Fixed position top, glassmorphism background
- Logo/name link on left → navigates to "/"
- Nav links centered: Home, About, Skills, Projects, Certificates, Contact
- LanguageToggle on right
- Hamburger menu icon for mobile (< 768px) with slide-in drawer
- Active link highlighted with accent underline using `useLocation()`
- Framer Motion for mobile menu open/close animation

**Step 4: Create Layout component**

Wraps all pages with Navbar + `<Outlet />` from React Router + Footer.

**Step 5: Set up App.jsx with React Router**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Skills from './pages/Skills';
import Projects from './pages/Projects';
import Certificates from './pages/Certificates';
import Contact from './pages/Contact';

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="skills" element={<Skills />} />
            <Route path="projects" element={<Projects />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="contact" element={<Contact />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
```

**Step 6: Verify navigation works**

All routes render, navbar shows active state, language toggle switches text, mobile menu opens/closes.

**Step 7: Commit**

```bash
git add src/components/ src/pages/ src/App.jsx
git commit -m "feat: add router, navbar with glassmorphism, language toggle, and page layout"
```

---

### Task 5: ParticleCanvas Component

**Files:**
- Create: `src/components/ParticleCanvas/ParticleCanvas.jsx`
- Create: `src/components/ParticleCanvas/ParticleCanvas.module.css`

**Step 1: Create ParticleCanvas component**

Canvas 2D API component that:
- Renders ~80-100 small particles (circles, rgba with accent color)
- Particles drift slowly in random directions
- Nearby particles (< 150px) connect with faint lines
- Mouse position attracts/repels particles within a radius
- Canvas resizes responsively on window resize
- Uses `useRef` for canvas + `requestAnimationFrame` loop
- Accepts `intensity` prop (for subtle vs. full effect on different pages)
- Performance: uses `will-change: transform` and offscreen check

**Step 2: Style as absolute/fixed background layer**

```css
.canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
```

Note: `pointer-events: none` so it doesn't block clicks on content above.

**Step 3: Verify particles render and respond to mouse**

**Step 4: Commit**

```bash
git add src/components/ParticleCanvas/
git commit -m "feat: add interactive particle canvas background"
```

---

### Task 6: Custom Hooks (useTypingEffect, useScrollReveal)

**Files:**
- Create: `src/hooks/useTypingEffect.js`
- Create: `src/hooks/useScrollReveal.js`

**Step 1: Create useTypingEffect hook**

```js
import { useState, useEffect } from 'react';

export function useTypingEffect(strings, typingSpeed = 100, deletingSpeed = 50, pauseTime = 2000) {
  const [text, setText] = useState('');
  const [stringIndex, setStringIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = strings[stringIndex];
    let timeout;

    if (!isDeleting && text === current) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setStringIndex((prev) => (prev + 1) % strings.length);
    } else {
      timeout = setTimeout(() => {
        setText(current.substring(0, text.length + (isDeleting ? -1 : 1)));
      }, isDeleting ? deletingSpeed : typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, stringIndex, strings, typingSpeed, deletingSpeed, pauseTime]);

  return text;
}
```

**Step 2: Create useScrollReveal hook**

Returns a ref and animation controls for Framer Motion `useInView`:
```js
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export function useScrollReveal(options = { once: true, margin: '-100px' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, options);
  return { ref, isInView };
}
```

**Step 3: Commit**

```bash
git add src/hooks/
git commit -m "feat: add useTypingEffect and useScrollReveal custom hooks"
```

---

### Task 7: Home Page (Hero)

**Files:**
- Create: `src/pages/Home.jsx` (replace placeholder)
- Create: `src/pages/Home.module.css`

**Step 1: Implement Home page**

- Full viewport hero with ParticleCanvas behind
- Large greeting text: "Olá, eu sou" / "Hi, I'm"
- Name "Fernando Gabriel" in huge Space Grotesk
- Typing animation below name cycling through roles (from translations)
- Two CTA buttons: "Ver Projetos" (Link to /projects) + "Baixar CV" (download link)
- Scroll down indicator (animated chevron at bottom)
- Framer Motion entrance animations (staggered fade-in from bottom)
- Page transition wrapper with motion.div

**Step 2: Style hero section**

- Center content vertically and horizontally
- Name: `clamp(2.5rem, 8vw, 5rem)` font size
- Typing text with blinking cursor (CSS animation)
- Buttons side by side, stack on mobile
- Responsive down to 320px

**Step 3: Verify page looks correct and animations play**

**Step 4: Commit**

```bash
git add src/pages/Home.jsx src/pages/Home.module.css
git commit -m "feat: implement hero page with typing animation and particle background"
```

---

### Task 8: About Page (Timeline)

**Files:**
- Create: `src/pages/About.jsx` (replace placeholder)
- Create: `src/pages/About.module.css`
- Create: `src/components/Timeline/Timeline.jsx`
- Create: `src/components/Timeline/Timeline.module.css`

**Step 1: Create Timeline component**

- Vertical timeline with alternating left/right entries (centered line on desktop)
- Single column on mobile (all left-aligned)
- Each entry has: year badge, title, description
- Entries animate in on scroll (useScrollReveal + Framer Motion)
- Connecting line with gradient accent color
- Year badge glows with accent

**Step 2: Implement About page**

- Section title + subtitle (from translations)
- Description paragraph
- Info cards row: Location, Education, Languages (glass style)
- Timeline component below with journey data from translations
- All elements scroll-reveal animated

**Step 3: Verify timeline renders and animates on scroll**

**Step 4: Commit**

```bash
git add src/pages/About.jsx src/pages/About.module.css src/components/Timeline/
git commit -m "feat: implement about page with animated timeline and info cards"
```

---

### Task 9: Skills Page

**Files:**
- Create: `src/pages/Skills.jsx` (replace placeholder)
- Create: `src/pages/Skills.module.css`
- Create: `src/components/SkillCard/SkillCard.jsx`
- Create: `src/components/SkillCard/SkillCard.module.css`
- Create: `src/data/skills.js`

**Step 1: Create skills data file**

`src/data/skills.js`:
```js
export const skills = {
  frontend: [
    { name: 'React', level: 85, icon: 'react' },
    { name: 'TypeScript', level: 75, icon: 'typescript' },
    { name: 'JavaScript', level: 90, icon: 'javascript' },
    { name: 'HTML', level: 95, icon: 'html' },
    { name: 'CSS', level: 90, icon: 'css' },
  ],
  backend: [
    { name: 'Node.js', level: 80, icon: 'nodejs' },
    { name: 'Java', level: 70, icon: 'java' },
    { name: 'PostgreSQL', level: 70, icon: 'postgresql' },
  ],
  tools: [
    { name: 'Git', level: 85, icon: 'git' },
    { name: 'VS Code', level: 90, icon: 'vscode' },
    { name: 'Figma', level: 60, icon: 'figma' },
  ]
};
```

**Step 2: Create SkillCard component**

- Displays tech icon (SVG or emoji fallback), name, and animated progress bar
- Progress bar fills on scroll into view (Framer Motion animate width)
- Glass card style with glow hover
- Icon area with subtle accent background

**Step 3: Implement Skills page**

- Section title + subtitle
- Three category sections (Frontend, Backend, Tools) with category headers
- Grid of SkillCards per category (3 columns desktop, 2 tablet, 1 mobile)
- Staggered scroll reveal animation

**Step 4: Verify skills render with animated bars**

**Step 5: Commit**

```bash
git add src/pages/Skills.jsx src/pages/Skills.module.css src/components/SkillCard/ src/data/skills.js
git commit -m "feat: implement skills page with animated proficiency bars"
```

---

### Task 10: Projects Page

**Files:**
- Create: `src/pages/Projects.jsx` (replace placeholder)
- Create: `src/pages/Projects.module.css`
- Create: `src/components/ProjectCard/ProjectCard.jsx`
- Create: `src/components/ProjectCard/ProjectCard.module.css`
- Create: `src/data/projects.js`

**Step 1: Create projects data file**

`src/data/projects.js` with 3-4 placeholder projects:
```js
export const projects = [
  {
    id: 1,
    title: 'Portfolio Website',
    description: 'Site pessoal com React, Vite e animações interativas.',
    descriptionEn: 'Personal website with React, Vite and interactive animations.',
    image: null, // placeholder
    tags: ['React', 'Vite', 'CSS Modules', 'Framer Motion'],
    category: 'frontend',
    github: 'https://github.com/Fernandogfg',
    demo: null
  },
  // ... 2-3 more placeholders
];
```

**Step 2: Create ProjectCard component**

- Image/preview area (gradient placeholder if no image)
- Title, description, tech tags
- GitHub + Demo links as icon buttons
- Glass card with glow hover, elevation on hover
- Framer Motion whileHover scale

**Step 3: Implement Projects page**

- Section title + subtitle
- Category filter buttons (All, Frontend, Backend, Full Stack)
- AnimatePresence for filter transition (layout animation)
- Responsive grid (3 cols desktop, 2 tablet, 1 mobile)

**Step 4: Verify filter works and cards animate**

**Step 5: Commit**

```bash
git add src/pages/Projects.jsx src/pages/Projects.module.css src/components/ProjectCard/ src/data/projects.js
git commit -m "feat: implement projects page with filterable card grid"
```

---

### Task 11: Certificates Page

**Files:**
- Create: `src/pages/Certificates.jsx` (replace placeholder)
- Create: `src/pages/Certificates.module.css`
- Create: `src/components/CertificateCard/CertificateCard.jsx`
- Create: `src/components/CertificateCard/CertificateCard.module.css`
- Create: `src/components/Modal/Modal.jsx`
- Create: `src/components/Modal/Modal.module.css`

**Step 1: Create reusable Modal component**

- Overlay with glassmorphism
- Centered content box
- Close button (X) top right
- AnimatePresence fade in/out
- Click outside to close
- Escape key to close
- Scroll lock on body when open

**Step 2: Create CertificateCard component**

- Icon/badge area with institution initial or icon
- Title, description, duration badge
- Click opens Modal with full details
- Glass card with glow hover
- Placeholder for future certificate image/PDF display

**Step 3: Implement Certificates page**

- Section title + subtitle
- Grid of CertificateCards (from translations data)
- Staggered scroll reveal
- Modal displays on card click

**Step 4: Verify cards render, modal opens/closes properly**

**Step 5: Commit**

```bash
git add src/pages/Certificates.jsx src/pages/Certificates.module.css src/components/CertificateCard/ src/components/Modal/
git commit -m "feat: implement certificates page with modal detail view"
```

---

### Task 12: Contact Page

**Files:**
- Create: `src/pages/Contact.jsx` (replace placeholder)
- Create: `src/pages/Contact.module.css`
- Create: `src/components/SocialLinks/SocialLinks.jsx`
- Create: `src/components/SocialLinks/SocialLinks.module.css`

**Step 1: Create SocialLinks component**

- Row of social icons: GitHub, LinkedIn, Email (mailto:), WhatsApp
- SVG icons inline (no external icon library needed)
- Hover glow + scale animation
- Links open in new tab

**Step 2: Implement Contact page**

- Section title + subtitle
- Two-column layout: form on left, social links + info on right (stack on mobile)
- Form fields: name (text), email (email), message (textarea)
- Styled inputs with accent border on focus, glass background
- Submit button with gradient (form action: `mailto:` or placeholder)
- Subtle ParticleCanvas in background (lower intensity)
- Form validation (required fields, email format)

**Step 3: Verify form renders, validation works, social links open correctly**

**Step 4: Commit**

```bash
git add src/pages/Contact.jsx src/pages/Contact.module.css src/components/SocialLinks/
git commit -m "feat: implement contact page with form and social links"
```

---

### Task 13: Footer Component

**Files:**
- Create: `src/components/Footer/Footer.jsx`
- Create: `src/components/Footer/Footer.module.css`
- Modify: `src/components/Layout/Layout.jsx` (add Footer)

**Step 1: Create Footer**

- Simple footer: "Feito com ❤ por Fernando Gabriel" (translated)
- Social links row (reuse SocialLinks)
- Year auto-generated
- Glass background, subtle top border

**Step 2: Add Footer to Layout**

**Step 3: Commit**

```bash
git add src/components/Footer/ src/components/Layout/
git commit -m "feat: add footer component to layout"
```

---

### Task 14: Page Transitions + Polish

**Files:**
- Create: `src/components/PageTransition/PageTransition.jsx`
- Modify: All page files (wrap content in PageTransition)

**Step 1: Create PageTransition wrapper**

```jsx
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
```

**Step 2: Wrap all page components with PageTransition**

**Step 3: Add scroll-to-top on route change**

Create `src/hooks/useScrollToTop.js` that scrolls to top on location change.

**Step 4: Final polish pass**

- Verify all pages have consistent spacing
- Check mobile responsiveness (320px, 768px, 1024px, 1440px)
- Verify all i18n strings render correctly in both languages
- Ensure no console errors
- Test keyboard navigation and tab order

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add page transitions, scroll-to-top, and responsive polish"
```

---

### Task 15: Build Verification + Final Review

**Step 1: Run production build**

```bash
npm run build
```
Expected: Clean build with no errors or warnings.

**Step 2: Preview production build**

```bash
npm run preview
```
Verify all pages render correctly in production mode.

**Step 3: Check bundle size**

```bash
ls -la dist/assets/
```
Verify JS bundle is reasonable (< 300KB gzipped).

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify production build and finalize portfolio v1"
```
