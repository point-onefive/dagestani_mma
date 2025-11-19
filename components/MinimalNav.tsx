'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function MinimalNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show nav when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsOpen(false); // Close menu when hiding nav
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/90 border-b border-purple-500/20 backdrop-blur-md shadow-lg shadow-purple-500/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Desktop/Tablet - Simple back arrow */}
        <Link href="/" className="hidden sm:block">
          <motion.div
            whileHover={{ x: -2 }}
            className="flex items-center gap-2 text-slate-300 hover:text-purple-400 transition-colors group"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            <span className="text-sm font-medium">Home</span>
          </motion.div>
        </Link>

        {/* Mobile - Left side empty for symmetry */}
        <div className="sm:hidden w-10" />

        {/* Hamburger menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden p-2 rounded-lg hover:bg-purple-500/10 transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="sm:hidden bg-black/95 border-t border-purple-500/20"
        >
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="block px-6 py-3 text-sm text-slate-300 hover:bg-purple-500/10 hover:text-purple-300 transition-colors border-b border-purple-500/10"
          >
            🏠 Home
          </Link>
          <Link
            href="/upcoming"
            onClick={() => setIsOpen(false)}
            className="block px-6 py-3 text-sm text-slate-300 hover:bg-purple-500/10 hover:text-purple-300 transition-colors border-b border-purple-500/10"
          >
            📅 Upcoming Matches
          </Link>
          <Link
            href="/historical"
            onClick={() => setIsOpen(false)}
            className="block px-6 py-3 text-sm text-slate-300 hover:bg-purple-500/10 hover:text-purple-300 transition-colors"
          >
            📊 Historical Data
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
