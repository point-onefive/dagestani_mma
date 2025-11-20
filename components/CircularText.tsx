'use client';

import { useEffect } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';

const getRotationTransition = (duration: number, from: number, loop = true) => ({
  from,
  to: from + 360,
  ease: 'linear' as const,
  duration,
  type: 'tween' as const,
  repeat: loop ? Infinity : 0
});

const getTransition = (duration: number, from: number) => ({
  rotate: getRotationTransition(duration, from),
  scale: {
    type: 'spring' as const,
    damping: 20,
    stiffness: 300
  }
});

interface CircularTextProps {
  text: string;
  spinDuration?: number;
  onHover?: 'speedUp' | 'slowDown' | 'pause' | 'goBonkers' | null;
  className?: string;
  size?: number;
  fontSize?: number;
}

const CircularText = ({ 
  text, 
  spinDuration = 20, 
  onHover = 'speedUp', 
  className = '',
  size = 200,
  fontSize = 24
}: CircularTextProps) => {
  const letters = Array.from(text);
  const controls = useAnimation();
  const rotation = useMotionValue(0);

  useEffect(() => {
    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start)
    });
  }, [spinDuration, text, onHover, controls, rotation]);

  const handleHoverStart = () => {
    const start = rotation.get();
    if (!onHover) return;

    let transitionConfig;
    let scaleVal = 1;

    switch (onHover) {
      case 'slowDown':
        transitionConfig = getTransition(spinDuration * 2, start);
        break;
      case 'speedUp':
        transitionConfig = getTransition(spinDuration / 4, start);
        break;
      case 'pause':
        transitionConfig = {
          rotate: { type: 'spring' as const, damping: 20, stiffness: 300 },
          scale: { type: 'spring' as const, damping: 20, stiffness: 300 }
        };
        scaleVal = 1;
        break;
      case 'goBonkers':
        transitionConfig = getTransition(spinDuration / 20, start);
        scaleVal = 0.8;
        break;
      default:
        transitionConfig = getTransition(spinDuration, start);
    }

    controls.start({
      rotate: start + 360,
      scale: scaleVal,
      transition: transitionConfig
    });
  };

  const handleHoverEnd = () => {
    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      scale: 1,
      transition: getTransition(spinDuration, start)
    });
  };

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ 
        rotate: rotation,
        width: size,
        height: size,
        borderRadius: '50%',
        transformOrigin: '50% 50%',
      }}
      initial={{ rotate: 0 }}
      animate={controls}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      suppressHydrationWarning
    >
      {letters.map((letter, i) => {
        const rotationDeg = (360 / letters.length) * i;
        const radius = (size / 2) - (fontSize / 2);
        const angle = (i * 2 * Math.PI) / letters.length;
        const x = Math.sin(angle) * radius;
        const y = -Math.cos(angle) * radius;

        return (
          <span
            key={i}
            className={`absolute left-1/2 top-1/2 inline-block font-bold transition-all duration-500 ${
              letter === '•' ? 'text-purple-400' : 'text-white'
            }`}
            style={{ 
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotationDeg}deg)`,
              WebkitTransform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotationDeg}deg)`,
              fontSize: `${fontSize}px`,
            }}
          >
            {letter}
          </span>
        );
      })}
    </motion.div>
  );
};

export default CircularText;
