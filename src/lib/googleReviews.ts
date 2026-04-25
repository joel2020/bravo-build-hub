export type GoogleReview = {
  reviewerName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  reviewText: string;
  reviewDate?: string;
  sourceUrl?: string;
  isFeatured: boolean;
};

// Real Google reviews only. Do not add generated/fabricated entries.
// Add entries here manually after verifying them on the public Google profile.
export const GOOGLE_REVIEWS: GoogleReview[] = [];

export const getFeaturedGoogleReviews = (limit = 3) =>
  GOOGLE_REVIEWS.filter((r) => r.isFeatured).slice(0, limit);
