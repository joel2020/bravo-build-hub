import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Intro: 12 seconds
export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1000), // "When your heating or cooling system fails..."
      setTimeout(() => setPhase(2), 6000), // "...you need more than just a quick fix."
      setTimeout(() => setPhase(3), 9000), // "...You need a partner you can trust."
      setTimeout(() => setPhase(4), 11000), // Start exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[var(--color-bg-light)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}hvac-unit.png`}
          alt="HVAC Unit"
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      <div className="relative overflow-hidden mb-6 z-10">
        <motion.div
          className="text-[2vw] font-bold tracking-[0.2em] text-[var(--color-accent)] uppercase text-center"
          initial={{ y: '100%', opacity: 0 }}
          animate={phase >= 1 ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          Heating or Cooling Trouble?
        </motion.div>
      </div>

      <div className="text-center z-10" style={{ perspective: '1000px' }}>
        <motion.h1 
          className="text-[6vw] font-black tracking-tighter text-[var(--color-primary)] leading-tight max-w-4xl px-8"
          initial={{ opacity: 0, y: 40 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          You Need More Than<br />A Quick Fix.
        </motion.h1>
      </div>

      <motion.div
        className="mt-8 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1 }}
      >
        <span className="px-6 py-3 bg-[var(--color-primary)] text-white text-[1.8vw] font-bold rounded-lg shadow-lg">
          A Partner You Can Trust.
        </span>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-[var(--color-accent)] origin-bottom"
        initial={{ height: 0, opacity: 0 }}
        animate={phase >= 1 ? { height: '15vh', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 1.5, ease: 'circOut' }}
      />
    </motion.div>
  );
}
