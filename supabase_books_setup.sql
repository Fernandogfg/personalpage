-- Execute este SQL no Supabase SQL Editor
-- Cria a tabela de livros e políticas de segurança (RLS)

CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT DEFAULT '',
  cover_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  page_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'want_to_read'
    CHECK (status IN ('want_to_read', 'reading', 'read')),
  progress INT DEFAULT 0,
  rating INT DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  notes TEXT DEFAULT '',
  google_books_id TEXT DEFAULT '',
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own books"
  ON books FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_updated_at ON books(updated_at DESC);

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
