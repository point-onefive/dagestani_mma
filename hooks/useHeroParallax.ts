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
    let lastScrollY = 0;
    let lastMouseX = 0.5;
    let lastMouseY = 0.5;

    const isDesktop = () => window.innerWidth >= 768;
    const isMobile = () => window.innerWidth < 768;

    const updateTransforms = () => {
      frameRequested = false;

      // Skip tiny changes to reduce repaints
      const scrollDiff = Math.abs(scrollY - lastScrollY);
      const mouseDiffX = Math.abs(mouseX - lastMouseX);
      const mouseDiffY = Math.abs(mouseY - lastMouseY);
      
      if (scrollDiff < 1 && mouseDiffX < 0.001 && mouseDiffY < 0.001) {
        return;
      }

      lastScrollY = scrollY;
      lastMouseX = mouseX;
      lastMouseY = mouseY;

      const scrollFactor = Math.min(scrollY, window.innerHeight * 2);
      const scrollNorm = scrollFactor / window.innerHeight;

      // Reduce parallax intensity on mobile for better performance
      const parallaxIntensity = isMobile() ? 0.3 : 1;

      // Background (largest movement for depth) - optimized for mobile
      const bgScroll = scrollNorm * -10 * parallaxIntensity;
      
      // Haze (medium movement) - optimized for mobile
      const hazeScroll = scrollNorm * -6 * parallaxIntensity;

      // Pointer multipliers (desktop only)
      const pointerFactor = isDesktop() ? 1 : 0;
      const offsetX = (mouseX - 0.5) * pointerFactor;
      const offsetY = (mouseY - 0.5) * pointerFactor;

      // Background moves most (reduced)
      const bgX = offsetX * 4;
      const bgY = bgScroll + offsetY * 5;
      
      // Haze moves moderately (reduced)
      const hazeX = offsetX * 3;
      const hazeY = hazeScroll + offsetY * 4;

      // Apply parallax with GPU-accelerated transforms
      if (backgroundRef.current) {
        backgroundRef.current.style.transform = `translate3d(${bgX}px, ${bgY}px, 0)`;
      }
      if (hazeRef.current) {
        hazeRef.current.style.transform = `translate3d(${hazeX}px, ${hazeY}px, 0)`;
      }
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
