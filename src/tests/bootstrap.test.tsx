import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DemoBanner } from '../components/DemoBanner';
import { AboutDemoView } from '../views/AboutDemoView';
import { HomeView } from '../views/HomeView';

describe('P00 Bootstrap & Prototype Honesty Acceptance Checks', () => {
  it('renders persistent DEMO banner with required disclosure text', () => {
    render(
      <BrowserRouter>
        <DemoBanner />
      </BrowserRouter>
    );

    // Verify DEMO badge presence
    expect(screen.getByText('DEMO')).toBeInTheDocument();

    // Verify required honesty copy (§2.2)
    expect(
      screen.getByText(/Bản thử nghiệm · Dữ liệu và tương tác mô phỏng/i)
    ).toBeInTheDocument();

    // Verify link to about-demo
    const aboutLink = screen.getByRole('link', { name: /Phạm vi & Giới hạn/i });
    expect(aboutLink).toHaveAttribute('href', '/about-demo');
  });

  it('renders Home view with signature loop and next moment preview', () => {
    render(
      <BrowserRouter>
        <HomeView />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Khám phá không gian kết nối người hâm mộ/i
    );
    expect(screen.getByText(/Artist A · Drop-in Gặp gỡ thân mật/i)).toBeInTheDocument();
  });

  it('renders AboutDemoView with required honesty and fictional entity statements', () => {
    render(
      <BrowserRouter>
        <AboutDemoView />
      </BrowserRouter>
    );

    // Verify independent concept declaration
    expect(screen.getByText(/không phải là sản phẩm chính thức/i)).toBeInTheDocument();

    // Verify fictional entity mentions
    expect(screen.getByText(/Artist A/i)).toBeInTheDocument();
    expect(screen.getByText(/Neon Sessions/i)).toBeInTheDocument();

    // Verify no real payment statement
    expect(screen.getByText(/Không thanh toán thật/i)).toBeInTheDocument();

    // Verify truthful presence declaration
    expect(screen.getByText(/Sự hiện diện chân thực/i)).toBeInTheDocument();
  });
});
