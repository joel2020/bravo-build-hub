import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => setPhase(4), 4000), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 bg-black z-20 overflow-hidden"
      initial={{ scale: 1.1, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0, filter: 'brightness(2)' }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="absolute inset-0"
        animate={{ scale: [1, 1.05] }}
        transition={{ duration: 6, ease: 'linear' }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}hvac-unit.png`}
          alt="HVAC Unit"
          className="w-full h-full object-cover opacity-60"
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-center px-24">
        <motion.div
          className="w-24 h-2 bg-[var(--color-accent)] mb-8"
          initial={{ scaleX: 0, originX: 0 }}
          animate={phase >= 1 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        <motion.h2 
          className="text-[6vw] font-black text-white leading-[1.1] mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          Quality You<br/>Can Feel.
        </motion.h2>
        <motion.p
          className="text-[2.5vw] text-white/80 font-medium max-w-3xl"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          Serving Westchester with premium heating & cooling solutions.
        </motion.p>
      </div>
    </motion.div>
  );
}
