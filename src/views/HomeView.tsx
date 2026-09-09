import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Radio, Calendar } from 'lucide-react';

export const HomeView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <header>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="tag">NGUYÊN MẪU SẢN PHẨM</span>
          <span className="tag" style={{ backgroundColor: '#EDE9FE', color: 'var(--primary)' }}>PHASE P00</span>
        </div>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '8px' }}>
          Khám phá không gian kết nối người hâm mộ
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--text-base)', maxWidth: '640px' }}>
          VieWorld tạo nên nhịp kết nối bền vững giữa nghệ sĩ và cộng đồng qua các khoảnh khắc trực tuyến trung thực, trải nghiệm sở hữu kỷ niệm và quyền lợi rõ ràng.
        </p>
      </header>

      <section className="card" style={{ background: 'linear-gradient(135deg, #201E3C 0%, #151426 100%)', color: '#FFFFFF', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', marginBottom: '12px' }}>
              <Radio size={14} color="#A9E5D4" />
              <span>KHOẢNH KHẮC TIẾP THEO · MÔ PHỎNG</span>
            </div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: '700', marginBottom: '6px' }}>
              Artist A · Drop-in Gặp gỡ thân mật
            </h2>
            <p style={{ color: '#D8D9E1', fontSize: 'var(--text-sm)', maxWidth: '520px', marginBottom: '16px' }}>
              Trò chuyện trực tiếp cùng Artist A (nhân vật hư cấu), gửi câu hỏi hàng đợi và lưu lại Moment Capsule cá nhân sau buổi gặp gỡ.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: 'var(--text-xs)', color: '#A9E5D4' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> 20:00 tối nay (Asia/Ho_Chi_Minh)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> Huy hiệu DEMO bắt buộc
              </span>
            </div>
          </div>
          <Link to="/about-demo" className="btn btn-primary" id="home-cta-about">
            <span>Tìm hiểu bản demo</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        <article className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--primary)" />
            <span>Vòng lặp trải nghiệm cốt lõi</span>
          </h3>
          <p className="card-desc">
            Khám phá → Vào World → Theo dõi/RSVP → Tham gia sự kiện → Lưu Moment Capsule → Xem My World → Khôi phục quyền lợi.
          </p>
        </article>

        <article className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            <span>Tính trung thực tuyệt đối</span>
          </h3>
          <p className="card-desc">
            Không sử dụng nghệ sĩ thật, không cổng thanh toán tiền tệ thật, và không mạo danh sự hiện diện của con người bằng AI.
          </p>
        </article>
      </section>
    </div>
  );
};
