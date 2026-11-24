import { guideMetadata, GuideRoute } from "@/lib/guideRoute";

export const generateMetadata = guideMetadata("parks");

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  return <GuideRoute slug="parks" params={params} />;
}
