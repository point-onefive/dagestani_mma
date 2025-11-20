'use client';

import { useEffect, useState } from 'react';

export default function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
  }>>([]);

  useEffect(() => {
    // Generate particles only on client to avoid hydration mismatch
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 12}s`,
      animationDuration: `${12 + Math.random() * 8}s`,
    }));
    setParticles(newParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
            background: '#b19eef',
            opacity: 0.3,
            animation: `float ${particle.animationDuration} ease-in-out infinite alternate`,
            animationDelay: particle.animationDelay,
          }}
        />
      ))}
    </div>
  );
}
