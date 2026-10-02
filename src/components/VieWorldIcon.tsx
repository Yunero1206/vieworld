import type { SVGProps } from 'react';

export type VieWorldIconName = 'explore' | 'artist' | 'room' | 'bag' | 'bell' | 'account' | 'calendar' | 'moment' | 'sound' | 'arrow';

/** One optically aligned 24px family, authored from the approved VieWorld guide. */
export function VieWorldIcon({ name, size = 24, ...props }: SVGProps<SVGSVGElement> & { name: VieWorldIconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-vw-icon={name} {...props}>
    {name === 'explore' && <><circle cx="12" cy="12" r="8.6"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z"/><path d="m16 8-4 4-1.5-1.5L16 8Z" fill="currentColor" stroke="none"/></>}
    {name === 'artist' && <><circle cx="12" cy="12" r="6.8"/><ellipse cx="12" cy="12" rx="10" ry="3.4" transform="rotate(-25 12 12)"/><path className="vw-icon-spark" fill="var(--icon-spark-fill, #fcfdfb)" d="m18.5 2.1.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/></>}
    {name === 'room' && <><path d="M5 21V6.6A2.6 2.6 0 0 1 7.6 4h8.8A2.6 2.6 0 0 1 19 6.6V21M3.5 21h17M8.5 21V7.5l7 1.8V21"/><path d="M13 15.5h.1"/></>}
    {name === 'bag' && <><rect x="4.5" y="7.2" width="15" height="14" rx="2.4"/><path d="M8.3 8.2V6a3.7 3.7 0 0 1 7.4 0v2.2"/></>}
    {name === 'bell' && <><path d="M8 18.5h8m-1.9 1.8a2.3 2.3 0 0 1-4.2 0M6.5 9.2a5.5 5.5 0 0 1 11 0c0 4.8 1 6.1 2 7.3.4.5.1 1.2-.6 1.2H5.1c-.7 0-1-.7-.6-1.2 1-1.2 2-2.5 2-7.3Z"/></>}
    {name === 'account' && <><circle cx="12" cy="7.1" r="4"/><path d="M4.5 21v-1.8a7.5 7.5 0 0 1 15 0V21"/></>}
    {name === 'calendar' && <><rect x="3.8" y="5.4" width="16.4" height="15" rx="2.1"/><path d="M7.5 3.5v4M16.5 3.5v4M4.5 10h15"/></>}
    {name === 'moment' && <><rect x="3.5" y="5" width="17" height="14" rx="2.2"/><path d="m10 9 5 3-5 3V9Z"/></>}
    {name === 'sound' && <><path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4"/></>}
    {name === 'arrow' && <path d="M5 12h14m-5-5 5 5-5 5"/>}
  </svg>;
}
