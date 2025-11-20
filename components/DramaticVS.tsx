'use client';

export default function DramaticVS() {
  return (
    <div className="text-center py-1 sm:py-2">
      <span 
        className="text-3xl sm:text-5xl font-black text-white"
        style={{
          textShadow: '0 0 6px rgba(190,120,255,0.8), 0 0 10px rgba(190,120,255,0.8)',
          animation: 'vsPulse 2.3s ease-in-out infinite'
        }}
      >
        VS
      </span>
    </div>
  );
}
