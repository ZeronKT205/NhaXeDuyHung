// ============================================
// INPUT VALIDATION & SANITIZATION
// Lớp 6: Validate + làm sạch dữ liệu trước khi vào DB
// ============================================

// ============================================
// SANITIZATION
// ============================================

/**
 * Loại bỏ HTML tags khỏi string (chống XSS)
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Trim và loại bỏ ký tự đặc biệt nguy hiểm
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Sanitize toàn bộ object (recursive)
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    if (typeof result[key] === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeString(result[key] as string);
    }
  }
  return result;
}

// ============================================
// PHONE VALIDATION
// ============================================

/**
 * Validate số điện thoại Việt Nam
 * Hỗ trợ: 0xxx, +84xxx, 84xxx
 */
export function isValidVietnamesePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s.-]/g, '');
  return /^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/.test(cleaned);
}

/**
 * Chuẩn hoá số điện thoại về format 0xxx
 */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s.-]/g, '');
  if (cleaned.startsWith('+84')) return '0' + cleaned.slice(3);
  if (cleaned.startsWith('84') && cleaned.length === 11) return '0' + cleaned.slice(2);
  return cleaned;
}

// ============================================
// EMAIL VALIDATION
// ============================================

/**
 * Validate email cơ bản
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// DATE VALIDATION
// ============================================

/**
 * Kiểm tra ngày có phải format YYYY-MM-DD hợp lệ
 */
export function isValidDate(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Kiểm tra ngày không phải trong quá khứ
 */
export function isNotPastDate(dateStr: string): boolean {
  const inputDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate >= today;
}

// ============================================
// PASSWORD VALIDATION
// ============================================

export interface PasswordStrength {
  valid: boolean;
  errors: string[];
}

/**
 * Kiểm tra độ mạnh mật khẩu
 * - Ít nhất 8 ký tự
 * - Có chữ hoa
 * - Có chữ thường
 * - Có số
 */
export function validatePassword(password: string): PasswordStrength {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ số');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// GENERIC VALIDATORS
// ============================================

/**
 * Kiểm tra giá trị bắt buộc
 */
export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

/**
 * Kiểm tra số dương
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0 && isFinite(value);
}

/**
 * Kiểm tra integer dương
 */
export function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

// ============================================
// BOOKING FORM VALIDATION
// ============================================

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate toàn bộ form đặt vé
 */
export function validateBookingForm(data: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  package_id: number;
  pickup_address: string;
  dropoff_address: string;
  departure_date: string;
  passenger_count: number;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isRequired(data.customer_name)) {
    errors.push({ field: 'customer_name', message: 'Vui lòng nhập họ và tên' });
  }

  if (!isRequired(data.customer_phone)) {
    errors.push({ field: 'customer_phone', message: 'Vui lòng nhập số điện thoại' });
  } else if (!isValidVietnamesePhone(data.customer_phone)) {
    errors.push({ field: 'customer_phone', message: 'Số điện thoại không hợp lệ' });
  }

  if (data.customer_email && !isValidEmail(data.customer_email)) {
    errors.push({ field: 'customer_email', message: 'Email không hợp lệ' });
  }

  if (!isPositiveInteger(data.package_id)) {
    errors.push({ field: 'package_id', message: 'Vui lòng chọn gói dịch vụ' });
  }

  if (!isRequired(data.pickup_address)) {
    errors.push({ field: 'pickup_address', message: 'Vui lòng nhập địa chỉ đón' });
  }

  if (!isRequired(data.dropoff_address)) {
    errors.push({ field: 'dropoff_address', message: 'Vui lòng nhập địa chỉ trả' });
  }

  if (!isValidDate(data.departure_date)) {
    errors.push({ field: 'departure_date', message: 'Ngày đi không hợp lệ' });
  } else if (!isNotPastDate(data.departure_date)) {
    errors.push({ field: 'departure_date', message: 'Ngày đi không thể là ngày trong quá khứ' });
  }

  if (!isPositiveInteger(data.passenger_count)) {
    errors.push({ field: 'passenger_count', message: 'Số hành khách phải lớn hơn 0' });
  }

  return errors;
}
