// components/TextType.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface TextTypeProps {
  text: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  showCursor?: boolean;
  className?: string;
  noLoop?: boolean; // If true, types once and stops
}

export default function TextType({
  text,
  typingSpeed = 70,
  pauseDuration = 1200,
  showCursor = true,
  className = '',
  noLoop = false,
}: TextTypeProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (text.length === 0) return;
    if (isComplete) return; // Stop if complete (for noLoop mode)

    const currentString = text[currentIndex];

    if (charIndex < currentString.length) {
      const typingTimer = setTimeout(() => {
        setDisplayText(currentString.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(typingTimer);
    } else {
      // Finished typing current line
      if (noLoop && currentIndex === text.length - 1) {
        // If noLoop is enabled and we're on the last line, stop
        setIsComplete(true);
      } else {
        // Move to next line after pause (or loop back to start)
        const pauseTimer = setTimeout(() => {
          setCharIndex(0);
          setCurrentIndex((prev) => (prev + 1) % text.length); // Loop back to start
          setDisplayText('');
        }, pauseDuration);

        return () => clearTimeout(pauseTimer);
      }
    }
  }, [text, currentIndex, charIndex, typingSpeed, pauseDuration, noLoop, isComplete]);

  return (
    <div className={className}>
      {displayText}
      {showCursor && !isComplete && (
        <span className="inline-block w-0.5 h-[0.9em] bg-purple-400 ml-1 animate-pulse" />
      )}
    </div>
  );
}
