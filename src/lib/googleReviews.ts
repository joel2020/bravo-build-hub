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
export const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    reviewerName: "Gilberto Gutierrez",
    rating: 5,
    reviewText:
      "Excellent technical and customer service. They replaced the water heater and boiler in my house, then came back for free maintenance a year later. Amazing job. Highly recommended to anyone who needs their services.",
    reviewDate: "2 months ago",
    isFeatured: true,
  },
  {
    reviewerName: "shaisky urena",
    rating: 5,
    reviewText:
      "This has been the most seamless experience ever. I cannot recommend them enough! I am always hesitant hiring out but they answered all of my concerns and went above in beyond with their service.",
    reviewDate: "2 months ago",
    isFeatured: false,
  },
  {
    reviewerName: "jeffrey",
    rating: 5,
    reviewText:
      "Brahyan is the man. Honest! Reliable! The best for all your HVAC needs! My tenant recommended him and he is my go to guy for my apartments.",
    reviewDate: "Edited 2 months ago",
    isFeatured: false,
  },
  {
    reviewerName: "Miguel Sandoval",
    rating: 5,
    reviewText:
      "Install a water heater for my cousin made a great job and services very professional",
    reviewDate: "2 months ago",
    isFeatured: false,
  },
  {
    reviewerName: "Carlos Alvarez",
    rating: 5,
    reviewText:
      "Had a mini split unit installed and the whole process was smooth from start to finish. The team worked quickly and efficiently, clearly knew what they were doing, and got the job done as fast as possible without cutting corners. Everything was up and running in no time. No complaints at all—solid, reliable service.",
    reviewDate: "a day ago",
    isFeatured: true,
  },
  {
    reviewerName: "Dwight Cooper",
    rating: 5,
    reviewText:
      "The work was done neatly,fast and economically. Great team. Highly recommended.",
    reviewDate: "4 days ago",
    isFeatured: false,
  },
  {
    reviewerName: "Gabriel Rivera",
    rating: 5,
    reviewText:
      "Brayan services my boiler, even repaired it. He recommended upgrading my hvac system to mini splits to add heat and AC to our basement room. From start to finish Brayan was professional with his service and knowledgeable. Recommended two systems instead of 1 to cover the whole house. Thank you!",
    reviewDate: "a month ago",
    isFeatured: true,
  },
];

export const getFeaturedGoogleReviews = (limit = 3) =>
  GOOGLE_REVIEWS.filter((r) => r.isFeatured).slice(0, limit);
