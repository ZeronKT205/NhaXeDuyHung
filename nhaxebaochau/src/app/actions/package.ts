'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import { revalidatePath } from 'next/cache';
import type { PackageType } from '@/lib/types';

export async function savePackage(formData: FormData): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  const supabase = await createClient();

  const idVal = formData.get('package_id');
  const id = idVal ? parseInt(idVal as string, 10) : null;
  const vehicleId = parseInt(formData.get('vehicle_id') as string, 10);
  const routeId = parseInt(formData.get('route_id') as string, 10);
  const packageType = (formData.get('package_type') as PackageType) || 'shared';
  const price = parseFloat(formData.get('price') as string || '0');
  const description = (formData.get('description') as string || '').trim();
  const isActive = formData.get('is_active') === 'true';

  if (!vehicleId || !routeId) {
    return { success: false, error: 'Xe và tuyến đường là bắt buộc' };
  }

  const payload = {
    vehicle_id: vehicleId,
    route_id: routeId,
    package_type: packageType,
    price: price,
    description: description || null,
    is_active: isActive,
  };

  let error;
  if (id) {
    const { error: err } = await supabase
      .from('packages')
      .update(payload)
      .eq('package_id', id);
    error = err;
  } else {
    const { error: err } = await supabase
      .from('packages')
      .insert(payload);
    error = err;
  }

  if (error) {
    console.error('Save package error:', error);
    return { success: false, error: 'Không thể lưu gói dịch vụ' };
  }

  revalidatePath('/admin/packages');
  revalidatePath('/');
  return { success: true };
}

export async function deletePackage(id: number): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from('packages')
    .update({ is_deleted: true })
    .eq('package_id', id);

  if (error) {
    console.error('Delete package error:', error);
    return { success: false, error: 'Không thể xoá gói dịch vụ' };
  }

  revalidatePath('/admin/packages');
  revalidatePath('/');
  return { success: true };
}
