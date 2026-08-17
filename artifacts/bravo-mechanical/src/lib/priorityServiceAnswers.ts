import raw from "@/content/priorityServiceAnswers.json";

export type PriorityServiceAnswer = {
  answer: string;
  decisionFactors: string[];
  proofLinks: { label: string; href: string }[];
};

const answers = raw as Record<string, PriorityServiceAnswer>;

export const getPriorityServiceAnswer = (slug: string) => answers[slug];
