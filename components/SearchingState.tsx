// components/SearchingState.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function SearchingState() {
  return (
    <div className="mt-16 flex flex-col items-center justify-center py-12 px-4">
      {/* Speech bubble - centered above character */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg"
        >
          <p className="text-xs text-slate-800 font-medium">
            Looking for fights...
          </p>
        </motion.div>
      </motion.div>

      {/* Thought bubble dots */}
      <div className="flex flex-col items-center -my-1">
        <motion.div
          className="w-3 h-3 rounded-full bg-white/80"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="w-2 h-2 rounded-full bg-white/70 mt-1"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
        />
      </div>

      {/* Animated character looking left and right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
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
        className="flex gap-2 mt-4"
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
