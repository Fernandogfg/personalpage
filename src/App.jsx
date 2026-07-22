import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout/Layout';
import ClientPage from './pages/ClientPage';
import RecruiterPage from './pages/RecruiterPage';

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ClientPage />} />
            <Route path="recruiter" element={<RecruiterPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
