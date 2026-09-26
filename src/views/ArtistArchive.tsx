import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Session } from '../domain/types';
import type { ExploreMedia, ExploreMoment } from '../world/exploreRows';
import { artistArchiveChapters } from '../world/artistArchive';
import { ArtistVisualRail } from '../components/ArtistVisualRail';
import { ARTIST_NOTES } from '../world/fanWorld';

function mediaStyle(media:ExploreMedia) { return {backgroundImage:`url("${media.src}")`,...(media.panel===undefined ? {} : {backgroundSize:'300% auto',backgroundPosition:`${media.panel*50}% center`})}; }
export function ArtistArchive({artistId,name,moments,sessions}:{artistId:string;name:string;moments:ExploreMoment[];sessions:Session[]}) {
  const {state}=useApp();
  const [params,setParams]=useSearchParams();
  const [recentExpanded,setRecentExpanded]=useState(false);
  const filters=['Tất cả','Sự kiện','Era','Capsule','Fan project'];
  const filter=filters.includes(params.get('filter')||'') ? params.get('filter')! : 'Tất cả';
  const returnTo=`/artist/${artistId}/archive${params.size ? `?${params}` : ''}`;
  const chapters=useMemo(()=>artistArchiveChapters(state,artistId,moments,sessions),[state.demoTime,state.activeTenantId,state.capsules,state.fanProfile.id,artistId,moments,sessions]);
  const filtered=chapters.filter(chapter=>filter==='Tất cả'||chapter.kind===filter);
  const years=[...new Set(filtered.map(chapter=>chapter.year))].sort((a,b)=>b-a);
  const note=ARTIST_NOTES.find(item=>item.worldId===artistId&&item.publishedAt<=state.demoTime);
  return <div className="artist-world-body artist-archive-page">
    <header className="artist-inner-heading"><div><h2>Kho lưu trữ</h2><p>Những chương đã ở lại cùng {name}.</p></div></header>
    <div className="artist-archive-layout"><div className="artist-archive-timeline">
      <div className="artist-archive-filters" role="group" aria-label="Lọc chương trong kho lưu trữ">{filters.map(item=><button key={item} type="button" aria-pressed={filter===item} onClick={()=>setParams(item==='Tất cả'?{}:{filter:item},{replace:true})}>{item}</button>)}</div>
      {years.length ? years.map(year=><section className="artist-archive-year" key={year} aria-labelledby={`artist-archive-${year}`}>
        <header><h3 id={`artist-archive-${year}`}>{year}</h3><p>{year===Number(state.demoTime.slice(0,4))?'Những hành trình đang tiếp diễn.':'Một năm của những gặp gỡ.'}</p><small>{filtered.filter(chapter=>chapter.year===year).length} chương</small></header>
        <ArtistVisualRail label={`Các chương năm ${year}`} className="artist-archive-chapters">{filtered.filter(chapter=>chapter.year===year).map(chapter=><details className="artist-chapter" key={chapter.id} open={params.get('chapter')===chapter.id}>
          <summary onClick={event=>{event.preventDefault();setParams(previous=>{const next=new URLSearchParams(previous);if(next.get('chapter')===chapter.id)next.delete('chapter');else next.set('chapter',chapter.id);return next;},{replace:true});}}><span className="artist-chapter-cover" style={mediaStyle(chapter.media)}/><span className="artist-chapter-shade"/><span className="artist-chapter-label"><small>{chapter.kind}{chapter.private?' · Riêng tư':chapter.demo?' · Minh họa':''}</small><h4>{chapter.title}</h4><span>{chapter.momentIds.length ? `${chapter.momentIds.length} khoảnh khắc` : 'Chương kỷ niệm'}<ChevronRight size={17}/></span></span></summary>
          <div className="artist-chapter-content"><p>{chapter.detail}</p>{chapter.momentIds.map(id=>{const moment=moments.find(item=>item.id===id);return moment&&<Link key={id} to={moment.targetUrl} state={{fromArtist:returnTo}}><span style={mediaStyle(moment.media)}/>{moment.title}<ArrowRight size={14}/></Link>;})}{chapter.to&&<Link to={chapter.to} state={{fromArtist:returnTo}}>Mở ngữ cảnh <ArrowRight size={14}/></Link>}
            {!chapter.to&&!chapter.momentIds.length&&<small>Chương minh họa chưa có media được liên kết.</small>}</div>
        </details>)}</ArtistVisualRail>
      </section>) : <p className="artist-world-empty">Chưa có chương nào thuộc nhóm này.</p>}
    </div><aside className="artist-archive-side">
      <section className="artist-archive-recent"><header><h3>Mới được giữ lại</h3>{moments.length>3&&<button type="button" onClick={()=>setRecentExpanded(value=>!value)} aria-expanded={recentExpanded}>{recentExpanded?'Thu gọn':'Xem tất cả'}</button>}</header>{(recentExpanded?moments:moments.slice(0,3)).map(moment=><Link key={moment.id} to={moment.targetUrl} state={{fromArtist:returnTo}}><span style={mediaStyle(moment.media)}/><div><small>{moment.kind==='video'?'VIDEO':'KHOẢNH KHẮC'}</small><strong>{moment.title}</strong></div><ArrowRight size={15}/></Link>)}</section>
      {note&&<blockquote className="artist-archive-quote" style={{backgroundImage:`linear-gradient(180deg,rgba(10,18,25,.9),rgba(10,18,25,.55)),url("${moments[0]?.media.src}")`}}><p>“{note.body}”</p><footer>— {name} · Lời nhắn mẫu</footer></blockquote>}
    </aside></div>
  </div>;
}
