import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// ============================================
// LỚP 2: MIDDLEWARE ROUTE GUARD
// Edge Runtime — chỉ dùng jose (không dùng Node.js APIs)
// ============================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production-!@#$%'
);
const TOKEN_COOKIE_NAME = 'admin_token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ============================================
  // 1. Admin routes (đòi hỏi đăng nhập)
  // ============================================
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

    // Không có token → redirect login
    if (!token) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token ở Edge Runtime
    try {
      await jwtVerify(token, JWT_SECRET);
      // Token hợp lệ → cho qua
      return NextResponse.next();
    } catch {
      // Token hết hạn hoặc không hợp lệ → xoá cookie + redirect login
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('expired', '1');

      const response = NextResponse.redirect(loginUrl);
      response.cookies.set(TOKEN_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      return response;
    }
  }

  // ============================================
  // 2. Alias /admin/login sang /login
  // ============================================
  if (pathname === '/admin/login') {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // ============================================
  // 3. Admin login page — nếu đã đăng nhập thì redirect về dashboard
  // ============================================
  if (pathname === '/login') {
    const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        // Đã đăng nhập → redirect về admin dashboard
        const adminUrl = request.nextUrl.clone();
        adminUrl.pathname = '/admin';
        return NextResponse.redirect(adminUrl);
      } catch {
        // Token không hợp lệ → cho xem login page
      }
    }
  }

  // ============================================
  // 3. Mọi route khác → cho qua (Landing Page)
  // ============================================
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match tất cả paths trừ:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
