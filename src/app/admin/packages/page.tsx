import { getCurrentAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PackagesManagement from '@/components/admin/PackagesManagement';
import type { PackageWithDetails, Vehicle, Route } from '@/lib/types';

export const revalidate = 0; // Dynamic rendering

export default async function AdminPackagesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/login');
  }

  const supabase = await createClient();

  // 1. Fetch non-deleted packages with vehicle and route details
  const { data: packagesData } = await supabase
    .from('packages')
    .select('*, vehicles:vehicles(*), routes:routes(*)')
    .eq('is_deleted', false)
    .order('package_id', { ascending: true });

  const packages: PackageWithDetails[] = (packagesData || []) as unknown as PackageWithDetails[];

  // 2. Fetch active vehicles to populate select options
  const { data: vehiclesData } = await supabase
    .from('vehicles')
    .select('*')
    .eq('is_active', true)
    .eq('is_deleted', false)
    .order('vehicle_id', { ascending: true });

  const vehicles: Vehicle[] = (vehiclesData || []) as Vehicle[];

  // 3. Fetch active routes to populate select options
  const { data: routesData } = await supabase
    .from('routes')
    .select('*')
    .eq('is_active', true)
    .eq('is_deleted', false)
    .order('route_id', { ascending: true });

  const routes: Route[] = (routesData || []) as Route[];

  return (
    <PackagesManagement
      packages={packages}
      vehicles={vehicles}
      routes={routes}
    />
  );
}
