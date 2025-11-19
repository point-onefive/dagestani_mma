// components/TextType.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface TextTypeProps {
  text: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  showCursor?: boolean;
  className?: string;
}

export default function TextType({
  text,
  typingSpeed = 70,
  pauseDuration = 1200,
  showCursor = true,
  className = '',
}: TextTypeProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (text.length === 0) return;
    if (isComplete) return;

    const currentString = text[currentIndex];

    if (charIndex < currentString.length) {
      const typingTimer = setTimeout(() => {
        setDisplayText(currentString.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(typingTimer);
    } else {
      // Finished typing current line
      if (currentIndex < text.length - 1) {
        // Move to next line after pause
        const pauseTimer = setTimeout(() => {
          setCharIndex(0);
          setCurrentIndex((prev) => prev + 1);
          setDisplayText('');
        }, pauseDuration);

        return () => clearTimeout(pauseTimer);
      } else {
        // All lines complete
        setIsComplete(true);
      }
    }
  }, [text, currentIndex, charIndex, isComplete, typingSpeed, pauseDuration]);

  return (
    <div className={className}>
      {displayText}
      {showCursor && !isComplete && (
        <span className="inline-block w-0.5 h-[0.9em] bg-purple-400 ml-1 animate-pulse" />
      )}
    </div>
  );
}
