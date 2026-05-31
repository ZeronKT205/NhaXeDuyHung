import { getCurrentAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import VehiclesManagement from '@/components/admin/VehiclesManagement';
import type { Vehicle } from '@/lib/types';

export const revalidate = 0; // Dynamic rendering

export default async function AdminVehiclesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/login');
  }

  const supabase = await createClient();

  // Fetch non-deleted vehicles
  const { data: vehiclesData } = await supabase
    .from('vehicles')
    .select('*')
    .eq('is_deleted', false)
    .order('vehicle_id', { ascending: true });

  const vehicles: Vehicle[] = (vehiclesData || []) as Vehicle[];

  return <VehiclesManagement vehicles={vehicles} />;
}
