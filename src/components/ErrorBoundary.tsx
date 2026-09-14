import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, RotateCcw, Trash2, Download } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  onResetDemoData?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
  showResetConfirm: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
    showResetConfirm: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Lỗi không xác định trong tiến trình hiển thị.',
      showResetConfirm: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Safely record diagnostic error without leaking credentials or private data
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary caught error]:', error, errorInfo);
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, errorMessage: '', showResetConfirm: false });
  };

  private handleGoHome = (): void => {
    this.setState({ hasError: false, errorMessage: '', showResetConfirm: false });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  private handleReload = (): void => {
    // Genuine reload that preserves demo storage and state
    if (typeof window !== 'undefined') {
      window.location.reload();
    } else {
      this.handleRetry();
    }
  };

  private handleExportBackup = (): void => {
    if (typeof window === 'undefined') return;
    try {
      const dump: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith('vieworld:')) {
          dump[key] = window.localStorage.getItem(key) || '';
        }
      }
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vieworld-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Cannot export backup:', e);
    }
  };

  private handleConfirmDestructiveReset = (): void => {
    this.setState({ hasError: false, errorMessage: '', showResetConfirm: false });
    if (this.props.onResetDemoData) {
      this.props.onResetDemoData();
    } else if (this.props.onReset) {
      this.props.onReset();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          data-testid="error-boundary-fallback"
          className="card"
          style={{
            maxWidth: '580px',
            margin: '40px auto',
            padding: '32px 24px',
            textAlign: 'center',
            border: '1px solid var(--danger)',
            backgroundColor: 'var(--surface)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <AlertTriangle size={28} />
          </div>

          <h2
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 800,
              color: 'var(--ink)',
              marginBottom: '8px',
            }}
            data-testid="error-boundary-title"
          >
            Đã xảy ra lỗi giao diện không mong muốn
          </h2>

          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--muted)',
              marginBottom: '20px',
              lineHeight: 1.6,
            }}
            data-testid="error-boundary-message"
          >
            Hệ thống đã tự động ngăn cách lỗi. Dữ liệu đơn hàng, tủ đồ và bộ sưu tập của bạn vẫn được lưu trữ an toàn.
          </p>

          {!this.state.showResetConfirm ? (
            <>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  justifyContent: 'center',
                  marginBottom: '24px',
                }}
              >
                <button
                  type="button"
                  onClick={this.handleRetry}
                  className="btn btn-primary"
                  data-testid="error-boundary-retry-btn"
                  style={{ fontSize: 'var(--text-sm)', gap: '6px' }}
                >
                  <RefreshCw size={16} />
                  <span>Thử lại</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="btn btn-secondary"
                  data-testid="error-boundary-home-btn"
                  style={{ fontSize: 'var(--text-sm)', gap: '6px' }}
                >
                  <Home size={16} />
                  <span>Về trang chủ</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleReload}
                  className="btn btn-secondary"
                  data-testid="error-boundary-reset-btn"
                  style={{ fontSize: 'var(--text-sm)', gap: '6px' }}
                >
                  <RotateCcw size={16} />
                  <span>Tải lại trang</span>
                </button>
              </div>

              {(this.props.onResetDemoData || this.props.onReset) && (
                <div
                  style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: '16px',
                    marginTop: '8px',
                  }}
                >
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '8px' }}>
                    Gặp lỗi dữ liệu không thể phục hồi bằng tải lại?
                  </p>
                  <button
                    type="button"
                    onClick={() => this.setState({ showResetConfirm: true })}
                    className="fw-text-button"
                    data-testid="error-boundary-trigger-reset-btn"
                    style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)', gap: '4px' }}
                  >
                    <Trash2 size={14} />
                    <span>Đặt lại dữ liệu mẫu về ban đầu…</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div
              role="region"
              aria-label="Xác nhận đặt lại dữ liệu"
              data-testid="error-boundary-confirm-panel"
              style={{
                border: '1px solid var(--danger)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                backgroundColor: 'var(--bg)',
                textAlign: 'left',
              }}
            >
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--danger)', marginBottom: '6px' }}>
                Xác nhận đặt lại toàn bộ dữ liệu mẫu?
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                Thao tác này mang tính phá hủy: toàn bộ đơn hàng mô phỏng đã mua, diện mạo avatar đã lưu và các món trong phòng trưng bày sẽ trở về trạng thái khởi tạo.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={this.handleExportBackup}
                  className="btn btn-secondary"
                  data-testid="error-boundary-export-btn"
                  style={{ fontSize: 'var(--text-xs)', gap: '4px' }}
                >
                  <Download size={14} />
                  <span>Xuất dữ liệu dự phòng</span>
                </button>
                <button
                  type="button"
                  onClick={this.handleConfirmDestructiveReset}
                  className="btn"
                  data-testid="error-boundary-confirm-reset-btn"
                  style={{
                    fontSize: 'var(--text-xs)',
                    backgroundColor: 'var(--danger-bg)',
                    color: 'var(--danger)',
                    border: '1px solid var(--danger)',
                    gap: '4px',
                  }}
                >
                  <Trash2 size={14} />
                  <span>Xác nhận đặt lại</span>
                </button>
                <button
                  type="button"
                  onClick={() => this.setState({ showResetConfirm: false })}
                  className="fw-text-button"
                  data-testid="error-boundary-cancel-reset-btn"
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
