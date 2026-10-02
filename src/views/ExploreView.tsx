import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { selectExploreRows } from '../world/exploreRows';
import { exploreActivityPair, worldActivities } from '../world/presenceDiscovery';
import { SearchCombobox } from '../components/SearchCombobox';
import { ArtistNavAvatar } from '../components/GlobalNavigation';
import { isDemoSignedIn } from '../world/account';
import { publicVoiceHallUrl, selectWorldPulse } from '../world/exploreDiscovery';
import { getArtistCover } from '../world/artistVisuals';
import { matchesVietnameseQuery } from '../utils/textSearch';

const SEARCH_GROUPS=[{id:'artist',label:'Nghệ sĩ',limit:3},{id:'activity',label:'Hoạt động',limit:4},{id:'query',label:'Gợi ý tìm kiếm',limit:3}];

export function ExploreView(){
  const {state,dispatch}=useApp(); const navigate=useNavigate();
  const [params,setParams]=useSearchParams(); const query=params.get('q')||'';
  const signedIn=isDemoSignedIn(state); const follows=signedIn?state.followedWorldIds:[];
  const followingOnly=params.get('scope')==='following';
  const worlds=Object.values(state.worlds).filter(w=>w.tenantId===state.activeTenantId&&w.type==='artist');
  const suggestions=worlds.flatMap(w=>[{id:w.id,label:w.name,context:'Artist World',target:`/artist/${w.id}`,group:'artist',image:getArtistCover(w.id)},...worldActivities(state,w.id).map(a=>({id:a.id,label:a.title,context:w.name+' · '+a.label,target:a.to,group:'activity'})),...(query.trim()&&matchesVietnameseQuery(w.name,query)?worldActivities(state,w.id).slice(0,3).map(a=>({id:`query-${a.id}`,label:`${w.name} ${a.title}`,context:'Tìm trong Explore',group:'query'})):[])]);
  const rows=selectExploreRows(state,query).filter(row=>!followingOnly||follows.includes(row.world_id));
  function search(q:string){const next=new URLSearchParams(params);if(q)next.set('q',q);else next.delete('q');setParams(next,{replace:true});}
  return <div className="presence-explore"><h1 className="sr-only">Explore</h1>
    <SearchCombobox value={query} onChange={search} suggestions={suggestions} groups={SEARCH_GROUPS} label="Tìm trong Explore" placeholder="Tìm nghệ sĩ, hoạt động, khoảnh khắc…" onSelect={s=>s.target?navigate(s.target):search(s.label)} onSubmit={search}/>
    {!query&&<nav className="presence-world-selector" aria-label="World bạn theo dõi"><span>World của bạn</span><Link to="/explore" aria-label="Khám phá thêm world">＋</Link>{worlds.filter(w=>follows.includes(w.id)).map(w=><Link to={`/artist/${w.id}`} key={w.id}><ArtistNavAvatar artist={w}/><span>{w.name}</span></Link>)}{!follows.length&&<small>Theo dõi artist bạn yêu thích để ghé lại dễ hơn.</small>}</nav>}
    {followingOnly&&<Link to="/explore">Xem tất cả world →</Link>}
    <div className="presence-explore-rows">{rows.map(row=>{
      const followed=follows.includes(row.world_id); const activities=exploreActivityPair(state,row.world_id,query); const voice=selectWorldPulse(state,row.world_id,activities[0]?.id);
      return <article className="presence-explore-row" key={row.world_id} data-world={row.world_id}>
        <div className="presence-explore-identity"><Link to={`/artist/${row.world_id}`}><ArtistNavAvatar artist={{id:row.world_id,name:row.artist_name}}/><strong>{row.artist_name}</strong></Link><button aria-pressed={followed} onClick={()=>isDemoSignedIn(state)?dispatch({type:'TOGGLE_FOLLOW',worldId:row.world_id}):window.dispatchEvent(new Event('vieworld-open-auth'))}>{followed?'Đang theo dõi':'+ Theo dõi'}</button></div>
        <div className="presence-pulse">{voice?<><small>{voice.isDemo?'Lời nhắn mẫu':'Từ cộng đồng'}</small><Link to={publicVoiceHallUrl(voice)}>“{voice.text}”</Link><span>{voice.author}</span></>:<Link to={`/artist/${row.world_id}/hall`}>Ghé Hall của {row.artist_name} →</Link>}</div>
        {activities.map((a,index)=><Link className={`presence-activity is-${index===0?'primary':'secondary'}`} to={a.to} key={a.id}><span className="presence-activity-art" style={{backgroundImage:`url("${a.media.src}")`,...(a.media.panel===undefined?{}:{backgroundSize:'300% auto',backgroundPosition:`${a.media.panel*50}% center`})}}/><span className="presence-phase">{a.label}</span><span className="presence-activity-copy"><strong>{a.title}</strong><small>{a.at?new Date(a.at).toLocaleString('vi-VN',{day:'numeric',month:'numeric',hour:'2-digit',minute:'2-digit'}):a.demo?'Minh họa':''}</small></span></Link>)}
      </article>;
    })}</div>
    {!rows.length&&<p>Chưa có world phù hợp. Thử từ khóa khác hoặc <Link to="/explore">khám phá tất cả</Link>.</p>}
    <p className="presence-note">Bản demo với nghệ sĩ, hoạt động và hình ảnh minh họa. Không phải số người trực tuyến thực.</p>
  </div>;
}
