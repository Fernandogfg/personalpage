import { useState, useEffect, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import styles from './NotesPage.module.css';

const AUTOSAVE_DELAY = 1000;

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mode, setMode] = useState('edit');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dbError, setDbError] = useState(false);
  const saveTimer = useRef(null);
  const editorRef = useRef(null);

  const fetchNotes = useCallback(async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('id, title, content, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      setDbError(true);
      return;
    }
    if (data) setNotes(data);
  }, [user.id]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const saveNote = useCallback(async (id, newTitle, newContent) => {
    setSaving(true);
    const { error } = await supabase
      .from('notes')
      .update({ title: newTitle || 'Sem título', content: newContent })
      .eq('id', id);

    if (!error) {
      setNotes(prev => prev.map(n =>
        n.id === id
          ? { ...n, title: newTitle || 'Sem título', content: newContent, updated_at: new Date().toISOString() }
          : n
      ));
    }
    setSaving(false);
  }, []);

  const scheduleAutosave = useCallback((id, newTitle, newContent) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveNote(id, newTitle, newContent), AUTOSAVE_DELAY);
  }, [saveNote]);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (activeId) scheduleAutosave(activeId, val, content);
  };

  const handleContentChange = (e) => {
    const val = e.target.value;
    setContent(val);
    if (activeId) scheduleAutosave(activeId, title, val);
  };

  const selectNote = (note) => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      if (activeId) saveNote(activeId, title, content);
    }
    setActiveId(note.id);
    setTitle(note.title);
    setContent(note.content || '');
    setMode('edit');
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const createNote = async () => {
    const { data, error } = await supabase
      .from('notes')
      .insert({ title: 'Sem título', content: '', user_id: user.id })
      .select()
      .single();

    if (error) {
      setDbError(true);
      return;
    }

    if (data) {
      setNotes(prev => [data, ...prev]);
      setActiveId(data.id);
      setTitle(data.title);
      setContent('');
      setMode('edit');
      if (window.innerWidth < 768) setSidebarOpen(false);
    }
  };

  const deleteNote = async (id) => {
    await supabase.from('notes').delete().eq('id', id);
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setTitle('');
      setContent('');
    }
  };

  const navigateToNote = (noteTitle) => {
    const target = notes.find(n =>
      n.title.toLowerCase() === noteTitle.toLowerCase()
    );
    if (target) {
      selectNote(target);
    } else {
      createNoteWithTitle(noteTitle);
    }
  };

  const createNoteWithTitle = async (noteTitle) => {
    const { data, error } = await supabase
      .from('notes')
      .insert({ title: noteTitle, content: '', user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setNotes(prev => [data, ...prev]);
      setActiveId(data.id);
      setTitle(data.title);
      setContent('');
      setMode('edit');
    }
  };

  const renderContent = (text) => {
    return text.replace(
      /\[\[([^\]]+)\]\]/g,
      (_, name) => `[${name}](#wiki:${encodeURIComponent(name)})`
    );
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    (n.content && n.content.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
      ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleEditorKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      const newContent = val.substring(0, start) + '  ' + val.substring(end);
      setContent(newContent);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
      if (activeId) scheduleAutosave(activeId, title, newContent);
    }
  };

  if (dbError) {
    return (
      <div className={styles.container}>
        <div className={styles.errorPage}>
          <h2>Tabela de notas não encontrada</h2>
          <p>Execute o arquivo <code>supabase_notes_setup.sql</code> no SQL Editor do Supabase para criar a tabela.</p>
          <button onClick={() => { setDbError(false); fetchNotes(); }} className={styles.retryBtn}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Notas</h2>
          <div className={styles.sidebarActions}>
            <button onClick={createNote} className={styles.newBtn} title="Nova nota">+</button>
            <button onClick={() => setSidebarOpen(false)} className={styles.closeSidebarBtn} title="Fechar">◀</button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />

        <div className={styles.notesList}>
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className={`${styles.noteItem} ${note.id === activeId ? styles.noteItemActive : ''}`}
              onClick={() => selectNote(note)}
            >
              <span className={styles.noteTitle}>{note.title}</span>
              <span className={styles.noteDate}>{formatDate(note.updated_at)}</span>
              <button
                className={styles.deleteBtn}
                onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
              >
                ×
              </button>
            </div>
          ))}
          {filteredNotes.length === 0 && (
            <p className={styles.emptyMsg}>
              {search ? 'Nenhuma nota encontrada' : 'Nenhuma nota ainda'}
            </p>
          )}
        </div>
      </aside>

      {!sidebarOpen && (
        <button
          className={styles.openSidebarBtn}
          onClick={() => setSidebarOpen(true)}
          title="Abrir notas"
        >
          ▶
        </button>
      )}

      <main className={styles.editor}>
        {activeId ? (
          <>
            <div className={styles.editorHeader}>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                className={styles.titleInput}
                placeholder="Título da nota"
              />
              <div className={styles.editorActions}>
                {saving && <span className={styles.savingIndicator}>Salvando...</span>}
                <div className={styles.modeToggle}>
                  <button
                    className={`${styles.modeBtn} ${mode === 'edit' ? styles.modeBtnActive : ''}`}
                    onClick={() => setMode('edit')}
                  >
                    Editar
                  </button>
                  <button
                    className={`${styles.modeBtn} ${mode === 'preview' ? styles.modeBtnActive : ''}`}
                    onClick={() => setMode('preview')}
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>

            {mode === 'edit' ? (
              <textarea
                ref={editorRef}
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleEditorKeyDown}
                className={styles.textarea}
                placeholder="Escreva em markdown... Use [[nome]] para linkar notas"
                spellCheck={false}
              />
            ) : (
              <div className={styles.preview}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => {
                      if (href && href.startsWith('#wiki:')) {
                        const name = decodeURIComponent(href.replace('#wiki:', ''));
                        return (
                          <a
                            href="#"
                            className={styles.wikiLink}
                            onClick={(e) => { e.preventDefault(); navigateToNote(name); }}
                          >
                            {children}
                          </a>
                        );
                      }
                      return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
                    }
                  }}
                >
                  {renderContent(content)}
                </ReactMarkdown>
              </div>
            )}
          </>
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon}>📝</span>
            <p>Selecione uma nota ou crie uma nova</p>
          </div>
        )}
      </main>
    </div>
  );
}
