import { useEffect, useRef, useState, useCallback } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import styles from './NoteGraph.module.css';

export default function NoteGraph({ notes, activeId, onSelectNote }) {
  const svgRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [dragNode, setDragNode] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const simRef = useRef(null);

  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (!container) return;
    const ro = new ResizeObserver(([entry]) => {
      setDimensions({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    const noteMap = new Map(notes.map(n => [n.title.toLowerCase(), n]));

    const graphNodes = notes.map(n => {
      const matches = [...(n.content || '').matchAll(wikiLinkRegex)];
      return {
        id: n.id,
        title: n.title,
        linkCount: matches.length,
      };
    });

    const graphLinks = [];
    notes.forEach(n => {
      const matches = [...(n.content || '').matchAll(wikiLinkRegex)];
      matches.forEach(m => {
        const target = noteMap.get(m[1].toLowerCase());
        if (target && target.id !== n.id) {
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

    const sim = forceSimulation(graphNodes)
      .force('link', forceLink(graphLinks).id(d => d.id).distance(120))
      .force('charge', forceManyBody().strength(-300))
      .force('center', forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collide', forceCollide(40))
      .on('tick', () => {
        setNodes([...graphNodes]);
        setLinks([...graphLinks]);
      });

    simRef.current = sim;
    return () => sim.stop();
  }, [notes, dimensions.width, dimensions.height]);

  const handleMouseDown = useCallback((e, node) => {
    e.stopPropagation();
    const svgRect = svgRef.current.getBoundingClientRect();
    setDragNode(node);
    setOffset({
      x: (e.clientX - svgRect.left) / zoom - pan.x - node.x,
      y: (e.clientY - svgRect.top) / zoom - pan.y - node.y,
    });
    if (simRef.current) {
      node.fx = node.x;
      node.fy = node.y;
      simRef.current.alphaTarget(0.3).restart();
    }
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e) => {
    if (dragNode) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const x = (e.clientX - svgRect.left) / zoom - pan.x - offset.x;
      const y = (e.clientY - svgRect.top) / zoom - pan.y - offset.y;
      dragNode.fx = x;
      dragNode.fy = y;
    } else if (isPanning) {
      setPan({
        x: (e.clientX - panStart.x) / zoom + pan.x,
        y: (e.clientY - panStart.y) / zoom + pan.y,
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [dragNode, offset, isPanning, panStart, zoom, pan]);

  const handleMouseUp = useCallback(() => {
    if (dragNode) {
      dragNode.fx = null;
      dragNode.fy = null;
      if (simRef.current) simRef.current.alphaTarget(0);
      setDragNode(null);
    }
    setIsPanning(false);
  }, [dragNode]);

  const handleBgMouseDown = useCallback((e) => {
    if (e.target === svgRef.current || e.target.tagName === 'rect') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(Math.max(z * delta, 0.2), 3));
  }, []);

  const getNodeRadius = (node) => {
    const base = 6;
    return base + (node.linkCount || 0) * 2;
  };

  return (
    <div className={styles.container}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseDown={handleBgMouseDown}
        onWheel={handleWheel}
        className={styles.svg}
      >
        <rect width={dimensions.width} height={dimensions.height} fill="transparent" />
        <g transform={`translate(${pan.x * zoom}, ${pan.y * zoom}) scale(${zoom})`}>
          {links.map((link, i) => (
            <line
              key={i}
              x1={link.source.x}
              y1={link.source.y}
              x2={link.target.x}
              y2={link.target.y}
              className={styles.link}
            />
          ))}
          {nodes.map(node => (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseDown={(e) => handleMouseDown(e, node)}
              onClick={() => onSelectNote(node.id)}
              className={styles.node}
            >
              <circle
                r={getNodeRadius(node)}
                className={`${styles.circle} ${node.id === activeId ? styles.circleActive : ''}`}
              />
              <text
                dy={getNodeRadius(node) + 14}
                className={`${styles.label} ${node.id === activeId ? styles.labelActive : ''}`}
              >
                {node.title}
              </text>
            </g>
          ))}
        </g>
      </svg>
      <div className={styles.controls}>
        <button onClick={() => setZoom(z => Math.min(z * 1.2, 3))} className={styles.zoomBtn}>+</button>
        <button onClick={() => setZoom(z => Math.max(z * 0.8, 0.2))} className={styles.zoomBtn}>-</button>
      </div>
    </div>
  );
}
