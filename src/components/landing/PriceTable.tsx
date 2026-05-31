'use client';

import { useState, useEffect } from 'react';
import type { PackageWithDetails } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface PriceTableProps {
  packages: PackageWithDetails[];
}

export default function PriceTable({ packages }: PriceTableProps) {
  const activePackages = packages.filter((p) => p.is_active && !p.is_deleted);

  const [activeTab, setActiveTab] = useState<'shared' | 'private'>('shared');
  const [selectedSeat, setSelectedSeat] = useState<string>('all');

  // Listen for filter event from vehicle card CTA
  useEffect(() => {
    const handler = (e: Event) => {
      const seats = (e as CustomEvent<string>).detail;
      setSelectedSeat(seats);
    };
    window.addEventListener('pricing:filter', handler);
    return () => window.removeEventListener('pricing:filter', handler);
  }, []);

  // Filter packages based on activeTab and selectedSeat
  const filteredPackages = activePackages.filter((pkg) => {
    // Filter by type
    if (pkg.package_type !== activeTab) return false;

    // Filter by seat count
    if (selectedSeat !== 'all') {
      return pkg.vehicles.seat_count.toString() === selectedSeat;
    }

    return true;
  });

  // Get available seat counts dynamically for the active tab to show in the filter pills
  const availableSeats = Array.from(
    new Set(
      activePackages
        .filter((p) => p.package_type === activeTab)
        .map((p) => p.vehicles.seat_count)
    )
  ).sort((a, b) => a - b);

  // Helper to format vehicle category label
  function getSeatLabel(seats: number) {
    if (seats === 4) return 'Xe 4 chỗ (Sedan)';
    if (seats === 7) return 'Xe 7 chỗ (SUV)';
    if (seats === 9) return 'Limousine 9 chỗ';
    if (seats === 16) return 'Xe 16 chỗ';
    return `Xe ${seats} chỗ`;
  }

  // Handle tab change (resets the seat filter to 'all')
  function handleTabChange(tab: 'shared' | 'private') {
    setActiveTab(tab);
    setSelectedSeat('all');
  }

  return (
    <section className="section price-section" id="pricing">
      <div className="container">
        
        {/* ── Section Header ── */}
        <div className="section-header">
          <div className="section-title-row">
            <h2 className="section-title">Bảng giá dịch vụ</h2>
          </div>
        </div>

        {/* ── Central Tab Switcher ── */}
        <div className="price-tab-container">
          <div className="price-tabs">
            <button
              className={`price-tab-btn ${activeTab === 'shared' ? 'active' : ''}`}
              onClick={() => handleTabChange('shared')}
            >
              Đi ghép
            </button>
            <button
              className={`price-tab-btn ${activeTab === 'private' ? 'active' : ''}`}
              onClick={() => handleTabChange('private')}
            >
              Bao xe (Riêng tư)
            </button>
          </div>
        </div>

        {/* ── Vehicle Filter Pills ── */}
        {availableSeats.length > 0 && (
          <div className="price-filter-container">
            <button
              className={`price-filter-pill ${selectedSeat === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedSeat('all')}
            >
              Tất cả dòng xe
            </button>
            {availableSeats.map((seats) => (
              <button
                key={seats}
                className={`price-filter-pill ${selectedSeat === seats.toString() ? 'active' : ''}`}
                onClick={() => setSelectedSeat(seats.toString())}
              >
                {getSeatLabel(seats)}
              </button>
            ))}
          </div>
        )}

        {/* ── Prices List Table ── */}
        {filteredPackages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <div className="empty-state-title">Đang cập nhật bảng giá</div>
            <div className="empty-state-text">
              Vui lòng liên hệ Hotline nhà xe để nhận báo giá ưu đãi nhất
            </div>
          </div>
        ) : (
          <div className="price-table-wrapper animate-fade-in-up">
            <table className="price-table">
              <thead>
                <tr>
                  <th>Tuyến đường</th>
                  <th>Loại xe</th>
                  <th>Thông tin chặng</th>
                  <th>Giá dịch vụ</th>
                  <th style={{ textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.package_id}>
                    {/* Route column */}
                    <td>
                      <div className="price-table-route">
                        <span>📍</span>
                        <span>{pkg.routes.departure_point}</span>
                        <span className="price-table-arrows">⇄</span>
                        <span>{pkg.routes.destination_point}</span>
                      </div>
                    </td>

                    {/* Vehicle info column */}
                    <td>
                      <div className="price-table-vehicle">
                        <span className="price-table-vehicle-name">
                          {pkg.vehicles.vehicle_name}
                        </span>
                        <span className="price-table-vehicle-type">
                          {pkg.vehicles.vehicle_type} ({pkg.vehicles.seat_count} chỗ)
                        </span>
                      </div>
                    </td>

                    {/* Distance & duration column */}
                    <td>
                      <span className="price-table-info">
                        {pkg.routes.distance_km ? `${pkg.routes.distance_km} km` : '—'}
                        {pkg.routes.estimated_duration ? ` • ${pkg.routes.estimated_duration}` : ''}
                      </span>
                    </td>

                    {/* Price column */}
                    <td>
                      <div className="price-table-amount">
                        {formatPrice(pkg.price)}
                        <span className="price-table-unit">
                          /{pkg.package_type === 'shared' ? 'ghế' : 'chuyến'}
                        </span>
                      </div>
                    </td>

                    {/* Action column */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="price-table-btn"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('booking:prefill', {
                            detail: {
                              tripType: pkg.package_type,
                              routeKey: `${pkg.routes.departure_point}||${pkg.routes.destination_point}`,
                              packageId: String(pkg.package_id),
                            }
                          }));
                          document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                      >
                        Đặt xe ngay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </section>
  );
}
