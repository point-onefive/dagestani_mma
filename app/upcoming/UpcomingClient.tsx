'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import PageHeader from '@/components/PageHeader';
import FightCard from '@/components/FightCard';
import MinimalNav from '@/components/MinimalNav';
import Footer from '@/components/Footer';
import type { UpcomingMatch } from '@/lib/dagestan';

interface UpcomingClientProps {
  upcoming: UpcomingMatch[];
  lastRefresh: string | null;
}

export default function UpcomingClient({ upcoming, lastRefresh }: UpcomingClientProps) {
  // Container animation for stagger effect
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  // Individual card animation - slide in from right
  const item = {
    hidden: { opacity: 0, x: 60 },
    show: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  const formatRefreshTime = (isoString: string | null) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      {/* Warm cinematic gradient background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/enhancements/bg.png"
          alt=""
          fill
          priority
          unoptimized
          className="object-cover pointer-events-none select-none"
          style={{ 
            opacity: 0.2,
            mixBlendMode: 'soft-light',
            filter: 'blur(8px)',
            transform: 'scale(1.15)'
          }}
        />
      </div>
      
      <MinimalNav currentPage="upcoming" />
      <main className="relative z-20 flex-1 w-full max-w-3xl mx-auto px-4 pb-12">
        <PageHeader
          lines={['Upcoming Dagestani Fights']}
          subtext="Fighters born in the Republic of Dagestan, Russia."
          noLoop={true}
        />
        {lastRefresh && (
          <div className="text-center text-xs text-slate-500 mt-4">
            Last updated: {formatRefreshTime(lastRefresh)}
          </div>
        )}
        {upcoming.length === 0 ? (
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-10 text-center text-slate-400 text-sm"
          >
            No upcoming Dagestani fights detected yet. Check back after the next refresh.
          </motion.p>
        ) : (
          <motion.section 
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-8 grid gap-4 sm:gap-5"
          >
            {upcoming.map((match, index) => (
              <motion.div
                key={`${match.eventId}-${match.fighterA}-${match.fighterB}`}
                variants={item}
              >
                <FightCard match={match} />
              </motion.div>
            ))}
          </motion.section>
        )}
      </main>
      <Footer />
    </div>
  );
}
