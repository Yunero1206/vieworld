import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, RotateCcw } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Lỗi không xác định trong tiến trình hiển thị.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Safely record diagnostic error without leaking credentials or private data
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary caught error]:', error, errorInfo);
    }
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  private handleGoHome = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  private handleResetState = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
    if (this.props.onReset) {
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
            maxWidth: '560px',
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
            Hệ thống đã tự động ngăn cách lỗi để bảo vệ toàn vẹn dữ liệu cá nhân của bạn trong không gian demo.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
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
              onClick={this.handleResetState}
              className="btn btn-secondary"
              data-testid="error-boundary-reset-btn"
              style={{ fontSize: 'var(--text-sm)', gap: '6px', color: 'var(--danger)' }}
            >
              <RotateCcw size={16} />
              <span>Tải lại trang</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
