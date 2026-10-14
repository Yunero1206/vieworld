import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AppProvider, useApp, type AppContextValue } from '../context/AppContext';
import { createInitialState } from '../data/fixtures';
import * as storage from '../services/storageAdapter';

let context: AppContextValue;
function Controls() {
  context = useApp();
  return <><button onClick={()=>context.registerDemoProfile('QA persistence A','google')}>Register</button><button onClick={()=>context.signInDemoProfile('fan-linh','google')}>Switch back</button><button onClick={()=>context.dispatch({type:'DEMO_SIGN_OUT'})}>Sign out</button><button onClick={()=>context.dispatch({type:'SAVE_PUBLIC_IDENTITY',bio:'QA',mood:'QA latest edit'})}>Edit</button></>;
}
beforeEach(()=>{localStorage.clear();storage._resetMemoryFallbackFlagForTesting();});
afterEach(()=>{cleanup();vi.restoreAllMocks();});

describe('Immediate persistence quality boundaries',()=>{
  it('measures three equivalent serialization runs and registration write counts',()=>{
    const state=createInitialState('vieworld-demo');
    const times=[];
    for(let run=0;run<3;run++) { const start=performance.now(); for(let i=0;i<100;i++)JSON.stringify(state); times.push((performance.now()-start)/100); }
    const spy=vi.spyOn(storage,'saveState');
    render(<AppProvider initialState={state}><Controls/></AppProvider>);
    fireEvent.click(screen.getByText('Register'));
    const newId=context.state.fanProfile.id;
    const counts={old:spy.mock.calls.filter(([s])=>s.fanProfile.id==='fan-linh').length,new:spy.mock.calls.filter(([s])=>s.fanProfile.id===newId).length};
    console.info('PERSISTENCE_MEASUREMENT',JSON.stringify({runtime:process.version,serializeMs:times,snapshotBytes:new TextEncoder().encode(JSON.stringify(state)).length,registrationWrites:counts,environment:'jsdom storage mock; no StrictMode; not browser durability or render timings'}));
    expect(counts).toEqual({old:1,new:1});
    expect(storage.loadState('vieworld-demo',newId).state.fanProfile.displayName).toBe('QA persistence A');
  });
  it('never writes through a foreign-tab conflict, including a manual profile transition',()=>{
    const state=createInitialState('vieworld-demo');
    const spy=vi.spyOn(storage,'saveState');
    render(<AppProvider initialState={state}><Controls/></AppProvider>);
    const key=storage.buildStorageKey(state.activeTenantId,state.fanProfile.id);
    const oldValue=localStorage.getItem(key)!;
    const external=JSON.parse(oldValue); external.state.fanProfile.displayName='External edit';
    const event=new Event('storage'); Object.defineProperties(event,{key:{value:key},oldValue:{value:oldValue},newValue:{value:JSON.stringify(external)},storageArea:{value:localStorage}}); fireEvent(window,event);
    expect(context.persistenceConflict).toBe(true); const calls=spy.mock.calls.length;
    fireEvent.click(screen.getByText('Sign out'));
    expect(spy.mock.calls.length).toBe(calls);
    fireEvent.click(screen.getByText('Register'));
    expect(spy.mock.calls.slice(calls).every(([s])=>s.fanProfile.id!==state.fanProfile.id)).toBe(true);
    expect(context.persistenceConflict).toBe(false);
  });
  it('keeps valid profile data across immediate sign-out, profile switch and reload',()=>{
    render(<AppProvider initialState={createInitialState('vieworld-demo')}><Controls/></AppProvider>);
    fireEvent.click(screen.getByText('Register')); const id=context.state.fanProfile.id;
    fireEvent.click(screen.getByText('Edit'));
    const mood=context.state.fanProfile.publicIdentity?.mood;
    expect(mood).toBe('QA latest edit');
    fireEvent.click(screen.getByText('Sign out'));
    expect(storage.loadState('vieworld-demo',id).state.fanProfile.publicIdentity?.mood).toBe(mood);
    fireEvent.click(screen.getByText('Switch back'));
    expect(context.state.fanProfile.id).toBe('fan-linh');
    expect(storage.loadState('vieworld-demo',id).state.fanProfile.displayName).toBe('QA persistence A');
  });
  it('does not lock for a savedAt-only external write and still persists a real edit',()=>{
    const state=createInitialState('vieworld-demo');
    render(<AppProvider initialState={state}><Controls/></AppProvider>);
    const key=storage.buildStorageKey(state.activeTenantId,state.fanProfile.id), oldValue=localStorage.getItem(key)!;
    const external=JSON.parse(oldValue); external.savedAt='2030-01-01T00:00:00Z';
    const event=new Event('storage'); Object.defineProperties(event,{key:{value:key},oldValue:{value:oldValue},newValue:{value:JSON.stringify(external)},storageArea:{value:localStorage}}); fireEvent(window,event);
    expect(context.persistenceConflict).toBe(false);
    fireEvent.click(screen.getByText('Edit'));
    expect(storage.loadState('vieworld-demo','fan-linh').state.fanProfile.publicIdentity?.mood).toBe('QA latest edit');
  });
  it('retains the memory fallback and visible notice when saving is denied',()=>{
    render(<AppProvider initialState={createInitialState('vieworld-demo')}><Controls/></AppProvider>);
    vi.spyOn(localStorage,'setItem').mockImplementation(()=>{throw new Error('quota');});
    fireEvent.click(screen.getByText('Register')); const id=context.state.fanProfile.id;
    fireEvent.click(screen.getByText('Edit'));
    expect(context.isMemoryFallback).toBe(true); expect(context.storageNotice).toContain('không lưu được dữ liệu');
    expect(storage.loadState('vieworld-demo',id).state.fanProfile.publicIdentity?.mood).toBe('QA latest edit');
  });
});
