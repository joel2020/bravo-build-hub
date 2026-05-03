import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Area: 10 seconds
export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500), // "At Bravo Mechanical, we are your five-star HVAC experts..."
      setTimeout(() => setPhase(2), 4000), // "...proudly serving Yonkers, White Plains, New Rochelle..."
      setTimeout(() => setPhase(3), 6000), // "...and thirty towns across Westchester County."
      setTimeout(() => setPhase(4), 9000), // Exit start
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center bg-[var(--color-primary)] text-white z-20"
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(100% 0 0 0)' }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="flex w-full h-full">
        <div className="w-1/2 h-full p-20 flex flex-col justify-center">
          <motion.h2 
            className="text-[4vw] font-black leading-tight mb-8"
            initial={{ opacity: 0, x: -40 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            Bravo Mechanical<br/>
            <span className="text-[var(--color-accent)] text-[3vw]">5-Star HVAC Experts</span>
          </motion.h2>

          <div className="space-y-4 text-[2vw] font-medium text-white/90">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.8 }}
            >
              ✓ Yonkers
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              ✓ White Plains
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              ✓ New Rochelle
            </motion.div>
            <motion.div
              className="mt-6 pt-6 border-t border-white/20 text-[1.8vw] text-white/70 italic"
              initial={{ opacity: 0 }}
              animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 1 }}
            >
              ...and 30 towns across Westchester County
            </motion.div>
          </div>
        </div>

        <div className="w-1/2 h-full relative">
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ scaleX: 0, originX: 1 }}
            animate={phase >= 1 ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          >
            <img 
              src={`${import.meta.env.BASE_URL}hvac-tech.png`}
              alt="HVAC Tech"
              className="w-full h-full object-cover opacity-60"
            />
            {/* Subtle continuous zoom */}
            <motion.div 
              className="absolute inset-0"
              animate={{ scale: [1, 1.05] }}
              transition={{ duration: 10, ease: 'linear' }}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
