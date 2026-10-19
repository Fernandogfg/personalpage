import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import styles from './ResetPasswordPage.module.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirm) {
      setError('As senhas nao coincidem.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Erro ao atualizar senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Definir nova senha</h2>

        {success ? (
          <div className={styles.success}>
            <p>Senha atualizada com sucesso!</p>
            <p className={styles.redirect}>Redirecionando...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="new-password" className={styles.label}>Nova senha</label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="confirm-password" className={styles.label}>Confirmar senha</label>
              <input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={styles.input}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              className={styles.button}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
