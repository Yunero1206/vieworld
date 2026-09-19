import React, { useEffect, useState } from 'react';

export interface SpeechBubbleProps {
  text?: string;
  durationMs?: number;
  onDismiss?: () => void;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  text,
  durationMs = 4000,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(Boolean(text));

  useEffect(() => {
    if (!text) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [text, durationMs, onDismiss]);

  if (!visible || !text) return null;

  return (
    <div className="speech-bubble-container" role="status" aria-live="polite">
      <div className="speech-bubble">{text}</div>
    </div>
  );
};
