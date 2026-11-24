"use client";

import { useRouter } from "@/i18n/navigation";
import LocationSearchField, { PickedLocation } from "@/components/LocationSearchField";

export default function OpenOnMapSearch() {
  const router = useRouter();
  const open = (location: PickedLocation) => {
    router.push(`/?lat=${location.lat.toFixed(4)}&lng=${location.lng.toFixed(4)}&zoom=8`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
      <LocationSearchField onSelect={open} />
    </div>
  );
}
