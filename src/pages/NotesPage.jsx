import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorView } from '@codemirror/view';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import NoteGraph from '../components/NoteGraph/NoteGraph';
import styles from './NotesPage.module.css';

const AUTOSAVE_DELAY = 1000;

const cmTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    height: '100%',
    fontSize: '14px',
  },
  '.cm-content': {
    fontFamily: 'JetBrains Mono, monospace',
    caretColor: '#00d4ff',
    lineHeight: '1.7',
    padding: '1.5rem',
  },
  '.cm-cursor': {
    borderLeftColor: '#00d4ff',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(0, 212, 255, 0.15) !important',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    borderRight: '1px solid rgba(0, 212, 255, 0.08)',
    color: 'rgba(136, 146, 176, 0.4)',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '12px',
  },
  '.cm-activeLineGutter': {
    color: '#00d4ff',
    backgroundColor: 'transparent',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(0, 212, 255, 0.03)',
  },
  '.cm-line': {
    padding: '0 0.5rem',
  },
  // Markdown syntax highlighting
  '.cm-header-1': { color: '#00d4ff', fontSize: '1.4em', fontWeight: '700' },
  '.cm-header-2': { color: '#00d4ff', fontSize: '1.2em', fontWeight: '600' },
  '.cm-header-3': { color: '#00d4ff', fontSize: '1.1em', fontWeight: '600' },
  '.cm-strong': { color: '#e0e8ff', fontWeight: '700' },
  '.cm-emphasis': { color: '#e0e8ff', fontStyle: 'italic' },
  '.cm-link': { color: '#00d4ff', textDecoration: 'underline' },
  '.cm-url': { color: '#0066ff' },
  '.cm-quote': { color: '#8892b0', fontStyle: 'italic' },
  '.cm-keyword': { color: '#00d4ff' },
  '.cm-atom': { color: '#0066ff' },
  '.cm-string': { color: '#7ee787' },
  '.cm-comment': { color: '#8892b0' },
  '.cm-meta': { color: '#8892b0' },
  '.cm-tag': { color: '#ff7b72' },
  '.cm-attribute': { color: '#d2a8ff' },
  '.cm-number': { color: '#79c0ff' },
  '.cm-variableName': { color: '#ffa657' },
  '.cm-propertyName': { color: '#79c0ff' },
  '.cm-typeName': { color: '#ff7b72' },
  '.cm-def': { color: '#ffa657' },
}, { dark: true });

const cmExtensions = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  EditorView.lineWrapping,
  cmTheme,
];

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [view, setView] = useState('edit');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dbError, setDbError] = useState(false);
  const saveTimer = useRef(null);

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

  const handleContentChange = useCallback((val) => {
    setContent(val);
    if (activeId) scheduleAutosave(activeId, title, val);
  }, [activeId, title, scheduleAutosave]);

  const selectNote = useCallback((note) => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      if (activeId) saveNote(activeId, title, content);
    }
    setActiveId(note.id);
    setTitle(note.title);
    setContent(note.content || '');
    if (view === 'graph') setView('edit');
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [activeId, title, content, saveNote, view]);

  const selectNoteById = useCallback((id) => {
    const note = notes.find(n => n.id === id);
    if (note) selectNote(note);
  }, [notes, selectNote]);

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
      setView('edit');
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

  const navigateToNote = useCallback((noteTitle) => {
    const target = notes.find(n =>
      n.title.toLowerCase() === noteTitle.toLowerCase()
    );
    if (target) {
      selectNote(target);
    } else {
      createNoteWithTitle(noteTitle);
    }
  }, [notes, selectNote]);

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
      setView('edit');
    }
  };

  const renderContent = (text) => {
    return text.replace(
      /\[\[([^\]]+)\]\]/g,
      (_, name) => `[${name}](#wiki:${encodeURIComponent(name)})`
    );
  };

  const filteredNotes = useMemo(() => notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    (n.content && n.content.toLowerCase().includes(search.toLowerCase()))
  ), [notes, search]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
      ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (dbError) {
    return (
      <div className={styles.container}>
        <div className={styles.errorPage}>
          <h2>Tabela de notas nao encontrada</h2>
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
                x
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
        <div className={styles.editorHeader}>
          {activeId && view !== 'graph' && (
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className={styles.titleInput}
              placeholder="Titulo da nota"
            />
          )}
          {!activeId && view !== 'graph' && (
            <span className={styles.titlePlaceholder}>Selecione ou crie uma nota</span>
          )}
          {view === 'graph' && (
            <span className={styles.titlePlaceholder}>Graph View</span>
          )}

          <div className={styles.editorActions}>
            {saving && <span className={styles.savingIndicator}>Salvando...</span>}
            <div className={styles.modeToggle}>
              <button
                className={`${styles.modeBtn} ${view === 'edit' ? styles.modeBtnActive : ''}`}
                onClick={() => setView('edit')}
              >
                Editar
              </button>
              <button
                className={`${styles.modeBtn} ${view === 'preview' ? styles.modeBtnActive : ''}`}
                onClick={() => setView('preview')}
              >
                Preview
              </button>
              <button
                className={`${styles.modeBtn} ${view === 'graph' ? styles.modeBtnActive : ''}`}
                onClick={() => setView('graph')}
              >
                Graph
              </button>
            </div>
          </div>
        </div>

        {view === 'graph' ? (
          <NoteGraph notes={notes} activeId={activeId} onSelectNote={selectNoteById} />
        ) : activeId ? (
          view === 'edit' ? (
            <div className={styles.cmWrapper}>
              <CodeMirror
                value={content}
                onChange={handleContentChange}
                extensions={cmExtensions}
                theme="none"
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightActiveLine: true,
                  foldGutter: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  indentOnInput: true,
                  tabSize: 2,
                }}
                placeholder="Escreva em markdown... Use [[nome]] para linkar notas"
              />
            </div>
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
          )
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
