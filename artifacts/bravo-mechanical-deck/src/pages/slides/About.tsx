export default function About() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg">
      <div className="absolute top-0 right-0 w-[28vw] h-full bg-cream" />
      <div className="absolute top-[6vh] right-[6vw] w-[1vw] h-[14vh] bg-accent" />

      <div className="relative z-10 grid grid-cols-12 h-full px-[6vw] py-[8vh] gap-[3vw]">
        <div className="col-span-7 flex flex-col">
          <span className="font-display font-bold uppercase tracking-[0.3em] text-[0.95vw] text-accent">
            02 · Who we are
          </span>
          <h2 className="mt-[2.5vh] font-display font-black tracking-tight text-[5.2vw] leading-[0.95] text-ink text-balance">
            Local HVAC,
            <span className="block text-primary">done right the first time.</span>
          </h2>
          <p className="mt-[4vh] font-body text-[1.6vw] text-text/80 leading-snug max-w-[42vw] text-pretty">
            Bravo Mechanical LLC is a licensed and insured
            HVAC contractor serving Westchester County
            homeowners and commercial clients with
            workmanship that lasts.
          </p>
          <p className="mt-[2vh] font-body text-[1.4vw] text-muted leading-snug max-w-[40vw] text-pretty">
            We size systems with load calculations, not
            guesswork — and we pick up the phone when it matters.
          </p>
        </div>

        <div className="col-span-5 flex flex-col justify-center gap-[3.5vh]">
          <div>
            <div className="font-display font-black text-primary text-[5vw] leading-none tracking-tight">
              24/7
            </div>
            <div className="mt-[1vh] font-display font-bold uppercase tracking-[0.2em] text-[1.05vw] text-ink">
              Emergency Service
            </div>
            <div className="font-body text-[1.15vw] text-muted">
              Open every day, including weekends and holidays.
            </div>
          </div>
          <div>
            <div className="font-display font-black text-primary text-[5vw] leading-none tracking-tight">
              5.0
            </div>
            <div className="mt-[1vh] font-display font-bold uppercase tracking-[0.2em] text-[1.05vw] text-ink">
              Google Rating
            </div>
            <div className="font-body text-[1.15vw] text-muted">
              Verified reviews from real Westchester customers.
            </div>
          </div>
          <div>
            <div className="font-display font-black text-primary text-[5vw] leading-none tracking-tight">
              30+
            </div>
            <div className="mt-[1vh] font-display font-bold uppercase tracking-[0.2em] text-[1.05vw] text-ink">
              Towns Covered
            </div>
            <div className="font-body text-[1.15vw] text-muted">
              From Yonkers to Yorktown — full county coverage.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
