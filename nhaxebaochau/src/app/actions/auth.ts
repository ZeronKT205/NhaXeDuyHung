'use server';

import { loginAdmin, logoutAdmin } from '@/lib/auth';
import { checkLoginRateLimit, getClientIP } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export interface LoginActionResult {
  success: boolean;
  error?: string;
  remainingAttempts?: number;
}

export async function submitLogin(formData: FormData): Promise<LoginActionResult> {
  const username = (formData.get('username') as string || '').trim();
  const password = formData.get('password') as string || '';

  if (!username || !password) {
    return { success: false, error: 'Vui lòng nhập tên đăng nhập và mật khẩu' };
  }

  // Rate Limiting
  const headerStore = await headers();
  const ip = getClientIP(headerStore);
  const rateCheck = checkLoginRateLimit(ip);
  if (!rateCheck.allowed) {
    return {
      success: false,
      error: `Đăng nhập quá nhiều lần. Vui lòng thử lại sau ${rateCheck.retryAfterSeconds} giây.`,
    };
  }

  try {
    const res = await loginAdmin(username, password);
    return res;
  } catch (error) {
    console.error('Login action error:', error);
    return { success: false, error: 'Đã xảy ra lỗi hệ thống' };
  }
}

export async function handleLogout() {
  await logoutAdmin();
  redirect('/login');
}
