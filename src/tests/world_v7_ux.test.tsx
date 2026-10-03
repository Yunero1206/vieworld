import { beforeEach,describe,expect,it } from 'vitest';
import { createInitialState } from '../data/fixtures';
import { saveState } from '../services/storageAdapter';
import { displayOptions } from '../world/display';
describe('v7 fan-first information architecture',()=>{
 beforeEach(()=>{localStorage.clear();saveState(createInitialState());});
 it('capsule display candidates never carry private notes or grant extra rights',()=>{const s=createInitialState('vieworld-demo');s.capsules.private={id:'private',tenantId:s.activeTenantId,version:1,updatedAt:s.demoTime,fanId:s.fanProfile.id,worldId:'artist-a',sessionId:'sample',participationId:'p',isSaved:false,privateNote:'PRIVATE SECRET'};const options=displayOptions(s);expect(options.some(i=>i.id==='private')).toBe(true);expect(JSON.stringify(options)).not.toContain('PRIVATE SECRET');});
});
