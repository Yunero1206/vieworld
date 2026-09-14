import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AvatarStage } from './AvatarStage';
import { PresencePanel } from './PresencePanel';
import { FanChatPanel } from './FanChatPanel';
import { getArtistChatMeta } from '../data/artistChatConfig';

export function ArtistBroadcast({worldId,format='dropin',sessionId}:{worldId:string;format?:'dropin'|'concert';sessionId?:string}){
  const {state, dispatch}=useApp();
  const session=Object.values(state.sessions).filter(s=>s.worldId===worldId&&(sessionId?s.id===sessionId:s.format===format)&&!['cancelled','ended'].includes(s.status)).sort((a,b)=>Number(b.status==='running')-Number(a.status==='running'))[0];
  if(!session)return <p className="fw-muted">Nhà nhạc chưa có phiên {format==='concert'?'concert':'live chat'} phù hợp. Không có artist đang phát trực tiếp tại đây.</p>;
  const raw=session.avatarAssetId?state.avatarAssets[session.avatarAssetId]:undefined;
  const approved=raw?.status==='approved'&&raw.ownerWorldId===session.worldId&&raw.allowedContexts.includes(session.format);
  const presence=session.status==='running'&&session.segmentMode==='live'&&session.hostRole==='artist'?session.artistPresence:'absent';
  const world = state.worlds[worldId];
  const sessionPoll = Object.values(state.polls).find(p => p.sessionId === session.id);
  const chatMeta = getArtistChatMeta(worldId, session, world?.name);

  return (
    <section className="vw-broadcast" aria-label="Khung phát avatar artist 2D">
      <PresencePanel session={{...session,artistPresence:presence}}/>
      <AvatarStage compact avatar={approved?raw:undefined} artistPresence={presence} isPaused={session.status!=='running'} stageVariant={format==='concert'?'concert':'standard'}/>
      <p className="fw-muted">Avatar 2D của artist hư cấu · Phiên mô phỏng. Chuyển động không có nghĩa là artist thật đang online. {session.segmentMode==='recorded'?'Đây là phân đoạn ghi sẵn.':''}</p>
      <div style={{ margin: '8px 0 14px' }}>
        <Link className="fw-button" to={`/sessions/${session.id}`}>Vào phiên · chat, câu hỏi & âm thanh →</Link>
      </div>

      {/* Unified Live Chat Feature for All Artists in Moments */}
      <div
        className="moments-chat-dock-container"
        style={{
          height: '480px',
          display: 'flex',
          flexDirection: 'column',
          marginTop: '12px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        }}
      >
        <FanChatPanel
          sessionId={session.id}
          worldId={worldId}
          artistName={world?.name || chatMeta.artistName}
          currentFanId={state.fanProfile.id}
          currentFanName={state.fanProfile.displayName}
          isChatPaused={session.isChatPaused}
          poll={sessionPoll || chatMeta.poll}
          onVote={(pollId, optionId) => dispatch({ type: 'VOTE_POLL', pollId, optionId })}
          cues={session.callSampleCues && session.callSampleCues.length > 0 ? session.callSampleCues : chatMeta.cues}
        />
      </div>
    </section>
  );
}

