import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sparkles, ShieldCheck, ArrowRight, Radio } from 'lucide-react';

export const StudioOverviewView: React.FC = () => {
  const { state } = useApp();

  const avatars = Object.values(state.avatarAssets);
  const approvedCount = avatars.filter((a) => a.status === 'approved').length;
  const draftCount = avatars.filter((a) => a.status === 'draft').length;
  const retiredCount = avatars.filter((a) => a.status === 'retired').length;

  const runningSessions = Object.values(state.sessions).filter((s) => s.status === 'running').length;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '20px 20px 60px 20px' }}>
      {/* Operator Role Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="tag" style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)', fontWeight: '700' }}>
            OPERATOR WORKSPACE · PHẠM VI NỘI BỘ
          </span>
          <span className="demo-badge">DEMO</span>
        </div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--ink)' }}>
          Bàn điều khiển Studio Demo
        </h1>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
          Mô phỏng quy trình kiểm duyệt tài sản avatar nghệ sĩ và quản trị phiên tương tác ảo.
        </p>
      </div>

      {/* Operator Disclaimer Notice */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '28px',
          backgroundColor: 'var(--surface)',
          borderLeft: '4px solid var(--primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '700', fontSize: 'var(--text-xs)' }}>
          <ShieldCheck size={16} />
          <span>QUY TẮC MINH BẠCH VẬN HÀNH STUDIO (§2.3, §4, P11–P12)</span>
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.5 }}>
          • <strong>Tài sản đồ họa tổng hợp:</strong> Mọi avatar là gói thiết kế 2D SVG khép kín. Không tải lên ảnh chụp người thật, không sử dụng công nghệ sao chép khuôn mặt (Face Cloning).
          <br />
          • <strong>Phê duyệt mô phỏng:</strong> Thao tác "Phê duyệt" chỉ có giá trị vận hành bên trong prototype, không thay thế cho hợp đồng pháp lý hay kiểm duyệt KYC thực tế.
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '32px',
        }}
      >
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: '600' }}>Avatar Đã Phê Duyệt</span>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: '800', color: 'var(--ink)', marginTop: '4px' }}>
            {approvedCount}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: '600' }}>Bản Nháp (Draft)</span>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: '800', color: '#D97706', marginTop: '4px' }}>
            {draftCount}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: '600' }}>Đã Ngưng Dùng (Retired)</span>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: '800', color: 'var(--muted)', marginTop: '4px' }}>
            {retiredCount}
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: '600' }}>Phiên Đang Diễn Ra</span>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: '800', color: '#16A34A', marginTop: '4px' }}>
            {runningSessions}
          </div>
        </div>
      </div>

      {/* Workstation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
        {/* Avatar Studio Card (P11) */}
        <article
          className="card"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid var(--border)',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: '#EDE9FE' }}>
                <Sparkles size={22} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', margin: 0, color: 'var(--ink)' }}>
                  Artist Avatar Studio
                </h3>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Gói P11 · Vòng đời tài sản đồ họa</span>
              </div>
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
              Quản lý các bộ phận avatar (cơ bản, trang phục, phụ kiện), xem trước visualizer SVG trực tiếp, cấu hình phạm vi sử dụng (drop-in, listening, concert) và thực hiện phê duyệt mô phỏng.
            </p>
          </div>

          <Link
            to="/studio/avatar"
            className="btn btn-primary"
            id="open-avatar-studio-btn"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: 'var(--text-sm)' }}
          >
            <span>Mở Avatar Studio</span>
            <ArrowRight size={16} />
          </Link>
        </article>

        {/* Operator Session Console Card (P12 Preview) */}
        <article
          className="card"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid var(--border)',
            gap: '16px',
            backgroundColor: '#FAF9F6',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: '#E0F2FE' }}>
                <Radio size={22} color="#0284C7" />
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: '700', margin: 0, color: 'var(--ink)' }}>
                  Bàn điều khiển Phiên sự kiện
                </h3>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Gói P12 · Điều phối & Kiểm duyệt</span>
              </div>
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
              Điều khiển trạng thái phòng diễn, ngắt/kết nối hiện diện nghệ sĩ, duyệt câu hỏi fan gửi lên và kích hoạt lưu trữ bản ghi Replay có kiểm duyệt.
            </p>
          </div>

          <Link
            to="/studio/operator"
            className="btn btn-secondary"
            id="open-operator-console-btn"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: 'var(--text-sm)' }}
          >
            <span>Mở Bàn điều khiển Phiên</span>
            <ArrowRight size={16} />
          </Link>
        </article>
      </div>
    </div>
  );
};
