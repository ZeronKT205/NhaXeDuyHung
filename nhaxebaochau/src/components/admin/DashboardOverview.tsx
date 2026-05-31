'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StatsCards from './StatsCards';
import BookingTable from './BookingTable';
import BookingDetail from './BookingDetail';
import type { BookingWithPackage } from '@/lib/types';

interface DashboardOverviewProps {
  stats: {
    newToday: number;
    pendingConfirmation: number;
    thisWeek: number;
    thisMonth: number;
  };
  recentBookings: BookingWithPackage[];
  isAdmin: boolean;
}

export default function DashboardOverview({
  stats,
  recentBookings,
  isAdmin,
}: DashboardOverviewProps) {
  const [selectedBooking, setSelectedBooking] = useState<BookingWithPackage | null>(null);
  const router = useRouter();

  const handleUpdated = () => {
    router.refresh();
    // Keep selected booking state updated with new data if open
    if (selectedBooking) {
      const updated = recentBookings.find(b => b.booking_id === selectedBooking.booking_id);
      if (updated) {
        setSelectedBooking(updated);
      }
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Tổng quan hệ thống</h1>
        <p className="admin-page-subtitle">Thống kê tình trạng hoạt động và đơn đặt vé</p>
      </div>

      <StatsCards
        newToday={stats.newToday}
        pendingConfirmation={stats.pendingConfirmation}
        thisWeek={stats.thisWeek}
        thisMonth={stats.thisMonth}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-800)' }}>🎫 Đơn đặt vé mới nhận</h2>
        <a href="/admin/bookings" className="btn btn-outline btn-sm">Xem tất cả đơn</a>
      </div>

      <BookingTable
        bookings={recentBookings}
        onSelectBooking={(b) => setSelectedBooking(b)}
      />

      {selectedBooking && (
        <BookingDetail
          booking={selectedBooking}
          isAdmin={isAdmin}
          onClose={() => setSelectedBooking(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
