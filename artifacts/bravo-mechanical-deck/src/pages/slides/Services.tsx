export default function Services() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg">
      <div className="absolute top-0 left-0 w-full h-[28vh] bg-ink" />

      <div className="relative z-10 px-[6vw] pt-[6vh] pb-[6vh] h-full flex flex-col">
        <div>
          <span className="font-display font-bold uppercase tracking-[0.3em] text-[0.95vw] text-accent">
            03 · Services
          </span>
          <h2 className="mt-[1.5vh] font-display font-black tracking-tight text-[4.5vw] leading-[0.95] text-cream">
            Whole-system HVAC service.
          </h2>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-[2vw]">
          <div className="bg-cream p-[2.5vw] border-t-[0.4vh] border-accent">
            <div className="font-display font-black text-primary text-[2vw] leading-none">01</div>
            <h3 className="mt-[1.5vh] font-display font-bold text-[1.7vw] text-ink leading-tight">
              HVAC Installation
            </h3>
            <p className="mt-[1.2vh] font-body text-[1.1vw] text-muted leading-snug">
              New furnace, AC, heat pump, and ductwork sized
              and engineered for your space.
            </p>
          </div>
          <div className="bg-cream p-[2.5vw] border-t-[0.4vh] border-accent">
            <div className="font-display font-black text-primary text-[2vw] leading-none">02</div>
            <h3 className="mt-[1.5vh] font-display font-bold text-[1.7vw] text-ink leading-tight">
              HVAC Repair
            </h3>
            <p className="mt-[1.2vh] font-body text-[1.1vw] text-muted leading-snug">
              Fast diagnostics for heating and cooling — same-day
              and emergency service available.
            </p>
          </div>
          <div className="bg-cream p-[2.5vw] border-t-[0.4vh] border-accent">
            <div className="font-display font-black text-primary text-[2vw] leading-none">03</div>
            <h3 className="mt-[1.5vh] font-display font-bold text-[1.7vw] text-ink leading-tight">
              Preventive Maintenance
            </h3>
            <p className="mt-[1.2vh] font-body text-[1.1vw] text-muted leading-snug">
              Seasonal tune-ups and service plans that extend
              equipment life and prevent breakdowns.
            </p>
          </div>
          <div className="bg-cream p-[2.5vw] border-t-[0.4vh] border-accent">
            <div className="font-display font-black text-primary text-[2vw] leading-none">04</div>
            <h3 className="mt-[1.5vh] font-display font-bold text-[1.7vw] text-ink leading-tight">
              Indoor Air Quality
            </h3>
            <p className="mt-[1.2vh] font-body text-[1.1vw] text-muted leading-snug">
              Filtration, humidifiers, dehumidifiers, and air
              purifiers for healthier interiors.
            </p>
          </div>
          <div className="bg-cream p-[2.5vw] border-t-[0.4vh] border-accent">
            <div className="font-display font-black text-primary text-[2vw] leading-none">05</div>
            <h3 className="mt-[1.5vh] font-display font-bold text-[1.7vw] text-ink leading-tight">
              Residential HVAC
            </h3>
            <p className="mt-[1.2vh] font-body text-[1.1vw] text-muted leading-snug">
              Whole-home heating and cooling for single-family
              homes, condos, and multi-units.
            </p>
          </div>
          <div className="bg-cream p-[2.5vw] border-t-[0.4vh] border-accent">
            <div className="font-display font-black text-primary text-[2vw] leading-none">06</div>
            <h3 className="mt-[1.5vh] font-display font-bold text-[1.7vw] text-ink leading-tight">
              Commercial HVAC
            </h3>
            <p className="mt-[1.2vh] font-body text-[1.1vw] text-muted leading-snug">
              Reliable HVAC for offices, retail, restaurants, and
              light-industrial buildings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
