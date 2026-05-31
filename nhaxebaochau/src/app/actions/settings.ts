'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import { revalidatePath } from 'next/cache';

export async function saveSettings(formData: FormData): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  const supabase = await createClient();

  const idVal = formData.get('setting_id');
  const settingId = idVal ? parseInt(idVal as string, 10) : 1;
  const hotline = (formData.get('hotline') as string || '').trim();
  const zaloPhone = (formData.get('zalo_phone') as string || '').trim();
  const officeAddress = (formData.get('office_address') as string || '').trim();
  const workingHours = (formData.get('working_hours') as string || '').trim();
  const bannerSlogan = (formData.get('banner_slogan') as string || '').trim();
  const facebookUrl = (formData.get('facebook_url') as string || '').trim();
  const zaloOaUrl = (formData.get('zalo_oa_url') as string || '').trim();

  const payload = {
    hotline: hotline || null,
    zalo_phone: zaloPhone || null,
    office_address: officeAddress || null,
    working_hours: workingHours || null,
    banner_slogan: bannerSlogan || null,
    facebook_url: facebookUrl || null,
    zalo_oa_url: zaloOaUrl || null,
  };

  const { error } = await supabase
    .from('site_settings')
    .update(payload)
    .eq('setting_id', settingId);

  if (error) {
    console.error('Save settings error:', error);
    return { success: false, error: 'Không thể lưu cài đặt' };
  }

  revalidatePath('/admin/settings');
  revalidatePath('/');
  return { success: true };
}
