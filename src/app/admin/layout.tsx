import { getCurrentAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import type { AdminInformation } from '@/lib/types';

export const revalidate = 0; // Dynamic rendering for admin pages

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/login');
  }

  // Fetch admin profile details from database
  const supabase = await createClient();
  const { data: adminInfo } = await supabase
    .from('admin_information')
    .select('*')
    .eq('information_id', admin.adminId)
    .eq('is_deleted', false)
    .single();

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      <Sidebar admin={admin} profile={adminInfo} />
      <div className="admin-content" style={{ flex: 1, padding: '32px', background: 'var(--bg-secondary)' }}>
        {children}
      </div>
    </div>
  );
}
