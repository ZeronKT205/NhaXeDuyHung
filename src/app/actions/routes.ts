'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import { revalidatePath } from 'next/cache';

export async function saveRoute(formData: FormData): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  const supabase = await createClient();

  const idVal = formData.get('route_id');
  const id = idVal ? parseInt(idVal as string, 10) : null;
  const departurePoint = (formData.get('departure_point') as string || '').trim();
  const destinationPoint = (formData.get('destination_point') as string || '').trim();
  const distanceKmVal = formData.get('distance_km');
  const distanceKm = distanceKmVal ? parseFloat(distanceKmVal as string) : null;
  const estimatedDuration = (formData.get('estimated_duration') as string || '').trim();
  const isActive = formData.get('is_active') === 'true';

  if (!departurePoint || !destinationPoint) {
    return { success: false, error: 'Điểm đi và điểm đến là bắt buộc' };
  }

  const payload = {
    departure_point: departurePoint,
    destination_point: destinationPoint,
    distance_km: distanceKm,
    estimated_duration: estimatedDuration || null,
    is_active: isActive,
  };

  let error;
  if (id) {
    const { error: err } = await supabase
      .from('routes')
      .update(payload)
      .eq('route_id', id);
    error = err;
  } else {
    const { error: err } = await supabase
      .from('routes')
      .insert(payload);
    error = err;
  }

  if (error) {
    console.error('Save route error:', error);
    return { success: false, error: 'Không thể lưu tuyến đường' };
  }

  revalidatePath('/admin/routes');
  revalidatePath('/');
  return { success: true };
}

export async function deleteRoute(id: number): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from('routes')
    .update({ is_deleted: true })
    .eq('route_id', id);

  if (error) {
    console.error('Delete route error:', error);
    return { success: false, error: 'Không thể xoá tuyến đường' };
  }

  revalidatePath('/admin/routes');
  revalidatePath('/');
  return { success: true };
}
