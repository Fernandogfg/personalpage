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

async function searchOpenLibrary(query) {
  if (!query.trim()) return [];
  const encoded = encodeURIComponent(query);
  const fields = 'key,title,author_name,cover_i,first_publish_year,number_of_pages_median';

  const [generalRes, authorRes] = await Promise.all([
    fetch(`https://openlibrary.org/search.json?q=${encoded}&limit=8&fields=${fields}`),
    fetch(`https://openlibrary.org/search.json?author=${encoded}&limit=8&fields=${fields}`),
  ]);

  const [generalData, authorData] = await Promise.all([generalRes.json(), authorRes.json()]);

  const seen = new Set();
  const results = [];
  for (const doc of [...(authorData.docs || []), ...(generalData.docs || [])]) {
    if (seen.has(doc.key)) continue;
    seen.add(doc.key);
    results.push({
      google_books_id: doc.key,
      title: doc.title || '',
      author: (doc.author_name || []).join(', '),
      cover_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '',
      description: '',
      page_count: doc.number_of_pages_median || 0,
    });
    if (results.length >= 10) break;
  }
  return results;
}

async function searchGoogleBooks(query) {
  if (!query.trim()) return [];
  const key = import.meta.env.VITE_GOOGLE_BOOKS_KEY;
  const keyParam = key ? `&key=${key}` : '';
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8${keyParam}`
  );
  if (!res.ok) return null;
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

async function searchBooks(query) {
  const googleResults = await searchGoogleBooks(query);
  if (googleResults && googleResults.length > 0) return googleResults;
  return searchOpenLibrary(query);
}

const EMPTY_MANUAL = {
  title: '',
  author: '',
  cover_url: '',
  description: '',
  page_count: '',
};

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
  const [addMode, setAddMode] = useState('search');
  const [manualForm, setManualForm] = useState(EMPTY_MANUAL);
  const searchTimer = useRef(null);
  const searchInputRef = useRef(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

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
      setAddMode('search');
      setManualForm(EMPTY_MANUAL);
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
      const results = await searchBooks(val);
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
        queue_position: 0,
        user_id: user.id,
      })
      .select()
      .single();

    if (!error && data) {
      setBooks(prev => [data, ...prev]);
      setSearchOpen(false);
    }
  };

  const addManualBook = async () => {
    if (!manualForm.title.trim()) return;

    const bookData = {
      title: manualForm.title.trim(),
      author: manualForm.author.trim(),
      cover_url: manualForm.cover_url.trim(),
      description: manualForm.description.trim(),
      page_count: parseInt(manualForm.page_count) || 0,
      google_books_id: `manual_${Date.now()}`,
    };

    await addBook(bookData);
    setManualForm(EMPTY_MANUAL);
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

  // Queue management
  const queueBooks = books
    .filter(b => (b.queue_position || 0) > 0)
    .sort((a, b) => a.queue_position - b.queue_position);

  const addToQueue = async (bookId) => {
    const maxPos = queueBooks.length > 0
      ? Math.max(...queueBooks.map(b => b.queue_position))
      : 0;
    await updateBook(bookId, { queue_position: maxPos + 1 });
  };

  const removeFromQueue = async (bookId) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    const pos = book.queue_position;
    await updateBook(bookId, { queue_position: 0 });

    const toUpdate = queueBooks
      .filter(b => b.queue_position > pos && b.id !== bookId);
    for (const b of toUpdate) {
      await updateBook(b.id, { queue_position: b.queue_position - 1 });
    }
  };

  const handleDragStart = (idx) => {
    dragItem.current = idx;
  };

  const handleDragEnter = (idx) => {
    dragOverItem.current = idx;
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const reordered = [...queueBooks];
    const [dragged] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, dragged);

    const updates = reordered.map((book, i) => ({
      id: book.id,
      queue_position: i + 1,
    }));

    setBooks(prev => prev.map(b => {
      const upd = updates.find(u => u.id === b.id);
      return upd ? { ...b, queue_position: upd.queue_position } : b;
    }));

    for (const upd of updates) {
      await supabase.from('books').update({ queue_position: upd.queue_position }).eq('id', upd.id);
    }

    dragItem.current = null;
    dragOverItem.current = null;
  };

  const filteredBooks = filter === 'queue'
    ? queueBooks
    : filter === 'all'
      ? books
      : books.filter(b => b.status === filter);

  const counts = {
    all: books.length,
    want_to_read: books.filter(b => b.status === 'want_to_read').length,
    reading: books.filter(b => b.status === 'reading').length,
    read: books.filter(b => b.status === 'read').length,
    queue: queueBooks.length,
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
          { key: 'queue', label: 'Fila' },
        ].map(f => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${filter === f.key ? styles.filterBtnActive : ''} ${f.key === 'queue' ? styles.filterBtnQueue : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label} <span className={styles.filterCount}>{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {/* Queue view */}
      {filter === 'queue' ? (
        <div className={styles.queueList}>
          {queueBooks.length === 0 && (
            <div className={styles.empty}>
              <p>Nenhum livro na fila de leitura</p>
              <p className={styles.queueHint}>
                Use o botao &ldquo;+ Fila&rdquo; no card de um livro para adiciona-lo aqui
              </p>
            </div>
          )}
          {queueBooks.map((book, idx) => (
            <div
              key={book.id}
              className={styles.queueItem}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragEnter={() => handleDragEnter(idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className={styles.queueGrip}>
                <span className={styles.queueNumber}>{idx + 1}</span>
                <span className={styles.queueDots}>&#x2630;</span>
              </div>
              {book.cover_url ? (
                <img src={book.cover_url} alt="" className={styles.queueCover} />
              ) : (
                <div className={styles.queueCoverEmpty}>
                  {book.title.charAt(0)}
                </div>
              )}
              <div className={styles.queueInfo} onClick={() => setEditingBook(book)}>
                <h4 className={styles.queueTitle}>{book.title}</h4>
                <p className={styles.queueAuthor}>{book.author}</p>
                <span className={styles.queueStatus} data-status={book.status}>
                  {STATUS_LABELS[book.status]}
                </span>
              </div>
              <button
                className={styles.queueRemove}
                onClick={() => removeFromQueue(book.id)}
                title="Remover da fila"
              >
                &#x2715;
              </button>
            </div>
          ))}
        </div>
      ) : (
        <>
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
                  {!(book.queue_position > 0) && (
                    <button
                      className={styles.queueBadge}
                      onClick={(e) => { e.stopPropagation(); addToQueue(book.id); }}
                      title="Adicionar a fila de leitura"
                    >
                      + Fila
                    </button>
                  )}
                  {book.queue_position > 0 && (
                    <span className={styles.queuePosBadge}>
                      #{book.queue_position}
                    </span>
                  )}
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
        </>
      )}

      {/* Search / Add modal */}
      {searchOpen && (
        <div className={styles.overlay} onClick={() => setSearchOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            {/* Mode tabs */}
            <div className={styles.modalTabs}>
              <button
                className={`${styles.modalTab} ${addMode === 'search' ? styles.modalTabActive : ''}`}
                onClick={() => setAddMode('search')}
              >
                Buscar
              </button>
              <button
                className={`${styles.modalTab} ${addMode === 'manual' ? styles.modalTabActive : ''}`}
                onClick={() => setAddMode('manual')}
              >
                Manual
              </button>
              <button className={styles.modalClose} onClick={() => setSearchOpen(false)}>
                &#x2715;
              </button>
            </div>

            {addMode === 'search' ? (
              <>
                <div className={styles.modalHeader}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => handleSearchInput(e.target.value)}
                    className={styles.searchInput}
                    placeholder="Buscar livro por titulo ou autor..."
                  />
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
              </>
            ) : (
              <div className={styles.manualForm}>
                <div className={styles.manualField}>
                  <label className={styles.manualLabel}>Titulo *</label>
                  <input
                    type="text"
                    value={manualForm.title}
                    onChange={e => setManualForm(prev => ({ ...prev, title: e.target.value }))}
                    className={styles.manualInput}
                    placeholder="Nome do livro"
                    autoFocus
                  />
                </div>
                <div className={styles.manualField}>
                  <label className={styles.manualLabel}>Autor</label>
                  <input
                    type="text"
                    value={manualForm.author}
                    onChange={e => setManualForm(prev => ({ ...prev, author: e.target.value }))}
                    className={styles.manualInput}
                    placeholder="Nome do autor"
                  />
                </div>
                <div className={styles.manualRow}>
                  <div className={styles.manualField}>
                    <label className={styles.manualLabel}>Paginas</label>
                    <input
                      type="number"
                      value={manualForm.page_count}
                      onChange={e => setManualForm(prev => ({ ...prev, page_count: e.target.value }))}
                      className={styles.manualInput}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div className={styles.manualField}>
                    <label className={styles.manualLabel}>URL da capa</label>
                    <input
                      type="url"
                      value={manualForm.cover_url}
                      onChange={e => setManualForm(prev => ({ ...prev, cover_url: e.target.value }))}
                      className={styles.manualInput}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className={styles.manualField}>
                  <label className={styles.manualLabel}>Descricao</label>
                  <textarea
                    value={manualForm.description}
                    onChange={e => setManualForm(prev => ({ ...prev, description: e.target.value }))}
                    className={styles.manualTextarea}
                    placeholder="Sinopse ou anotacoes..."
                    rows={3}
                  />
                </div>
                <button
                  className={styles.manualSubmit}
                  onClick={addManualBook}
                  disabled={!manualForm.title.trim()}
                >
                  Adicionar livro
                </button>
              </div>
            )}
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

              {/* Queue */}
              <div className={styles.editSection}>
                <label className={styles.editLabel}>Fila de leitura</label>
                {editingBook.queue_position > 0 ? (
                  <div className={styles.queueControl}>
                    <span className={styles.queuePosLabel}>Posicao #{editingBook.queue_position}</span>
                    <button
                      className={styles.queueControlBtn}
                      onClick={() => {
                        removeFromQueue(editingBook.id);
                        setEditingBook(prev => ({ ...prev, queue_position: 0 }));
                      }}
                    >
                      Remover da fila
                    </button>
                  </div>
                ) : (
                  <button
                    className={styles.queueControlBtn}
                    onClick={() => {
                      const maxPos = queueBooks.length > 0
                        ? Math.max(...queueBooks.map(b => b.queue_position))
                        : 0;
                      const newPos = maxPos + 1;
                      updateBook(editingBook.id, { queue_position: newPos });
                      setEditingBook(prev => ({ ...prev, queue_position: newPos }));
                    }}
                  >
                    + Adicionar a fila
                  </button>
                )}
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
