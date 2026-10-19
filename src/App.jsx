import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import ClientPage from './pages/ClientPage';
import RecruiterPage from './pages/RecruiterPage';
import DashboardPage from './pages/DashboardPage';
import NotesPage from './pages/NotesPage';
import BooksPage from './pages/BooksPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<RecruiterPage />} />
              <Route path="client" element={<ClientPage />} />
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="notes" element={
                <ProtectedRoute>
                  <NotesPage />
                </ProtectedRoute>
              } />
              <Route path="books" element={
                <ProtectedRoute>
                  <BooksPage />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
