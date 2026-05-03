import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// CTA: 12 seconds
export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500), // "Don't let HVAC troubles disrupt your life."
      setTimeout(() => setPhase(2), 2500), // "Call us today at..."
      setTimeout(() => setPhase(3), 4000), // "(914) 361-9142"
      setTimeout(() => setPhase(4), 6500), // "Or visit bravomechanicalny.com"
      setTimeout(() => setPhase(5), 9000), // "Bravo Mechanical, your comfort is our commitment."
      setTimeout(() => setPhase(6), 11000), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--color-primary)] text-white z-20"
      initial={{ clipPath: 'circle(0% at 50% 50%)' }}
      animate={{ clipPath: 'circle(150% at 50% 50%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iI2ZmZiIHN0cm9rZS1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] [background-size:32px_32px] pointer-events-none" />

      <motion.div
        className="text-[2.5vw] font-bold tracking-widest text-white/80 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.8 }}
      >
        Don't Let HVAC Troubles Disrupt Your Life.
      </motion.div>

      <motion.div
        className="text-[2vw] font-bold text-[var(--color-accent)] uppercase mb-2"
        initial={{ opacity: 0 }}
        animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        Call Us Today
      </motion.div>

      <motion.div
        className="text-[8vw] font-black mb-8 tracking-tighter"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={phase >= 3 ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        (914) 361-9142
      </motion.div>

      <motion.div
        className="text-[3vw] font-medium bg-white text-[var(--color-primary)] px-8 py-3 rounded-2xl mb-12 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8, type: 'spring' }}
      >
        bravomechanicalny.com
      </motion.div>

      <motion.div
        className="flex items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 5 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-[3vw] font-bold">Bravo Mechanical</div>
        <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
        <div className="text-[1.8vw] font-medium text-white/80">Westchester County, NY</div>
      </motion.div>
    </motion.div>
  );
}
