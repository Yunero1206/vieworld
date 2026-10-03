import {useEffect,useState} from 'react';
import {Link,Navigate,useSearchParams} from 'react-router-dom';
import {useApp} from '../context/AppContext';
import {PersonalSpaceGate} from '../components/account/PersonalSpaceGate';
import {PersonalDisplayRoom} from '../components/DisplayRoom';
import {CollectionBrowser} from '../components/CollectionBrowser';
import {FanAvatarCustomizer} from '../components/FanAvatarCustomizer';
import {RoomGuestbook} from '../components/RoomGuestbook';
import {WorldPanel} from '../components/WorldPanel';
import {PrivacyDialog} from '../components/account/PrivacyDialog';
import {loadPrivacySettings} from '../world/privacy';

export function FanWorldView(){const {state}=useApp();return <PersonalSpaceGate><RoomFirstSpace key={state.activeTenantId+':'+state.fanProfile.id}/></PersonalSpaceGate>;}
function RoomFirstSpace(){
 const {state}=useApp();const [params,setParams]=useSearchParams();
 const [privacy,setPrivacy]=useState(()=>loadPrivacySettings(state.activeTenantId,state.fanProfile.id));
 const [privacyOpen,setPrivacyOpen]=useState(false);
 useEffect(()=>{const refresh=()=>setPrivacy(loadPrivacySettings(state.activeTenantId,state.fanProfile.id));refresh();window.addEventListener('vieworld-privacy-changed',refresh);return()=>window.removeEventListener('vieworld-privacy-changed',refresh);},[state.activeTenantId,state.fanProfile.id]);
 const panel=params.get('panel')||params.get('drawer')||params.get('zone');
 const route=panel&&({bag:'/orders',orders:'/orders',pass:'/memberships',membership:'/memberships',benefits:'/memberships',support:'/account/help',account:'/account/settings',privacy:'/account/settings',worlds:'/explore',hall:'/explore?scope=following',calendar:'/explore?scope=following',sessions:'/explore',archive:'/explore'} as Record<string,string>)[panel];
 const section=params.get('section')||(panel==='wardrobe'?'avatar':panel==='capsules'||panel==='showcase'||params.has('custom')?'collection':null);
 const open=(value:string)=>{const next=new URLSearchParams();next.set('section',value==='wardrobe'?'avatar':value);if(value==='wardrobe')next.set('tab','outfit');setParams(next);};
 const close=()=>setParams({});
 if(route)return <Navigate to={route} replace/>;
 return <div className="presence-room-page">
   <PersonalDisplayRoom key={state.activeTenantId+state.fanProfile.id} onOpen={open} onOpenPrivacy={()=>setPrivacyOpen(true)} privacySettings={privacy}/>
   <nav className="presence-room-secondary" aria-label="Góc riêng"><Link to="/me?section=collection">Bộ sưu tập riêng</Link><Link to="/account/settings">Cài đặt</Link></nav>
   {section==='avatar'&&<WorldPanel title="Avatar của bạn" onClose={close} variant="workspace"><FanAvatarCustomizer initialTab={params.get('tab')==='accessories'?'accessories':params.get('tab')==='outfit'||panel==='wardrobe'?'outfit':'appearance'} onBackToRoom={close}/></WorldPanel>}
   {section==='collection'&&<WorldPanel title="Bộ sưu tập riêng" onClose={close} variant="workspace"><CollectionBrowser/></WorldPanel>}
   {section==='guestbook'&&<WorldPanel title="Sổ lưu bút" onClose={close}>{privacy.guestbookEnabled?<RoomGuestbook fanId={state.fanProfile.id} isOwner/>:<p>Bạn đang ẩn sổ lưu bút. <Link to="/account/settings">Mở cài đặt</Link></p>}</WorldPanel>}
   {privacyOpen&&<PrivacyDialog onClose={()=>setPrivacyOpen(false)} onSave={setPrivacy}/>}
 </div>;
}
