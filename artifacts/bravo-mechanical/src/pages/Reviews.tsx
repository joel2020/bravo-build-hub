import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/PageHero";
import { CTABand } from "@/components/CTABand";
import { SITE } from "@/lib/site";
import { useSeo } from "@/lib/seo";
import { GOOGLE_REVIEWS } from "@/lib/googleReviews";

const Reviews = () => {
  const reviewSchema = GOOGLE_REVIEWS.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: GOOGLE_REVIEWS.map((review, index) => ({
      "@type": "Review",
      position: index + 1,
      author: { "@type": "Person", name: review.reviewerName },
      reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5 },
      reviewBody: review.reviewText,
    })),
  } : undefined;

  useSeo({
    title: "Bravo Mechanical Reviews | Westchester County HVAC Customers",
    description: "Read verified customer feedback for Bravo Mechanical HVAC service in Westchester County, NY, including boiler, water heater, mini-split, heating, and cooling work.",
    canonical: `${SITE.siteUrl}/reviews`,
    jsonLd: reviewSchema,
  });

  return (
    <Layout>
      <PageHero
        eyebrow="Customer Reviews"
        title="Westchester customers trust Bravo Mechanical for HVAC work"
        subtitle="Read feedback from customers who hired Bravo Mechanical for heating, cooling, boiler, water heater, mini-split, and related HVAC service."
      />

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-muted-foreground leading-relaxed">
            Customer feedback matters because HVAC work happens inside your home or business. The reviews below reflect real service experiences and help other Westchester neighbors understand what to expect from Bravo Mechanical. For the most current public rating and review count, visit our Google Business Profile.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {GOOGLE_REVIEWS.length > 0 ? GOOGLE_REVIEWS.map((review, i) => (
            <div key={`${review.reviewerName}-${i}`} className="bg-card border border-border rounded-lg p-6">
              <div className="flex gap-1 mb-3 text-accent">
                {Array.from({ length: review.rating }).map((_, s) => <Star key={s} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-sm mb-4 leading-relaxed">"{review.reviewText}"</p>
              <div className="text-sm font-semibold">{review.reviewerName}</div>
              {review.reviewDate && <div className="text-xs text-muted-foreground">Reviewed {review.reviewDate}</div>}
              {review.sourceUrl && (
                <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline mt-2 inline-block">
                  View on Google
                </a>
              )}
            </div>
          )) : (
            <div className="lg:col-span-3 bg-card border border-border rounded-lg p-6 text-sm text-muted-foreground">
              Verified Google reviews will appear here once added to the reviews data file.
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-semibold">
          <Link to="/contact" className="text-accent hover:underline">Request HVAC service →</Link>
          <a href={SITE.social.google} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Leave a Google review →</a>
        </div>
      </section>

      <CTABand title="Need HVAC service in Westchester County?" subtitle="Call Bravo Mechanical or request service online for heating, cooling, boiler, furnace, heat pump, mini-split, and maintenance support." />
    </Layout>
  );
};

export default Reviews;
