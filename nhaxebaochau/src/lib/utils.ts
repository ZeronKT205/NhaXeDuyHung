import type { BookingStatus } from './types';

/**
 * Format price in Vietnamese Dong
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

/**
 * Format date to Vietnamese locale
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Format datetime to Vietnamese locale
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Get status label and color
 */
export function getStatusInfo(status: BookingStatus): {
  label: string;
  color: string;
  emoji: string;
  bgClass: string;
} {
  const map: Record<BookingStatus, { label: string; color: string; emoji: string; bgClass: string }> = {
    new: { label: 'Mới gửi', color: '#f59e0b', emoji: '🟡', bgClass: 'badge-new' },
    confirmed: { label: 'Đã xác nhận', color: '#22c55e', emoji: '🟢', bgClass: 'badge-confirmed' },
    completed: { label: 'Hoàn thành', color: '#3b82f6', emoji: '✅', bgClass: 'badge-completed' },
    cancelled: { label: 'Đã huỷ', color: '#ef4444', emoji: '❌', bgClass: 'badge-cancelled' },
  };
  return map[status];
}

/**
 * Validate Vietnamese phone number
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s.-]/g, '');
  return /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(cleaned);
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
export function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get package type label
 */
export function getPackageTypeLabel(type: 'shared' | 'private'): string {
  return type === 'shared' ? 'Xe ghép' : 'Bao chuyến';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Calculate total amount
 */
export function calculateTotal(pricePerPerson: number, passengerCount: number, packageType: 'shared' | 'private'): number {
  // Bao chuyến = giá nguyên xe, không nhân số khách
  if (packageType === 'private') return pricePerPerson;
  return pricePerPerson * passengerCount;
}
