import { displayOptions, DISPLAY_FIXTURES } from './display';
import type { AppAction, AppState } from '../domain/types';
import { readDisplaySurfaces, validateSurfaceSelection } from './displaySurfaces';

export interface HistoryCard { id:string; fanId:string; tenantId:string; eventTitle:string; worldId:string; collectedAt:string; physicalStatus:'owned'|'returned'; returnedAt?:string; source:'demo-serialized-card' }
export const historyCards=(s:AppState)=>(s.ticketArchive || []).filter(c=>c.fanId===s.fanProfile.id && c.tenantId===s.activeTenantId);
export const returnedCount=(s:AppState)=>new Set(historyCards(s).filter(c=>c.physicalStatus==='returned').map(c=>c.id)).size;
export const hasHistoryBadge=(s:AppState,n:number)=>[10,20].includes(n)&&returnedCount(s)>=n;

export function historyReducer(s:AppState,a:AppAction):AppState|undefined {
  switch(a.type){
    case 'SET_DISPLAY_SLOT': {
      if(!DISPLAY_FIXTURES.some(f=>f.slot===a.slot) || (a.itemId && !displayOptions(s).some(i=>i.slot===a.slot && i.id===a.itemId)))return {...s,lastError:{code:'DISPLAY_NOT_OWNED',message:'Chọn đúng loại món đã nhận hoặc huy hiệu đã đạt.'}};
      const previous = readDisplaySurfaces(s.fanProfile, displayOptions(s));
      const selection = { itemIds: a.itemId ? [a.itemId] : [], focalItemId: a.itemId, layoutPreset: previous[a.slot].layoutPreset };
      return {...s,lastError:undefined,fanProfile:{...s.fanProfile,displaySlots:{...s.fanProfile.displaySlots,[a.slot]:a.itemId},displaySurfaces:{...previous,[a.slot]:selection}}};
    }
    case 'SET_DISPLAY_SURFACE': {
      const problem = validateSurfaceSelection(s.fanProfile, a.surfaceId, a.selection, displayOptions(s));
      if (problem) return {...s,lastError:{code:'DISPLAY_SURFACE_INVALID',message:problem}};
      const previous = readDisplaySurfaces(s.fanProfile, displayOptions(s));
      return {...s,lastError:undefined,fanProfile:{...s.fanProfile,
        displaySlots:{...s.fanProfile.displaySlots,[a.surfaceId]:a.selection.itemIds[0] || ''},
        displaySurfaces:{...previous,[a.surfaceId]:a.selection},
      }};
    }
    case 'IMPORT_DEMO_CARDS': {
      // Explicit opt-in fixture. This creates collection history, NEVER attendance or access.
      const cards=Array.from({length:20},(_,i):HistoryCard=>({id:`DEMO-${s.fanProfile.id}-${String(i+1).padStart(3,'0')}`,fanId:s.fanProfile.id,tenantId:s.activeTenantId,eventTitle:['Đêm đầu tiên','Giai điệu mùa hè','Hẹn dưới ánh đèn','Một chiều acoustic'][i%4],worldId:i%3===0?'neon-sessions':'artist-a',collectedAt:`2026-${String(1+Math.floor(i/4)).padStart(2,'0')}-${String(3+i%4).padStart(2,'0')}T12:00:00Z`,physicalStatus:'owned',source:'demo-serialized-card'}));
      const existing=s.ticketArchive || [];
      return {...s,ticketArchive:[...existing,...cards.filter(c=>!existing.some(e=>e.id===c.id && e.tenantId===c.tenantId))],lastError:undefined};
    }
    case 'RETURN_HISTORY_CARDS': {
      const ids=new Set(a.cardIds);const owned=historyCards(s).filter(c=>ids.has(c.id)&&c.physicalStatus==='owned');
      const count=returnedCount(s);const next=count<10?10:count<20?20:undefined;
      if(!next || ids.size!==a.cardIds.length || owned.length!==ids.size || ids.size!==next-count)return {...s,lastError:{code:'CARD_RETURN_INVALID',message:'Chọn đúng các thẻ chưa trả để đạt mốc tiếp theo. Mỗi thẻ chỉ được ghi nhận một lần.'}};
      return {...s,lastError:undefined,ticketArchive:(s.ticketArchive || []).map(c=>c.fanId===s.fanProfile.id && c.tenantId===s.activeTenantId && ids.has(c.id)?{...c,physicalStatus:'returned',returnedAt:s.demoTime}:c)};
    }
    case 'SAVE_PUBLIC_IDENTITY': {
      if(a.bio.length>160 || a.mood.length>60 || (a.badge!==undefined&&!hasHistoryBadge(s,a.badge)))return {...s,lastError:{code:'IDENTITY_INVALID',message:'Lời giới thiệu hoặc huy hiệu chưa hợp lệ.'}};
      const productIds=[...new Set(a.productIds || [])];
      if(productIds.length>3 || productIds.some(id=>!s.products[id] || !Object.values(s.orders).some(o=>o.productId===id && o.fanId===s.fanProfile.id && o.tenantId===s.activeTenantId && o.status==='fulfilled')))return {...s,lastError:{code:'IDENTITY_INVALID',message:'Chỉ trưng bày tối đa 3 món bạn đã nhận.'}};
      return {...s,lastError:undefined,fanProfile:{...s.fanProfile,publicIdentity:{bio:a.bio.trim(),mood:a.mood.trim(),badge:a.badge,productIds}}};
    }
  }
}
