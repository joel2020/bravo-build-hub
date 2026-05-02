const base = import.meta.env.BASE_URL;

export default function WhyUs() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg">
      <div className="grid grid-cols-12 h-full">
        <div className="col-span-5 relative">
          <img
            src={`${base}ac-unit.png`}
            crossOrigin="anonymous"
            alt="High-efficiency AC condenser at a Westchester home"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-ink/40 to-transparent" />
        </div>

        <div className="col-span-7 px-[5vw] py-[8vh] flex flex-col">
          <span className="font-display font-bold uppercase tracking-[0.3em] text-[0.95vw] text-accent">
            06 · Why Bravo
          </span>
          <h2 className="mt-[2vh] font-display font-black tracking-tight text-[4.6vw] leading-[0.95] text-ink text-balance">
            Built for Westchester homes and businesses.
          </h2>

          <div className="mt-[5vh] flex flex-col gap-[3vh]">
            <div className="flex gap-[2vw] items-start">
              <div className="font-display font-black text-accent text-[2.4vw] leading-none w-[4vw] shrink-0">
                01
              </div>
              <div>
                <h3 className="font-display font-bold text-[1.7vw] text-ink leading-tight">
                  Licensed and insured
                </h3>
                <p className="mt-[0.6vh] font-body text-[1.2vw] text-muted leading-snug max-w-[36vw]">
                  Fully licensed in New York with permit coordination
                  on every project that requires one.
                </p>
              </div>
            </div>
            <div className="flex gap-[2vw] items-start">
              <div className="font-display font-black text-accent text-[2.4vw] leading-none w-[4vw] shrink-0">
                02
              </div>
              <div>
                <h3 className="font-display font-bold text-[1.7vw] text-ink leading-tight">
                  Engineered, not guessed
                </h3>
                <p className="mt-[0.6vh] font-body text-[1.2vw] text-muted leading-snug max-w-[36vw]">
                  Manual-J load calculations on every install — we
                  size for your home, not a one-size-fits-all rule.
                </p>
              </div>
            </div>
            <div className="flex gap-[2vw] items-start">
              <div className="font-display font-black text-accent text-[2.4vw] leading-none w-[4vw] shrink-0">
                03
              </div>
              <div>
                <h3 className="font-display font-bold text-[1.7vw] text-ink leading-tight">
                  Brand-agnostic equipment
                </h3>
                <p className="mt-[0.6vh] font-body text-[1.2vw] text-muted leading-snug max-w-[36vw]">
                  Carrier, Trane, Mitsubishi, Daikin, Bosch, Rheem —
                  we recommend what fits, not what we stock.
                </p>
              </div>
            </div>
            <div className="flex gap-[2vw] items-start">
              <div className="font-display font-black text-accent text-[2.4vw] leading-none w-[4vw] shrink-0">
                04
              </div>
              <div>
                <h3 className="font-display font-bold text-[1.7vw] text-ink leading-tight">
                  Rebate-aware quoting
                </h3>
                <p className="mt-[0.6vh] font-body text-[1.2vw] text-muted leading-snug max-w-[36vw]">
                  We review NYS Clean Heat, utility, and federal
                  heat-pump incentives during every quote.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
