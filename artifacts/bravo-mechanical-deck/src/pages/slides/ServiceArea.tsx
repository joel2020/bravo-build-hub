const base = import.meta.env.BASE_URL;

export default function ServiceArea() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg">
      <img
        src={`${base}westchester.png`}
        crossOrigin="anonymous"
        alt="Westchester County aerial"
        className="absolute right-0 top-0 w-[42vw] h-full object-cover"
      />
      <div className="absolute right-0 top-0 w-[42vw] h-full bg-gradient-to-l from-transparent to-bg" />

      <div className="relative z-10 px-[6vw] py-[8vh] h-full flex flex-col w-[58vw]">
        <span className="font-display font-bold uppercase tracking-[0.3em] text-[0.95vw] text-accent">
          04 · Service Area
        </span>
        <h2 className="mt-[2vh] font-display font-black tracking-tight text-[4.8vw] leading-[0.95] text-ink text-balance">
          Westchester County, <span className="text-primary">covered.</span>
        </h2>
        <p className="mt-[2.5vh] font-body text-[1.4vw] text-muted leading-snug max-w-[44vw] text-pretty">
          From the Sound Shore to the Hudson, from village
          colonials to high-rise commercial — we know the housing
          stock, the climate, and the codes.
        </p>

        <div className="mt-[4vh] grid grid-cols-3 gap-x-[2vw] gap-y-[1.2vh] font-display font-bold text-[1.25vw] text-ink">
          <span>Yonkers</span>
          <span>White Plains</span>
          <span>New Rochelle</span>
          <span>Mount Vernon</span>
          <span>Scarsdale</span>
          <span>Rye</span>
          <span>Harrison</span>
          <span>Mamaroneck</span>
          <span>Larchmont</span>
          <span>Bronxville</span>
          <span>Tarrytown</span>
          <span>Sleepy Hollow</span>
          <span>Ossining</span>
          <span>Peekskill</span>
          <span>Mount Kisco</span>
          <span>Chappaqua</span>
          <span>Pleasantville</span>
          <span>Bedford</span>
          <span>Katonah</span>
          <span>Armonk</span>
          <span>Yorktown</span>
        </div>

        <p className="mt-[3vh] font-body text-[1.05vw] text-muted italic">
          Plus Tuckahoe, Eastchester, Hastings-on-Hudson, Dobbs
          Ferry, Irvington, Briarcliff Manor, Croton-on-Hudson,
          Pound Ridge, and Somers.
        </p>
      </div>
    </div>
  );
}
