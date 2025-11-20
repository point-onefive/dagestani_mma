'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import CircularText from './CircularText';

interface MinimalNavProps {
  currentPage?: 'upcoming' | 'historical';
}

export default function MinimalNav({ currentPage }: MinimalNavProps = {}) {
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
            className="flex items-center gap-2 text-slate-300 hover:text-purple-400 transition-colors group relative"
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
            <span 
              className="text-sm font-medium relative"
              style={{
                transition: 'text-shadow 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textShadow = '0 0 6px rgba(180,120,255,0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textShadow = 'none';
              }}
            >
              Home
              <span 
                className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
              />
            </span>
          </motion.div>
        </Link>

        {/* Desktop - Character logo in center */}
        <Link href="/" className="hidden sm:block absolute left-1/2 transform -translate-x-1/2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-[48px] h-[48px] flex items-center justify-center"
          >
            {/* Circular text border */}
            <div className="absolute inset-0">
              <CircularText 
                text="DAGSTATS•UFC•TRACKER•" 
                spinDuration={15}
                onHover="speedUp"
                size={48}
                fontSize={5.5}
              />
            </div>
            
            {/* Character image in center */}
            <div className="relative z-10 w-6 h-6 rounded-lg overflow-hidden">
              <Image
                src="/regen_226.png"
                alt="Home"
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </Link>

        {/* Desktop/Tablet - Right side navigation arrow */}
        {currentPage === 'upcoming' && (
          <Link href="/historical" className="hidden sm:block">
            <motion.div
              whileHover={{ x: 2 }}
              className="flex items-center gap-2 text-slate-300 hover:text-purple-400 transition-colors group relative"
            >
              <span 
                className="text-sm font-medium relative"
                style={{
                  transition: 'text-shadow 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textShadow = '0 0 6px rgba(180,120,255,0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textShadow = 'none';
                }}
              >
                Historical
                <span 
                  className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                />
              </span>
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
                  d="M14 5l7 7m0 0l-7 7m7-7H3" 
                />
              </svg>
            </motion.div>
          </Link>
        )}

        {currentPage === 'historical' && (
          <Link href="/upcoming" className="hidden sm:block">
            <motion.div
              whileHover={{ x: 2 }}
              className="flex items-center gap-2 text-slate-300 hover:text-purple-400 transition-colors group relative"
            >
              <span 
                className="text-sm font-medium relative"
                style={{
                  transition: 'text-shadow 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textShadow = '0 0 6px rgba(180,120,255,0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textShadow = 'none';
                }}
              >
                Upcoming
                <span 
                  className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                />
              </span>
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
                  d="M14 5l7 7m0 0l-7 7m7-7H3" 
                />
              </svg>
            </motion.div>
          </Link>
        )}

        {/* Mobile - Character logo/home button on top left */}
        <Link href="/" className="sm:hidden">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-[40px] h-[40px] flex items-center justify-center"
          >
            {/* Circular text border */}
            <div className="absolute inset-0">
              <CircularText 
                text="DAGSTATS•UFC•TRACKER•" 
                spinDuration={15}
                onHover="speedUp"
                size={40}
                fontSize={4.5}
              />
            </div>
            
            {/* Character image in center */}
            <div className="relative z-10 w-5 h-5 rounded-lg overflow-hidden">
              <Image
                src="/regen_226.png"
                alt="Home"
                width={20}
                height={20}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </Link>

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
            Home
          </Link>
          <Link
            href="/upcoming"
            onClick={() => setIsOpen(false)}
            className="block px-6 py-3 text-sm text-slate-300 hover:bg-purple-500/10 hover:text-purple-300 transition-colors border-b border-purple-500/10"
          >
            Upcoming Fights
          </Link>
          <Link
            href="/historical"
            onClick={() => setIsOpen(false)}
            className="block px-6 py-3 text-sm text-slate-300 hover:bg-purple-500/10 hover:text-purple-300 transition-colors"
          >
            Historical Data
          </Link>
        </motion.div>
      )}
    </motion.nav>
  );
}
