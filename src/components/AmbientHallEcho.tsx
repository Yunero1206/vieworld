import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicVoiceHallUrl, type PublicVoice } from '../world/exploreDiscovery';

/** A curated voice, not a presence counter or an identity for the decorative seated fans. */
export function AmbientHallEcho({ voices }: { voices: PublicVoice[] }) {
  const [frame, setFrame] = useState({ index: 0, visible: true });
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const held = hovered || focused;
  const signature = voices.map(voice => `${voice.id}:${voice.text}`).join('|');
  useEffect(() => setFrame({ index: 0, visible: true }), [signature]);
  useEffect(() => {
    if (!voices.length || held) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: number | undefined;
    const clear = () => window.clearTimeout(timer);
    const schedule = () => {
      clear();
      if (document.hidden || reducedMotion.matches) return;
      timer = window.setTimeout(() => {
        setFrame(current => ({ ...current, visible: false }));
        timer = window.setTimeout(() => {
          setFrame(current => ({ index: (current.index + 1) % voices.length, visible: true }));
          schedule();
        }, 3250);
      }, 9000);
    };
    const resume = () => { clear(); setFrame(current => ({ ...current, visible: !document.hidden })); schedule(); };
    schedule();
    document.addEventListener('visibilitychange', resume);
    reducedMotion.addEventListener?.('change', resume);
    return () => { clear(); document.removeEventListener('visibilitychange', resume); reducedMotion.removeEventListener?.('change', resume); };
  }, [signature, held, voices.length]);
  const voice = voices[frame.index % voices.length];
  if (!voice) return null;
  return <Link className={`presence-home-echo anchor-${frame.index % 3}${frame.visible ? ' is-visible' : ''}`}
    to={publicVoiceHallUrl(voice)} aria-hidden={!frame.visible} tabIndex={frame.visible ? 0 : -1}
    aria-label={`Lời nhắn ${voice.isDemo ? 'mẫu ' : ''}của ${voice.author}: ${voice.text}`}
    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    <small>{voice.author}</small><span>{voice.text}</span>
  </Link>;
}
