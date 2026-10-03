import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { ContextStage } from '../components/ContextStage';
import { createInitialState } from '../data/fixtures';
import { saveState } from '../services/storageAdapter';
import { appReducer } from '../domain/reducer';
function mount() { const state=createInitialState('vieworld-demo'); if (!localStorage.getItem('vieworld_v1_vieworld-demo_fan-linh')) saveState(state); return render(<AppProvider><MemoryRouter><ContextStage session={state.sessions['session-dropin-01']} artistId="artist-a" artistName="Artist A" image="/image.png"/></MemoryRouter></AppProvider>); }
describe('Context stage refinement',()=>{
  beforeEach(()=>localStorage.clear());
  it('restores user-triggered lightstick effects without a fake cheer total',()=>{
    const {container}=mount();
    expect(screen.queryByRole('button',{name:'Thả tim cổ vũ nghệ sĩ'})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Vẫy lightstick cổ vũ'}));
    expect(container.querySelectorAll('.vw-live-cheer-particles svg')).toHaveLength(5);
    expect(screen.getByRole('log',{name:'Trò chuyện cùng Hall'})).toBeInTheDocument();
    expect(screen.queryAllByRole('img',{name:/Minh họa · Hội viên/})).toHaveLength(0);
  });
  it('opens public chat/composer for nonmembers without invented sample tenure',()=>{
    const state=createInitialState('vieworld-demo'); state.memberships={}; saveState(state); mount();
    expect(screen.getByRole('log')).toBeInTheDocument();
    expect(screen.getByRole('textbox',{name:'Gửi lời trong Hall'})).toBeInTheDocument();
    expect(screen.getByRole('link',{name:'Vào Hall'})).toBeInTheDocument();
  });
  it('stores a start date on new membership but preserves an active period on retry',()=>{
    const state=createInitialState('vieworld-demo'); state.memberships={};
    const next=appReducer(state,{type:'UPGRADE_MEMBERSHIP',worldId:'artist-a'});
    expect(Object.values(next.memberships)[0].startedAt).toBe(state.demoTime);
    expect(appReducer(next,{type:'UPGRADE_MEMBERSHIP',worldId:'artist-a'})).toBe(next);
  });
});
