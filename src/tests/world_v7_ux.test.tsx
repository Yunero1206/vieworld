import { beforeEach, describe, it, expect } from 'vitest';
import { filterDisplayItems } from '../world/displayFilter';
import { displayOptions } from '../world/display';
import { createInitialState } from '../data/fixtures';
import { saveState } from '../services/storageAdapter';
describe('v7 fan-first information architecture',()=>{
 beforeEach(()=>{localStorage.clear();saveState(createInitialState());});



 it('filters by accent-insensitive name, artist, date and exact fixture category',()=>{const items=[{id:'1',slot:'ticket' as const,title:'Đêm tháng sáu',detail:'',worldId:'a',collectedAt:'2026-06-10T00:00:00Z'},{id:'2',slot:'shirt' as const,title:'Đêm tháng sáu',detail:'',worldId:'a',collectedAt:'2026-06-10T00:00:00Z'},{id:'3',slot:'ticket' as const,title:'Đêm tháng sáu',detail:'',worldId:'b'}];const f={slot:'ticket' as const,query:'dem thang',artist:'a',from:'2026-06-01',to:'2026-06-30'};expect(filterDisplayItems(items,f).map(i=>i.id)).toEqual(['1']);expect(filterDisplayItems(items,{...f,to:'2026-06-02'})).toEqual([]);});
 it('capsule display candidates never carry private notes or grant extra rights',()=>{const s=createInitialState('vieworld-demo');s.capsules.private={id:'private',tenantId:s.activeTenantId,version:1,updatedAt:s.demoTime,fanId:s.fanProfile.id,worldId:'artist-a',sessionId:'sample',participationId:'p',isSaved:false,privateNote:'PRIVATE SECRET'};const options=displayOptions(s);expect(options.some(i=>i.id==='private')).toBe(true);expect(JSON.stringify(options)).not.toContain('PRIVATE SECRET');});
});
