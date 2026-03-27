import { useTranslation } from 'react-i18next';
import SocialLinks from '../SocialLinks/SocialLinks';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <SocialLinks />
        <p className={styles.text}>
          {t('footer.made_with')} <span className={styles.heart}>❤</span> {t('footer.by')}
        </p>
        <p className={styles.copyright}>© {year}</p>
      </div>
    </footer>
  );
}
