'use server';

import { createClient } from '@/lib/supabase/server';
import { validateBookingForm, sanitizeObject, normalizePhone } from '@/lib/validation';
import { checkBookingRateLimit, getClientIP } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { calculateTotal } from '@/lib/utils';
import { requireAuth, requireAdmin } from '@/lib/auth-guard';
import { revalidatePath } from 'next/cache';
import type { BookingStatus } from '@/lib/types';


export interface BookingActionResult {
  success: boolean;
  bookingCode?: string;
  error?: string;
  fieldErrors?: { field: string; message: string }[];
}

export async function submitBooking(formData: FormData): Promise<BookingActionResult> {
  // 1. Rate limit
  const headerStore = await headers();
  const ip = getClientIP(headerStore);
  const rateCheck = checkBookingRateLimit(ip);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${rateCheck.retryAfterSeconds} giây.`,
    };
  }

  // 2. Parse & sanitize input
  const rawData = {
    customer_name: formData.get('customer_name') as string || '',
    customer_phone: formData.get('customer_phone') as string || '',
    customer_email: formData.get('customer_email') as string || '',
    package_id: parseInt(formData.get('package_id') as string || '0', 10),
    pickup_address: formData.get('pickup_address') as string || '',
    dropoff_address: formData.get('dropoff_address') as string || '',
    departure_date: formData.get('departure_date') as string || '',
    passenger_count: parseInt(formData.get('passenger_count') as string || '1', 10),
    customer_note: formData.get('customer_note') as string || '',
  };

  const data = sanitizeObject(rawData);

  // 3. Validate
  const errors = validateBookingForm(data);
  if (errors.length > 0) {
    return { success: false, fieldErrors: errors };
  }

  // 4. Lấy giá gói tại thời điểm đặt
  const supabase = await createClient();
  const { data: pkg } = await supabase
    .from('packages')
    .select('price, package_type')
    .eq('package_id', data.package_id)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .single();

  if (!pkg) {
    return { success: false, error: 'Gói dịch vụ không tồn tại hoặc đã ngừng hoạt động' };
  }

  // 5. Tính tổng tiền
  const totalAmount = calculateTotal(pkg.price, data.passenger_count, pkg.package_type);

  // 6. Insert booking (booking_code được auto-generate bởi trigger)
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      booking_code: '', // Trigger sẽ generate
      package_id: data.package_id,
      customer_name: data.customer_name,
      customer_phone: normalizePhone(data.customer_phone),
      customer_email: data.customer_email || null,
      pickup_address: data.pickup_address,
      dropoff_address: data.dropoff_address,
      departure_date: data.departure_date,
      passenger_count: data.passenger_count,
      price_at_booking: pkg.price,
      total_amount: totalAmount,
      status: 'new',
      customer_note: data.customer_note || null,
    })
    .select('booking_code')
    .single();

  if (error) {
    console.error('Booking insert error:', error);
    return { success: false, error: 'Có lỗi xảy ra. Vui lòng thử lại sau.' };
  }

  return {
    success: true,
    bookingCode: booking.booking_code,
  };
}

export async function updateBookingStatus(
  bookingId: number,
  status: BookingStatus,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('booking_id', bookingId);

  if (error) {
    console.error('Update status error:', error);
    return { success: false, error: 'Không thể cập nhật trạng thái đơn hàng' };
  }

  // Update admin_id in the newly created history record
  const { data: latestHistory } = await supabase
    .from('booking_status_history')
    .select('history_id')
    .eq('booking_id', bookingId)
    .order('changed_at', { ascending: false })
    .limit(1);

  if (latestHistory && latestHistory.length > 0) {
    await supabase
      .from('booking_status_history')
      .update({ admin_id: admin.adminId, note: note || null })
      .eq('history_id', latestHistory[0].history_id);
  }

  revalidatePath('/admin');
  revalidatePath('/admin/bookings');
  return { success: true };
}

export async function updateBookingInternalNote(
  bookingId: number,
  internalNote: string
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from('bookings')
    .update({ internal_note: internalNote })
    .eq('booking_id', bookingId);

  if (error) {
    console.error('Update internal note error:', error);
    return { success: false, error: 'Không thể cập nhật ghi chú nội bộ' };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/bookings');
  return { success: true };
}

export async function deleteBooking(
  bookingId: number
): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from('bookings')
    .update({ is_deleted: true })
    .eq('booking_id', bookingId);

  if (error) {
    console.error('Delete booking error:', error);
    return { success: false, error: 'Không thể xoá đơn đặt vé' };
  }

  revalidatePath('/admin');
  revalidatePath('/admin/bookings');
  return { success: true };
}

export async function getBookingHistory(
  bookingId: number
): Promise<any[]> {
  await requireAuth();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('booking_status_history')
    .select('*, admins(username, admin_information(full_name))')
    .eq('booking_id', bookingId)
    .order('changed_at', { ascending: false });

  if (error) {
    console.error('Fetch booking history error:', error);
    return [];
  }
  return data;
}


