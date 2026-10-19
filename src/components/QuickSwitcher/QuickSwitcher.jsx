import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './QuickSwitcher.module.css';

export default function QuickSwitcher({ isOpen, onClose, notes, onSelect, onCreate }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const filtered = query
    ? notes.filter(n => n.title.toLowerCase().includes(query.toLowerCase()))
    : notes.slice(0, 10);

  const canCreate = query && !notes.some(n => n.title.toLowerCase() === query.toLowerCase());

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const totalItems = filtered.length + (canCreate ? 1 : 0);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (canCreate && selectedIndex === filtered.length) {
        onCreate(query);
        onClose();
      } else if (filtered[selectedIndex]) {
        onSelect(filtered[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [totalItems, selectedIndex, filtered, canCreate, query, onSelect, onCreate, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.input}
          placeholder="Abrir nota..."
        />
        <div className={styles.results}>
          {filtered.map((note, i) => (
            <div
              key={note.id}
              className={`${styles.item} ${i === selectedIndex ? styles.itemActive : ''}`}
              onClick={() => { onSelect(note); onClose(); }}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <span className={styles.itemTitle}>{note.title}</span>
            </div>
          ))}
          {canCreate && (
            <div
              className={`${styles.item} ${styles.itemCreate} ${selectedIndex === filtered.length ? styles.itemActive : ''}`}
              onClick={() => { onCreate(query); onClose(); }}
              onMouseEnter={() => setSelectedIndex(filtered.length)}
            >
              <span className={styles.createLabel}>Criar:</span>
              <span className={styles.itemTitle}>{query}</span>
            </div>
          )}
          {filtered.length === 0 && !canCreate && (
            <div className={styles.empty}>Nenhuma nota encontrada</div>
          )}
        </div>
      </div>
    </div>
  );
}
