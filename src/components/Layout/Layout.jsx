import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import ParticleCanvas from '../ParticleCanvas/ParticleCanvas';

export default function Layout() {
  return (
    <>
      <ParticleCanvas />
      <Navbar />
      <main style={{ paddingTop: '70px', position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>
    </>
  );
}
