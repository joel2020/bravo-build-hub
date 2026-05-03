import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Services: 16 seconds
const services = ['Furnaces', 'Boilers', 'AC Units', 'Heat Pumps', 'Mini-Splits'];

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500), // "We specialize in the installation, repair, and maintenance..."
      setTimeout(() => setPhase(2), 2000), // "...of furnaces, boilers, air conditioners, heat pumps..."
      setTimeout(() => setPhase(3), 8000), // "We are fully licensed, insured, and brand-agnostic..."
      setTimeout(() => setPhase(4), 11000), // "...meaning we recommend what's best for your home, not our bottom line."
      setTimeout(() => setPhase(5), 15000), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-light)] z-20 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'brightness(1.5)' }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 z-0">
        <motion.div 
          className="absolute inset-0"
          animate={{ scale: [1, 1.05], y: ['0%', '-5%'] }}
          transition={{ duration: 16, ease: 'linear' }}
        >
          <img 
            src={`${import.meta.env.BASE_URL}hvac-tools.png`}
            alt="HVAC Tools"
            className="w-full h-full object-cover opacity-15 grayscale"
          />
        </motion.div>
      </div>

      <div className="relative z-10 w-full max-w-7xl px-12 mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-[3vw] font-bold text-[var(--color-primary)]">Installation, Repair & Maintenance</h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {services.map((service, i) => (
            <motion.div
              key={service}
              className="px-6 py-3 rounded-full bg-white border border-[var(--color-primary)] text-[var(--color-primary)] text-[1.8vw] font-bold shadow-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={phase >= 2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: phase >= 2 ? i * 0.2 : 0 }}
            >
              {service}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-8 text-center mt-12">
          <motion.div
            className="bg-[var(--color-primary)] text-white p-8 rounded-2xl shadow-xl"
            initial={{ opacity: 0, y: 40 }}
            animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="text-[2.5vw] font-black mb-2">Licensed</div>
            <div className="w-12 h-1 bg-[var(--color-accent)] mx-auto" />
          </motion.div>
          <motion.div
            className="bg-[var(--color-primary)] text-white p-8 rounded-2xl shadow-xl"
            initial={{ opacity: 0, y: 40 }}
            animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
          >
            <div className="text-[2.5vw] font-black mb-2">Insured</div>
            <div className="w-12 h-1 bg-[var(--color-accent)] mx-auto" />
          </motion.div>
          <motion.div
            className="bg-white border-2 border-[var(--color-accent)] text-[var(--color-primary)] p-8 rounded-2xl shadow-xl"
            initial={{ opacity: 0, y: 40 }}
            animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.4 }}
          >
            <div className="text-[2.5vw] font-black mb-2">Brand-Agnostic</div>
            <div className="text-[1.2vw] font-medium mt-4 text-[var(--color-text-secondary)]">What's best for your home, not our bottom line.</div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
