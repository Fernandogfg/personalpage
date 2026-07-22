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
