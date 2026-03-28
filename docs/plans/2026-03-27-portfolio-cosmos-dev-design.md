# Portfolio "Cosmos Dev" — Design Document

**Author:** Fernando Gabriel Flores Gonçalves
**Date:** 2026-03-27
**Status:** Approved

## Overview

Portfolio website for Fernando Gabriel, a Junior Full Stack Developer based in Campo Grande, MS. The site showcases skills, projects, certificates, and professional background with a dark futuristic aesthetic ("Cosmos Dev" style).

## Tech Stack

- **Framework:** React 18 + Vite
- **Routing:** React Router v6 (multi-page)
- **Animations:** Framer Motion
- **i18n:** react-i18next (PT/EN bilingual with toggle)
- **Particles:** Canvas API (future-ready for Three.js)
- **Styling:** CSS Modules
- **Deployment:** Static build, GitHub Pages / Netlify / Vercel

## Design System

### Colors (Cyan Neon — Blue Family Only)

| Token       | Value     | Usage                    |
|-------------|-----------|--------------------------|
| background  | #0a0a1a   | Page background          |
| surface     | #111128   | Cards, navbar, modals    |
| accent      | #00d4ff   | Primary CTA, links, glow |
| secondary   | #0066ff   | Gradients, hover states  |
| text        | #e0e8ff   | Body text                |
| text-muted  | #8892b0   | Secondary text           |

### Typography

- **Headings:** Space Grotesk (bold, 700)
- **Body:** Inter (regular 400, medium 500)
- **Code/Mono:** JetBrains Mono (for any code snippets)

### Effects

- Glassmorphism: `backdrop-filter: blur(12px); background: rgba(17,17,40,0.8)`
- Glow: `box-shadow: 0 0 20px rgba(0,212,255,0.3)`
- Gradient accent: `linear-gradient(135deg, #00d4ff, #0066ff)`

## Pages

### 1. Home (Hero)

- Full-viewport hero section
- Canvas background with interactive particles (respond to mouse movement)
- Name in large Space Grotesk typography
- Typing animation cycling: "Full Stack Developer", "React Enthusiast", "Problem Solver"
- CTA buttons: "Ver Projetos" / "Baixar CV"
- Scroll indicator at bottom

### 2. Sobre Mim (About)

- Professional summary text
- Animated timeline of journey:
  - 2017: Started Environmental Engineering at UFMS
  - 2018: Business Diploma in Vancouver, Canada
  - 2022: Started Computer Science at Estácio de Sá
  - 2024: Full Stack course at Mach1
  - Present: Junior Full Stack Developer
- Info cards: Location, Languages (PT/EN), Education
- Fade-in on scroll animations

### 3. Skills

- Grid of technology icons organized by category:
  - **Frontend:** React, TypeScript, JavaScript, HTML, CSS
  - **Backend:** Node.js, Java, PostgreSQL
  - **Tools:** Git, VS Code, etc.
- Animated proficiency bars (animate on scroll into view)
- Hover glow effect on each skill card

### 4. Projetos (Projects)

- Filterable grid of project cards
- Each card: screenshot/preview, title, short description, tech tags, GitHub + demo links
- Hover effect: glow border + slight elevation
- Initially with placeholder content (user will fill in)
- Filter by category (Frontend, Backend, Full Stack)

### 5. Certificados (Certificates)

- Grid of certificate cards:
  - Fisk English (6 years)
  - LCC Vancouver — Advanced English (4 months)
  - LCC Vancouver — Business Diploma (3 months)
  - SENAC — Microsoft Office
  - Mach1 — Full Stack Development (1 year)
- Each card expandable to modal with details
- Space for certificate image/PDF upload in future
- Placeholder structure ready for user to add certificate files

### 6. Contato (Contact)

- Styled contact form: name, email, message
- Direct links: GitHub, LinkedIn, Email, WhatsApp
- Subtle particle background
- Social icons with hover glow

### Navbar (Global)

- Fixed top, glassmorphism effect
- Logo/name on left
- Page links centered
- Language toggle (PT/EN) on right
- Hamburger menu on mobile (< 768px)
- Active page indicator with accent underline

## Animations

- **Page transitions:** Fade + slight slide via Framer Motion AnimatePresence
- **Scroll reveals:** Elements fade-in and slide-up on scroll (IntersectionObserver + Framer Motion)
- **Particles:** Canvas 2D API, ~100 particles, connect lines when close, respond to mouse
- **Typing effect:** Custom hook cycling through role strings
- **Hover effects:** Scale + glow on cards, underline slide on nav links

## Internationalization

- react-i18next with JSON translation files
- Languages: pt-BR (default), en
- Toggle button in navbar with flag icons or "PT | EN"
- All user-facing text externalized to translation files

## Future Considerations

- Three.js integration: Replace Canvas particles with 3D scene
- Blog section
- Dark/light mode toggle (currently dark-only)
- CMS integration for project/certificate management
- Analytics

## File Structure

```
src/
├── assets/          # Images, fonts, icons
├── components/      # Reusable components (Navbar, Footer, ParticleCanvas, etc.)
├── pages/           # Page components (Home, About, Skills, Projects, Certificates, Contact)
├── hooks/           # Custom hooks (useTypingEffect, useScrollReveal, etc.)
├── i18n/            # Translation files (pt.json, en.json)
├── styles/          # Global styles, CSS variables, reset
├── App.jsx          # Router setup
└── main.jsx         # Entry point
```
