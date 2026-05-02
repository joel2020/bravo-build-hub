export default function SocialProof() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-ink">
      <div className="absolute top-0 left-0 w-[40vw] h-full bg-primary" />
      <div className="absolute bottom-[8vh] right-[8vw] w-[14vw] h-[0.5vh] bg-accent" />

      <div className="relative z-10 grid grid-cols-12 h-full px-[6vw] py-[8vh] gap-[3vw]">
        <div className="col-span-5 flex flex-col justify-between text-cream">
          <span className="font-display font-bold uppercase tracking-[0.3em] text-[0.95vw] text-cream/80">
            05 · Social Proof
          </span>
          <div>
            <div className="font-display font-black text-cream text-[14vw] leading-[0.85] tracking-tight">
              5.0
            </div>
            <div className="mt-[1vh] font-display font-bold tracking-[0.18em] uppercase text-[1.4vw] text-cream/90">
              ★★★★★ Google Rating
            </div>
            <div className="mt-[1vh] font-body text-[1.1vw] text-cream/70">
              Verified reviews from Westchester County
            </div>
          </div>
          <span className="font-display font-bold tracking-[0.2em] uppercase text-[0.9vw] text-cream/60">
            Source · Google Business Profile
          </span>
        </div>

        <div className="col-span-7 flex flex-col justify-center gap-[3vh] text-cream">
          <div className="border-l-[0.4vh] border-accent pl-[2vw]">
            <p className="font-display font-bold text-[2vw] leading-tight text-cream text-pretty">
              "Showed up on time, diagnosed the problem
              quickly, and the price was fair. Heat was back
              on the same afternoon."
            </p>
            <p className="mt-[1.5vh] font-body text-[1.1vw] text-cream/70 uppercase tracking-[0.18em] font-semibold">
              Homeowner · Yonkers
            </p>
          </div>
          <div className="border-l-[0.4vh] border-accent pl-[2vw]">
            <p className="font-display font-bold text-[2vw] leading-tight text-cream text-pretty">
              "Honest, professional, and clean work.
              Replaced our furnace without trying to upsell us.
              Would absolutely call again."
            </p>
            <p className="mt-[1.5vh] font-body text-[1.1vw] text-cream/70 uppercase tracking-[0.18em] font-semibold">
              Homeowner · Scarsdale
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
