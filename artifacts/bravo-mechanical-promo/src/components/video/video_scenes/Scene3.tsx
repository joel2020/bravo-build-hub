import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const stats = [
  { value: '5', label: 'Star Google Rating' },
  { value: '24/7', label: 'Emergency Service' },
  { value: '100%', label: 'Licensed & Insured' },
];

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100), // bg
      setTimeout(() => setPhase(2), 500), // stats start
      setTimeout(() => setPhase(3), 5000), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-light)] z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={phase >= 1 ? { opacity: 0.15 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
         <img 
            src={`${import.meta.env.BASE_URL}hvac-tech.png`}
            alt="HVAC Technician"
            className="w-full h-full object-cover grayscale"
          />
      </motion.div>

      <div className="w-full px-20 flex justify-between relative z-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center justify-center w-1/3 px-8 text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: phase >= 2 ? i * 0.2 : 0 }}
          >
            <div className="text-[7vw] font-black text-[var(--color-primary)] leading-none mb-4">
              {stat.value}
            </div>
            <div className="text-[2vw] font-bold text-[var(--color-text-secondary)] uppercase tracking-wide">
              {stat.label}
            </div>
            {i < 2 && (
              <motion.div 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-1/2 bg-[var(--color-border)]"
                initial={{ scaleY: 0 }}
                animate={phase >= 2 ? { scaleY: 1 } : { scaleY: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.2 }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
