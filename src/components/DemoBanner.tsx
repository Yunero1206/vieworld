import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <aside className="demo-banner" aria-label="Thông báo phiên bản thử nghiệm" role="complementary">
      <div className="demo-banner-content">
        <span className="demo-badge" aria-label="Chế độ thử nghiệm">DEMO</span>
        <AlertCircle size={16} aria-hidden="true" />
        <strong>Bản thử nghiệm · Dữ liệu và tương tác mô phỏng</strong>
      </div>
      <Link to="/about-demo" className="demo-banner-link" id="demo-banner-about-link">
        Phạm vi & Giới hạn
      </Link>
    </aside>
  );
};
