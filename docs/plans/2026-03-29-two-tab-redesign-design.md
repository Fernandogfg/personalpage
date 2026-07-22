# Two-Tab Portfolio Redesign

**Date:** 2026-03-29
**Status:** Approved

## Summary

Restructure the portfolio from 6 separate pages to 2 single-page scrollable views, toggled via a switch in the navbar: **Clientes** (default) and **Recrutadores**.

## Navigation

- Navbar contains: Logo (FG) + **Client/Recruiter toggle** (styled switch with cyan glow) + Language toggle
- The 6 old nav links are removed
- Toggle switches between routes `/` (Clientes) and `/recruiter` (Recrutadores)
- Smooth page transition via Framer Motion on route change

## Aba Clientes (`/`)

Focus: sell services, inspire confidence, get project requests.

1. **Hero** — Headline oriented toward clients (e.g., "Transformo suas ideias em soluções digitais"), CTA "Solicitar Orçamento" (scrolls to contact)
2. **Serviços** (NEW) — Cards showing offered services (Sites, Web Apps, APIs, etc.)
3. **Projetos** — Reuse existing project cards with filtering
4. **Contato** — Adapted form with "Descreva seu projeto" field

## Aba Recrutadores (`/recruiter`)

Focus: showcase qualifications, experience, and technical depth.

1. **Sobre** — Bio, info cards (location, education, languages), career timeline
2. **Skills** — Existing skill grid with progress bars
3. **Projetos** — Same projects, demonstrating experience
4. **Certificados** — Existing certificate cards + "Baixar CV" button

## What Changes

- Remove 6 separate routes, create 2 scrollable page routes
- Reuse existing components: ProjectCard, SkillCard, CertificateCard, Timeline, SocialLinks, ContactForm
- New components needed: ModeToggle (navbar switch), ServicesSection, ClientHero
- Adapt Hero text/CTAs per mode
- Update i18n with new keys for services section and client-oriented copy
- Navbar simplifies to logo + toggle + language

## What Stays

- Design system: dark bg (#0a0a1a), cyan accent (#00d4ff), glassmorphism, glow effects
- ParticleCanvas background
- Framer Motion animations
- i18n (PT/EN)
- All existing reusable components
- Footer with social links

## Projects

Same projects appear in both tabs — no filtering by audience.
