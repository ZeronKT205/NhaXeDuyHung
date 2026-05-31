import { getCurrentAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardOverview from '@/components/admin/DashboardOverview';
import type { BookingWithPackage } from '@/lib/types';

export const revalidate = 0; // Dynamic rendering for admin dashboard overview

export default async function AdminPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/login');
  }

  const supabase = await createClient();

  // Calculate start dates
  const now = new Date();
  
  // Start of today (local date boundary in ISO format)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  // Start of week
  const startOfWeekDate = new Date(now);
  startOfWeekDate.setDate(now.getDate() - now.getDay()); // Sunday as start of week
  const startOfWeek = new Date(startOfWeekDate.getFullYear(), startOfWeekDate.getMonth(), startOfWeekDate.getDate()).toISOString();

  // Start of month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 1. Query Stats counts
  // New bookings today
  const { count: newToday } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)
    .gte('created_at', startOfToday);

  // Pending confirmation bookings (status = 'new')
  const { count: pendingConfirmation } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)
    .eq('status', 'new');

  // Bookings created this week
  const { count: thisWeek } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)
    .gte('created_at', startOfWeek);

  // Bookings created this month
  const { count: thisMonth } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)
    .gte('created_at', startOfMonth);

  // 2. Query last 10 bookings
  const { data: bookingsData } = await supabase
    .from('bookings')
    .select('*, packages:packages(*, vehicles:vehicles(*), routes:routes(*))')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(10);

  const recentBookings: BookingWithPackage[] = (bookingsData || []) as unknown as BookingWithPackage[];

  const stats = {
    newToday: newToday || 0,
    pendingConfirmation: pendingConfirmation || 0,
    thisWeek: thisWeek || 0,
    thisMonth: thisMonth || 0,
  };

  const isAdmin = admin.role === 'admin';

  return (
    <DashboardOverview
      stats={stats}
      recentBookings={recentBookings}
      isAdmin={isAdmin}
    />
  );
}
