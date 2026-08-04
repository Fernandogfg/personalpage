import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import styles from './DashboardPage.module.css';

const FREE_TIER_DB_MB = 500;

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_db_stats');
      if (rpcError) throw rpcError;
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const dbSizeMB = stats ? stats.db_size_bytes / (1024 * 1024) : 0;
  const usagePercent = stats ? Math.min((dbSizeMB / FREE_TIER_DB_MB) * 100, 100) : 0;

  const getBarColor = (percent) => {
    if (percent < 50) return 'var(--color-accent)';
    if (percent < 80) return '#ffaa00';
    return '#ff4d6a';
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.userEmail}>{user?.email}</p>
        </div>
        <button onClick={signOut} className={styles.logoutBtn}>Sair</button>
      </div>

      {error && (
        <div className={styles.errorCard}>
          <p>Erro ao carregar dados: {error}</p>
          <p className={styles.errorHint}>
            Verifique se a função <code>get_db_stats</code> foi criada no Supabase SQL Editor.
          </p>
        </div>
      )}

      {loading && !error && (
        <div className={styles.loading}>Carregando...</div>
      )}

      {stats && !loading && (
        <>
          <div className={styles.mainCard}>
            <h2 className={styles.cardTitle}>Uso do Banco de Dados</h2>
            <div className={styles.usageDisplay}>
              <span className={styles.usageValue}>{formatBytes(stats.db_size_bytes)}</span>
              <span className={styles.usageLimit}>/ {FREE_TIER_DB_MB} MB</span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressBar}
                style={{
                  width: `${usagePercent}%`,
                  background: getBarColor(usagePercent),
                }}
              />
            </div>
            <p className={styles.usagePercent}>{usagePercent.toFixed(1)}% utilizado</p>
          </div>

          <div className={styles.grid}>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>📊</span>
              <span className={styles.statValue}>{stats.table_count}</span>
              <span className={styles.statLabel}>Tabelas</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>📝</span>
              <span className={styles.statValue}>{stats.total_rows?.toLocaleString('pt-BR')}</span>
              <span className={styles.statLabel}>Registros totais</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statIcon}>📦</span>
              <span className={styles.statValue}>{formatBytes(stats.index_size_bytes)}</span>
              <span className={styles.statLabel}>Tamanho dos índices</span>
            </div>
          </div>

          {stats.tables && stats.tables.length > 0 && (
            <div className={styles.tableCard}>
              <h2 className={styles.cardTitle}>Tabelas</h2>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Tabela</th>
                      <th>Registros</th>
                      <th>Tamanho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.tables.map((t) => (
                      <tr key={t.name}>
                        <td className={styles.tableName}>{t.name}</td>
                        <td>{t.row_count?.toLocaleString('pt-BR')}</td>
                        <td>{formatBytes(t.total_size)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button onClick={fetchStats} className={styles.refreshBtn}>
            Atualizar dados
          </button>
        </>
      )}
    </div>
  );
}
