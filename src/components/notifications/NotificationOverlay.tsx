import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { DisplayNotification } from './notification.types';
import { NotificationInbox } from './NotificationInbox';

interface NotificationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: DisplayNotification[];
  onSelectNotification: (item: DisplayNotification) => void;
  onMarkAllAsRead: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export const NotificationOverlay: React.FC<NotificationOverlayProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectNotification,
  onMarkAllAsRead,
  returnFocusRef,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // The inbox owns scrolling; lock both document scroll roots until it closes.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    const appRoot = document.getElementById('root');
    const previousInert = appRoot?.inert;
    if (appRoot) appRoot.inert = true;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const returnElement = returnFocusRef?.current || document.activeElement as HTMLElement;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      if (appRoot) appRoot.inert = Boolean(previousInert);
      returnElement?.focus();
    };
  }, [isOpen, returnFocusRef]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      const target = closeBtnRef.current || dialogRef.current?.querySelector<HTMLElement>('button');
      (target || dialogRef.current)?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !dialogRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="vw-notif-backdrop is-desktop-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="vw-notif-dialog vw-inbox-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vw-notif-dialog-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close stays outside the scrolling list on every viewport. */}
        {(
          <button
            ref={closeBtnRef}
            type="button"
            className="vw-notif-close-btn"
            onClick={onClose}
            aria-label="Đóng bảng thông báo (hoặc nhấn Esc)"
            title="Đóng (Esc)"
          >
            <X size={19} aria-hidden="true" />
          </button>
        )}

        {(
          <NotificationInbox
            notifications={notifications}
            onMarkAllAsRead={onMarkAllAsRead}
            onSelectNotification={(item) => {
              onSelectNotification(item);
              onClose();
            }}
          />
        )}
      </div>
    </div>,
    document.body
  );
};
