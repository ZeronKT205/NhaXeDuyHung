// ============================================
// RATE LIMITER (In-Memory)
// Sử dụng sliding window algorithm
// Production: thay bằng Redis (ioredis/upstash)
// ============================================

interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix timestamp (ms)
}

// In-memory store - sẽ reset khi server restart
// Production: chuyển sang Redis / Upstash
const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(storeName: string): Map<string, RateLimitEntry> {
  if (!stores.has(storeName)) {
    stores.set(storeName, new Map());
  }
  return stores.get(storeName)!;
}

/**
 * Cleanup expired entries (chạy mỗi 5 phút)
 */
function cleanupStore(store: Map<string, RateLimitEntry>) {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

// Auto cleanup mỗi 5 phút
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    for (const store of stores.values()) {
      cleanupStore(store);
    }
  }, 5 * 60 * 1000);
}

// ============================================
// RATE LIMIT CHECK
// ============================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp (ms)
  retryAfterSeconds: number;
}

/**
 * Kiểm tra rate limit cho một key
 *
 * @param storeName - Tên store (VD: 'login', 'booking', 'api')
 * @param key - Unique key (VD: IP address, username)
 * @param maxAttempts - Số lần tối đa
 * @param windowMs - Thời gian reset (milliseconds)
 */
export function checkRateLimit(
  storeName: string,
  key: string,
  maxAttempts: number,
  windowMs: number
): RateLimitResult {
  const store = getStore(storeName);
  const now = Date.now();
  const entry = store.get(key);

  // Nếu chưa có entry hoặc đã hết window → reset
  if (!entry || entry.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetAt: now + windowMs,
      retryAfterSeconds: 0,
    };
  }

  // Nếu đã vượt quá limit
  if (entry.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterSeconds,
    };
  }

  // Tăng count
  entry.count += 1;
  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    resetAt: entry.resetAt,
    retryAfterSeconds: 0,
  };
}

/**
 * Reset rate limit cho một key
 * Dùng sau khi đăng nhập thành công
 */
export function resetRateLimit(storeName: string, key: string): void {
  const store = getStore(storeName);
  store.delete(key);
}

// ============================================
// PRE-CONFIGURED LIMITERS
// ============================================

/** Rate limit cho đăng nhập: 5 lần / 15 phút per IP */
export function checkLoginRateLimit(ip: string): RateLimitResult {
  return checkRateLimit('login-ip', ip, 5, 15 * 60 * 1000);
}

/** Rate limit cho đặt vé: 10 lần / 10 phút per IP */
export function checkBookingRateLimit(ip: string): RateLimitResult {
  return checkRateLimit('booking', ip, 10, 10 * 60 * 1000);
}

/** Rate limit tổng API: 100 lần / 1 phút per IP */
export function checkApiRateLimit(ip: string): RateLimitResult {
  return checkRateLimit('api', ip, 100, 60 * 1000);
}

// ============================================
// HELPER: Lấy IP từ headers
// ============================================

/**
 * Lấy client IP từ request headers
 * Hỗ trợ: X-Forwarded-For, X-Real-IP, hoặc fallback
 */
export function getClientIP(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headers.get('x-real-ip') || '127.0.0.1';
}
