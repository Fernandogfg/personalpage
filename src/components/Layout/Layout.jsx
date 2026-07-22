import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import ParticleCanvas from '../ParticleCanvas/ParticleCanvas';
import Footer from '../Footer/Footer';
import { useScrollToTop } from '../../hooks/useScrollToTop';

export default function Layout() {
  useScrollToTop();

  return (
    <>
      <ParticleCanvas />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />
        <main style={{ paddingTop: '70px' }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}
