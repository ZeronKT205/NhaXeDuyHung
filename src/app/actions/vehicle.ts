'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth-guard';
import { revalidatePath } from 'next/cache';

export async function saveVehicle(formData: FormData): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  const supabase = await createClient();

  const idVal = formData.get('vehicle_id');
  const id = idVal ? parseInt(idVal as string, 10) : null;
  const name = (formData.get('vehicle_name') as string || '').trim();
  const licensePlate = (formData.get('license_plate') as string || '').trim();
  const type = (formData.get('vehicle_type') as string || '').trim();
  const seats = parseInt(formData.get('seat_count') as string || '4', 10);
  const imageUrl = (formData.get('image_url') as string || '').trim();
  const description = (formData.get('description') as string || '').trim();
  const isActive = formData.get('is_active') === 'true';

  if (!name || !type) {
    return { success: false, error: 'Tên xe và loại xe là bắt buộc' };
  }

  const payload = {
    vehicle_name: name,
    license_plate: licensePlate || null,
    vehicle_type: type,
    seat_count: seats,
    image_url: imageUrl || null,
    description: description || null,
    is_active: isActive,
  };

  let error;
  if (id) {
    const { error: err } = await supabase
      .from('vehicles')
      .update(payload)
      .eq('vehicle_id', id);
    error = err;
  } else {
    const { error: err } = await supabase
      .from('vehicles')
      .insert(payload);
    error = err;
  }

  if (error) {
    console.error('Save vehicle error:', error);
    if (error.code === '23505') {
      return { success: false, error: 'Biển số xe đã tồn tại trong hệ thống' };
    }
    return { success: false, error: 'Không thể lưu thông tin xe' };
  }

  revalidatePath('/admin/vehicles');
  revalidatePath('/');
  return { success: true };
}

export async function deleteVehicle(id: number): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from('vehicles')
    .update({ is_deleted: true })
    .eq('vehicle_id', id);

  if (error) {
    console.error('Delete vehicle error:', error);
    return { success: false, error: 'Không thể xoá xe' };
  }

  revalidatePath('/admin/vehicles');
  revalidatePath('/');
  return { success: true };
}
