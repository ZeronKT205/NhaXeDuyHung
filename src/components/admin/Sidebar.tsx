'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { handleLogout } from '@/app/actions/auth';
import type { AdminJWTPayload } from '@/lib/auth';
import type { AdminInformation } from '@/lib/types';

interface SidebarProps {
  admin: AdminJWTPayload;
  profile: AdminInformation | null;
}

export default function Sidebar({ admin, profile }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: '📊 Tổng quan', path: '/admin' },
    { name: '🎫 Đơn đặt vé', path: '/admin/bookings' },
    { name: '🚗 Quản lý xe', path: '/admin/vehicles' },
    { name: '📍 Tuyến đường', path: '/admin/routes' },
    { name: '💰 Gói dịch vụ', path: '/admin/packages' },
    { name: '⚙️ Cài đặt website', path: '/admin/settings' },
  ];

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="admin-mobile-header">
        <span className="admin-mobile-header-title">Duy Hùng Admin</span>
        <button
          className="admin-mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">🚐 DUY HÙNG</div>
          <div className="sidebar-subtitle">Hệ thống quản trị</div>
        </div>

        {/* Admin Info Profile Card */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--accent-400)',
            color: 'var(--primary-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '18px',
            overflow: 'hidden'
          }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (profile?.full_name || admin.username).charAt(0).toUpperCase()
            )}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {profile?.full_name || 'Nhân viên'}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>
              {admin.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            // Check if active: exact match for /admin, startsWith for others
            const isActive = item.path === '/admin' 
              ? pathname === '/admin' 
              : pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <span className="sidebar-link-text">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <form action={handleLogout}>
            <button
              type="submit"
              className="btn btn-danger"
              style={{ width: '100%', padding: '10px 16px', fontSize: '14px', justifyContent: 'flex-start' }}
            >
              🚪 Đăng xuất
            </button>
          </form>
        </div>
      </aside>

      {/* Overlay for mobile drawer */}
      {mobileOpen && (
        <div
          className="mobile-sidebar-overlay open"
          style={{ zIndex: 99 }}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
