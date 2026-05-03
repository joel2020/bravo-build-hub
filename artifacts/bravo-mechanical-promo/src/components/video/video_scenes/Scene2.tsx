import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const services = ['Heating', 'Cooling', 'Repair', 'Installation'];

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),
      setTimeout(() => setPhase(2), 600), // Image reveal
      setTimeout(() => setPhase(3), 1200), // List items
      setTimeout(() => setPhase(4), 5000), // Exit start
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center bg-[var(--color-primary)] text-white z-20"
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(100% 0 0 0)' }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="flex w-full h-full">
        <div className="w-1/2 h-full p-20 flex flex-col justify-center">
          <motion.div
            className="w-12 h-1 bg-[var(--color-accent)] mb-8"
            initial={{ scaleX: 0, originX: 0 }}
            animate={phase >= 1 ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          <motion.h2 
            className="text-[4vw] font-black leading-tight mb-12"
            initial={{ opacity: 0, x: -40 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            Complete Climate<br/>Control.
          </motion.h2>

          <div className="space-y-6">
            {services.map((service, i) => (
              <motion.div
                key={service}
                className="flex items-center text-[2.5vw] font-semibold"
                initial={{ opacity: 0, x: -20 }}
                animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: phase >= 3 ? i * 0.15 : 0 }}
              >
                <div className="w-3 h-3 rounded-full bg-[var(--color-accent)] mr-6" />
                {service}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="w-1/2 h-full relative">
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ scaleX: 0, originX: 1 }}
            animate={phase >= 2 ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <img 
              src={`${import.meta.env.BASE_URL}hvac-tools.png`}
              alt="HVAC Tools"
              className="w-full h-full object-cover opacity-80"
            />
            <motion.div 
              className="absolute inset-0 bg-[var(--color-primary)] mix-blend-multiply opacity-40"
            />
            {/* Subtle continuous zoom */}
            <motion.div 
              className="absolute inset-0"
              animate={{ scale: [1, 1.1] }}
              transition={{ duration: 10, ease: 'linear' }}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
