import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // ============================================
  // LỚP 1: SECURITY HEADERS
  // Áp dụng cho mọi response từ server
  // ============================================
  async headers() {
    return [
      {
        // Áp dụng cho tất cả routes
        source: "/(.*)",
        headers: [
          {
            // Chống XSS: chỉ cho phép script/style từ nguồn tin cậy
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://*.tile.openstreetmap.org https://server.arcgisonline.com https://*.google.com https://*.googleapis.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-src 'self' https://www.google.com https://*.google.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          {
            // Bắt buộc HTTPS (1 năm, bao gồm subdomain)
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            // Chặn nhúng trang trong iframe (chống clickjacking)
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Chặn trình duyệt tự đoán MIME type
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Kiểm soát thông tin referrer gửi đi
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Giới hạn quyền truy cập hardware
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            // Bật XSS protection trên trình duyệt cũ
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
