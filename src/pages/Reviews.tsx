import { Star } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { SITE } from "@/lib/site";

const reviews = [
  { q: "Showed up on time, diagnosed the problem fast, and had our AC running the same day. Professional from start to finish.", a: "Sarah M.", town: "Scarsdale" },
  { q: "Bravo installed a new furnace for us last fall. Clean work, fair price, and the system runs great.", a: "Mike R.", town: "White Plains" },
  { q: "Reliable for our restaurant — they keep our rooftop units running and respond quickly when we need them.", a: "Anthony D.", town: "Yonkers" },
  { q: "Honest, knowledgeable, and easy to work with. Will use them again.", a: "Jennifer L.", town: "Tarrytown" },
  { q: "Quick response on a no-heat call in January. Saved us from a freezing weekend.", a: "David K.", town: "Bedford" },
  { q: "Quality install of our ductless mini-split system. Very pleased with the work.", a: "Patricia S.", town: "Mount Kisco" },
];

const Reviews = () => (
  <Layout>
    <PageHero
      eyebrow="Reviews"
      title="What Westchester customers say about Bravo Mechanical"
      subtitle="We've earned our reputation one job at a time. Here's what homeowners and businesses across the county have to say."
    />

    <section className="container mx-auto px-4 py-16">
      <a href={SITE.social.google} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 mb-10 bg-card border border-border rounded-lg px-6 py-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">5.0</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />)}
          </div>
        </div>
        <div className="text-muted-foreground">on Google · <span className="font-semibold text-foreground">{SITE.rating.count} reviews</span></div>
      </a>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.map((r, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6">
            <div className="flex gap-1 mb-3 text-accent">
              {Array.from({ length: 5 }).map((_, s) => <Star key={s} className="h-4 w-4 fill-current" />)}
            </div>
            <p className="text-sm mb-4 leading-relaxed">"{r.q}"</p>
            <div className="text-sm font-semibold">{r.a}</div>
            <div className="text-xs text-muted-foreground">{r.town}, NY</div>
          </div>
        ))}
      </div>
    </section>

    <CTABand title="Worked with us? Leave a review." subtitle="Your feedback helps other Westchester neighbors find dependable HVAC service." />
  </Layout>
);

export default Reviews;
