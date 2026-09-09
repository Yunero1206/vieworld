import React from 'react';
import { ShieldAlert, Lock, Layers } from 'lucide-react';

export const AboutDemoView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '900px' }}>
      <header>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="demo-badge">DEMO DISCLOSURE</span>
          <span className="tag">PHIÊN BẢN 1.0</span>
        </div>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '8px' }}>
          Về bản thử nghiệm VieWorld
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--text-base)', lineHeight: 1.6 }}>
          VieWorld là một bản thử nghiệm sản phẩm độc lập do Phạm Thanh Phú thiết kế và xây dựng nhằm kiểm chứng trải nghiệm kết nối cộng đồng người hâm mộ (fan relationship product).
        </p>
      </header>

      <section className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={22} color="var(--primary)" />
          <span>Tuyên bố tính trung thực & Pháp lý (§2.2)</span>
        </h2>
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--ink)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
          <li>
            <strong>Dự án độc lập:</strong> VieWorld không phải là sản phẩm chính thức được công bố hay bảo trợ bởi DatVietVAC hay bất kỳ đối tác thương mại nào.
          </li>
          <li>
            <strong>Nhân vật & Sự kiện hoàn toàn hư cấu:</strong> Nghệ sĩ <code>Artist A</code> và chương trình <code>Neon Sessions</code> là thực thể giả lập. Không sử dụng hình ảnh, giọng nói, hoặc mạo danh danh tính nghệ sĩ thực tế.
          </li>
          <li>
            <strong>Huy hiệu DEMO cố định:</strong> Mọi trạng thái phát trực tiếp mô phỏng đều đi kèm huy hiệu <code>DEMO</code> liền kề.
          </li>
          <li>
            <strong>Sự hiện diện chân thực:</strong> Chuyển động của avatar không quyết định trạng thái hiện diện. Khi host ngắt kết nối, giao diện lập tức phản ánh trạng thái ngắt kết nối, tuyệt đối không dùng AI để đóng giả nghệ sĩ.
          </li>
          <li>
            <strong>Không thanh toán thật:</strong> Không thu thập thẻ ngân hàng, tài khoản thanh toán hoặc dữ liệu tài chính cá nhân. Nút mua sắm chỉ phục vụ mô phỏng luồng đơn hàng.
          </li>
        </ul>
      </section>

      <section className="card">
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={22} color="var(--primary)" />
          <span>Ranh giới kỹ thuật & Bảo mật dữ liệu (§2.4, §4)</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
          <div style={{ padding: 'var(--space-3)', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', marginBottom: '4px' }}>Lưu trữ cục bộ</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              Dữ liệu được lưu trữ trong trình duyệt qua adapter phiên bản (localStorage) và phân tách theo không gian tenant (VieWorld, MFan, FanMe).
            </p>
          </div>
          <div style={{ padding: 'var(--space-3)', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', marginBottom: '4px' }}>Không quyền nhạy cảm</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              Nguyên mẫu không yêu cầu quyền camera, microphone hay thông báo hệ điều hành trong phạm vi cốt lõi.
            </p>
          </div>
          <div style={{ padding: 'var(--space-3)', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: '700', marginBottom: '4px' }}>Media sạch bản quyền</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              Âm thanh và hình ảnh sử dụng vector tự tạo hoặc vòng lặp âm thanh trung tính đã được cấp phép. Không rip hay stream từ Spotify/YouTube.
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={22} color="var(--primary)" />
          <span>Lộ trình các gói công việc (P00 – P17)</span>
        </h2>
        <p className="card-desc" style={{ marginBottom: '16px' }}>
          Hệ thống được xây dựng theo từng gói công việc độc lập nhằm đảm bảo kiểm thử và kiểm soát chất lượng nghiêm ngặt:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', fontSize: 'var(--text-xs)' }}>
          <div style={{ padding: '8px', background: '#EDE9FE', color: 'var(--primary)', fontWeight: '600', borderRadius: 'var(--radius-sm)' }}>
            ✓ P00: Khởi tạo & Checkpoint
          </div>
          <div style={{ padding: '8px', background: 'var(--bg)', color: 'var(--muted)', borderRadius: 'var(--radius-sm)' }}>
            P01: Domain Types & Reducer
          </div>
          <div style={{ padding: '8px', background: 'var(--bg)', color: 'var(--muted)', borderRadius: 'var(--radius-sm)' }}>
            P02: Persistence & Reusable Shell
          </div>
          <div style={{ padding: '8px', background: 'var(--bg)', color: 'var(--muted)', borderRadius: 'var(--radius-sm)' }}>
            P03: Discover & Worlds
          </div>
          <div style={{ padding: '8px', background: 'var(--bg)', color: 'var(--muted)', borderRadius: 'var(--radius-sm)' }}>
            P04: Session Stage & Presence
          </div>
          <div style={{ padding: '8px', background: 'var(--bg)', color: 'var(--muted)', borderRadius: 'var(--radius-sm)' }}>
            P05: Questions, Poll & Chat
          </div>
          <div style={{ padding: '8px', background: 'var(--bg)', color: 'var(--muted)', borderRadius: 'var(--radius-sm)' }}>
            P06: Capsule & My World (Loop)
          </div>
          <div style={{ padding: '8px', background: 'var(--bg)', color: 'var(--muted)', borderRadius: 'var(--radius-sm)' }}>
            P07–P10: Utility & Recovery
          </div>
          <div style={{ padding: '8px', background: 'var(--bg)', color: 'var(--muted)', borderRadius: 'var(--radius-sm)' }}>
            P11–P13: Operator & Studio
          </div>
          <div style={{ padding: '8px', background: 'var(--bg)', color: 'var(--muted)', borderRadius: 'var(--radius-sm)' }}>
            P14–P17: Isolation, QA & Handoff
          </div>
        </div>
      </section>
    </div>
  );
};
