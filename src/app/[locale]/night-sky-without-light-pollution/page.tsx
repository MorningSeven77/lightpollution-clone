import { guideMetadata, GuideRoute } from "@/lib/guideRoute";

export const generateMetadata = guideMetadata("night-sky");

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  return <GuideRoute slug="night-sky" params={params} />;
}
