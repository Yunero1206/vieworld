import {beforeEach,describe,it,expect} from 'vitest';
import {render,screen,fireEvent,within} from '@testing-library/react';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import {AppProvider} from '../context/AppContext';
import {FanWorldView} from '../views/FanWorldView';
import {ArtistGalleryView} from '../views/ArtistGalleryView';
import {FanShell} from '../components/FanShell';
import {filterDisplayItems} from '../world/displayFilter';
import {displayOptions} from '../world/display';
import {createInitialState} from '../data/fixtures';
function mount(path:string){return render(<AppProvider><MemoryRouter initialEntries={[path]}><Routes><Route element={<FanShell/>}><Route path="/artists" element={<ArtistGalleryView/>}/><Route path="/me" element={<FanWorldView/>}/><Route path="/archive" element={<FanWorldView/>}/><Route path="/moments" element={<FanWorldView/>}/></Route></Routes></MemoryRouter></AppProvider>);}
describe('v7 fan-first information architecture',()=>{
 beforeEach(()=>localStorage.clear());
 it('four destinations and no scope banner; artist home has shortcuts and highlights without a hall image',()=>{const {container}=mount('/artists');expect(within(screen.getByRole('navigation',{name:'Điều hướng chính'})).getAllByRole('link').map(a=>a.textContent)).toEqual(['Explore','Moments','My Space','VieSHOP']);expect(screen.queryByText('Phạm vi & Giới hạn')).not.toBeInTheDocument();expect(screen.getByRole('heading',{name:'Nghệ sĩ đang theo dõi'})).toBeInTheDocument();expect(screen.getByRole('region',{name:'Hoạt động nổi bật'})).toBeInTheDocument();expect(container.querySelector('.v6-artist-hall')).toBeNull();});
 it('legacy archive opens private collection within My Space without a room',()=>{const {container}=mount('/archive');expect(screen.getByRole('heading',{level:1})).toHaveTextContent('My Space');expect(screen.getByRole('button',{name:'Bộ sưu tập riêng'})).toHaveAttribute('aria-pressed','true');expect(container.querySelector('.v6-room-art')).toBeNull();fireEvent.click(screen.getByRole('button',{name:'Phòng trưng bày'}));expect(container.querySelector('.v6-room-art')).not.toBeNull();});
 it('custom deep link provides typed filters without publishing anything',()=>{mount('/me?custom=ticket');expect(screen.getByRole('searchbox',{name:'Tìm trong bộ sưu tập'})).toBeInTheDocument();expect(screen.getByRole('button',{name:'Vé & kỷ niệm'})).toHaveAttribute('aria-pressed','true');expect(screen.getByLabelText('Từ ngày')).toHaveAttribute('type','date');});
 it('filters by accent-insensitive name, artist, date and exact fixture category',()=>{const items=[{id:'1',slot:'ticket' as const,title:'Đêm tháng sáu',detail:'',worldId:'a',collectedAt:'2026-06-10T00:00:00Z'},{id:'2',slot:'shirt' as const,title:'Đêm tháng sáu',detail:'',worldId:'a',collectedAt:'2026-06-10T00:00:00Z'},{id:'3',slot:'ticket' as const,title:'Đêm tháng sáu',detail:'',worldId:'b'}];const f={slot:'ticket' as const,query:'dem thang',artist:'a',from:'2026-06-01',to:'2026-06-30'};expect(filterDisplayItems(items,f).map(i=>i.id)).toEqual(['1']);expect(filterDisplayItems(items,{...f,to:'2026-06-02'})).toEqual([]);});
 it('capsule display candidates never carry private notes or grant extra rights',()=>{const s=createInitialState('vieworld-demo');s.capsules.private={id:'private',tenantId:s.activeTenantId,version:1,updatedAt:s.demoTime,fanId:s.fanProfile.id,worldId:'artist-a',sessionId:'sample',participationId:'p',isSaved:false,privateNote:'PRIVATE SECRET'};const options=displayOptions(s);expect(options.some(i=>i.id==='private')).toBe(true);expect(JSON.stringify(options)).not.toContain('PRIVATE SECRET');});
});
