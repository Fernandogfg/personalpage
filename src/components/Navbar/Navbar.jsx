import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/skills', label: t('nav.skills') },
    { path: '/projects', label: t('nav.projects') },
    { path: '/certificates', label: t('nav.certificates') },
    { path: '/contact', label: t('nav.contact') }
  ];

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [mobileMenuOpen]);

  // Close menu on route change
  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={styles.navbar}>
        {/* Left: Logo */}
        <Link to="/" className={styles.logo}>
          FG
        </Link>

        {/* Center: Desktop Nav Links */}
        <div className={styles.navLinks}>
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right: Language Toggle & Hamburger */}
        <div className={styles.rightSection}>
          <LanguageToggle />
          <button
            className={styles.hamburger}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className={styles.mobileMenu}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.mobileNavLink} ${styles.mobileNavLinkActive}`
                      : styles.mobileNavLink
                  }
                  onClick={handleNavClick}
                >
                  {link.label}
                </NavLink>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
