import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { verifyPassword, hashPassword } from '@/lib/password';
import type { AdminRole } from '@/lib/types';

// ============================================
// CONFIG
// ============================================
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production-!@#$%'
);
const TOKEN_COOKIE_NAME = 'admin_token';
const TOKEN_EXPIRY = '8h';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

// ============================================
// TYPES
// ============================================
export interface AdminJWTPayload extends JWTPayload {
  adminId: number;
  username: string;
  role: AdminRole;
}

export interface LoginResult {
  success: boolean;
  error?: string;
  remainingAttempts?: number;
  lockedUntil?: string;
}

// ============================================
// JWT OPERATIONS
// ============================================

/**
 * Tạo JWT token cho admin đã xác thực
 */
export async function signToken(payload: {
  adminId: number;
  username: string;
  role: AdminRole;
}): Promise<string> {
  return new SignJWT({
    adminId: payload.adminId,
    username: payload.username,
    role: payload.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verify và decode JWT token
 * Trả về payload nếu hợp lệ, null nếu không
 */
export async function verifyToken(token: string): Promise<AdminJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as AdminJWTPayload;
  } catch {
    return null;
  }
}

/**
 * Verify token dùng cho Edge Runtime (middleware)
 * Chỉ dùng jose, không cần Node.js APIs
 */
export async function verifyTokenEdge(token: string): Promise<AdminJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as AdminJWTPayload;
  } catch {
    return null;
  }
}

// ============================================
// COOKIE OPERATIONS
// ============================================

/**
 * Set JWT token vào httpOnly cookie
 */
export async function setTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,                    // JS không đọc được
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
    sameSite: 'lax',                   // Chống CSRF
    path: '/',
    maxAge: 8 * 60 * 60,              // 8 giờ (seconds)
  });
}

/**
 * Lấy token từ cookie
 */
export async function getTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(TOKEN_COOKIE_NAME);
  return cookie?.value ?? null;
}

/**
 * Xoá token cookie (đăng xuất)
 */
export async function clearTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,  // Xoá ngay
  });
}

// ============================================
// LOGIN / LOGOUT
// ============================================

/**
 * Xử lý đăng nhập admin
 * Bao gồm: kiểm tra khoá, verify password, cập nhật attempts, tạo JWT
 */
export async function loginAdmin(
  username: string,
  password: string
): Promise<LoginResult> {
  const supabase = await createClient();

  // 1. Tìm admin theo username (chưa bị xoá)
  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('username', username)
    .eq('is_deleted', false)
    .single();

  if (error || !admin) {
    // Không tiết lộ username có tồn tại hay không (chống enumeration)
    return { success: false, error: 'Tên đăng nhập hoặc mật khẩu không đúng' };
  }

  // 2. Kiểm tra tài khoản có bị vô hiệu hoá
  if (!admin.is_active) {
    return { success: false, error: 'Tài khoản đã bị vô hiệu hoá' };
  }

  // 3. Kiểm tra tài khoản có đang bị khoá
  if (admin.locked_until) {
    const lockExpiry = new Date(admin.locked_until);
    if (lockExpiry > new Date()) {
      return {
        success: false,
        error: `Tài khoản tạm khoá. Thử lại sau ${LOCK_DURATION_MINUTES} phút.`,
        lockedUntil: admin.locked_until,
      };
    }
    // Đã hết thời gian khoá → reset
    await supabase
      .from('admins')
      .update({ failed_login_attempts: 0, locked_until: null })
      .eq('admin_id', admin.admin_id);
  }

  // 4. Verify password bằng bcrypt
  const passwordMatch = await verifyPassword(password, admin.password_hash);

  if (!passwordMatch) {
    // Tăng failed_login_attempts
    const newAttempts = (admin.failed_login_attempts || 0) + 1;
    const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;

    const updateData: Record<string, unknown> = {
      failed_login_attempts: newAttempts,
    };

    // Khoá tài khoản nếu >= 5 lần sai
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + LOCK_DURATION_MINUTES);
      updateData.locked_until = lockUntil.toISOString();
    }

    await supabase
      .from('admins')
      .update(updateData)
      .eq('admin_id', admin.admin_id);

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      return {
        success: false,
        error: `Sai mật khẩu quá ${MAX_LOGIN_ATTEMPTS} lần. Tài khoản tạm khoá ${LOCK_DURATION_MINUTES} phút.`,
        remainingAttempts: 0,
      };
    }

    return {
      success: false,
      error: 'Tên đăng nhập hoặc mật khẩu không đúng',
      remainingAttempts: remaining > 0 ? remaining : 0,
    };
  }

  // 5. Đăng nhập thành công → Reset attempts + tạo JWT
  await supabase
    .from('admins')
    .update({ failed_login_attempts: 0, locked_until: null })
    .eq('admin_id', admin.admin_id);

  const token = await signToken({
    adminId: admin.admin_id,
    username: admin.username,
    role: admin.role,
  });

  await setTokenCookie(token);

  return { success: true };
}

/**
 * Đăng xuất admin
 */
export async function logoutAdmin(): Promise<void> {
  await clearTokenCookie();
}

/**
 * Lấy thông tin admin hiện tại từ cookie
 * Trả về null nếu chưa đăng nhập hoặc token hết hạn
 */
export async function getCurrentAdmin(): Promise<AdminJWTPayload | null> {
  const token = await getTokenFromCookie();
  if (!token) return null;
  return verifyToken(token);
}

// ============================================
// PASSWORD MANAGEMENT
// ============================================

/**
 * Đổi mật khẩu admin
 * Yêu cầu mật khẩu cũ để xác thực
 */
export async function changePassword(
  adminId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Lấy password_hash hiện tại
  const { data: admin } = await supabase
    .from('admins')
    .select('password_hash')
    .eq('admin_id', adminId)
    .eq('is_deleted', false)
    .single();

  if (!admin) {
    return { success: false, error: 'Không tìm thấy tài khoản' };
  }

  // Verify mật khẩu cũ
  const valid = await verifyPassword(currentPassword, admin.password_hash);
  if (!valid) {
    return { success: false, error: 'Mật khẩu hiện tại không đúng' };
  }

  // Validate mật khẩu mới
  if (newPassword.length < 8) {
    return { success: false, error: 'Mật khẩu mới phải có ít nhất 8 ký tự' };
  }

  // Hash và cập nhật
  const newHash = await hashPassword(newPassword);
  await supabase
    .from('admins')
    .update({ password_hash: newHash })
    .eq('admin_id', adminId);

  return { success: true };
}
