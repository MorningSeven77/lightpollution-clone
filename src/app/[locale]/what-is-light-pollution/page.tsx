import { guideMetadata, GuideRoute } from "@/lib/guideRoute";

export const generateMetadata = guideMetadata("what-is");

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  return <GuideRoute slug="what-is" params={params} />;
}
