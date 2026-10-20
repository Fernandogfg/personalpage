-- Add queue_position column for reading queue ordering
ALTER TABLE books ADD COLUMN IF NOT EXISTS queue_position INT DEFAULT 0;

-- Index for efficient queue queries
CREATE INDEX IF NOT EXISTS idx_books_queue ON books (user_id, queue_position) WHERE queue_position > 0;
