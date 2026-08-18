"use client";

import { useTranslations } from "next-intl";
import LocationSearchField, { type PickedLocation } from "@/components/LocationSearchField";
import type { StarMapClock } from "@/lib/starmap/useStarMapClock";

type StarMapControlsProps = {
  clock: StarMapClock;
  location: PickedLocation | null;
  onLocationChange: (location: PickedLocation) => void;
};

function toDateInputValue(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toTimeInputValue(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Preset playback speeds (simulated seconds per real second). "live" is a
// distinct option from "1" -- live re-syncs to the actual current time
// every frame (never drifts), while a literal 1x "play" would just
// accumulate elapsed real time from whatever date it started at (drifts
// from true "now" the instant it's paused and resumed, since paused time
// doesn't advance) -- not useful enough to offer as its own option here.
const SPEED_OPTIONS = [-86400, -3600, -60, 0, 60, 3600, 86400] as const;

const SPEED_LABEL_KEYS: Record<(typeof SPEED_OPTIONS)[number], string> = {
  [-86400]: "speedReverseDay",
  [-3600]: "speedReverseHour",
  [-60]: "speedReverseMinute",
  0: "speedPaused",
  60: "speedForwardMinute",
  3600: "speedForwardHour",
  86400: "speedForwardDay",
};

// Date/time picker (default "live", ticking with useStarMapClock) + reused
// LocationSearchField (no new location UI, per the star-map plan doc).
// Editing either date or time switches the clock out of live mode
// (StarMapClock.setFrozenDate) -- StarMapCanvas's SkyGroup picks up the
// change immediately since it recomputes on every date/lat/lng prop change,
// not on a coarse timer (see that file's own comment).
export default function StarMapControls({ clock, location, onLocationChange }: StarMapControlsProps) {
  const t = useTranslations("starMap");

  const handleSpeedChange = (value: string) => {
    if (value === "live") {
      clock.goLive();
      return;
    }
    const speed = Number(value);
    if (speed === 0) {
      clock.pause();
    } else {
      clock.play(speed);
    }
  };
  const speedSelectValue = clock.isLive ? "live" : clock.isPlaying ? String(clock.speed) : "0";

  const handleDateChange = (value: string) => {
    if (!value) return;
    const [y, m, d] = value.split("-").map(Number);
    const current = clock.date;
    clock.setFrozenDate(new Date(y, m - 1, d, current.getHours(), current.getMinutes(), current.getSeconds()));
  };

  const handleTimeChange = (value: string) => {
    if (!value) return;
    const [hh, mm] = value.split(":").map(Number);
    const current = clock.date;
    clock.setFrozenDate(new Date(current.getFullYear(), current.getMonth(), current.getDate(), hh, mm));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <LocationSearchField onSelect={onLocationChange} />

        <label className="flex items-center gap-2 text-sm">
          <span className="text-zinc-400">{t("dateLabel")}</span>
          <input
            type="date"
            value={toDateInputValue(clock.date)}
            onChange={(e) => handleDateChange(e.target.value)}
            className="rounded-md border border-white/10 bg-zinc-800 px-2 py-2 text-sm"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-zinc-400">{t("timeLabel")}</span>
          <input
            type="time"
            value={toTimeInputValue(clock.date)}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="rounded-md border border-white/10 bg-zinc-800 px-2 py-2 text-sm"
          />
        </label>

        <button
          type="button"
          onClick={clock.goLive}
          disabled={clock.isLive}
          className="rounded-md border border-white/10 bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700 disabled:opacity-50"
        >
          {t("nowButton")}
        </button>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-zinc-400">{t("speedLabel")}</span>
          <select
            value={speedSelectValue}
            onChange={(e) => handleSpeedChange(e.target.value)}
            className="rounded-md border border-white/10 bg-zinc-800 px-2 py-2 text-sm"
          >
            <option value="live">{t("speedLive")}</option>
            {SPEED_OPTIONS.map((speed) => (
              <option key={speed} value={speed}>
                {t(SPEED_LABEL_KEYS[speed])}
              </option>
            ))}
          </select>
        </label>

        <span className="text-xs text-zinc-500">
          {clock.isLive
            ? t("liveIndicator")
            : clock.isPlaying
              ? t(SPEED_LABEL_KEYS[clock.speed as keyof typeof SPEED_LABEL_KEYS] ?? "speedPaused")
              : t("frozenIndicator")}
        </span>
      </div>

      {location && (
        <div className="mt-2 text-xs text-zinc-400">
          {location.placeName && <span>{location.placeName} · </span>}
          {location.lat.toFixed(2)}, {location.lng.toFixed(2)}
        </div>
      )}
    </div>
  );
}
