// components/PageHeader.tsx
'use client';

import TextType from './TextType';

type PageHeaderProps = {
  lines: string[];
  subtext?: string;
};

export default function PageHeader({ lines, subtext }: PageHeaderProps) {
  return (
    <header className="w-full max-w-4xl mx-auto pt-8 px-4 text-center">
      <TextType
        text={lines}
        typingSpeed={70}
        pauseDuration={1200}
        showCursor={true}
        className="text-3xl sm:text-4xl md:text-5xl font-semibold text-slate-100"
      />
      {subtext && (
        <p className="mt-4 text-sm sm:text-base text-slate-400">
          {subtext}
        </p>
      )}
    </header>
  );
}
