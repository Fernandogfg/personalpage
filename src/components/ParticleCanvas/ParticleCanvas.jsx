import { useRef, useEffect } from 'react';
import styles from './ParticleCanvas.module.css';

const CONNECTION_DISTANCE = 150;
const MOUSE_ATTRACTION_DISTANCE = 150;
const ATTRACTION_STRENGTH = 0.02;
const MAX_SPEED = 0.35;

const COLORS = [
  { r: 0, g: 212, b: 255 },
  { r: 0, g: 136, b: 204 },
  { r: 102, g: 229, b: 255 },
  { r: 0, g: 102, b: 255 },
];

export default function ParticleCanvas({ intensity = 1 }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null });
  const particlesRef = useRef([]);
  const animationRef = useRef(null);
  const scrollFadeRef = useRef(1);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const count = Math.round(50 + 50 * intensity);

    function initParticles(w, h) {
      const particles = [];
      for (let i = 0; i < count; i++) {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          baseRadius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.3,
          color,
          pulseOffset: Math.random() * Math.PI * 2,
          pulseSpeed: 0.5 + Math.random() * 1.5,
        });
      }
      particlesRef.current = particles;
    }

    function handleResize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    }

    function handleMouseMove(e) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    function handleScroll() {
      const fadeEnd = window.innerHeight * 0.6;
      scrollFadeRef.current = Math.max(0, 1 - window.scrollY / fadeEnd);
    }

    function animate() {
      const width = canvas.width;
      const height = canvas.height;
      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const fade = scrollFadeRef.current;

      timeRef.current += 0.016;
      const time = timeRef.current;

      ctx.clearRect(0, 0, width, height);

      if (fade > 0) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          p.x += p.vx;
          p.y += p.vy;

          if (p.x > width) p.x = 0;
          if (p.x < 0) p.x = width;
          if (p.y > height) p.y = 0;
          if (p.y < 0) p.y = height;

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

          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (speed > MAX_SPEED) {
            p.vx = (p.vx / speed) * MAX_SPEED;
            p.vy = (p.vy / speed) * MAX_SPEED;
          }

          const pulse = 1 + 0.3 * Math.sin(time * p.pulseSpeed + p.pulseOffset);
          const radius = p.baseRadius * pulse;
          const { r, g, b } = p.color;
          const alpha = p.opacity * intensity * fade;

          ctx.shadowBlur = 12;
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${alpha * 0.6})`;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CONNECTION_DISTANCE) {
              const opacity = (1 - distance / CONNECTION_DISTANCE) * 0.15 * intensity * fade;
              const r = Math.round((p1.color.r + p2.color.r) / 2);
              const g = Math.round((p1.color.g + p2.color.g) / 2);
              const b = Math.round((p1.color.b + p2.color.b) / 2);
              ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles(canvas.width, canvas.height);
    animationRef.current = requestAnimationFrame(animate);

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [intensity]);

  return <canvas ref={canvasRef} className={styles.canvas} />;
}
