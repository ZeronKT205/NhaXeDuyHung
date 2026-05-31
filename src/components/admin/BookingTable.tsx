import type { BookingWithPackage } from '@/lib/types';
import { formatPrice, formatDate, getStatusInfo, getPackageTypeLabel } from '@/lib/utils';

interface BookingTableProps {
  bookings: BookingWithPackage[];
  onSelectBooking: (booking: BookingWithPackage) => void;
}

export default function BookingTable({ bookings, onSelectBooking }: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="empty-state" style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <div className="empty-state-icon">🎫</div>
        <div className="empty-state-title">Chưa có đơn đặt vé nào</div>
        <div className="empty-state-text">Mọi đơn đặt vé mới gửi từ khách hàng sẽ hiển thị ở đây.</div>
      </div>
    );
  }

  return (
    <div className="table-wrapper" style={{ background: 'white' }}>
      <table className="table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Tuyến đường</th>
            <th>Gói xe</th>
            <th>Ngày đi</th>
            <th>Số khách</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const statusInfo = getStatusInfo(booking.status);
            const routeText = booking.packages?.routes
              ? `${booking.packages.routes.departure_point} → ${booking.packages.routes.destination_point}`
              : 'Đang tải...';

            return (
              <tr key={booking.booking_id} onClick={() => onSelectBooking(booking)}>
                <td>
                  <strong style={{ color: 'var(--primary-600)' }}>{booking.booking_code}</strong>
                </td>
                <td>
                  <div>{booking.customer_name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{booking.customer_phone}</div>
                </td>
                <td>{routeText}</td>
                <td>
                  <div>{booking.packages?.vehicles?.vehicle_name || 'Đang tải...'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {getPackageTypeLabel(booking.packages?.package_type)}
                  </div>
                </td>
                <td>{formatDate(booking.departure_date)}</td>
                <td>{booking.passenger_count} người</td>
                <td>
                  <strong>{formatPrice(booking.total_amount)}</strong>
                </td>
                <td>
                  <span className={`badge ${statusInfo.bgClass}`}>
                    {statusInfo.emoji} {statusInfo.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
