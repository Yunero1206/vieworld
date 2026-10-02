import type {AppState,Benefit} from '../domain/types';
import {artistForWorld,sessionContextUrl} from './worldContext';
import {canEnterHall} from './merchCatalog';
import {getWorldProject} from './exploreRows';

/** Only explicitly supplied, currently valid targets create a benefit destination. */
export function benefitDestination(state:AppState,benefit:Benefit):string|undefined {
  if(benefit.tenantId!==state.activeTenantId||benefit.fanId!==state.fanProfile.id||!['eligible','claimed'].includes(benefit.status))return;
  if(benefit.availableFrom&&Date.parse(benefit.availableFrom)>Date.parse(state.demoTime))return;
  if(benefit.expiresAt&&Date.parse(benefit.expiresAt)<=Date.parse(state.demoTime))return;
  const target=benefit.target;if(!target)return;
  if(target.type==='artist_hall')return target.worldId===benefit.worldId&&canEnterHall(state,target.worldId)?`/artist/${target.worldId}/hall`:undefined;
  if(target.type==='product_family'){
    const product=Object.values(state.products).find(p=>p.tenantId===state.activeTenantId&&p.worldId===benefit.worldId&&(p.familyId||p.id)===target.id&&(!p.requiredBenefitId||p.requiredBenefitId===benefit.id));
    return product?`/shop?artist=${product.worldId}&product=${product.id}`:undefined;
  }
  if(target.type==='fan_project')return state.activeTenantId==='vieworld-demo'&&getWorldProject(benefit.worldId)?.id===target.id?getWorldProject(benefit.worldId)?.targetUrl:undefined;
  const session=state.sessions[target.id];const artist=session&&artistForWorld(state,session.worldId);
  if(!session||session.tenantId!==state.activeTenantId||artist!==benefit.worldId||session.rightsApproved!==true||['expired','missing'].includes(session.mediaStatus||'')||session.status==='cancelled')return;
  if(target.type==='archive_replay'&&session.status!=='ended')return;
  return sessionContextUrl(artist,session.id);
}
