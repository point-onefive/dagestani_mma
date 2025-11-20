import { gsap } from 'gsap';

/**
 * Transition from Dagestan landscape to space background
 * Fast zoom into sky section
 */
export function transitionToSpace(onComplete?: () => void) {
  // Instant background switch
  gsap.set('#dagestan-bg', { opacity: 0 });
  gsap.set('#space-bg', { opacity: 1 });
  
  // Fast zoom animation only
  gsap.to('#camera', {
    scale: 50,
    y: 10000,
    duration: 0.2,
    ease: 'power2.in',
    onComplete
  });
}

/**
 * Transition from space back to Dagestan landscape
 */
export function transitionToDagestan(onComplete?: () => void) {
  const tl = gsap.timeline({ 
    defaults: { ease: 'power2.out' },
    onComplete 
  });

  tl.to('#space-bg', {
    opacity: 0,
    duration: 0.4,
  })
  .to('#dagestan-bg', {
    opacity: 1,
    duration: 0.4,
  }, '<0.1')
  .to('#camera', {
    scale: 1,
    y: 0,
    duration: 0.5,
  }, '<');
}

/**
 * Set background state without animation (for direct navigation)
 */
export function setBackgroundState(state: 'dagestan' | 'space') {
  const dagestaEl = document.getElementById('dagestan-bg');
  const spaceEl = document.getElementById('space-bg');
  const cameraEl = document.getElementById('camera');
  
  if (!dagestaEl || !spaceEl || !cameraEl) return;

  if (state === 'dagestan') {
    dagestaEl.style.opacity = '1';
    spaceEl.style.opacity = '0';
    gsap.set(cameraEl, { scale: 1, y: 0 });
  } else {
    dagestaEl.style.opacity = '0';
    spaceEl.style.opacity = '1';
    gsap.set(cameraEl, { scale: 1, y: 0 });
  }
}
