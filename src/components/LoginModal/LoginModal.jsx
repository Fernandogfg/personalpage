import { useState } from 'react';
import Modal from '../Modal/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import styles from './LoginModal.module.css';

export default function LoginModal({ isOpen, onClose }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      onClose();
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Email ou senha incorretos'
        : 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      setError('Erro ao enviar email. Verifique o endereco.');
    } finally {
      setLoading(false);
    }
  };

  const switchToReset = () => {
    setMode('reset');
    setError('');
    setResetSent(false);
  };

  const switchToLogin = () => {
    setMode('login');
    setError('');
    setResetSent(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        {mode === 'login' ? (
          <>
            <h2 className={styles.title}>Login</h2>
            <p className={styles.subtitle}>Acesso restrito</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="login-email" className={styles.label}>Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  required
                  autoComplete="email"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="login-password" className={styles.label}>Senha</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button
                type="submit"
                className={styles.button}
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <button className={styles.forgotLink} onClick={switchToReset}>
              Esqueci minha senha
            </button>
          </>
        ) : (
          <>
            <h2 className={styles.title}>Recuperar senha</h2>
            <p className={styles.subtitle}>Enviaremos um link por email</p>

            {resetSent ? (
              <div className={styles.successMsg}>
                <p>Email enviado para <strong>{email}</strong></p>
                <p>Verifique sua caixa de entrada e clique no link.</p>
                <button className={styles.forgotLink} onClick={switchToLogin}>
                  Voltar ao login
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetRequest} className={styles.form}>
                <div className={styles.field}>
                  <label htmlFor="reset-email" className={styles.label}>Email</label>
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    required
                    autoComplete="email"
                  />
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <button
                  type="submit"
                  className={styles.button}
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar link'}
                </button>
              </form>
            )}

            {!resetSent && (
              <button className={styles.forgotLink} onClick={switchToLogin}>
                Voltar ao login
              </button>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
