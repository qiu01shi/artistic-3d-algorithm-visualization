import { useCallback, useEffect, useRef, useState } from 'react';

export function usePlayer(length: number, resetKey: string) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setIndex(0);
    setPlaying(true);
  }, [resetKey]);

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      setIndex((i) => Math.min(i + 1, Math.max(length - 1, 0)));
    }, 1400 / speed);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing, speed, length]);

  // stop at the final step
  useEffect(() => {
    if (playing && length > 0 && index >= length - 1) setPlaying(false);
  }, [index, length, playing]);

  const next = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.min(length - 1, i + 1));
  }, [length]);
  const prev = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.max(0, i - 1));
  }, []);
  const restart = useCallback(() => {
    setIndex(0);
    setPlaying(true);
  }, []);
  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (!p && index >= length - 1) setIndex(0);
      return !p;
    });
  }, [index, length]);
  const seek = useCallback((i: number) => {
    setPlaying(false);
    setIndex(i);
  }, []);

  return { index, playing, speed, setSpeed, next, prev, restart, toggle, seek };
}
