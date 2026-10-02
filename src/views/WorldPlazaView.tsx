import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { selectHomePresence, type PresenceActivity } from '../world/presenceDiscovery';
import { AmbientHallEcho } from '../components/AmbientHallEcho';
import { VieWorldIcon } from '../components/VieWorldIcon';

const LABELS = { recent: 'Vừa rồi', now: 'Đang diễn ra', next: 'Sắp tới' };

function HomeTile({ activity, slot, artistName }: { activity?: PresenceActivity; slot: keyof typeof LABELS; artistName?: string }) {
  const date = activity?.at ? new Date(activity.at).toLocaleString('vi-VN', {
    day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh',
  }) : undefined;
  return <div className={`presence-home-slot is-${slot}`}>
    <h2 className="sr-only">{LABELS[slot]}</h2>
    {activity ? <Link className="presence-home-tile" to={activity.to} aria-label={`${LABELS[slot]}: ${activity.title}`}>
      <span className="presence-home-media">
      <span className="presence-home-art" style={{ backgroundImage: `url("${activity.media.src}")`, ...(activity.media.panel === undefined ? {} : { backgroundSize: '300% auto', backgroundPosition: `${activity.media.panel * 50}% center` }) }} />
      <span className={`presence-phase phase-${slot}`}><VieWorldIcon name={slot === 'recent' ? 'moment' : slot === 'next' ? 'calendar' : 'sound'} size={16}/>{slot === 'now' ? activity.label : LABELS[slot]}</span>
      <span className="presence-home-caption" aria-hidden="true"><VieWorldIcon name="arrow" size={18}/></span>
      </span>
      <span className="presence-home-summary"><strong>{activity.title}</strong><small><span><VieWorldIcon name="account" size={16}/>{artistName}</span>{date && <span><VieWorldIcon name="calendar" size={16}/>{date}</span>}</small></span>
    </Link> : <div className="presence-home-empty">
      <p>{slot === 'now' ? 'Một khoảng yên giữa những cuộc hẹn.' : slot === 'next' ? 'Chưa có cuộc hẹn mới.' : 'Những kỷ niệm sẽ ở lại đây.'}</p>
      <Link to="/explore">Ghé các world <ArrowUpRight size={16} /></Link>
    </div>}
  </div>;
}

export function WorldPlazaView() {
  const { state } = useApp();
  const home = selectHomePresence(state);
  return <section className="presence-home" aria-label="VieWorld, những khoảnh khắc cùng nhau">
    <h1 className="sr-only">VieWorld</h1>
    <div className="presence-home-timeline">{(['recent', 'now', 'next'] as const).map(slot => <HomeTile key={slot} slot={slot} activity={home[slot]} artistName={home[slot] && state.worlds[home[slot]!.artistId]?.name} />)}</div>
    <div className="presence-home-community">
      <div className="presence-home-echo-host"><AmbientHallEcho voices={home.voices}/></div>
      <img className="presence-home-bench" src="/images/presence-fans-bench.webp" width="1440" height="480" alt="" aria-hidden="true" fetchPriority="high" />
      <small className="sr-only">Fan minh họa{home.voices.length ? ' · Lời nhắn được chọn từ Hall' : ''}</small>
    </div>
  </section>;
}
