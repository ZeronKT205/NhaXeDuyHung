'use client';

import { useState, useRef, useEffect } from 'react';
import type { PackageWithDetails } from '@/lib/types';
import { formatPrice, getTodayString } from '@/lib/utils';
import { submitBooking, type BookingActionResult } from '@/app/actions/booking';

interface BookingFormProps {
  packages: PackageWithDetails[];
}

const HOURS = Array.from({ length: 17 }, (_, i) => `${String(i + 5).padStart(2, '0')}:00`);

export default function BookingForm({ packages }: BookingFormProps) {
  const [result, setResult]   = useState<BookingActionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [tripType, setTripType]           = useState<'shared' | 'private'>('shared');
  const [routeKey, setRouteKey]           = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const formRef      = useRef<HTMLFormElement>(null);
  const pendingPkgId = useRef('');

  const active = packages.filter(p => p.is_active && !p.is_deleted);

  // Pre-fill from sessionStorage (Routes section click)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('booking_prefill');
      if (!raw) return;
      sessionStorage.removeItem('booking_prefill');
      const d = JSON.parse(raw);
      if (d.tripType === 'shared' || d.tripType === 'private') setTripType(d.tripType);
      if (d.route) setRouteKey(d.route);
    } catch {}
  }, []);

  // Pre-fill from PriceTable "Đặt xe ngay" button
  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent<{ tripType: string; routeKey: string; packageId: string }>).detail;
      pendingPkgId.current = d.packageId;
      if (d.tripType === 'shared' || d.tripType === 'private') setTripType(d.tripType);
      if (d.routeKey) setRouteKey(d.routeKey);
    };
    window.addEventListener('booking:prefill', handler);
    return () => window.removeEventListener('booking:prefill', handler);
  }, []);

  // Reset package when type/route changes — but honour pending prefill
  useEffect(() => {
    if (pendingPkgId.current) {
      setSelectedPackageId(pendingPkgId.current);
      pendingPkgId.current = '';
    } else {
      setSelectedPackageId('');
    }
  }, [tripType, routeKey]);

  const uniqueRoutes = Array.from(
    new Map(active.map(p => [
      `${p.routes.departure_point}||${p.routes.destination_point}`,
      { from: p.routes.departure_point, to: p.routes.destination_point },
    ])).entries()
  ).map(([key, v]) => ({ key, ...v }));

  const matchingPkgs = active.filter(p =>
    p.package_type === tripType &&
    `${p.routes.departure_point}||${p.routes.destination_point}` === routeKey
  );

  const selectedPkg = matchingPkgs.find(p => String(p.package_id) === selectedPackageId);
  const getErr = (f: string) => result?.fieldErrors?.find(e => e.field === f)?.message;

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedPackageId) return;
    setLoading(true); setResult(null);
    const fd = new FormData(e.currentTarget);
    const time = fd.get('departure_time') as string;
    const note = fd.get('customer_note') as string;
    fd.set('customer_note', time ? `[Giờ đi: ${time}]${note ? ' ' + note : ''}` : note);
    fd.delete('departure_time');
    fd.set('package_id', selectedPackageId);
    try {
      const res = await submitBooking(fd);
      setResult(res);
      if (res.success) { formRef.current?.reset(); setTripType('shared'); setRouteKey(''); setSelectedPackageId(''); }
    } catch { setResult({ success: false, error: 'Có lỗi xảy ra. Vui lòng thử lại.' }); }
    setLoading(false);
  }

  if (result?.success) {
    return (
      <section className="booking-section" id="booking">
        <div className="container">
          <div className="bk-ticket bk-ticket--success">
            <div className="bk-success-inner">
              <div className="bk-success-check">✓</div>
              <h3 className="bk-success-title">Đặt vé thành công!</h3>
              <p className="bk-success-desc">Nhà xe đã nhận và sẽ liên hệ xác nhận sớm nhất.</p>
              <div className="bk-code">{result.bookingCode}</div>
              <p className="bk-code-hint">Lưu mã đơn để tra cứu khi cần</p>
              <button className="bk-btn-primary" onClick={() => setResult(null)}>Đặt vé mới</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="booking-section" id="booking">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Đặt vé</span>
          <div className="section-title-row">
            <h2 className="section-title">Đặt vé tại đây</h2>
          </div>
          <p className="section-subtitle">Điền thông tin bên dưới, nhà xe xác nhận trong 15 phút</p>
        </div>

        {result?.error && <div className="bk-alert">{result.error}</div>}

        <div className="bk-ticket">

          {/* ── LEFT: Selections ── */}
          <div className="bk-left">

            <div className="bk-block">
              <p className="bk-step">Loại chuyến</p>
              <div className="bk-type-row">
                <button type="button"
                  className={`bk-type-btn${tripType === 'shared' ? ' active' : ''}`}
                  onClick={() => setTripType('shared')}>
                  <span className="bk-type-name">Xe ghép</span>
                  <span className="bk-type-hint">Giá tốt hơn</span>
                </button>
                <button type="button"
                  className={`bk-type-btn${tripType === 'private' ? ' active' : ''}`}
                  onClick={() => setTripType('private')}>
                  <span className="bk-type-name">Bao xe</span>
                  <span className="bk-type-hint">Chỉ nhóm bạn</span>
                </button>
              </div>
            </div>

            <div className="bk-block">
              <p className="bk-step">Tuyến đường</p>
              <select className="bk-select" value={routeKey} onChange={e => setRouteKey(e.target.value)} required>
                <option value="">— Chọn tuyến đường —</option>
                {uniqueRoutes.map(r => (
                  <option key={r.key} value={r.key}>{r.from} → {r.to}</option>
                ))}
              </select>
            </div>

            {routeKey && (
              <div className="bk-block">
                <p className="bk-step">Gói xe</p>
                {matchingPkgs.length === 0
                  ? <p className="bk-empty">Chưa có gói cho tuyến này. Vui lòng gọi hotline.</p>
                  : (
                    <div className="bk-pkg-list">
                      {matchingPkgs.map(pkg => (
                        <button key={pkg.package_id} type="button"
                          className={`bk-pkg${String(pkg.package_id) === selectedPackageId ? ' active' : ''}`}
                          onClick={() => setSelectedPackageId(String(pkg.package_id))}>
                          <span className="bk-pkg-name">{pkg.vehicles.vehicle_name}</span>
                          <span className="bk-pkg-seats">{pkg.vehicles.seat_count} chỗ</span>
                          <span className="bk-pkg-price">{formatPrice(pkg.price)}<em>/{tripType === 'shared' ? 'người' : 'chuyến'}</em></span>
                        </button>
                      ))}
                    </div>
                  )
                }
              </div>
            )}

            {selectedPkg && (
              <div className="bk-selected-summary">
                <span>✓ {selectedPkg.vehicles.vehicle_name} · {selectedPkg.routes.departure_point} → {selectedPkg.routes.destination_point}</span>
                <strong>{formatPrice(selectedPkg.price)}/{tripType === 'shared' ? 'người' : 'chuyến'}</strong>
              </div>
            )}
          </div>

          {/* ── Ticket notch divider ── */}
          <div className="bk-notch-divider" />

          {/* ── RIGHT: Customer info ── */}
          <div className="bk-right">
            <form ref={formRef} onSubmit={handleSubmit} className="bk-form">

              <div className="bk-row">
                <div className="bk-field">
                  <label>Họ và tên <span>*</span></label>
                  <input name="customer_name" placeholder="Nguyễn Văn A"
                    className={getErr('customer_name') ? 'err' : ''} required />
                  {getErr('customer_name') && <span className="bk-err">{getErr('customer_name')}</span>}
                </div>
                <div className="bk-field">
                  <label>Số điện thoại <span>*</span></label>
                  <input type="tel" name="customer_phone" placeholder="0335 232 346"
                    className={getErr('customer_phone') ? 'err' : ''} required />
                  {getErr('customer_phone') && <span className="bk-err">{getErr('customer_phone')}</span>}
                </div>
              </div>

              <div className="bk-row">
                <div className="bk-field">
                  <label>Địa chỉ đón <span>*</span></label>
                  <input name="pickup_address" placeholder="Số nhà, đường..."
                    className={getErr('pickup_address') ? 'err' : ''} required />
                </div>
                <div className="bk-field">
                  <label>Địa chỉ trả <span>*</span></label>
                  <input name="dropoff_address" placeholder="Số nhà, đường..."
                    className={getErr('dropoff_address') ? 'err' : ''} required />
                </div>
              </div>

              <div className="bk-row">
                <div className="bk-field">
                  <label>Ngày đi <span>*</span></label>
                  <input type="date" name="departure_date" min={getTodayString()} required />
                </div>
                <div className="bk-field">
                  <label>Giờ đi <span>*</span></label>
                  <select name="departure_time" defaultValue="07:00">
                    {HOURS.map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
                <div className="bk-field">
                  <label>Hành khách <span>*</span></label>
                  <input type="number" name="passenger_count" defaultValue={1} min={1} max={50} required />
                </div>
              </div>

              <div className="bk-row">
                <div className="bk-field bk-field-full">
                  <label>Ghi chú</label>
                  <textarea name="customer_note" rows={2}
                    placeholder="Trẻ nhỏ, hàng cồng kềnh, yêu cầu đặc biệt..." />
                </div>
              </div>

              <button type="submit" className="bk-btn-primary"
                disabled={loading || !selectedPackageId}>
                {loading ? 'Đang gửi...' : 'Xác nhận đặt vé →'}
              </button>
              {!selectedPackageId && routeKey && (
                <p className="bk-hint-txt">← Vui lòng chọn gói xe bên trái</p>
              )}
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
