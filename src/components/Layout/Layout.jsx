import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import ParticleCanvas from '../ParticleCanvas/ParticleCanvas';
import Footer from '../Footer/Footer';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import { useAuth } from '../../contexts/AuthContext';

export default function Layout() {
  useScrollToTop();
  const { authError, clearAuthError } = useAuth();

  return (
    <>
      <ParticleCanvas />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <main style={{ paddingTop: '70px' }}>
          {authError && (
            <div style={{
              background: 'rgba(255, 77, 106, 0.1)',
              border: '1px solid rgba(255, 77, 106, 0.3)',
              color: '#ff4d6a',
              padding: '0.75rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
            }}>
              <span>{authError}. Solicite um novo link de recuperacao.</span>
              <button
                onClick={clearAuthError}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff4d6a',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  padding: '0 0.5rem',
                }}
              >
                &#x2715;
              </button>
            </div>
          )}
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}
