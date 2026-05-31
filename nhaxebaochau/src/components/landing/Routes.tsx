'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import type { PackageWithDetails } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

const RouteMap = dynamic(() => import('./RouteMap'), { ssr: false, loading: () => <div className="svg-map-wrapper svg-map-container" style={{ background: '#f8fafc' }} /> });

interface RoutesProps {
  packages?: PackageWithDetails[];
}

export default function Routes({ packages = [] }: RoutesProps) {
  const t = useTranslations('routes');
  const routes = t.raw('list') as { from: string; to: string; note: string }[];
  const activePackages = packages.filter(p => p.is_active && !p.is_deleted);
  const [open, setOpen]               = useState(false);
  const [route, setRoute]             = useState('');
  const [tripType, setTripType]       = useState<'shared'|'private'>('shared');
  const [selectedPkgId, setSelectedPkgId] = useState('');
  const [name, setName]               = useState('');
  const [phone, setPhone]             = useState('');
  const [pickup, setPickup]           = useState('');
  const [dropoff, setDropoff]         = useState('');
  const [date, setDate]         = useState('');
  const [time, setTime]         = useState('07:00');
  const [pax, setPax]           = useState('1');
  const [sent, setSent]         = useState(false);

  const HOURS = Array.from({ length: 17 }, (_, i) => `${String(i + 5).padStart(2, '0')}:00`);

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setOpen(false); setSent(false);
      setName(''); setPhone(''); setPickup(''); setDropoff('');
      setDate(''); setTime('07:00'); setPax('1'); setSelectedPkgId('');
    }, 2000);
  }

  return (
    <section className="section routes-section" id="routes">
      <div className="container">
        
        {/* ── Title Header ── */}
        <div className="section-header" style={{ marginBottom: 36 }}>
          <div className="section-title-row">
            <h2 className="section-title">{t('title')}</h2>
          </div>
        </div>

        <div className="routes-top-row">
          <div className="routes-info-col">

            {/* Destination headline */}
            <div className="routes-headline">
              <span className="routes-headline-line">Huế</span>
              <span className="routes-headline-sep">—</span>
              <span className="routes-headline-line">Đà Nẵng</span>
              <span className="routes-headline-sep">—</span>
              <span className="routes-headline-line routes-headline-accent">Hội An</span>
            </div>
            <p className="routes-tagline">Lộ trình nhanh chóng · An toàn · Tiện lợi</p>

            <p className="routes-popular-label">{t('popularLabel')}</p>

            <ul className="routes-list">
              {routes.map((r, i) => (
                <li key={i} className="routes-list-item" onClick={() => {
                    setRoute(`${r.from} → ${r.to}`); setOpen(true);
                    try { sessionStorage.setItem('booking_prefill', JSON.stringify({ tripType: 'shared', route: `${r.from}||${r.to}` })); } catch {}
                  }}>
                  <div className="routes-list-route">
                    <span className="routes-list-from">{r.from}</span>
                    <span className="routes-list-arrows">⇄</span>
                    <span className="routes-list-to">{r.to}</span>
                  </div>
                  <span className="routes-list-note">{r.note}</span>
                  <span className="routes-list-chevron">›</span>
                </li>
              ))}
            </ul>

            <div className="routes-actions">
              <button className="routes-cta" onClick={() => setOpen(true)}>
                {t('cta')}
              </button>
              <span className="routes-trust-badge">{t('trust')}</span>
            </div>

            {/* Stats row */}
            <div className="routes-stats-row">
              <div className="routes-stat-item">
                <span className="routes-stat-val">120+</span>
                <span className="routes-stat-lbl">chuyến / ngày</span>
              </div>
              <div className="routes-stat-divider" />
              <div className="routes-stat-item">
                <span className="routes-stat-val">2–2.5h</span>
                <span className="routes-stat-lbl">thời gian</span>
              </div>
              <div className="routes-stat-divider" />
              <div className="routes-stat-item">
                <span className="routes-stat-val">100%</span>
                <span className="routes-stat-lbl">an toàn</span>
              </div>
            </div>

          </div>

          <div className="routes-map-col">
            <RouteMap />
          </div>
        </div>
      </div>

      {open && (
        <div className="routes-modal-overlay" onClick={() => setOpen(false)}>
          <div className="rmt-modal" onClick={e => e.stopPropagation()}>

            {sent ? (
              <div className="rmt-success">
                <div className="rmt-success-check">✓</div>
                <p className="rmt-success-msg">{t('modal.success')}</p>
              </div>
            ) : (
              <>
                <button className="rmt-close" onClick={() => setOpen(false)}>×</button>

                {/* Ticket layout */}
                <div className="rmt-ticket">

                  {/* LEFT: same mechanism as BookingForm */}
                  <div className="rmt-left">
                    <p className="rmt-section-lbl">Loại chuyến</p>
                    <div className="rmt-type-row">
                      <button type="button"
                        className={`rmt-type-btn${tripType === 'shared' ? ' active' : ''}`}
                        onClick={() => { setTripType('shared'); setRoute(''); setSelectedPkgId(''); }}>
                        <span>Xe ghép</span>
                        <small>Giá tốt hơn</small>
                      </button>
                      <button type="button"
                        className={`rmt-type-btn${tripType === 'private' ? ' active' : ''}`}
                        onClick={() => { setTripType('private'); setRoute(''); setSelectedPkgId(''); }}>
                        <span>Bao xe</span>
                        <small>Chỉ nhóm bạn</small>
                      </button>
                    </div>

                    <p className="rmt-section-lbl" style={{ marginTop: 18 }}>Tuyến đường</p>
                    {activePackages.length > 0 ? (
                      <select className="bk-select" value={route} onChange={e => { setRoute(e.target.value); setSelectedPkgId(''); }}>
                        <option value="">— Chọn tuyến đường —</option>
                        {Array.from(new Map(
                          activePackages
                            .filter(p => p.package_type === tripType)
                            .map(p => [
                              `${p.routes.departure_point}||${p.routes.destination_point}`,
                              { from: p.routes.departure_point, to: p.routes.destination_point }
                            ])
                        ).entries()).map(([key, r]) => (
                          <option key={key} value={`${r.from} → ${r.to}`}>{r.from} → {r.to}</option>
                        ))}
                      </select>
                    ) : (
                      <select className="bk-select" value={route} onChange={e => setRoute(e.target.value)}>
                        <option value="">— Chọn tuyến đường —</option>
                        {routes.map((r, i) => (
                          <option key={i} value={`${r.from} → ${r.to}`}>{r.from} → {r.to}</option>
                        ))}
                      </select>
                    )}

                    {route && activePackages.length > 0 && (() => {
                      const pkgs = activePackages.filter(p =>
                        p.package_type === tripType &&
                        `${p.routes.departure_point} → ${p.routes.destination_point}` === route
                      );
                      const chosen = pkgs.find(p => String(p.package_id) === selectedPkgId);
                      return (
                        <>
                          <p className="rmt-section-lbl" style={{ marginTop: 18 }}>Gói xe</p>
                          {pkgs.length === 0
                            ? <p className="bk-empty">Chưa có gói. Vui lòng gọi hotline.</p>
                            : (
                              <div className="bk-pkg-list">
                                {pkgs.map(pkg => (
                                  <button key={pkg.package_id} type="button"
                                    className={`bk-pkg${String(pkg.package_id) === selectedPkgId ? ' active' : ''}`}
                                    onClick={() => setSelectedPkgId(String(pkg.package_id))}>
                                    <span className="bk-pkg-name">{pkg.vehicles.vehicle_name}</span>
                                    <span className="bk-pkg-seats">{pkg.vehicles.seat_count} chỗ</span>
                                    <span className="bk-pkg-price">
                                      {formatPrice(pkg.price)}
                                      <em>/{tripType === 'shared' ? 'người' : 'chuyến'}</em>
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )
                          }
                          {chosen && (
                            <div className="rmt-selected-badge" style={{ marginTop: 10 }}>
                              ✓ {chosen.vehicles.vehicle_name} · {formatPrice(chosen.price)}/{tripType === 'shared' ? 'người' : 'chuyến'}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Notch divider */}
                  <div className="rmt-notch" />

                  {/* RIGHT: customer info */}
                  <form className="rmt-right" onSubmit={handleSubmit}>
                    <p className="rmt-section-lbl">Thông tin hành khách</p>

                    <div className="rmt-field">
                      <label>Họ và tên <span>*</span></label>
                      <input value={name} onChange={e => setName(e.target.value)}
                        placeholder="Nguyễn Văn A" required />
                    </div>

                    <div className="rmt-field">
                      <label>Số điện thoại <span>*</span></label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="0335 232 346" required />
                    </div>

                    <div className="rmt-field">
                      <label>Địa chỉ đón <span>*</span></label>
                      <input value={pickup} onChange={e => setPickup(e.target.value)}
                        placeholder="Số nhà, đường..." required />
                    </div>

                    <div className="rmt-field">
                      <label>Địa chỉ trả <span>*</span></label>
                      <input value={dropoff} onChange={e => setDropoff(e.target.value)}
                        placeholder="Số nhà, đường..." required />
                    </div>

                    <div className="rmt-row">
                      <div className="rmt-field">
                        <label>Ngày đi <span>*</span></label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                      </div>
                      <div className="rmt-field">
                        <label>Giờ đi</label>
                        <select value={time} onChange={e => setTime(e.target.value)}>
                          {HOURS.map(h => <option key={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="rmt-field">
                      <label>Hành khách</label>
                      <select value={pax} onChange={e => setPax(e.target.value)}>
                        {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n} người</option>)}
                      </select>
                    </div>

                    <button type="submit" className="rmt-submit"
                      disabled={!route || (activePackages.length > 0 && !selectedPkgId)}>
                      {!route
                        ? 'Chọn tuyến đường trước ←'
                        : (activePackages.length > 0 && !selectedPkgId)
                          ? 'Chọn gói xe trước ←'
                          : 'Xác nhận đặt vé →'}
                    </button>
                  </form>

                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
