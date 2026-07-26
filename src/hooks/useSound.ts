'use client';
/**
 * Zero-asset sound engine built on the Web Audio API. Keeps the prototype free
 * of binary files while still giving each game audible feedback.
 */
import { useCallback, useRef } from 'react';
import { useUIStore } from '@/lib/store';

export type SoundName = 'click' | 'tick' | 'win' | 'lose' | 'reveal' | 'spin' | 'cash';

const PRESETS: Record<SoundName, { freq: number; to: number; dur: number; type: OscillatorType; gain: number }> = {
  click: { freq: 520, to: 620, dur: 0.06, type: 'triangle', gain: 0.05 },
  tick: { freq: 880, to: 880, dur: 0.03, type: 'square', gain: 0.025 },
  win: { freq: 480, to: 1180, dur: 0.42, type: 'sawtooth', gain: 0.07 },
  lose: { freq: 320, to: 90, dur: 0.4, type: 'sawtooth', gain: 0.06 },
  reveal: { freq: 700, to: 1400, dur: 0.22, type: 'sine', gain: 0.06 },
  spin: { freq: 220, to: 480, dur: 0.5, type: 'triangle', gain: 0.04 },
  cash: { freq: 900, to: 1500, dur: 0.18, type: 'sine', gain: 0.07 },
};

export function useSound(localEnabled = true) {
  const globalEnabled = useUIStore((s) => s.soundEnabled);
  const ctxRef = useRef<AudioContext | null>(null);

  return useCallback(
    (name: SoundName) => {
      if (!globalEnabled || !localEnabled || typeof window === 'undefined') return;
      try {
        const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctxRef.current ??= new Ctor();
        const ctx = ctxRef.current;
        if (ctx.state === 'suspended') void ctx.resume();

        const preset = PRESETS[name];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = preset.type;
        osc.frequency.setValueAtTime(preset.freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, preset.to), ctx.currentTime + preset.dur);
        gain.gain.setValueAtTime(preset.gain, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + preset.dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + preset.dur);
      } catch {
        /* Audio is a progressive enhancement — never break gameplay. */
      }
    },
    [globalEnabled, localEnabled],
  );
}
