import {describe,it,expect,beforeEach} from 'vitest';
import {render,screen,fireEvent} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {AppProvider} from '../context/AppContext';
import {FanAvatarCustomizer} from '../components/FanAvatarCustomizer';
import {CollectionBrowser} from '../components/CollectionBrowser';
import {createInitialState} from '../data/fixtures';
import {appReducer} from '../domain/reducer';
import {currentPublicFan} from '../world/community';
import {filterDisplayItems} from '../world/displayFilter';
describe('v8 identity and collection',()=>{
 beforeEach(()=>localStorage.clear());
 it('persists only a supported appearance without granting ownership or access',()=>{const s=createInitialState('vieworld-demo');const n=appReducer(s,{type:'SET_AVATAR_PRESET',preset:'bob'});expect(n.fanProfile.avatarPreset).toBe('bob');expect(n.orders).toBe(s.orders);expect(n.memberships).toBe(s.memberships);expect(currentPublicFan(n).appearance).toBe('bob');expect(appReducer(s,{type:'SET_AVATAR_PRESET',preset:'invalid' as 'bob'})).toBe(s);});
 it('preview is reversible and save is explicit',()=>{render(<AppProvider disableAutoHydrate><MemoryRouter><FanAvatarCustomizer/></MemoryRouter></AppProvider>);const save=screen.getByRole('button',{name:'Lưu avatar'});expect(save).toBeDisabled();fireEvent.click(screen.getByRole('button',{name:'Tóc bob hạt dẻ'}));expect(save).not.toBeDisabled();fireEvent.click(screen.getByRole('button',{name:'Hủy thay đổi'}));expect(save).toBeDisabled();fireEvent.click(screen.getByRole('button',{name:'Tóc xoăn mềm'}));fireEvent.click(save);expect(save).toBeDisabled();expect(screen.getByRole('status')).toHaveTextContent('Đã lưu');});
 it('collection owns filters and typed entry; no display room duplicated',()=>{const {container}=render(<AppProvider disableAutoHydrate><MemoryRouter initialEntries={['/me?section=collection&type=shirt']}><CollectionBrowser/></MemoryRouter></AppProvider>);expect(screen.getByRole('button',{name:'Áo'})).toHaveAttribute('aria-pressed','true');expect(screen.getByRole('searchbox')).toBeInTheDocument();expect(container.querySelector('.v6-room-art')).toBeNull();fireEvent.click(screen.getByRole('button',{name:'Xóa bộ lọc'}));expect(screen.getByRole('button',{name:'Tất cả'})).toHaveAttribute('aria-pressed','true');});
 it('all-types search preserves artist and date filtering',()=>{const items=[{id:'a',slot:'shirt' as const,title:'Áo mùa hè',detail:'',worldId:'a',collectedAt:'2026-06-10T00:00:00Z'},{id:'b',slot:'ticket' as const,title:'Vé mùa hè',detail:'',worldId:'b'}];expect(filterDisplayItems(items,{slot:'all',query:'mua he',artist:'all',from:'',to:''})).toHaveLength(2);expect(filterDisplayItems(items,{slot:'all',query:'mua he',artist:'a',from:'2026-06-01',to:'2026-06-30'}).map(i=>i.id)).toEqual(['a']);});
});
