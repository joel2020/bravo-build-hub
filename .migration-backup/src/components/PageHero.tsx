export const PageHero = ({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) => (
  <section className="bg-secondary border-b border-border">
    <div className="container mx-auto px-4 py-14 lg:py-20">
      {eyebrow && <div className="text-accent font-bold uppercase tracking-wider text-sm mb-3">{eyebrow}</div>}
      <h1 className="text-3xl md:text-5xl font-extrabold text-foreground max-w-3xl">{title}</h1>
      {subtitle && <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{subtitle}</p>}
    </div>
  </section>
);
