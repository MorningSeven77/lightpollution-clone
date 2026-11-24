import { guideMetadata, GuideRoute } from "@/lib/guideRoute";

export const generateMetadata = guideMetadata("milky-way");

export default function Page({ params }: { params: Promise<{ locale: string }> }) {
  return <GuideRoute slug="milky-way" params={params} />;
}
