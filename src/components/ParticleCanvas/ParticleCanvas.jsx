import { useRef, useEffect, useCallback } from 'react';
import styles from './ParticleCanvas.module.css';

export default function ParticleCanvas({ intensity = 1 }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null });
  const particlesRef = useRef([]);
  const animationRef = useRef(null);

  const PARTICLE_COUNT = Math.round(20 + 20 * intensity);
  const CONNECTION_DISTANCE = 150;
  const MOUSE_ATTRACTION_DISTANCE = 150;
  const ATTRACTION_STRENGTH = 0.02;
  const MAX_SPEED = 2.5;
  const FRICTION = 0.98;
  const ACCENT_COLOR = '#00d4ff';

  // Initialize particles
  const initializeParticles = useCallback((width, height) => {
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
    particlesRef.current = particles;
  }, [PARTICLE_COUNT]);

  // Handle resize
  const handleResize = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initializeParticles(canvas.width, canvas.height);
  }, [initializeParticles]);

  // Handle mouse move
  const handleMouseMove = useCallback((e) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const particles = particlesRef.current;
    const mouse = mouseRef.current;

    // Clear canvas
    ctx.fillStyle = 'rgba(5, 10, 30, 1)'; // Dark background
    ctx.fillRect(0, 0, width, height);

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x > width) p.x = 0;
      if (p.x < 0) p.x = width;
      if (p.y > height) p.y = 0;
      if (p.y < 0) p.y = height;

      // Mouse attraction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MOUSE_ATTRACTION_DISTANCE) {
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * ATTRACTION_STRENGTH;
          p.vy += Math.sin(angle) * ATTRACTION_STRENGTH;
        }
      }

      // Friction — dissipa velocidade gradualmente
      p.vx *= FRICTION;
      p.vy *= FRICTION;

      // Limite de velocidade máxima
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > MAX_SPEED) {
        p.vx = (p.vx / speed) * MAX_SPEED;
        p.vy = (p.vy / speed) * MAX_SPEED;
      }

      // Draw particle
      ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity * intensity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw connections between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CONNECTION_DISTANCE) {
          const opacity = (1 - distance / CONNECTION_DISTANCE) * 0.2 * intensity;
          ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [intensity]);

  // Setup and cleanup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initializeParticles(canvas.width, canvas.height);

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [animate, handleResize, handleMouseMove, initializeParticles]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
