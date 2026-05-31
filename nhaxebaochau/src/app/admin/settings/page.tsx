import { getCurrentAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SettingsManagement from '@/components/admin/SettingsManagement';
import type { SiteSettings } from '@/lib/types';

export const revalidate = 0; // Dynamic rendering

export default async function AdminSettingsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/login');
  }

  const supabase = await createClient();

  // Fetch the first settings row
  const { data: settingsData } = await supabase
    .from('site_settings')
    .select('*')
    .eq('is_deleted', false)
    .order('setting_id', { ascending: true })
    .limit(1);

  const settings: SiteSettings | null = settingsData && settingsData.length > 0 ? settingsData[0] : null;

  return <SettingsManagement settings={settings} />;
}
