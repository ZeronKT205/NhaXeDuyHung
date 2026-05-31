import { getCurrentAdmin, type AdminJWTPayload } from '@/lib/auth';
import { redirect } from 'next/navigation';

// ============================================
// SERVER ACTION GUARDS
// Mỗi Server Action trong Admin PHẢI gọi 1 trong
// các hàm này trước khi thực hiện business logic
// ============================================

/**
 * Yêu cầu đăng nhập — dùng cho mọi Server Action trong Admin
 * Throw redirect nếu chưa đăng nhập
 * 
 * @example
 * ```ts
 * 'use server';
 * export async function getBookings() {
 *   const admin = await requireAuth();
 *   // admin.adminId, admin.username, admin.role
 *   // ... business logic
 * }
 * ```
 */
export async function requireAuth(): Promise<AdminJWTPayload> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect('/login');
  }
  return admin;
}

/**
 * Yêu cầu role 'admin' — dùng cho các action nhạy cảm
 * (quản lý tài khoản admin, cài đặt hệ thống, xoá dữ liệu)
 * 
 * @example
 * ```ts
 * 'use server';
 * export async function deleteVehicle(id: number) {
 *   const admin = await requireAdmin();
 *   // Chỉ admin mới xoá được
 * }
 * ```
 */
export async function requireAdmin(): Promise<AdminJWTPayload> {
  const admin = await requireAuth();
  if (admin.role !== 'admin') {
    throw new Error('Bạn không có quyền thực hiện thao tác này');
  }
  return admin;
}

/**
 * Kiểm tra đăng nhập mà không redirect
 * Dùng cho các page cần biết trạng thái auth
 */
export async function getAuthStatus(): Promise<{
  isAuthenticated: boolean;
  admin: AdminJWTPayload | null;
}> {
  const admin = await getCurrentAdmin();
  return {
    isAuthenticated: !!admin,
    admin,
  };
}
