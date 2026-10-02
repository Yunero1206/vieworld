import type { AppState, Session } from '../domain/types';
import { EXPANDED_ARCHIVE_CHAPTERS } from '../data/expandedUniverse';
import type { ExploreMedia, ExploreMoment } from './exploreRows';
import { contextMedia } from './artistPresentation';
import { sessionContextUrl } from './worldContext';

export interface ArtistChapter { id:string; title:string; year:number; kind:'Sự kiện'|'Era'|'Capsule'|'Fan project'; media:ExploreMedia; detail:string; momentIds:string[]; to?:string; demo?:boolean; private?:boolean }
/** Chapter references are a presentation projection; Moment objects stay canonical. */
export function artistArchiveChapters(state:AppState,artistId:string,moments:ExploreMoment[],sessions:Session[]):ArtistChapter[] {
  const year=Number(state.demoTime.slice(0,4));
  const assigned=new Set<string>();
  const chapters:ArtistChapter[]=state.activeTenantId==='vieworld-demo' ? EXPANDED_ARCHIVE_CHAPTERS.filter(ch=>ch.worldId===artistId).map((ch,index)=>{
    // Only known/current-year associations. Never infer a historical date from an image.
    const related=ch.year===year ? moments.filter(moment=> {
      if(artistId==='artist-a') return ch.id.endsWith('hanoi') ? /Hà Nội|Mỹ Đình/.test(moment.title) : ch.id.endsWith('neon') && /Soundcheck|thu âm|Thu âm|tập nhảy|Star Club|cảm ơn/.test(moment.title);
      return ch.kind==='Era' ? /phòng thu|bản phối|Bản phối|Hòa âm|nháp/.test(moment.title) : ch.kind==='Fan project' ? /Project|project/.test(moment.title) : ch.kind==='Sự kiện' && /diễn|Live|sân khấu|khán đài/.test(moment.title);
    }).filter(moment=>!assigned.has(moment.id)) : [];
    related.forEach(moment=>assigned.add(moment.id));
    return {...ch,media:related[0]?.media||moments[index%Math.max(1,moments.length)]?.media||contextMedia(artistId),momentIds:related.map(moment=>moment.id)};
  }) : [];
  sessions.filter(session=>session.tenantId===state.activeTenantId && session.rightsApproved!==false && session.status==='ended').forEach(session=>chapters.push({
    id:`session-${session.id}`,title:session.title,year:Number(session.scheduledStartTime.slice(0,4)),kind:'Sự kiện',media:contextMedia(artistId,session),detail:'Buổi diễn đã khép lại. Mở ngữ cảnh để xem trạng thái phát lại.',momentIds:[],to:sessionContextUrl(artistId,session.id),demo:session.demo,
  }));
  const remaining=moments.filter(moment=>!assigned.has(moment.id));
  if(remaining.length) chapters.push({id:`daily-${artistId}-${year}`,title:'Những ngày thường',year,kind:'Era',media:remaining[0].media,detail:'Những lát cắt gần đây được giữ lại trong world.',momentIds:remaining.map(moment=>moment.id),demo:remaining.some(moment=>moment.isDemo)});

  return chapters;
}
