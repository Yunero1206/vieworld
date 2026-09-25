import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { DisplayNotification } from './notification.types';
import { DesktopNotificationBoard } from './DesktopNotificationBoard';
import { MobileNotificationPopover } from './MobileNotificationPopover';
import { AllNotificationsDrawer } from './AllNotificationsDrawer';

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
  const [viewMode, setViewMode] = useState<'board' | 'all'>('board');
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 680;
  });

  // Track viewport width for desktop vs mobile presentation
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 680);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset viewMode when opened/closed
  useEffect(() => {
    if (isOpen) {
      setViewMode('board');
    }
  }, [isOpen]);

  // Lock body scroll and manage keyboard trap
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (viewMode === 'all') {
          setViewMode('board');
        } else {
          onClose();
        }
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
      returnFocusRef?.current?.focus();
    };
  }, [isOpen, onClose, viewMode, returnFocusRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`vw-notif-backdrop ${isMobile ? 'is-mobile-backdrop' : 'is-desktop-backdrop'}`}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`vw-notif-dialog ${isMobile ? 'is-mobile-dialog' : 'is-desktop-dialog'} ${
          viewMode === 'all' ? 'is-all-mode' : ''
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vw-notif-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-right floating close button on Desktop Board */}
        {!isMobile && viewMode !== 'all' && (
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

        {/* Content presentation depending on screen and viewMode */}
        {viewMode === 'all' ? (
          <AllNotificationsDrawer
            isOpen={true}
            onClose={onClose}
            onBackToBoard={() => setViewMode('board')}
            notifications={notifications}
            onSelectNotification={(item) => {
              onSelectNotification(item);
              onClose();
            }}
            onMarkAllAsRead={onMarkAllAsRead}
          />
        ) : isMobile ? (
          <MobileNotificationPopover
            notifications={notifications}
            onSelectNotification={onSelectNotification}
            onMarkAllAsRead={onMarkAllAsRead}
            onViewAll={() => setViewMode('all')}
            onClose={onClose}
          />
        ) : (
          <DesktopNotificationBoard
            notifications={notifications}
            onSelectNotification={(item) => {
              onSelectNotification(item);
              onClose();
            }}
            onViewAll={() => setViewMode('all')}
          />
        )}
      </div>
    </div>,
    document.body
  );
};
