import { getCurrentAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RoutesManagement from '@/components/admin/RoutesManagement';
import type { Route } from '@/lib/types';

export const revalidate = 0; // Dynamic rendering

export default async function AdminRoutesPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/login');
  }

  const supabase = await createClient();

  // Fetch non-deleted routes
  const { data: routesData } = await supabase
    .from('routes')
    .select('*')
    .eq('is_deleted', false)
    .order('route_id', { ascending: true });

  const routes: Route[] = (routesData || []) as Route[];

  return <RoutesManagement routes={routes} />;
}
