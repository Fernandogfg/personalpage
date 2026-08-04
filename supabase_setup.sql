-- Execute este SQL no Supabase SQL Editor (https://supabase.com/dashboard)
-- Ele cria a função que o dashboard usa para monitorar o uso do banco

CREATE OR REPLACE FUNCTION get_db_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'db_size_bytes', pg_database_size(current_database()),
    'table_count', (
      SELECT count(*)
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ),
    'total_rows', (
      SELECT COALESCE(sum(n_live_tup), 0)
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
    ),
    'index_size_bytes', (
      SELECT COALESCE(sum(pg_indexes_size(quote_ident(schemaname) || '.' || quote_ident(tablename))), 0)
      FROM pg_tables
      WHERE schemaname = 'public'
    ),
    'tables', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'name', t.tablename,
          'row_count', COALESCE(s.n_live_tup, 0),
          'total_size', pg_total_relation_size(quote_ident(t.schemaname) || '.' || quote_ident(t.tablename))
        )
        ORDER BY pg_total_relation_size(quote_ident(t.schemaname) || '.' || quote_ident(t.tablename)) DESC
      ), '[]'::json)
      FROM pg_tables t
      LEFT JOIN pg_stat_user_tables s
        ON t.schemaname = s.schemaname AND t.tablename = s.relname
      WHERE t.schemaname = 'public'
    )
  ) INTO result;

  RETURN result;
END;
$$;
