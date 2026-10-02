import type {AppState} from '../domain/types';
import {artistForWorld,sessionContextUrl} from './worldContext';
import {contextMedia} from './artistPresentation';
import {getWorldMoments,getWorldProject,type ExploreMedia} from './exploreRows';
import {matchesVietnameseQuery} from '../utils/textSearch';
import {isDemoSignedIn} from './account';
import {selectPublicVoices} from './exploreDiscovery';

export interface PresenceActivity {id:string;artistId:string;title:string;to:string;media:ExploreMedia;phase:'recent'|'now'|'next';label:string;at?:string;demo:boolean}
export function worldActivities(state:AppState,artistId:string):PresenceActivity[]{
  if(state.worlds[artistId]?.type!=='artist'||state.worlds[artistId]?.tenantId!==state.activeTenantId)return [];
  const sessions=Object.values(state.sessions).filter(s=>s.tenantId===state.activeTenantId&&s.rightsApproved===true&&s.mediaStatus!=='expired'&&s.mediaStatus!=='missing'&&artistForWorld(state,s.worldId)===artistId&&s.status!=='cancelled');
  const list:PresenceActivity[]=sessions.flatMap(s=>{
    const phase=['running','open','paused'].includes(s.status)?'now':s.status==='scheduled'&&Date.parse(s.scheduledStartTime)>=Date.parse(state.demoTime)?'next':s.status==='ended'?'recent':null;
    return phase?[{id:s.id,artistId,title:s.title.replace(state.worlds[artistId].name+': ',''),to:sessionContextUrl(artistId,s.id),media:contextMedia(artistId,s),phase,label:s.status==='open'?'Sảnh đã mở':s.status==='paused'?'Tạm dừng':s.status==='running'?'Đang diễn ra':phase==='next'?'Sắp tới':'Đã khép lại',at:s.scheduledStartTime,demo:!!s.demo}]:[];
  });
  if(state.activeTenantId==='vieworld-demo'){
    const project=getWorldProject(artistId);
    if(project)list.push({id:project.id,artistId,title:project.title,to:project.targetUrl,media:contextMedia(artistId),phase:'now',label:'Dự án fan',demo:true});
    getWorldMoments(artistId).forEach(m=>list.push({id:m.id,artistId,title:m.title,to:m.targetUrl,media:m.media,phase:'recent',label:'Khoảnh khắc',demo:true}));
  }
  return list;
}
export function exploreActivityPair(state:AppState,artistId:string,query=''){
  const list=worldActivities(state,artistId);
  const rank=(a:PresenceActivity)=>a.phase==='now'?0:a.phase==='next'?1:2;
  list.sort((a,b)=>Number(!!query&&matchesVietnameseQuery(b.title,query))-Number(!!query&&matchesVietnameseQuery(a.title,query))||rank(a)-rank(b)||(a.phase==='next'?(a.at||'').localeCompare(b.at||''):0));
  const primary=list[0];
  const secondary=list.find(a=>a.id!==primary?.id&&a.phase===(primary?.phase==='next'?'recent':'next'))||list.find(a=>a.id!==primary?.id&&a.phase!==primary?.phase)||list.find(a=>a.id!==primary?.id);
  return [primary,secondary].filter((a):a is PresenceActivity=>!!a);
}
/** Main: one reason to enter now plus a complementary temporal state. */
export function selectArtistActivityPair(state:AppState,artistId:string):PresenceActivity[]{
  const list=worldActivities(state,artistId);
  const now=Date.parse(state.demoTime);
  const rank=(a:PresenceActivity)=>{
    const s=state.sessions[a.id];
    if(s?.status==='running')return 0;
    if(s&&['open','paused'].includes(s.status))return 1;
    if(a.phase==='next'&&a.at&&Date.parse(a.at)-now<=86_400_000)return 2;
    if(a.phase==='now')return 3;
    return a.phase==='next'?4:5;
  };
  list.sort((a,b)=>rank(a)-rank(b)||(a.phase==='next'?(a.at||'').localeCompare(b.at||''):(b.at||'').localeCompare(a.at||'')));
  const primary=list[0];
  const secondary=list.find(a=>a.id!==primary?.id&&a.phase===(primary?.phase==='next'?'recent':'next'))||list.find(a=>a.id!==primary?.id&&a.phase!==primary?.phase);
  return [primary,secondary].filter((a):a is PresenceActivity=>!!a);
}
export function selectHomePresence(state:AppState){
  const list=Object.values(state.worlds).filter(w=>w.type==='artist'&&w.tenantId===state.activeTenantId).flatMap(w=>worldActivities(state,w.id));
  const related=(a:PresenceActivity)=>isDemoSignedIn(state)&&state.followedWorldIds.includes(a.artistId);
  const rank=(a:PresenceActivity,b:PresenceActivity)=>Number(related(b))-Number(related(a))||(a.at||'').localeCompare(b.at||'')||a.id.localeCompare(b.id);
  const now=list.filter(a=>a.phase==='now').sort((a,b)=>Number(b.label==='Đang diễn ra')-Number(a.label==='Đang diễn ra')||rank(a,b))[0];
  const next=list.filter(a=>a.phase==='next').sort(rank)[0];
  const recent=list.filter(a=>a.phase==='recent').sort((a,b)=>Number(related(b))-Number(related(a))||(b.at||'').localeCompare(a.at||''))[0];
  // Keep bubbles about the selected present context, not unrelated/private Hall traffic.
  const voices=now?selectPublicVoices(state,now.artistId,now.id).slice(0,3):[];
  return {recent,now,next,voices};
}
