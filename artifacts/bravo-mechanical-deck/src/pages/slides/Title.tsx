const base = import.meta.env.BASE_URL;

export default function Title() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-ink">
      <img
        src={`${base}technician.png`}
        crossOrigin="anonymous"
        alt="HVAC technician at work"
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/70 to-ink/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col h-full px-[7vw] py-[7vh] text-cream">
        <div className="flex items-center gap-[1.2vw]">
          <div className="w-[1vw] h-[1vw] bg-accent" />
          <span className="font-display font-bold tracking-[0.3em] text-[1.1vw] uppercase">
            Bravo Mechanical LLC
          </span>
        </div>

        <div className="mt-auto">
          <p className="font-display font-bold uppercase tracking-[0.18em] text-accent text-[1.3vw]">
            HVAC · Westchester County, NY
          </p>
          <h1 className="mt-[2vh] font-display font-black tracking-tight text-[7.5vw] leading-[0.92] text-balance">
            Heat. Cool.
            <span className="block text-accent">Done right.</span>
          </h1>
          <p className="mt-[3vh] font-body text-[1.6vw] text-cream/80 max-w-[55vw] leading-snug text-pretty">
            Reliable installation, repair, and maintenance from
            licensed local technicians — available around the clock.
          </p>
        </div>

        <div className="mt-[5vh] flex items-end justify-between border-t border-cream/20 pt-[2.5vh]">
          <span className="font-display font-bold uppercase tracking-[0.25em] text-[1vw] text-cream/70">
            Pitch Deck · 2026
          </span>
          <span className="font-display font-bold tracking-tight text-[1.4vw]">
            (914) 361-9142
          </span>
        </div>
      </div>
    </div>
  );
}
