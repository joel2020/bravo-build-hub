import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Trust / 24/7: 10 seconds
export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500), // "And because emergencies don't wait for business hours, neither do we."
      setTimeout(() => setPhase(2), 4000), // "Our twenty-four-seven emergency service ensures your family stays comfortable..."
      setTimeout(() => setPhase(3), 9000), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 bg-black z-20 overflow-hidden"
      initial={{ scale: 1.1, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 1 }}
    >
      <motion.div 
        className="absolute inset-0"
        animate={{ scale: [1, 1.05] }}
        transition={{ duration: 10, ease: 'linear' }}
      >
        {/* We reuse the hvac-unit image but styled darker */}
        <img 
          src={`${import.meta.env.BASE_URL}hvac-unit.png`}
          alt="HVAC Unit"
          className="w-full h-full object-cover opacity-40"
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-black/60" />

      <div className="absolute inset-0 flex flex-col justify-center px-24">
        <motion.div
          className="w-24 h-2 bg-[var(--color-accent)] mb-8"
          initial={{ scaleX: 0, originX: 0 }}
          animate={phase >= 1 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        <motion.h2 
          className="text-[5vw] font-black text-white leading-[1.1] mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          Emergencies Don't Wait.<br/>Neither Do We.
        </motion.h2>
        
        <motion.div
          className="mt-8 flex items-center"
          initial={{ opacity: 0, x: -40 }}
          animate={phase >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          <div className="bg-[var(--color-accent)] text-black px-6 py-4 rounded-xl text-[4vw] font-black shadow-lg">
            24/7
          </div>
          <div className="ml-8 text-[2.5vw] text-white/90 font-bold leading-tight">
            Emergency Service<br/>
            <span className="text-[1.8vw] font-medium text-white/70">Keeping your family comfortable around the clock.</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
