// hooks/useHeroParallax.ts
'use client';

import { useEffect } from 'react';

type LayerRefs = {
  backgroundRef: React.RefObject<HTMLDivElement>;
  hazeRef: React.RefObject<HTMLDivElement>;
  gridRef: React.RefObject<HTMLDivElement>;
};

export function useHeroParallax({
  backgroundRef,
  hazeRef,
  gridRef,
}: LayerRefs) {
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || typeof window === 'undefined') {
      return;
    }

    let scrollY = window.scrollY || 0;
    let mouseX = 0.5;
    let mouseY = 0.5;
    let frameRequested = false;

    const isDesktop = () => window.innerWidth >= 768;

    const updateTransforms = () => {
      frameRequested = false;

      const scrollFactor = Math.min(scrollY, window.innerHeight * 2); // clamp
      const scrollNorm = scrollFactor / window.innerHeight;

      // Parallax stack: Background moves MOST, Haze medium, PixelBlast STATIC
      // Background (largest movement for depth) - more subtle
      const bgScroll = scrollNorm * -20;
      
      // Haze (medium movement) - more subtle
      const hazeScroll = scrollNorm * -12;

      // Pointer multipliers (background and haze only) - more subtle
      const pointerFactor = isDesktop() ? 1 : 0;
      const offsetX = (mouseX - 0.5) * pointerFactor;
      const offsetY = (mouseY - 0.5) * pointerFactor;

      // Background moves most (reduced)
      const bgX = offsetX * 8;
      const bgY = bgScroll + offsetY * 10;
      
      // Haze moves moderately (reduced)
      const hazeX = offsetX * 6;
      const hazeY = hazeScroll + offsetY * 8;

      // Apply parallax to background and haze only (PixelBlast stays STATIC)
      if (backgroundRef.current) {
        backgroundRef.current.style.transform = `translate3d(${bgX}px, ${bgY}px, 0)`;
      }
      if (hazeRef.current) {
        hazeRef.current.style.transform = `translate3d(${hazeX}px, ${hazeY}px, 0)`;
      }
      // PixelBlast grid stays completely static - no transform applied
    };

    const requestFrame = () => {
      if (!frameRequested) {
        frameRequested = true;
        window.requestAnimationFrame(updateTransforms);
      }
    };

    const onScroll = () => {
      scrollY = window.scrollY || 0;
      requestFrame();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDesktop()) return;
      const { innerWidth, innerHeight } = window;
      mouseX = e.clientX / innerWidth;
      mouseY = e.clientY / innerHeight;
      requestFrame();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // initial paint
    requestFrame();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [backgroundRef, hazeRef, gridRef]);
}
