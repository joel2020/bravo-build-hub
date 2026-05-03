const base = import.meta.env.BASE_URL;

export default function Contact() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-ink">
      <img
        src={`${base}ductwork.png`}
        crossOrigin="anonymous"
        alt="Modern HVAC ductwork"
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/90 to-primary/40" />
      <div className="absolute top-[6vh] right-[6vw] w-[14vw] h-[0.5vh] bg-accent" />

      <div className="relative z-10 h-full px-[7vw] py-[8vh] flex flex-col text-cream">
        <div className="flex items-center gap-[1.2vw]">
          <div className="w-[1vw] h-[1vw] bg-accent" />
          <span className="font-display font-bold tracking-[0.3em] text-[1.05vw] uppercase text-cream/80">
            Let's talk
          </span>
        </div>

        <div className="mt-auto">
          <h2 className="font-display font-black tracking-tight text-[7vw] leading-[0.92] text-cream text-balance">
            Schedule a quote.
            <span className="block text-accent">We pick up the phone.</span>
          </h2>
        </div>

        <div className="mt-[6vh] grid grid-cols-3 gap-[3vw] border-t border-cream/20 pt-[4vh]">
          <div>
            <div className="font-display font-bold uppercase tracking-[0.25em] text-[0.95vw] text-cream/60">
              Call
            </div>
            <a
              href="tel:+19143619142"
              className="mt-[1vh] block font-display font-black text-[2.6vw] leading-tight text-cream tracking-tight"
            >
              (914) 361-9142
            </a>
          </div>
          <div>
            <div className="font-display font-bold uppercase tracking-[0.25em] text-[0.95vw] text-cream/60">
              Email
            </div>
            <a
              href="mailto:info@bravomechanicalny.com"
              className="mt-[1vh] block font-display font-bold text-[1.5vw] leading-tight text-cream break-all"
            >
              info@bravomechanicalny.com
            </a>
          </div>
          <div>
            <div className="font-display font-bold uppercase tracking-[0.25em] text-[0.95vw] text-cream/60">
              Service Area
            </div>
            <div className="mt-[1vh] font-display font-bold text-[2vw] leading-tight text-cream">
              Westchester
              <span className="block text-cream/70 text-[1.4vw] font-medium">
                County, NY · Open 24/7
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
