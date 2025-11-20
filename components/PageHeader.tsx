// components/PageHeader.tsx
'use client';

import TextType from './TextType';
import { ReactNode } from 'react';

type PageHeaderProps = {
  lines: string[];
  subtext?: string | ReactNode;
  noLoop?: boolean; // Add option to disable looping
};

export default function PageHeader({ lines, subtext, noLoop = false }: PageHeaderProps) {
  return (
    <header className="w-full max-w-4xl mx-auto pt-20 sm:pt-24 px-4 text-center">
      <TextType
        text={lines}
        typingSpeed={70}
        pauseDuration={1200}
        showCursor={true}
        noLoop={noLoop}
        className="text-2xl sm:text-4xl md:text-5xl font-semibold text-slate-100"
      />
      {subtext && (
        <p className="mt-4 text-sm sm:text-base text-slate-400">
          {subtext}
        </p>
      )}
    </header>
  );
}
