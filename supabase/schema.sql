-- ============================================
-- NHÀ XE DUY HÙNG - DATABASE SCHEMA
-- Supabase (PostgreSQL)
-- Theo ERD mới: ADMINS, ADMIN_INFORMATION,
-- VEHICLES, ROUTES, PACKAGES, BOOKINGS,
-- BOOKING_STATUS_HISTORY, SITE_SETTINGS
-- ============================================

-- ============================================
-- 1. ADMIN_INFORMATION (Thông tin cá nhân admin)
-- ============================================
CREATE TABLE admin_information (
  information_id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  position VARCHAR(100),
  avatar_url TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ADMINS (Tài khoản đăng nhập admin)
-- ============================================
CREATE TABLE admins (
  admin_id SERIAL PRIMARY KEY,
  information_id INT NOT NULL REFERENCES admin_information(information_id) ON DELETE RESTRICT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'staff',  -- 'admin' | 'staff'
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. VEHICLES (Xe)
-- ============================================
CREATE TABLE vehicles (
  vehicle_id SERIAL PRIMARY KEY,
  vehicle_name VARCHAR(100) NOT NULL,
  license_plate VARCHAR(20) UNIQUE,
  vehicle_type VARCHAR(50) NOT NULL,          -- Sedan, SUV, Limousine, etc.
  seat_count INT NOT NULL DEFAULT 4,
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. ROUTES (Tuyến đường)
-- ============================================
CREATE TABLE routes (
  route_id SERIAL PRIMARY KEY,
  departure_point VARCHAR(100) NOT NULL,       -- Điểm đi
  destination_point VARCHAR(100) NOT NULL,     -- Điểm đến
  distance_km REAL,                            -- Quãng đường (km)
  estimated_duration VARCHAR(50),              -- "2 giờ 30 phút"
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. PACKAGES (Gói giá)
-- ============================================
CREATE TABLE packages (
  package_id SERIAL PRIMARY KEY,
  vehicle_id INT NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE RESTRICT,
  route_id INT NOT NULL REFERENCES routes(route_id) ON DELETE RESTRICT,
  package_type VARCHAR(20) NOT NULL DEFAULT 'shared',  -- 'shared' | 'private'
  price DECIMAL(12, 0) NOT NULL,                       -- Giá (VND)
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. BOOKINGS (Đơn đặt vé)
-- ============================================
CREATE TABLE bookings (
  booking_id SERIAL PRIMARY KEY,
  booking_code VARCHAR(20) NOT NULL UNIQUE,            -- DH-YYYYMMDD-XXX
  package_id INT NOT NULL REFERENCES packages(package_id) ON DELETE RESTRICT,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(100),
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  departure_date DATE NOT NULL,
  passenger_count INT NOT NULL DEFAULT 1,
  price_at_booking DECIMAL(12, 0) NOT NULL,            -- Giá tại thời điểm đặt
  total_amount DECIMAL(12, 0) NOT NULL,                -- Tổng tiền = price_at_booking * passenger_count
  status VARCHAR(20) NOT NULL DEFAULT 'new',           -- 'new' | 'confirmed' | 'completed' | 'cancelled'
  customer_note TEXT,                                  -- Ghi chú từ khách
  internal_note TEXT,                                  -- Ghi chú nội bộ (nhân viên)
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. BOOKING_STATUS_HISTORY (Lịch sử trạng thái đơn)
-- ============================================
CREATE TABLE booking_status_history (
  history_id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
  admin_id INT REFERENCES admins(admin_id) ON DELETE SET NULL,
  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  note TEXT,
  is_deleted BOOLEAN DEFAULT false,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. SITE_SETTINGS (Cài đặt trang - 1 dòng duy nhất)
-- ============================================
CREATE TABLE site_settings (
  setting_id SERIAL PRIMARY KEY,
  hotline VARCHAR(20),
  zalo_phone VARCHAR(20),
  office_address TEXT,
  working_hours VARCHAR(100),
  banner_slogan TEXT,
  facebook_url TEXT,
  zalo_oa_url TEXT,
  is_deleted BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_information_id ON admins(information_id);
CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX idx_packages_vehicle_id ON packages(vehicle_id);
CREATE INDEX idx_packages_route_id ON packages(route_id);
CREATE INDEX idx_bookings_booking_code ON bookings(booking_code);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_departure_date ON bookings(departure_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_bookings_package_id ON bookings(package_id);
CREATE INDEX idx_booking_status_history_booking_id ON booking_status_history(booking_id);
CREATE INDEX idx_booking_status_history_admin_id ON booking_status_history(admin_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Admin Information: chỉ đọc/ghi qua server
ALTER TABLE admin_information ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_info_public_read" ON admin_information FOR SELECT USING (true);
CREATE POLICY "admin_info_auth_write" ON admin_information FOR ALL USING (
  auth.role() = 'authenticated'
);

-- Admins: chỉ đọc/ghi qua server
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_public_read" ON admins FOR SELECT USING (true);
CREATE POLICY "admins_auth_write" ON admins FOR ALL USING (
  auth.role() = 'authenticated'
);

-- Vehicles: public đọc, admin ghi
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vehicles_public_read" ON vehicles FOR SELECT USING (true);
CREATE POLICY "vehicles_auth_write" ON vehicles FOR ALL USING (
  auth.role() = 'authenticated'
);

-- Routes: public đọc, admin ghi
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "routes_public_read" ON routes FOR SELECT USING (true);
CREATE POLICY "routes_auth_write" ON routes FOR ALL USING (
  auth.role() = 'authenticated'
);

-- Packages: public đọc, admin ghi
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packages_public_read" ON packages FOR SELECT USING (true);
CREATE POLICY "packages_auth_write" ON packages FOR ALL USING (
  auth.role() = 'authenticated'
);

-- Bookings: public tạo, admin đọc/sửa
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_public_insert" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_public_read" ON bookings FOR SELECT USING (true);
CREATE POLICY "bookings_auth_write" ON bookings FOR ALL USING (
  auth.role() = 'authenticated'
);

-- Booking Status History: public đọc, admin ghi
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history_public_read" ON booking_status_history FOR SELECT USING (true);
CREATE POLICY "history_auth_write" ON booking_status_history FOR ALL USING (
  auth.role() = 'authenticated'
);

-- Site Settings: public đọc, admin ghi
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read" ON site_settings FOR SELECT USING (true);
CREATE POLICY "settings_auth_write" ON site_settings FOR ALL USING (
  auth.role() = 'authenticated'
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_information_updated_at BEFORE UPDATE ON admin_information
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER packages_updated_at BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- site_settings chỉ có updated_at, không có created_at
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Auto-generate booking code: DH-YYYYMMDD-XXX
-- ============================================
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TRIGGER AS $$
DECLARE
  today_str TEXT;
  seq INT;
BEGIN
  today_str := TO_CHAR(NOW(), 'YYYYMMDD');

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(booking_code FROM LENGTH('DH-' || today_str || '-') + 1) AS INT)
  ), 0) + 1
  INTO seq
  FROM bookings
  WHERE booking_code LIKE 'DH-' || today_str || '-%';

  NEW.booking_code := 'DH-' || today_str || '-' || LPAD(seq::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_generate_code BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.booking_code IS NULL OR NEW.booking_code = '')
  EXECUTE FUNCTION generate_booking_code();

-- ============================================
-- Auto-log booking status changes
-- ============================================
CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_at)
    VALUES (NEW.booking_id, OLD.status, NEW.status, NOW());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_status_change AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION log_booking_status_change();

-- ============================================
-- SEED DATA - Site Settings (1 dòng duy nhất)
-- ============================================
INSERT INTO site_settings (hotline, zalo_phone, office_address, working_hours, banner_slogan, facebook_url, zalo_oa_url)
VALUES (
  '0905 123 456',
  '0905 123 456',
  '123 Trần Hưng Đạo, TP. Huế, Thừa Thiên Huế',
  '5:00 - 22:00 hàng ngày',
  'Đồng hành cùng bạn trên mọi chuyến đi',
  'https://facebook.com/nhaxeduyhung',
  ''
);

-- ============================================
-- SEED DATA - Admin (mật khẩu mẫu, cần hash thực tế)
-- ============================================
INSERT INTO admin_information (full_name, phone, email, position)
VALUES ('Quản trị viên', '0905 123 456', 'admin@duyhung.vn', 'Quản lý');

INSERT INTO admins (information_id, username, password_hash, role)
VALUES (1, 'admin', '$2b$10$placeholder_hash_replace_me', 'admin');

-- ============================================
-- SEED DATA - Sample Vehicles
-- ============================================
INSERT INTO vehicles (vehicle_name, license_plate, vehicle_type, seat_count, description) VALUES
  ('Xe Limousine A', '75A-12345', 'Limousine', 9, 'Ghế massage, wifi, nước uống miễn phí, màn hình giải trí cá nhân'),
  ('Xe Sedan B', '75A-67890', 'Sedan', 4, 'Xe 4 chỗ tiện nghi, máy lạnh, sạch sẽ'),
  ('Xe SUV C', '75A-11111', 'SUV 7 chỗ', 7, 'Xe 7 chỗ rộng rãi, phù hợp gia đình');

-- ============================================
-- SEED DATA - Sample Routes
-- ============================================
INSERT INTO routes (departure_point, destination_point, distance_km, estimated_duration) VALUES
  ('Huế', 'Đà Nẵng', 100, '2 giờ 30 phút'),
  ('Huế', 'Hội An', 130, '3 giờ'),
  ('Đà Nẵng', 'Hội An', 30, '45 phút'),
  ('Huế', 'Quảng Bình', 170, '3 giờ 30 phút');

-- ============================================
-- SEED DATA - Sample Packages
-- ============================================
-- Xe Limousine A (vehicle_id=1) + Huế → Đà Nẵng (route_id=1)
INSERT INTO packages (vehicle_id, route_id, package_type, price, description) VALUES
  (1, 1, 'shared',  200000,  'Xe ghép Limousine A — Huế → Đà Nẵng'),
  (1, 1, 'private', 1200000, 'Bao chuyến Limousine A — Huế → Đà Nẵng');

-- Xe Limousine A (vehicle_id=1) + Huế → Hội An (route_id=2)
INSERT INTO packages (vehicle_id, route_id, package_type, price, description) VALUES
  (1, 2, 'shared',  250000,  'Xe ghép Limousine A — Huế → Hội An'),
  (1, 2, 'private', 1500000, 'Bao chuyến Limousine A — Huế → Hội An');

-- Xe Sedan B (vehicle_id=2) + Đà Nẵng → Hội An (route_id=3)
INSERT INTO packages (vehicle_id, route_id, package_type, price, description) VALUES
  (2, 3, 'shared',  150000, 'Xe ghép Sedan B — Đà Nẵng → Hội An'),
  (2, 3, 'private', 500000, 'Bao chuyến Sedan B — Đà Nẵng → Hội An');

-- ============================================
-- STORAGE BUCKET for images (chạy riêng trong Supabase SQL Editor)
-- ============================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-images', 'vehicle-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('admin-avatars', 'admin-avatars', true);
