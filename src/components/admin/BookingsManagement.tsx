'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BookingTable from './BookingTable';
import BookingDetail from './BookingDetail';
import type { BookingWithPackage } from '@/lib/types';

interface BookingsManagementProps {
  bookings: BookingWithPackage[];
  isAdmin: boolean;
  filters: {
    status: string;
    search: string;
    date: string;
  };
}

export default function BookingsManagement({
  bookings,
  isAdmin,
  filters,
}: BookingsManagementProps) {
  const [selectedBooking, setSelectedBooking] = useState<BookingWithPackage | null>(null);
  const router = useRouter();
  const [statusVal, setStatusVal] = useState(filters.status);
  const [searchVal, setSearchVal] = useState(filters.search);
  const [dateVal, setDateVal] = useState(filters.date);

  // Sync inputs with URL changes
  useEffect(() => {
    setStatusVal(filters.status);
    setSearchVal(filters.search);
    setDateVal(filters.date);
  }, [filters]);

  const applyFilters = (status = statusVal, search = searchVal, date = dateVal) => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    if (date) params.set('date', date);
    
    router.push(`/admin/bookings?${params.toString()}`);
  };

  const handleClear = () => {
    setStatusVal('');
    setSearchVal('');
    setDateVal('');
    router.push('/admin/bookings');
  };

  const handleUpdated = () => {
    router.refresh();
    if (selectedBooking) {
      const updated = bookings.find(b => b.booking_id === selectedBooking.booking_id);
      if (updated) {
        setSelectedBooking(updated);
      }
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Quản lý đơn đặt vé</h1>
        <p className="admin-page-subtitle">Xem, xác nhận, và điều phối đơn hàng xe ghép</p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ flex: '2', minWidth: '240px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Tìm tên, SĐT, mã đơn..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          />
        </div>

        <div style={{ flex: '1', minWidth: '180px' }}>
          <select
            className="form-select"
            value={statusVal}
            onChange={(e) => {
              setStatusVal(e.target.value);
              applyFilters(e.target.value, searchVal, dateVal);
            }}
          >
            <option value="">-- Tất cả trạng thái --</option>
            <option value="new">🟡 Mới gửi</option>
            <option value="confirmed">🟢 Đã xác nhận</option>
            <option value="completed">✅ Hoàn thành</option>
            <option value="cancelled">❌ Đã huỷ</option>
          </select>
        </div>

        <div style={{ flex: '1', minWidth: '180px' }}>
          <input
            type="date"
            className="form-input"
            value={dateVal}
            onChange={(e) => {
              setDateVal(e.target.value);
              applyFilters(statusVal, searchVal, e.target.value);
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary btn-sm" onClick={() => applyFilters()}>
            🔍 Lọc
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleClear}>
            🧹 Xoá lọc
          </button>
        </div>
      </div>

      <BookingTable
        bookings={bookings}
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
