'use client';

import { useState, useEffect, useTransition } from 'react';
import type { BookingWithPackage } from '@/lib/types';
import {
  formatPrice,
  formatDate,
  formatDateTime,
  getStatusInfo,
  getPackageTypeLabel
} from '@/lib/utils';
import {
  updateBookingStatus,
  updateBookingInternalNote,
  deleteBooking,
  getBookingHistory
} from '@/app/actions/booking';

interface BookingDetailProps {
  booking: BookingWithPackage;
  isAdmin: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function BookingDetail({
  booking,
  isAdmin,
  onClose,
  onUpdated,
}: BookingDetailProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [internalNote, setInternalNote] = useState(booking.internal_note || '');
  const [statusReason, setStatusReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadHistory() {
      const data = await getBookingHistory(booking.booking_id);
      setHistory(data);
    }
    loadHistory();
    setInternalNote(booking.internal_note || '');
    setError(null);
    setSuccess(null);
  }, [booking]);

  const currentStatusInfo = getStatusInfo(booking.status);

  function handleStatusChange(newStatus: 'new' | 'confirmed' | 'completed' | 'cancelled') {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await updateBookingStatus(booking.booking_id, newStatus, statusReason);
      if (res.success) {
        setSuccess(`Đã cập nhật trạng thái đơn hàng thành: ${getStatusInfo(newStatus).label}`);
        setStatusReason('');
        // Reload history
        const data = await getBookingHistory(booking.booking_id);
        setHistory(data);
        onUpdated();
      } else {
        setError(res.error || 'Cập nhật trạng thái thất bại');
      }
    });
  }

  function handleSaveInternalNote() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await updateBookingInternalNote(booking.booking_id, internalNote);
      if (res.success) {
        setSuccess('Đã lưu ghi chú nội bộ');
        onUpdated();
      } else {
        setError(res.error || 'Cập nhật ghi chú nội bộ thất bại');
      }
    });
  }

  function handleDelete() {
    if (!confirm('Bạn có chắc chắn muốn xoá đơn đặt vé này không?')) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteBooking(booking.booking_id);
      if (res.success) {
        onUpdated();
        onClose();
      } else {
        setError(res.error || 'Xoá đơn đặt vé thất bại');
      }
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <h2>Chi tiết đơn đặt vé: {booking.booking_code}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {error && (
            <div className="login-error" style={{ margin: 0 }}>
              <span>❌</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="login-error" style={{ margin: 0, background: 'rgba(34, 197, 94, 0.15)', borderColor: 'var(--success-500)', color: '#86efac' }}>
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', marginRight: '8px' }}>Thay đổi trạng thái:</span>
            <button
              className="btn btn-outline btn-sm"
              disabled={isPending || booking.status === 'new'}
              onClick={() => handleStatusChange('new')}
            >
              🟡 Mới gửi
            </button>
            <button
              className="btn btn-primary btn-sm"
              disabled={isPending || booking.status === 'confirmed'}
              onClick={() => handleStatusChange('confirmed')}
            >
              🟢 Xác nhận
            </button>
            <button
              className="btn btn-success btn-sm"
              disabled={isPending || booking.status === 'completed'}
              onClick={() => handleStatusChange('completed')}
            >
              ✅ Hoàn thành
            </button>
            <button
              className="btn btn-danger btn-sm"
              disabled={isPending || booking.status === 'cancelled'}
              onClick={() => handleStatusChange('cancelled')}
            >
              ❌ Huỷ đơn
            </button>
          </div>

          {/* Booking Info Grid */}
          <div>
            <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '12px' }}>📁 Thông tin khách hàng & Chuyến đi</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Tên khách hàng</span>
                <span className="detail-value">{booking.customer_name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Số điện thoại</span>
                <span className="detail-value">
                  <a href={`tel:${booking.customer_phone}`} style={{ color: 'var(--primary-500)', textDecoration: 'underline' }}>
                    {booking.customer_phone}
                  </a>
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email</span>
                <span className="detail-value">{booking.customer_email || 'Chưa cung cấp'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Số hành khách</span>
                <span className="detail-value">{booking.passenger_count} người</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ngày đi</span>
                <span className="detail-value">{formatDate(booking.departure_date)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Trạng thái hiện tại</span>
                <span className={`badge ${currentStatusInfo.bgClass}`} style={{ alignSelf: 'flex-start' }}>
                  {currentStatusInfo.emoji} {currentStatusInfo.label}
                </span>
              </div>
              <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Địa chỉ đón</span>
                <span className="detail-value">{booking.pickup_address}</span>
              </div>
              <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Địa chỉ trả</span>
                <span className="detail-value">{booking.dropoff_address}</span>
              </div>
              <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Ghi chú từ khách</span>
                <span className="detail-value" style={{ fontStyle: booking.customer_note ? 'normal' : 'italic', color: booking.customer_note ? 'inherit' : 'var(--text-muted)' }}>
                  {booking.customer_note || 'Không có ghi chú'}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Info */}
          <div>
            <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '12px' }}>💰 Thông tin dịch vụ & Giá tiền</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Tuyến đường</span>
                <span className="detail-value">
                  {booking.packages?.routes?.departure_point} → {booking.packages?.routes?.destination_point}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Loại gói xe</span>
                <span className="detail-value">
                  {booking.packages?.vehicles?.vehicle_name} ({getPackageTypeLabel(booking.packages?.package_type)})
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Giá đơn giá tại lúc đặt</span>
                <span className="detail-value">{formatPrice(booking.price_at_booking)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tổng tiền thanh toán</span>
                <span className="detail-value" style={{ color: 'var(--primary-600)', fontSize: '18px', fontWeight: 700 }}>
                  {formatPrice(booking.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Internal Notes & Status change note */}
          <div>
            <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '12px' }}>✍️ Ghi chú nội bộ</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Ghi chú nội bộ (chỉ nhân viên nhìn thấy)</label>
                <textarea
                  className="form-textarea"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Nhập ghi chú cho đơn này (ví dụ: đã liên hệ lái xe A, khách đổi giờ...)"
                  rows={2}
                  disabled={isPending}
                />
                <button
                  className="btn btn-primary btn-sm"
                  style={{ alignSelf: 'flex-start', marginTop: '6px' }}
                  onClick={handleSaveInternalNote}
                  disabled={isPending}
                >
                  Lưu ghi chú
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Lý do thay đổi trạng thái (nếu có)</label>
                <input
                  type="text"
                  className="form-input"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Nhập lý do đổi trạng thái để ghi log lịch sử"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          {/* Log History */}
          <div>
            <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '12px' }}>🕒 Lịch sử xử lý đơn</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '8px' }}>
              {history.length === 0 ? (
                <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '13px' }}>Chưa có lịch sử thay đổi</div>
              ) : (
                history.map((log) => {
                  const oldInfo = log.old_status ? getStatusInfo(log.old_status as any) : null;
                  const newInfo = getStatusInfo(log.new_status as any);
                  const adminName = log.admins?.admin_information?.full_name || log.admins?.username || 'Hệ thống';
                  return (
                    <div key={log.history_id} style={{ fontSize: '13px', background: 'var(--gray-50)', padding: '10px', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${newInfo.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        <span>👤 Thực hiện: <strong>{adminName}</strong></span>
                        <span>{formatDateTime(log.changed_at)}</span>
                      </div>
                      <div>
                        Trạng thái: {oldInfo ? <s>{oldInfo.label}</s> : 'Khởi tạo'} → <strong>{newInfo.label}</strong>
                      </div>
                      {log.note && (
                        <div style={{ marginTop: '4px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                          💬 Lý do: {log.note}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          {isAdmin && (
            <button
              className="btn btn-danger btn-sm"
              style={{ marginRight: 'auto' }}
              onClick={handleDelete}
              disabled={isPending}
            >
              🗑️ Xoá đơn đặt vé
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={isPending}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
