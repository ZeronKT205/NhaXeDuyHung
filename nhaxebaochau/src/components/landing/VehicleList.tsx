import type { Vehicle } from '@/lib/types';
import { getTranslations } from 'next-intl/server';
import VehicleCtaBtn from './VehicleCtaBtn';

interface VehicleListProps {
  vehicles: Vehicle[];
}

const FLEET_VEHICLES = [
  {
    id: 'camry',
    type: 'SEDAN · 4 CHỖ',
    name: 'Toyota Camry',
    seats: 4,
    plate: '75A-123.45',
    image: '/image/fleet/toyota-camry.png',
    accent: '#00829a',
    features: ['Điều hòa tự động', 'Điều hòa 2 vùng', 'Ghế da cao cấp', 'Sạc USB'],
  },
  {
    id: 'fortuner',
    type: 'SUV · 7 CHỖ',
    name: 'Toyota Fortuner',
    seats: 7,
    plate: '75A-678.90',
    image: '/image/fleet/toyota-fortuner.png',
    accent: '#6366f1',
    features: ['Không gian rộng', 'Điều hòa mát sâu', 'Phù hợp gia đình', 'Vận hành mạnh'],
  },
  {
    id: 'solati',
    type: 'LIMOUSINE · 9 CHỖ',
    name: 'Hyundai Solati',
    seats: 9,
    plate: '75A-999.99',
    image: '/image/fleet/hyundai-solati.png',
    accent: '#0ea5e9',
    features: ['Ghế VIP rộng rãi', 'Wifi miễn phí', 'Sạc USB mỗi ghế', 'Nước uống miễn phí'],
  },
];

export default async function VehicleList({ vehicles: _ }: VehicleListProps) {
  const t = await getTranslations('vehicles');

  return (
    <section className="section vl-section" id="vehicles">
      <div className="container">
        <div className="section-header">
          <span className="section-label">{t('label')}</span>
          <div className="section-title-row">
            <h2 className="section-title">{t('title')}</h2>
          </div>
          <p className="section-subtitle">{t('subtitle')}</p>
        </div>

        <div className="vl-grid">
          {FLEET_VEHICLES.map((v) => (
            <article
              key={v.id}
              className="vl-card"
              style={{ '--vl-accent': v.accent } as React.CSSProperties}
            >
              <div className="vl-card-left">
                <span className="vl-type">{v.type}</span>
                <h3 className="vl-name">{v.name}</h3>

                <div className="vl-meta">
                  <span className="vl-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    {v.seats} chỗ
                  </span>
                  <span className="vl-meta-sep">·</span>
                  <span className="vl-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                    {v.plate}
                  </span>
                </div>

                <div className="vl-stat-badge">
                  <span className="vl-stat-num">1000+</span>
                  <span className="vl-stat-label">chuyến đi</span>
                </div>

                <VehicleCtaBtn seats={v.seats} />
              </div>

              <div className="vl-card-right">
                <img src={v.image} alt={v.name} className="vl-img" loading="lazy" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
