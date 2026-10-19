import { useEffect, useRef, useCallback, useState } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, forceX, forceY } from 'd3-force';
import styles from './NoteGraph.module.css';

const DEFAULT_SETTINGS = {
  centerForce: 0.05,
  repelForce: 250,
  linkForce: 0.4,
  linkDistance: 100,
  nodeSize: 1,
  linkThickness: 1,
  showOrphans: true,
  showArrows: false,
  textFade: 1,
  localMode: false,
  localDepth: 1,
};

export default function NoteGraph({ notes, activeId, onSelectNote }) {
  const canvasRef = useRef(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [controlsOpen, setControlsOpen] = useState(false);
  const stateRef = useRef({
    nodes: [],
    links: [],
    sim: null,
    drag: null,
    hover: null,
    pan: { x: 0, y: 0 },
    zoom: 1,
    isPanning: false,
    panStart: { x: 0, y: 0 },
    panOrigin: { x: 0, y: 0 },
    animFrame: null,
    width: 800,
    height: 600,
    settings: DEFAULT_SETTINGS,
  });

  // Keep settings in sync with ref
  useEffect(() => {
    stateRef.current.settings = settings;
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toWorld = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const s = stateRef.current;
    return {
      x: (clientX - rect.left - s.pan.x) / s.zoom,
      y: (clientY - rect.top - s.pan.y) / s.zoom,
    };
  }, []);

  const getRadius = useCallback((node) => {
    const base = 5 * stateRef.current.settings.nodeSize;
    return base + Math.min((node.linkCount || 0) * 1.5, 15) * stateRef.current.settings.nodeSize;
  }, []);

  const findNode = useCallback((wx, wy) => {
    const s = stateRef.current;
    for (let i = s.nodes.length - 1; i >= 0; i--) {
      const n = s.nodes[i];
      const r = getRadius(n);
      const dx = n.x - wx;
      const dy = n.y - wy;
      if (dx * dx + dy * dy < (r + 4) * (r + 4)) return n;
    }
    return null;
  }, [getRadius]);

  const getConnected = useCallback((nodeId) => {
    const s = stateRef.current;
    const set = new Set();
    s.links.forEach(l => {
      const sid = typeof l.source === 'object' ? l.source.id : l.source;
      const tid = typeof l.target === 'object' ? l.target.id : l.target;
      if (sid === nodeId) set.add(tid);
      if (tid === nodeId) set.add(sid);
    });
    return set;
  }, []);

  // Get nodes within depth of active note (for local graph)
  const getLocalNodes = useCallback((noteId, depth) => {
    const visited = new Set([noteId]);
    let frontier = new Set([noteId]);
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    const noteMap = new Map(notes.map(n => [n.title.toLowerCase(), n]));

    for (let d = 0; d < depth; d++) {
      const nextFrontier = new Set();
      frontier.forEach(id => {
        const note = notes.find(n => n.id === id);
        if (!note) return;
        // Outgoing links
        const matches = [...(note.content || '').matchAll(wikiLinkRegex)];
        matches.forEach(m => {
          const target = noteMap.get(m[1].toLowerCase());
          if (target && !visited.has(target.id)) {
            visited.add(target.id);
            nextFrontier.add(target.id);
          }
        });
        // Incoming links
        notes.forEach(other => {
          if (visited.has(other.id)) return;
          const otherMatches = [...(other.content || '').matchAll(wikiLinkRegex)];
          otherMatches.forEach(m => {
            const target = noteMap.get(m[1].toLowerCase());
            if (target && target.id === id) {
              visited.add(other.id);
              nextFrontier.add(other.id);
            }
          });
        });
      });
      frontier = nextFrontier;
    }
    return visited;
  }, [notes]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;
    const cfg = s.settings;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = s.width * dpr;
    canvas.height = s.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, s.width, s.height);

    ctx.save();
    ctx.translate(s.pan.x, s.pan.y);
    ctx.scale(s.zoom, s.zoom);

    const hoverId = s.hover?.id;
    const connected = hoverId ? getConnected(hoverId) : null;

    // Links
    s.links.forEach(l => {
      const sx = l.source.x, sy = l.source.y;
      const tx = l.target.x, ty = l.target.y;
      const sid = l.source.id, tid = l.target.id;

      let alpha = 0.12;
      let width = 0.8 * cfg.linkThickness;

      if (hoverId) {
        if (sid === hoverId || tid === hoverId) {
          alpha = 0.6;
          width = 1.5 * cfg.linkThickness;
        } else {
          alpha = 0.04;
        }
      }

      if (activeId && (sid === activeId || tid === activeId)) {
        alpha = Math.max(alpha, 0.35);
        width = Math.max(width, 1.2 * cfg.linkThickness);
      }

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
      ctx.lineWidth = width;
      ctx.stroke();

      // Arrows
      if (cfg.showArrows) {
        const angle = Math.atan2(ty - sy, tx - sx);
        const tr = getRadius(l.target);
        const ax = tx - Math.cos(angle) * (tr + 4);
        const ay = ty - Math.sin(angle) * (tr + 4);
        const arrowSize = 6 * cfg.linkThickness;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - arrowSize * Math.cos(angle - 0.4), ay - arrowSize * Math.sin(angle - 0.4));
        ctx.lineTo(ax - arrowSize * Math.cos(angle + 0.4), ay - arrowSize * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
        ctx.fill();
      }
    });

    // Nodes
    s.nodes.forEach(node => {
      const r = getRadius(node);
      const isActive = node.id === activeId;
      const isHover = node.id === hoverId;
      const isConnected = connected?.has(node.id);
      const isDimmed = hoverId && !isHover && !isConnected;

      if (isActive || isHover) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 8, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(node.x, node.y, r, node.x, node.y, r + 8);
        glow.addColorStop(0, 'rgba(0, 212, 255, 0.2)');
        glow.addColorStop(1, 'rgba(0, 212, 255, 0)');
        ctx.fillStyle = glow;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);

      if (node.color) {
        ctx.fillStyle = isHover ? node.color : `${node.color}99`;
        ctx.strokeStyle = node.color;
      } else if (isActive) {
        ctx.fillStyle = 'rgba(0, 212, 255, 0.9)';
        ctx.strokeStyle = '#00d4ff';
      } else if (isHover) {
        ctx.fillStyle = 'rgba(0, 212, 255, 0.7)';
        ctx.strokeStyle = '#00d4ff';
      } else if (isConnected) {
        ctx.fillStyle = 'rgba(0, 212, 255, 0.45)';
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.6)';
      } else if (isDimmed) {
        ctx.fillStyle = 'rgba(0, 212, 255, 0.08)';
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
      } else if (node.isOrphan) {
        ctx.fillStyle = 'rgba(136, 146, 176, 0.2)';
        ctx.strokeStyle = 'rgba(136, 146, 176, 0.3)';
      } else {
        ctx.fillStyle = 'rgba(0, 212, 255, 0.25)';
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
      }

      ctx.lineWidth = isActive || isHover ? 2 : 1;
      ctx.fill();
      ctx.stroke();

      // Label
      const labelAlpha = isDimmed ? 0.1 : cfg.textFade;
      if (labelAlpha > 0.05) {
        const fontSize = (isActive || isHover ? 12 : 10) * cfg.nodeSize;
        ctx.font = `${isActive ? '600' : '400'} ${fontSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        if (isActive || isHover) {
          ctx.fillStyle = `rgba(0, 212, 255, ${labelAlpha})`;
        } else if (isConnected) {
          ctx.fillStyle = `rgba(224, 232, 255, ${labelAlpha * 0.7})`;
        } else {
          ctx.fillStyle = `rgba(136, 146, 176, ${labelAlpha * 0.6})`;
        }

        ctx.fillText(node.title, node.x, node.y + r + 6);
      }
    });

    ctx.restore();
    s.animFrame = requestAnimationFrame(draw);
  }, [activeId, getConnected, getRadius]);

  // Build graph data and simulation
  useEffect(() => {
    const s = stateRef.current;
    const cfg = settings;
    const container = canvasRef.current?.parentElement;
    if (!container) return;

    s.width = container.clientWidth;
    s.height = container.clientHeight;

    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    const noteMap = new Map(notes.map(n => [n.title.toLowerCase(), n]));

    // Determine which notes to show
    let visibleIds = null;
    if (cfg.localMode && activeId) {
      visibleIds = getLocalNodes(activeId, cfg.localDepth);
    }

    const visibleNotes = visibleIds
      ? notes.filter(n => visibleIds.has(n.id))
      : notes;

    const graphLinks = [];
    visibleNotes.forEach(n => {
      const matches = [...(n.content || '').matchAll(wikiLinkRegex)];
      matches.forEach(m => {
        const target = noteMap.get(m[1].toLowerCase());
        if (target && target.id !== n.id && (!visibleIds || visibleIds.has(target.id))) {
          const exists = graphLinks.some(
            l => (l.source === n.id && l.target === target.id) ||
                 (l.source === target.id && l.target === n.id)
          );
          if (!exists) {
            graphLinks.push({ source: n.id, target: target.id });
          }
        }
      });
    });

    const linkCounts = new Map();
    graphLinks.forEach(l => {
      linkCounts.set(l.source, (linkCounts.get(l.source) || 0) + 1);
      linkCounts.set(l.target, (linkCounts.get(l.target) || 0) + 1);
    });

    const graphNodes = visibleNotes
      .filter(n => cfg.showOrphans || (linkCounts.get(n.id) || 0) > 0)
      .map(n => {
        const existing = s.nodes.find(old => old.id === n.id);
        return {
          id: n.id,
          title: n.title,
          linkCount: linkCounts.get(n.id) || 0,
          isOrphan: (linkCounts.get(n.id) || 0) === 0,
          x: existing?.x ?? s.width / 2 + (Math.random() - 0.5) * 200,
          y: existing?.y ?? s.height / 2 + (Math.random() - 0.5) * 200,
          vx: existing?.vx ?? 0,
          vy: existing?.vy ?? 0,
        };
      });

    s.nodes = graphNodes;
    s.links = graphLinks;

    if (s.sim) s.sim.stop();

    s.sim = forceSimulation(graphNodes)
      .force('link', forceLink(graphLinks).id(d => d.id).distance(cfg.linkDistance).strength(cfg.linkForce))
      .force('charge', forceManyBody().strength(-cfg.repelForce).distanceMax(400))
      .force('center', forceCenter(s.width / 2, s.height / 2).strength(cfg.centerForce))
      .force('collide', forceCollide(d => getRadius(d) + 12).strength(0.7))
      .force('x', forceX(s.width / 2).strength(0.02))
      .force('y', forceY(s.height / 2).strength(0.02))
      .alphaDecay(0.01)
      .alphaMin(0.001)
      .velocityDecay(0.3);

    return () => { if (s.sim) s.sim.stop(); };
  }, [notes, settings, activeId, getRadius, getLocalNodes]);

  // Animation loop
  useEffect(() => {
    const s = stateRef.current;
    s.animFrame = requestAnimationFrame(draw);
    return () => { if (s.animFrame) cancelAnimationFrame(s.animFrame); };
  }, [draw]);

  // Resize
  useEffect(() => {
    const container = canvasRef.current?.parentElement;
    if (!container) return;
    const ro = new ResizeObserver(([entry]) => {
      stateRef.current.width = entry.contentRect.width;
      stateRef.current.height = entry.contentRect.height;
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const handleMouseDown = useCallback((e) => {
    const s = stateRef.current;
    const w = toWorld(e.clientX, e.clientY);
    const node = findNode(w.x, w.y);

    if (node) {
      s.drag = node;
      node.fx = node.x;
      node.fy = node.y;
      if (s.sim) s.sim.alphaTarget(0.3).restart();
    } else {
      s.isPanning = true;
      s.panStart = { x: e.clientX, y: e.clientY };
      s.panOrigin = { ...s.pan };
    }
  }, [toWorld, findNode]);

  const handleMouseMove = useCallback((e) => {
    const s = stateRef.current;
    if (s.drag) {
      const w = toWorld(e.clientX, e.clientY);
      s.drag.fx = w.x;
      s.drag.fy = w.y;
    } else if (s.isPanning) {
      s.pan = {
        x: s.panOrigin.x + (e.clientX - s.panStart.x),
        y: s.panOrigin.y + (e.clientY - s.panStart.y),
      };
    } else {
      const w = toWorld(e.clientX, e.clientY);
      const node = findNode(w.x, w.y);
      s.hover = node;
      canvasRef.current.style.cursor = node ? 'pointer' : 'grab';
    }
  }, [toWorld, findNode]);

  const handleMouseUp = useCallback((e) => {
    const s = stateRef.current;
    if (s.drag) {
      const w = toWorld(e.clientX, e.clientY);
      const node = findNode(w.x, w.y);
      if (node && node.id === s.drag.id) onSelectNote(node.id);
      s.drag.fx = null;
      s.drag.fy = null;
      if (s.sim) s.sim.alphaTarget(0);
      s.drag = null;
    }
    s.isPanning = false;
  }, [toWorld, findNode, onSelectNote]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const s = stateRef.current;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    const newZoom = Math.min(Math.max(s.zoom * factor, 0.15), 4);
    s.pan.x = mx - (mx - s.pan.x) * (newZoom / s.zoom);
    s.pan.y = my - (my - s.pan.y) * (newZoom / s.zoom);
    s.zoom = newZoom;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const s = stateRef.current;
    s.hover = null;
    if (s.drag) {
      s.drag.fx = null;
      s.drag.fy = null;
      if (s.sim) s.sim.alphaTarget(0);
      s.drag = null;
    }
    s.isPanning = false;
  }, []);

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        className={styles.canvas}
      />

      {/* Controls toggle */}
      <button
        className={styles.controlsToggle}
        onClick={() => setControlsOpen(!controlsOpen)}
      >
        {controlsOpen ? '✕' : '⚙'}
      </button>

      {/* Controls panel */}
      {controlsOpen && (
        <div className={styles.controls}>
          {/* Filters */}
          <div className={styles.controlSection}>
            <h4 className={styles.controlTitle}>Filtros</h4>
            <label className={styles.toggle}>
              <input type="checkbox" checked={settings.showOrphans} onChange={e => updateSetting('showOrphans', e.target.checked)} />
              <span>Notas soltas</span>
            </label>
            <label className={styles.toggle}>
              <input type="checkbox" checked={settings.localMode} onChange={e => updateSetting('localMode', e.target.checked)} />
              <span>Grafo local</span>
            </label>
            {settings.localMode && (
              <div className={styles.sliderGroup}>
                <span className={styles.sliderLabel}>Profundidade: {settings.localDepth}</span>
                <input type="range" min="1" max="5" step="1" value={settings.localDepth}
                  onChange={e => updateSetting('localDepth', Number(e.target.value))} className={styles.slider} />
              </div>
            )}
          </div>

          {/* Display */}
          <div className={styles.controlSection}>
            <h4 className={styles.controlTitle}>Exibicao</h4>
            <label className={styles.toggle}>
              <input type="checkbox" checked={settings.showArrows} onChange={e => updateSetting('showArrows', e.target.checked)} />
              <span>Setas</span>
            </label>
            <div className={styles.sliderGroup}>
              <span className={styles.sliderLabel}>Tamanho dos nos: {settings.nodeSize.toFixed(1)}</span>
              <input type="range" min="0.3" max="3" step="0.1" value={settings.nodeSize}
                onChange={e => updateSetting('nodeSize', Number(e.target.value))} className={styles.slider} />
            </div>
            <div className={styles.sliderGroup}>
              <span className={styles.sliderLabel}>Espessura dos links: {settings.linkThickness.toFixed(1)}</span>
              <input type="range" min="0.3" max="3" step="0.1" value={settings.linkThickness}
                onChange={e => updateSetting('linkThickness', Number(e.target.value))} className={styles.slider} />
            </div>
            <div className={styles.sliderGroup}>
              <span className={styles.sliderLabel}>Opacidade do texto: {settings.textFade.toFixed(1)}</span>
              <input type="range" min="0" max="1" step="0.1" value={settings.textFade}
                onChange={e => updateSetting('textFade', Number(e.target.value))} className={styles.slider} />
            </div>
          </div>

          {/* Forces */}
          <div className={styles.controlSection}>
            <h4 className={styles.controlTitle}>Forcas</h4>
            <div className={styles.sliderGroup}>
              <span className={styles.sliderLabel}>Centro: {settings.centerForce.toFixed(2)}</span>
              <input type="range" min="0" max="0.5" step="0.01" value={settings.centerForce}
                onChange={e => updateSetting('centerForce', Number(e.target.value))} className={styles.slider} />
            </div>
            <div className={styles.sliderGroup}>
              <span className={styles.sliderLabel}>Repulsao: {settings.repelForce.toFixed(0)}</span>
              <input type="range" min="0" max="800" step="10" value={settings.repelForce}
                onChange={e => updateSetting('repelForce', Number(e.target.value))} className={styles.slider} />
            </div>
            <div className={styles.sliderGroup}>
              <span className={styles.sliderLabel}>Link forca: {settings.linkForce.toFixed(2)}</span>
              <input type="range" min="0" max="1" step="0.05" value={settings.linkForce}
                onChange={e => updateSetting('linkForce', Number(e.target.value))} className={styles.slider} />
            </div>
            <div className={styles.sliderGroup}>
              <span className={styles.sliderLabel}>Link distancia: {settings.linkDistance.toFixed(0)}</span>
              <input type="range" min="30" max="300" step="10" value={settings.linkDistance}
                onChange={e => updateSetting('linkDistance', Number(e.target.value))} className={styles.slider} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
