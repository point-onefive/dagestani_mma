// components/PixelBlast.tsx
'use client';

import React, { useRef, useEffect } from 'react';

interface PixelBlastProps {
  variant?: 'circle' | 'square';
  pixelSize?: number;
  color?: string;
  patternScale?: number;
  patternDensity?: number;
  pixelSizeJitter?: number;
  enableRipples?: boolean;
  rippleSpeed?: number;
  rippleThickness?: number;
  rippleIntensityScale?: number;
  liquid?: boolean;
  liquidStrength?: number;
  liquidRadius?: number;
  liquidWobbleSpeed?: number;
  speed?: number;
  edgeFade?: number;
  transparent?: boolean;
  disabled?: boolean;
}

export default function PixelBlast({
  variant = 'circle',
  pixelSize = 6,
  color = '#B19EEF',
  patternScale = 3,
  patternDensity = 1.2,
  pixelSizeJitter = 0.5,
  enableRipples = true,
  rippleSpeed = 0.4,
  rippleThickness = 0.12,
  rippleIntensityScale = 1.5,
  liquid = true,
  liquidStrength = 0.12,
  liquidRadius = 1.2,
  liquidWobbleSpeed = 5,
  speed = 0.6,
  edgeFade = 0.25,
  transparent = false,
  disabled = false,
}: PixelBlastProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (disabled) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      time += speed / 60;

      if (!transparent) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      const cols = Math.floor(canvas.width / (pixelSize * patternScale));
      const rows = Math.floor(canvas.height / (pixelSize * patternScale));

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * pixelSize * patternScale;
          const y = j * pixelSize * patternScale;

          let intensity = Math.sin(i * patternDensity + time) * Math.cos(j * patternDensity + time);

          if (enableRipples) {
            const dx = i - cols / 2;
            const dy = j - rows / 2;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const ripple = Math.sin(dist * rippleThickness - time * rippleSpeed) * rippleIntensityScale;
            intensity += ripple;
          }

          if (liquid) {
            const wobbleX = Math.sin(time * liquidWobbleSpeed + i) * liquidRadius;
            const wobbleY = Math.cos(time * liquidWobbleSpeed + j) * liquidRadius;
            intensity += (wobbleX + wobbleY) * liquidStrength;
          }

          // Edge fade
          const edgeX = Math.min(i / (cols * edgeFade), (cols - i) / (cols * edgeFade), 1);
          const edgeY = Math.min(j / (rows * edgeFade), (rows - j) / (rows * edgeFade), 1);
          intensity *= Math.min(edgeX, edgeY);

          const alpha = Math.max(0, Math.min(1, intensity));

          if (alpha > 0.05) {
            ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            const size = pixelSize * (1 + (Math.random() - 0.5) * pixelSizeJitter);

            if (variant === 'circle') {
              ctx.beginPath();
              ctx.arc(x + pixelSize / 2, y + pixelSize / 2, size / 2, 0, Math.PI * 2);
              ctx.fill();
            } else {
              ctx.fillRect(x, y, size, size);
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    disabled,
    variant,
    pixelSize,
    color,
    patternScale,
    patternDensity,
    pixelSizeJitter,
    enableRipples,
    rippleSpeed,
    rippleThickness,
    rippleIntensityScale,
    liquid,
    liquidStrength,
    liquidRadius,
    liquidWobbleSpeed,
    speed,
    edgeFade,
    transparent,
  ]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
