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
      ...(review.reviewDate ? { datePublished: review.reviewDate } : {}),
    })),
  } : undefined;

  useSeo({
    title: "HVAC Reviews in Westchester County, NY | Bravo Mechanical",
    description: "Read customer reviews for Bravo Mechanical's residential and commercial HVAC services across Westchester County, NY.",
    canonical: `${SITE.siteUrl}/reviews`,
    jsonLd: reviewSchema,
  });

  return (
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
        {GOOGLE_REVIEWS.length > 0 ? GOOGLE_REVIEWS.map((review, i) => (
          <div key={`${review.reviewerName}-${i}`} className="bg-card border border-border rounded-lg p-6">
            <div className="flex gap-1 mb-3 text-accent">
              {Array.from({ length: review.rating }).map((_, s) => <Star key={s} className="h-4 w-4 fill-current" />)}
            </div>
            <p className="text-sm mb-4 leading-relaxed">"{review.reviewText}"</p>
            <div className="text-sm font-semibold">{review.reviewerName}</div>
            {review.reviewDate && <div className="text-xs text-muted-foreground">Reviewed on {review.reviewDate}</div>}
            {review.sourceUrl && (
              <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline mt-2 inline-block">
                View on Google
              </a>
            )}
          </div>
        )) : (
          <div className="lg:col-span-3 bg-card border border-border rounded-lg p-6 text-sm text-muted-foreground">
            No verified Google reviews have been added yet. Add real reviews in <code>src/lib/googleReviews.ts</code> to publish them here.
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <a href={SITE.social.google} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-accent hover:underline">
          Leave a Google review →
        </a>
      </div>
    </section>

    <CTABand title="Worked with us? Leave a review." subtitle="Your feedback helps other Westchester neighbors find dependable HVAC service." />
  </Layout>
  );
};

export default Reviews;
