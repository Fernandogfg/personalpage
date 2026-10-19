import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import styles from './BooksPage.module.css';

const STATUS_LABELS = {
  want_to_read: 'Quero ler',
  reading: 'Lendo',
  read: 'Lido',
};

const STATUS_ORDER = ['reading', 'want_to_read', 'read'];

async function searchGoogleBooks(query) {
  if (!query.trim()) return [];
  const key = import.meta.env.VITE_GOOGLE_BOOKS_KEY;
  const keyParam = key ? `&key=${key}` : '';
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8${keyParam}`
  );
  const data = await res.json();
  if (!data.items) return [];
  return data.items.map(item => {
    const info = item.volumeInfo;
    return {
      google_books_id: item.id,
      title: info.title || '',
      author: (info.authors || []).join(', '),
      cover_url: info.imageLinks?.thumbnail?.replace('http://', 'https://') || '',
      description: info.description || '',
      page_count: info.pageCount || 0,
    };
  });
}

export default function BooksPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dbError, setDbError] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const searchTimer = useRef(null);
  const searchInputRef = useRef(null);

  const fetchBooks = useCallback(async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      setDbError(true);
      return;
    }
    if (data) setBooks(data);
  }, [user.id]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [searchOpen]);

  const handleSearchInput = (val) => {
    setSearchQuery(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!val.trim()) { setSearchResults([]); return; }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      const results = await searchGoogleBooks(val);
      setSearchResults(results);
      setSearching(false);
    }, 500);
  };

  const addBook = async (bookData) => {
    const existing = books.find(b => b.google_books_id === bookData.google_books_id);
    if (existing) {
      setSearchOpen(false);
      return;
    }

    const { data, error } = await supabase
      .from('books')
      .insert({
        ...bookData,
        status: 'want_to_read',
        progress: 0,
        rating: 0,
        notes: '',
        user_id: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      setBooks(prev => [data, ...prev]);
      setSearchOpen(false);
    }
  };

  const updateBook = async (id, updates) => {
    const { error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setBooks(prev => prev.map(b =>
        b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } : b
      ));
    }
  };

  const deleteBook = async (id) => {
    await supabase.from('books').delete().eq('id', id);
    setBooks(prev => prev.filter(b => b.id !== id));
    if (editingBook?.id === id) setEditingBook(null);
  };

  const cycleStatus = (book) => {
    const idx = STATUS_ORDER.indexOf(book.status);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    updateBook(book.id, { status: next });
  };

  const filteredBooks = filter === 'all'
    ? books
    : books.filter(b => b.status === filter);

  const counts = {
    all: books.length,
    want_to_read: books.filter(b => b.status === 'want_to_read').length,
    reading: books.filter(b => b.status === 'reading').length,
    read: books.filter(b => b.status === 'read').length,
  };

  if (dbError) {
    return (
      <div className={styles.container}>
        <div className={styles.errorPage}>
          <h2>Tabela de livros nao encontrada</h2>
          <p>Execute o arquivo <code>supabase_books_setup.sql</code> no SQL Editor do Supabase para criar a tabela.</p>
          <button onClick={() => { setDbError(false); fetchBooks(); }} className={styles.retryBtn}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Meus Livros</h1>
        <button className={styles.addBtn} onClick={() => setSearchOpen(true)}>
          + Adicionar livro
        </button>
      </div>

      {/* Filter tabs */}
      <div className={styles.filters}>
        {[
          { key: 'all', label: 'Todos' },
          { key: 'reading', label: 'Lendo' },
          { key: 'want_to_read', label: 'Quero ler' },
          { key: 'read', label: 'Lidos' },
        ].map(f => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${filter === f.key ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label} <span className={styles.filterCount}>{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {/* Book grid */}
      <div className={styles.grid}>
        {filteredBooks.map(book => (
          <div key={book.id} className={styles.card} onClick={() => setEditingBook(book)}>
            <div className={styles.cardCover}>
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className={styles.coverImg} />
              ) : (
                <div className={styles.coverPlaceholder}>
                  <span>{book.title.charAt(0)}</span>
                </div>
              )}
              <button
                className={styles.statusBadge}
                data-status={book.status}
                onClick={(e) => { e.stopPropagation(); cycleStatus(book); }}
                title="Clique para mudar status"
              >
                {STATUS_LABELS[book.status]}
              </button>
            </div>
            <div className={styles.cardInfo}>
              <h3 className={styles.cardTitle}>{book.title}</h3>
              <p className={styles.cardAuthor}>{book.author}</p>
              {book.status === 'reading' && book.page_count > 0 && (
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${Math.min((book.progress / book.page_count) * 100, 100)}%` }}
                  />
                  <span className={styles.progressText}>
                    {book.progress}/{book.page_count}
                  </span>
                </div>
              )}
              {book.status === 'read' && book.rating > 0 && (
                <div className={styles.stars}>
                  {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className={styles.empty}>
          <p>{filter === 'all' ? 'Nenhum livro adicionado ainda' : `Nenhum livro com status "${STATUS_LABELS[filter] || filter}"`}</p>
          <button className={styles.addBtn} onClick={() => setSearchOpen(true)}>
            Buscar e adicionar livro
          </button>
        </div>
      )}

      {/* Search modal */}
      {searchOpen && (
        <div className={styles.overlay} onClick={() => setSearchOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => handleSearchInput(e.target.value)}
                className={styles.searchInput}
                placeholder="Buscar livro por titulo ou autor..."
              />
              <button className={styles.modalClose} onClick={() => setSearchOpen(false)}>
                &#x2715;
              </button>
            </div>
            <div className={styles.searchResults}>
              {searching && <p className={styles.searchMsg}>Buscando...</p>}
              {!searching && searchQuery && searchResults.length === 0 && (
                <p className={styles.searchMsg}>Nenhum resultado encontrado</p>
              )}
              {searchResults.map(result => (
                <div
                  key={result.google_books_id}
                  className={styles.searchItem}
                  onClick={() => addBook(result)}
                >
                  {result.cover_url ? (
                    <img src={result.cover_url} alt="" className={styles.searchCover} />
                  ) : (
                    <div className={styles.searchCoverEmpty} />
                  )}
                  <div className={styles.searchInfo}>
                    <h4 className={styles.searchTitle}>{result.title}</h4>
                    <p className={styles.searchAuthor}>{result.author}</p>
                    {result.page_count > 0 && (
                      <p className={styles.searchPages}>{result.page_count} paginas</p>
                    )}
                  </div>
                  <span className={styles.searchAdd}>+</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingBook && (
        <div className={styles.overlay} onClick={() => setEditingBook(null)}>
          <div className={styles.editModal} onClick={e => e.stopPropagation()}>
            <div className={styles.editHeader}>
              <div className={styles.editCoverWrap}>
                {editingBook.cover_url ? (
                  <img src={editingBook.cover_url} alt="" className={styles.editCover} />
                ) : (
                  <div className={styles.editCoverPlaceholder}>
                    {editingBook.title.charAt(0)}
                  </div>
                )}
              </div>
              <div className={styles.editInfo}>
                <h2 className={styles.editTitle}>{editingBook.title}</h2>
                <p className={styles.editAuthor}>{editingBook.author}</p>
                {editingBook.page_count > 0 && (
                  <p className={styles.editPages}>{editingBook.page_count} paginas</p>
                )}
              </div>
              <button className={styles.modalClose} onClick={() => setEditingBook(null)}>
                &#x2715;
              </button>
            </div>

            <div className={styles.editBody}>
              {/* Status */}
              <div className={styles.editSection}>
                <label className={styles.editLabel}>Status</label>
                <div className={styles.statusGroup}>
                  {STATUS_ORDER.map(s => (
                    <button
                      key={s}
                      className={`${styles.statusOption} ${editingBook.status === s ? styles.statusOptionActive : ''}`}
                      onClick={() => {
                        updateBook(editingBook.id, { status: s });
                        setEditingBook(prev => ({ ...prev, status: s }));
                      }}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress */}
              {editingBook.status === 'reading' && editingBook.page_count > 0 && (
                <div className={styles.editSection}>
                  <label className={styles.editLabel}>
                    Progresso: {editingBook.progress} / {editingBook.page_count}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={editingBook.page_count}
                    value={editingBook.progress}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setEditingBook(prev => ({ ...prev, progress: val }));
                      updateBook(editingBook.id, { progress: val });
                    }}
                    className={styles.progressSlider}
                  />
                </div>
              )}

              {/* Rating */}
              <div className={styles.editSection}>
                <label className={styles.editLabel}>Avaliacao</label>
                <div className={styles.ratingGroup}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className={`${styles.starBtn} ${star <= editingBook.rating ? styles.starBtnActive : ''}`}
                      onClick={() => {
                        const val = star === editingBook.rating ? 0 : star;
                        setEditingBook(prev => ({ ...prev, rating: val }));
                        updateBook(editingBook.id, { rating: val });
                      }}
                    >
                      &#9733;
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className={styles.editSection}>
                <label className={styles.editLabel}>Notas pessoais</label>
                <textarea
                  value={editingBook.notes}
                  onChange={e => {
                    const val = e.target.value;
                    setEditingBook(prev => ({ ...prev, notes: val }));
                  }}
                  onBlur={() => updateBook(editingBook.id, { notes: editingBook.notes })}
                  className={styles.notesTextarea}
                  placeholder="Suas anotacoes sobre o livro..."
                  rows={4}
                />
              </div>

              {/* Description */}
              {editingBook.description && (
                <div className={styles.editSection}>
                  <label className={styles.editLabel}>Sinopse</label>
                  <p className={styles.descriptionText}>{editingBook.description}</p>
                </div>
              )}

              {/* Delete */}
              <button
                className={styles.deleteBtn}
                onClick={() => deleteBook(editingBook.id)}
              >
                Remover livro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
