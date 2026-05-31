import { getCurrentAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BookingsManagement from '@/components/admin/BookingsManagement';
import type { BookingWithPackage } from '@/lib/types';

export const revalidate = 0; // Dynamic rendering

interface BookingsPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    date?: string;
  }>;
}

export default async function BookingsPage(props: BookingsPageProps) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/login');
  }

  const searchParams = await props.searchParams;
  const status = searchParams.status || '';
  const search = searchParams.search || '';
  const date = searchParams.date || '';

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('bookings')
    .select('*, packages:packages(*, vehicles:vehicles(*), routes:routes(*))')
    .eq('is_deleted', false);

  if (status) {
    query = query.eq('status', status);
  }

  if (date) {
    query = query.eq('departure_date', date);
  }

  if (search) {
    query = query.or(
      `booking_code.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`
    );
  }

  // Newest first
  query = query.order('created_at', { ascending: false });

  const { data: bookingsData } = await query;
  const bookings: BookingWithPackage[] = (bookingsData || []) as unknown as BookingWithPackage[];

  const filters = {
    status,
    search,
    date,
  };

  const isAdmin = admin.role === 'admin';

  return (
    <BookingsManagement
      bookings={bookings}
      isAdmin={isAdmin}
      filters={filters}
    />
  );
}
