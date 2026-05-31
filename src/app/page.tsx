import { createClient } from '@/lib/supabase/server';
import Header from '@/components/landing/Header';
import HeroBanner from '@/components/landing/HeroBanner';
import WhyUs from '@/components/landing/WhyUs';
import Routes from '@/components/landing/Routes';
import VehicleList from '@/components/landing/VehicleList';
import PriceTable from '@/components/landing/PriceTable';
import BookingForm from '@/components/landing/BookingForm';
import Testimonials from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';
import type { SiteSettings, Vehicle, PackageWithDetails } from '@/lib/types';

export const revalidate = 0; // Dynamic rendering to fetch fresh database entries

const DEFAULT_SETTINGS: SiteSettings = {
  setting_id: 1,
  hotline: '0905 123 456',
  zalo_phone: '0905 123 456',
  office_address: '123 Trần Hưng Đạo, TP. Huế, Thừa Thiên Huế',
  working_hours: '5:00 - 22:00 hàng ngày',
  banner_slogan: 'Đồng hành cùng bạn trên mọi chuyến đi',
  facebook_url: 'https://facebook.com/nhaxeduyhung',
  zalo_oa_url: '',
  is_deleted: false,
  updated_at: '2026-01-01T00:00:00.000Z',
};

const DEFAULT_VEHICLES: Vehicle[] = [
  {
    vehicle_id: 1,
    vehicle_name: 'Toyota Camry',
    license_plate: '75A-123.45',
    vehicle_type: 'Sedan',
    seat_count: 4,
    image_url: '/image/fleet/toyota-camry.png',
    description: 'Dòng xe 4 chỗ sang trọng, êm ái, máy lạnh mát mẻ.',
    is_active: true,
    is_deleted: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    vehicle_id: 2,
    vehicle_name: 'Toyota Fortuner',
    license_plate: '75A-678.90',
    vehicle_type: 'SUV',
    seat_count: 7,
    image_url: '/image/fleet/toyota-fortuner.png',
    description: 'Xe 7 chỗ gầm cao, không gian rộng rãi phù hợp đi gia đình.',
    is_active: true,
    is_deleted: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  {
    vehicle_id: 3,
    vehicle_name: 'Hyundai Solati',
    license_plate: '75A-999.99',
    vehicle_type: 'Limousine',
    seat_count: 9,
    image_url: '/image/fleet/hyundai-solati.png',
    description: 'Xe Limousine 9 chỗ VIP, đầy đủ tiện nghi, wifi giải trí.',
    is_active: true,
    is_deleted: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  }
];

const DEFAULT_PACKAGES: PackageWithDetails[] = [
  // Huế ⇄ Đà Nẵng
  {
    package_id: 1,
    vehicle_id: 1,
    route_id: 1,
    package_type: 'shared',
    price: 180000,
    description: 'Xe ghép Limousine Huế đi Đà Nẵng giá rẻ, đưa đón tận nơi.',
    is_active: true,
    is_deleted: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    vehicles: DEFAULT_VEHICLES[0],
    routes: {
      route_id: 1,
      departure_point: 'Huế',
      destination_point: 'Đà Nẵng',
      distance_km: 100,
      estimated_duration: '2 giờ 30 phút',
      is_active: true,
      is_deleted: false,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }
  },
  {
    package_id: 2,
    vehicle_id: 1,
    route_id: 1,
    package_type: 'private',
    price: 1000000,
    description: 'Bao xe 4 chỗ riêng tư Huế ⇄ Đà Nẵng, thời gian xuất phát linh hoạt.',
    is_active: true,
    is_deleted: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    vehicles: DEFAULT_VEHICLES[0],
    routes: {
      route_id: 1,
      departure_point: 'Huế',
      destination_point: 'Đà Nẵng',
      distance_km: 100,
      estimated_duration: '2 giờ 30 phút',
      is_active: true,
      is_deleted: false,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }
  },
  // Huế ⇄ Hội An
  {
    package_id: 3,
    vehicle_id: 2,
    route_id: 2,
    package_type: 'shared',
    price: 250000,
    description: 'Xe ghép 7 chỗ Huế đi Hội An gầm cao, thoải mái.',
    is_active: true,
    is_deleted: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    vehicles: DEFAULT_VEHICLES[1],
    routes: {
      route_id: 2,
      departure_point: 'Huế',
      destination_point: 'Hội An',
      distance_km: 130,
      estimated_duration: '3 giờ',
      is_active: true,
      is_deleted: false,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }
  },
  {
    package_id: 4,
    vehicle_id: 2,
    route_id: 2,
    package_type: 'private',
    price: 1300000,
    description: 'Bao xe 7 chỗ riêng tư Huế ⇄ Hội An đưa đón tận nhà.',
    is_active: true,
    is_deleted: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    vehicles: DEFAULT_VEHICLES[1],
    routes: {
      route_id: 2,
      departure_point: 'Huế',
      destination_point: 'Hội An',
      distance_km: 130,
      estimated_duration: '3 giờ',
      is_active: true,
      is_deleted: false,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }
  },
  // Đà Nẵng ⇄ Hội An
  {
    package_id: 5,
    vehicle_id: 3,
    route_id: 3,
    package_type: 'shared',
    price: 120000,
    description: 'Xe ghép Limousine 9 chỗ Đà Nẵng đi Hội An nhanh chóng.',
    is_active: true,
    is_deleted: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    vehicles: DEFAULT_VEHICLES[2],
    routes: {
      route_id: 3,
      departure_point: 'Đà Nẵng',
      destination_point: 'Hội An',
      distance_km: 30,
      estimated_duration: '45 phút',
      is_active: true,
      is_deleted: false,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }
  },
  {
    package_id: 6,
    vehicle_id: 3,
    route_id: 3,
    package_type: 'private',
    price: 450000,
    description: 'Bao xe Limousine 9 chỗ Đà Nẵng ⇄ Hội An sang trọng đón tận sân bay.',
    is_active: true,
    is_deleted: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    vehicles: DEFAULT_VEHICLES[2],
    routes: {
      route_id: 3,
      departure_point: 'Đà Nẵng',
      destination_point: 'Hội An',
      distance_km: 30,
      estimated_duration: '45 phút',
      is_active: true,
      is_deleted: false,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }
  },
  // Huế ⇄ Quảng Bình
  {
    package_id: 7,
    vehicle_id: 3,
    route_id: 4,
    package_type: 'shared',
    price: 320000,
    description: 'Xe ghép Limousine 9 chỗ Huế ⇄ Quảng Bình.',
    is_active: true,
    is_deleted: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    vehicles: DEFAULT_VEHICLES[2],
    routes: {
      route_id: 4,
      departure_point: 'Huế',
      destination_point: 'Quảng Bình',
      distance_km: 170,
      estimated_duration: '3 giờ 30 phút',
      is_active: true,
      is_deleted: false,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }
  },
  {
    package_id: 8,
    vehicle_id: 3,
    route_id: 4,
    package_type: 'private',
    price: 1800000,
    description: 'Bao chuyến Limousine 9 chỗ Huế ⇄ Quảng Bình.',
    is_active: true,
    is_deleted: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    vehicles: DEFAULT_VEHICLES[2],
    routes: {
      route_id: 4,
      departure_point: 'Huế',
      destination_point: 'Quảng Bình',
      distance_km: 170,
      estimated_duration: '3 giờ 30 phút',
      is_active: true,
      is_deleted: false,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }
  }
];

export default async function Home() {
  const supabase = await createClient();

  // 1. Fetch site settings
  const { data: settingsList } = await supabase
    .from('site_settings')
    .select('*')
    .eq('is_deleted', false)
    .order('setting_id', { ascending: true })
    .limit(1);

  const settings: SiteSettings = (settingsList && settingsList.length > 0 ? settingsList[0] : DEFAULT_SETTINGS) as SiteSettings;

  // 2. Fetch active vehicles
  const { data: vehiclesData } = await supabase
    .from('vehicles')
    .select('*')
    .eq('is_active', true)
    .eq('is_deleted', false)
    .order('vehicle_id', { ascending: true });

  const vehicles: Vehicle[] = vehiclesData && vehiclesData.length > 0 ? vehiclesData : DEFAULT_VEHICLES;

  // 3. Fetch active packages with vehicles and routes
  const { data: packagesData } = await supabase
    .from('packages')
    .select('*, vehicles:vehicles(*), routes:routes(*)')
    .eq('is_active', true)
    .eq('is_deleted', false)
    .order('package_id', { ascending: true });

  // Filter out packages where vehicles or routes are inactive or deleted
  let packages: PackageWithDetails[] = (packagesData || []).filter(
    (pkg: any) =>
      pkg.vehicles &&
      pkg.vehicles.is_active &&
      !pkg.vehicles.is_deleted &&
      pkg.routes &&
      pkg.routes.is_active &&
      !pkg.routes.is_deleted
  ) as unknown as PackageWithDetails[];

  // Fallback to default packages if database is empty/not configured
  if (packages.length === 0) {
    packages = DEFAULT_PACKAGES;
  }

  return (
    <div className="landing-page" style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <Header />
      <main>
        <HeroBanner settings={settings} />
        <WhyUs />
        <Routes packages={packages} />
        <VehicleList vehicles={vehicles} />
        <PriceTable packages={packages} />
        <Testimonials />
        <BookingForm packages={packages} />
        <FAQ />
      </main>
      <Footer settings={settings} />
    </div>
  );
}
