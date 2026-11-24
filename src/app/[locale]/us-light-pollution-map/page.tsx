import { guideMetadata, GuideRoute } from "@/lib/guideRoute";

export const generateMetadata = guideMetadata("us");

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  return <GuideRoute slug="us" params={params} />;
}
