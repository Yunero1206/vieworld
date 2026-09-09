import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { NextMomentCard } from '../components/NextMomentCard';
import { WorldCard } from '../components/WorldCard';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Repeat, Compass } from 'lucide-react';

export const DiscoverView: React.FC = () => {
  const { state } = useApp();

  // Find priority next moment session (e.g. session-dropin-01)
  const nextSession =
    Object.values(state.sessions).find((s) => s.status === 'running') ||
    Object.values(state.sessions).find((s) => s.status === 'scheduled') ||
    state.sessions['session-dropin-01'];

  const worldsList = Object.values(state.worlds);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Editorial Header Hero */}
      <header>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="demo-badge">DEMO PROTOTYPE</span>
          <span className="tag" style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)' }}>
            VÒNG LẶP TRẢI NGHIỆM ĐẦU TIÊN
          </span>
        </div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '10px' }}>
          Khám phá thế giới người hâm mộ
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--text-base)', maxWidth: '680px', lineHeight: 1.6 }}>
          VieWorld là nguyên mẫu kết nối người hâm mộ và thế giới giải trí qua những khoảnh khắc trực tuyến có ý nghĩa, lưu giữ kỷ niệm và quyền lợi minh bạch.
        </p>
      </header>

      {/* Next Moment Spotlight (§3.2) */}
      {nextSession && <NextMomentCard session={nextSession} />}

      {/* Signature Loop Explanation Card */}
      <section className="card" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Repeat size={18} color="var(--primary)" />
          <h2 style={{ fontSize: 'var(--text-md)', fontWeight: '700' }}>Vòng lặp tương tác chuẩn (§2.1)</h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            textAlign: 'center',
            fontSize: 'var(--text-xs)',
          }}
        >
          <div style={{ padding: '12px 8px', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
            <Compass size={18} color="var(--primary)" style={{ margin: '0 auto 6px auto' }} />
            <strong>1. Khám phá</strong>
            <p style={{ color: 'var(--muted)', marginTop: '2px' }}>Tìm khoảnh khắc mới</p>
          </div>
          <div style={{ padding: '12px 8px', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
            <Heart size={18} color="var(--primary)" style={{ margin: '0 auto 6px auto' }} />
            <strong>2. Vào World & Theo dõi</strong>
            <p style={{ color: 'var(--muted)', marginTop: '2px' }}>Gắn kết tự nguyện</p>
          </div>
          <div style={{ padding: '12px 8px', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
            <Sparkles size={18} color="var(--primary)" style={{ margin: '0 auto 6px auto' }} />
            <strong>3. Tham gia & Lưu Capsule</strong>
            <p style={{ color: 'var(--muted)', marginTop: '2px' }}>Nhận kỷ niệm số</p>
          </div>
          <div style={{ padding: '12px 8px', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
            <ShieldCheck size={18} color="var(--primary)" style={{ margin: '0 auto 6px auto' }} />
            <strong>4. My World & Sở hữu</strong>
            <p style={{ color: 'var(--muted)', marginTop: '2px' }}>Quyền lợi & Khôi phục</p>
          </div>
        </div>
      </section>

      {/* Featured Worlds Section */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '700' }}>Các không gian giải trí nổi bật</h2>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
              Mỗi thế giới sở hữu sự kiện, khoảnh khắc và cửa hàng VieSHOP riêng biệt.
            </p>
          </div>
          <Link to="/worlds" className="btn btn-secondary" style={{ fontSize: 'var(--text-xs)' }} id="see-all-worlds-btn">
            <span>Xem tất cả ({worldsList.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {worldsList.map((world) => (
            <WorldCard key={world.id} world={world} viewMode="scenery" />
          ))}
        </div>
      </section>
    </div>
  );
};
