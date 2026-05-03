import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => setPhase(4), 2000),
      setTimeout(() => setPhase(5), 4000), // Start exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative overflow-hidden mb-6">
        <motion.div
          className="text-[1.5vw] font-bold tracking-[0.2em] text-[var(--color-accent)] uppercase"
          initial={{ y: '100%' }}
          animate={phase >= 1 ? { y: 0 } : { y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          Westchester County HVAC
        </motion.div>
      </div>

      <div className="text-center" style={{ perspective: '1000px' }}>
        <motion.h1 
          className="text-[8vw] font-black tracking-tighter text-[var(--color-primary)] leading-none"
        >
          {'BRAVO'.split('').map((char, i) => (
            <motion.span 
              key={i} 
              className="inline-block"
              initial={{ opacity: 0, y: 40, rotateX: -60 }}
              animate={phase >= 2 ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 40, rotateX: -60 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25, delay: phase >= 2 ? i * 0.05 : 0 }}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>
        <motion.h2
          className="text-[4vw] font-bold text-[var(--color-text-secondary)] -mt-2 tracking-tight"
        >
          {'MECHANICAL'.split('').map((char, i) => (
            <motion.span 
              key={i} 
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25, delay: phase >= 3 ? i * 0.03 : 0 }}
            >
              {char}
            </motion.span>
          ))}
        </motion.h2>
      </div>

      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 w-px bg-[var(--color-accent)]"
        initial={{ height: 0, opacity: 0 }}
        animate={phase >= 4 ? { height: 100, opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'circOut' }}
      />
    </motion.div>
  );
}
