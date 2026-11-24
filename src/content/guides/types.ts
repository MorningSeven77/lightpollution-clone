export type GuideSection = {
  id: string;
  heading: string;
  paragraphs: string[];
};

export type GuideFaq = {
  question: string;
  answer: string;
};

export type GuideLink = {
  href: string;
  label: string;
};

export type GuideDiagram = {
  kind: "types" | "ladder" | "season";
  title: string;
  caption: string;
  labels: string[];
};

export type GuideCopy = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  eyebrow: string;
  lede: string[];
  sections: GuideSection[];
  faq: GuideFaq[];
  related: GuideLink[];
  diagram?: GuideDiagram;
  /** Knowledge pages lead with an explanation and a search that opens the map. */
  toolEntry?: boolean;
};
