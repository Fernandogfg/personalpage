import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LanguageToggle from '../LanguageToggle/LanguageToggle';
import ModeToggle from '../ModeToggle/ModeToggle';
import LoginModal from '../LoginModal/LoginModal';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);

  const handleAuthClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setLoginOpen(true);
    }
  };

  return (
    <>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.logo}>
          FG
        </Link>

        <ModeToggle />

        <div className={styles.rightSection}>
          <LanguageToggle />
          <button onClick={handleAuthClick} className={styles.loginBtn}>
            {user ? '⚙️' : 'Login'}
          </button>
        </div>
      </nav>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
