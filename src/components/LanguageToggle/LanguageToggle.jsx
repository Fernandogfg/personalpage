import { useTranslation } from 'react-i18next';
import styles from './LanguageToggle.module.css';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const handleToggle = () => {
    const newLang = i18n.language === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(newLang);
  };

  const isPT = i18n.language === 'pt';

  return (
    <button className={styles.toggle} onClick={handleToggle} aria-label="Toggle language">
      <span className={isPT ? styles.active : styles.inactive}>PT</span>
      <span className={styles.divider}>/</span>
      <span className={!isPT ? styles.active : styles.inactive}>EN</span>
    </button>
  );
}
