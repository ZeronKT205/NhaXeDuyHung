'use client';

import { useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { submitLogin } from '@/app/actions/auth';

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get('redirect') || '/admin';
  const isExpired = searchParams.get('expired') === '1';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const res = await submitLogin(formData);
      if (res.success) {
        router.push(redirectPath);
        router.refresh();
      } else {
        setError(res.error || 'Đăng nhập không thành công');
      }
    });
  }

  return (
    <div className="login-card" style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0px' }}>
      
      {/* Logo Container with White Background (nền trắng), strictly square (sắc nhọn) */}
      <div style={{
        width: '120px',
        height: '120px',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px auto',
        padding: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        borderRadius: '0px'
      }}>
        <img
          src="/image/Herosecsison/logo (2).png"
          alt="Nhà Xe Duy Hùng Logo"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
      </div>

      <h1 className="login-title" style={{ color: '#ffffff', fontSize: '22px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>
        Đăng Nhập Admin
      </h1>
      <p className="login-subtitle" style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', marginBottom: '28px' }}>
        Hệ thống quản lý đặt vé xe ghép Duy Hùng
      </p>

      {isExpired && !error && (
        <div className="login-error" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'var(--warning-500)', color: '#fde047', borderRadius: '0px' }}>
          <span>⚠️</span>
          <span>Phiên làm việc hết hạn. Vui lòng đăng nhập lại.</span>
        </div>
      )}

      {error && (
        <div className="login-error" style={{ borderRadius: '0px' }}>
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="form-label" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>Tên đăng nhập</label>
          <input
            type="text"
            name="username"
            className="form-input"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
              padding: '12px 16px',
              fontSize: '14px',
              width: '100%',
              boxSizing: 'border-box',
              outline: 'none',
              borderRadius: '0px'
            }}
            placeholder="Nhập tên đăng nhập"
            required
            disabled={isPending}
          />
        </div>

        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="form-label" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500' }}>Mật khẩu</label>
          <input
            type="password"
            name="password"
            className="form-input"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
              padding: '12px 16px',
              fontSize: '14px',
              width: '100%',
              boxSizing: 'border-box',
              outline: 'none',
              borderRadius: '0px'
            }}
            placeholder="Nhập mật khẩu"
            required
            disabled={isPending}
          />
        </div>

        <button
          type="submit"
          className="btn btn-accent btn-lg"
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '14px',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: '#cca43b',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '0px'
          }}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <span className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderTopColor: 'var(--primary-800)', borderRadius: '0px' }} />
              Đang đăng nhập...
            </>
          ) : (
            <>🔑 Đăng nhập</>
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="login-container" style={{ borderRadius: '0px' }}>
      <Suspense fallback={
        <div style={{ color: '#ffffff', fontSize: '14px' }}>Đang tải form đăng nhập...</div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
