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
      <Navbar />
      <main style={{ paddingTop: '70px', position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
