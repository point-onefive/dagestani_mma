// components/SearchingState.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function SearchingState() {
  return (
    <div className="mt-16 flex flex-col items-center justify-center py-12 px-4">
      {/* Animated character looking left and right */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Speech bubble - positioned above character's head */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg"
          >
            <p className="text-xs text-slate-800 font-medium">
              Looking for fights...
            </p>
          </motion.div>
          {/* Triangle pointer */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/90" />
        </motion.div>

        <motion.div
          animate={{ scaleX: [1, 1, -1, -1, 1] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.4, 0.5, 0.9, 1]
          }}
        >
          <Image
            src="/regen_226.png"
            alt="Looking for fights"
            width={120}
            height={120}
            className="opacity-80"
          />
        </motion.div>
      </motion.div>

      {/* Scanning dots */}
      <motion.div
        className="flex gap-2 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            className="w-2 h-2 rounded-full bg-purple-400"
          />
        ))}
      </motion.div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="text-center space-y-2 mt-6"
      >
        <p className="text-slate-400 text-sm">
          No upcoming Dagestani fights detected yet.
        </p>
        <p className="text-slate-500 text-xs">
          Check back after the next refresh.
        </p>
      </motion.div>
    </div>
  );
}
