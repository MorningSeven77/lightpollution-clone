"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type StarMapClock = {
  date: Date;
  isLive: boolean;
  // Fast-forward/rewind: true whenever the clock is advancing at a
  // multiplier other than real-time (1x forward). Mutually exclusive with
  // isLive -- starting playback stops real-time tracking, and goLive()
  // stops playback.
  isPlaying: boolean;
  speed: number; // multiplier while isPlaying, e.g. 3600 = 1 simulated hour per real second, negative = reverse
  goLive: () => void;
  setFrozenDate: (date: Date) => void;
  play: (speed: number) => void;
  pause: () => void;
};

// Owns all date/time state shared by StarMapControls (display) and
// StarMapCanvas (computation): "live" (tracking real now, 1x forward),
// "playing" (advancing from wherever the clock currently sits at some
// speed multiplier, for fast-forward/rewind), or "frozen" (neither --
// manual date/time edit, or paused mid-playback).
//
// A single requestAnimationFrame loop drives both live and playing modes,
// using real elapsed time between frames (not a fixed setInterval tick) so
// large speed multipliers (e.g. 86400x = 1 simulated day per real second)
// advance smoothly instead of jumping in big steps once a second. Live
// mode still resyncs to the actual `new Date()` each frame rather than
// accumulating its own delta, so it can never drift from real time no
// matter how long the tab stays open.
export function useStarMapClock(): StarMapClock {
  const [date, setDate] = useState(() => new Date());
  const [isLive, setIsLive] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const lastFrameTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLive && !isPlaying) return;

    lastFrameTimeRef.current = null;
    const tick = (now: number) => {
      if (isLive) {
        setDate(new Date());
      } else {
        const last = lastFrameTimeRef.current;
        lastFrameTimeRef.current = now;
        if (last !== null) {
          const elapsedMs = now - last;
          setDate((prev) => new Date(prev.getTime() + elapsedMs * speed));
        }
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };
    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isLive, isPlaying, speed]);

  const goLive = useCallback(() => {
    setIsPlaying(false);
    setDate(new Date());
    setIsLive(true);
  }, []);

  const setFrozenDate = useCallback((next: Date) => {
    setIsLive(false);
    setIsPlaying(false);
    setDate(next);
  }, []);

  const play = useCallback((nextSpeed: number) => {
    setIsLive(false);
    setSpeed(nextSpeed);
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsLive(false);
    setIsPlaying(false);
  }, []);

  return { date, isLive, isPlaying, speed, goLive, setFrozenDate, play, pause };
}
