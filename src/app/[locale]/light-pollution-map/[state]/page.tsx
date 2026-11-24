import { STATE_SLUGS } from "@/content/guides/regions";
import { guideMetadata, GuideRoute } from "@/lib/guideRoute";

export const dynamicParams = false;

export function generateStaticParams() {
  return STATE_SLUGS.map((state) => ({ state }));
}

export const generateMetadata = guideMetadata("state");

export default function Page({
  params,
}: {
  params: Promise<{ locale: string; state: string }>;
}) {
  return <GuideRoute slug="state" params={params} />;
}
