import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash password với bcrypt (12 rounds)
 * Dùng khi tạo hoặc đổi mật khẩu admin
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * So sánh mật khẩu người dùng nhập với hash trong DB
 * Timing-safe comparison (chống timing attack)
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
