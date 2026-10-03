import { fireEvent,render,screen } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import { describe,expect,it } from 'vitest';

import { CallSampleCueBar } from '../components/CallSampleCueBar';
import { CallSampleCue } from '../domain/types';

describe('Job 08: Art Integration & Responsive Micro-Feedback', () => {

  const mockCues: CallSampleCue[] = [
    {
      id: 'cue-01',
      cueText: 'VI-E-WORLD!',
      prompt: 'Hô vang tên cộng đồng cùng nghệ sĩ tại nhịp dạo đầu!',
      actionLabel: 'Hô vang: VIEWORLD',
    },
    {
      id: 'cue-03',
      cueText: 'LIGHTSTICK XANH!',
      prompt: 'Bật và vẫy lightstick ảo theo nhịp trống dồn!',
      actionLabel: 'Vẫy lightstick ảo',
    },
  ];

  /* -------------------------------------------------------------------------- */
  /* Test 3: Local Lightstick Interaction & Truthful Invariants                */
  /* -------------------------------------------------------------------------- */
  describe('Local Lightstick & Call Sample Cues', () => {
    it('provides local visual feedback on lightstick trigger without fake crowd or capsule awards', () => {
      render(<CallSampleCueBar cues={mockCues} />);

      // Verify disclaimers exist
      const cueDisclaimer = screen.getByTestId('call-sample-cue-disclaimer');
      expect(cueDisclaimer).toHaveTextContent(/mô phỏng hiệu ứng tương tác cục bộ/i);
      expect(cueDisclaimer).toHaveTextContent(/không đồng bộ âm thanh webrtc/i);

      const lightstickDisclaimer = screen.getByTestId('lightstick-disclaimer');
      expect(lightstickDisclaimer).toHaveTextContent(/tuyệt đối không làm tăng số lượng khán giả ảo/i);
      expect(lightstickDisclaimer).toHaveTextContent(/không tự động cấp capsule/i);

      // Trigger lightstick cue
      const lightstickBtn = screen.getByTestId('trigger-cue-cue-03');
      expect(lightstickBtn).toHaveClass('cue-button--lightstick');
      fireEvent.click(lightstickBtn);

      // Feedback message confirms local scope
      const feedback = screen.getByTestId('cue-feedback-message');
      expect(feedback).toHaveTextContent(/đang vẫy lightstick ảo/i);
      expect(feedback).toHaveTextContent(/không tăng số lượng khán giả/i);

      // Active lightstick pulse badge is displayed
      const activePulse = screen.getByTestId('lightstick-local-feedback');
      expect(activePulse).toBeInTheDocument();
      expect(activePulse).toHaveTextContent(/chỉ hiển thị trên màn hình của bạn/i);
    });

    it('triggers standard cue feedback for non-lightstick chants', () => {
      render(<CallSampleCueBar cues={mockCues} />);

      const chantBtn = screen.getByTestId('trigger-cue-cue-01');
      fireEvent.click(chantBtn);

      const feedback = screen.getByTestId('cue-feedback-message');
      expect(feedback).toHaveTextContent(/bạn vừa hưởng ứng: "VI-E-WORLD!"/i);
      expect(feedback).toHaveTextContent(/mô phỏng hiệu ứng cục bộ/i);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Test 4: Reduced Motion & Tactile Micro-Interactions in CSS                 */
  /* -------------------------------------------------------------------------- */
  describe('CSS Micro-Interactions & Reduced Motion Rules', () => {
    it('contains prefers-reduced-motion media query guarding artwork, animations, and hotspots', () => {
      const cssContent = fs.readFileSync(path.resolve(__dirname, '../index.css'), 'utf-8');

      // Verifies reduced motion rules disable animations and transitions
      expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(cssContent).toContain('.diorama-backdrop-artwork');
      expect(cssContent).toContain('.room-backdrop-artwork');
      expect(cssContent).toContain('.lightstick-active-badge');
      expect(cssContent).toContain('.avatar-renderer');

      // Verifies tactile micro-interaction active states
      expect(cssContent).toContain('.diorama-spot:active');
      expect(cssContent).toContain('.room-spot:active');
      expect(cssContent).toContain('transform: scale(0.98)');
    });
  });

});
