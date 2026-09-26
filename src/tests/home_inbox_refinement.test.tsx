import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { NotificationOverlay } from '../components/notifications/NotificationOverlay';
import type { DisplayNotification } from '../components/notifications/notification.types';
import { createInitialState } from '../data/fixtures';
import { appReducer } from '../domain/reducer';
import { AppProvider } from '../context/AppContext';
import { CollectionBrowser } from '../components/CollectionBrowser';
import { MemoryRouter } from 'react-router-dom';

describe('Unified notification inbox', () => {
  const notices: DisplayNotification[] = Array.from({length:12},(_,i)=>({id:`n${i}`,type:'system',categoryLabel:'VieWorld',categoryDotColor:'#6366f1',title:`Tin số ${i}`,body:'Nội dung thông báo',createdAt:`2026-09-${String(i+1).padStart(2,'0')}T10:00:00Z`,timeAgo:'Hôm nay',read:i%2===0}));
  it('includes all notices without truncation or a second view, newest first',()=>{
    render(<NotificationOverlay isOpen notifications={notices} onClose={vi.fn()} onSelectNotification={vi.fn()} onMarkAllAsRead={vi.fn()}/>);
    const list=screen.getByRole('region',{name:'Tất cả thông báo'});
    expect(within(list).getAllByRole('button')).toHaveLength(12);
    expect(within(list).getAllByRole('button')[0]).toHaveTextContent('Tin số 11');
    expect(screen.queryByText(/Xem chi tiết|Xem tất cả thông báo/)).toBeNull();
  });
  it('opens a notice with keyboard and closes the overlay',()=>{
    const select=vi.fn(),close=vi.fn();
    render(<NotificationOverlay isOpen notifications={notices} onClose={close} onSelectNotification={select} onMarkAllAsRead={vi.fn()}/>);
    fireEvent.keyDown(screen.getByRole('button',{name:'Chưa đọc: VieWorld - Tin số 11'}),{key:'Enter'});
    expect(select).toHaveBeenCalledWith(notices[11]); expect(close).toHaveBeenCalledOnce();
  });
  it('shows an empty state and disables meaningless mark-all action',()=>{
    render(<NotificationOverlay isOpen notifications={[]} onClose={vi.fn()} onSelectNotification={vi.fn()} onMarkAllAsRead={vi.fn()}/>);
    expect(screen.getByText(/Chưa có thông báo nào/)).toBeVisible();
    expect(screen.getByRole('button',{name:'Đánh dấu tất cả đã đọc'})).toBeDisabled();
  });
  it('cannot mark a different tenant or fan notification as read',()=>{
    const state=createInitialState();
    const example=Object.values(state.notifications)[0];
    state.notifications.other={...example,id:'other',tenantId:'mfan-demo',isRead:false};
    expect(appReducer(state,{type:'MARK_NOTIFICATION_READ',notificationId:'other'})).toBe(state);
    const next=appReducer(state,{type:'MARK_ALL_NOTIFICATIONS_READ'});
    expect(next.notifications.other.isRead).toBe(false);
    expect(Object.values(next.notifications).filter(item=>item.tenantId===next.activeTenantId).every(item=>item.isRead)).toBe(true);
  });
  it('opens legacy achievement links in the memory mode with the correct lens',()=>{
    render(<AppProvider><MemoryRouter initialEntries={['/me?section=collection&type=achievement']}><CollectionBrowser/></MemoryRouter></AppProvider>);
    expect(screen.getByRole('button',{name:'Kỷ niệm & dấu mốc'})).toHaveAttribute('aria-pressed','true');
    expect(screen.getByRole('button',{name:'Dấu mốc'})).toHaveAttribute('aria-pressed','true');
    fireEvent.click(screen.getByRole('button',{name:'Vật phẩm'}));
    expect(screen.getByRole('button',{name:'Vật phẩm'})).toHaveAttribute('aria-pressed','true');
  });
});
