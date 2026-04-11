/**
 * 简单的内存速率限制器
 * 用于防止暴力破解和滥用
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// 清理过期条目（每10分钟）
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export interface RateLimitConfig {
  /** 时间窗口内最大请求数 */
  maxRequests: number;
  /** 时间窗口（毫秒） */
  windowMs: number;
}

/**
 * 检查是否超过速率限制
 * @param key 限制键（如 IP + 路径）
 * @param config 限制配置
 * @returns 是否允许请求，以及剩余次数和重置时间
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // 创建新条目
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  if (entry.count >= config.maxRequests) {
    // 超过限制
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // 增加计数
  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * 从请求中获取客户端标识
 * 支持代理情况下的 X-Forwarded-For
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}

/** 预设的速率限制配置 */
export const RATE_LIMITS = {
  /** 注册：每IP每小时5次 */
  REGISTER: { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  /** PIN验证：每用户每15分钟5次 */
  PIN_VERIFY: { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  /** 登录：每IP每15分钟10次 */
  LOGIN: { maxRequests: 10, windowMs: 15 * 60 * 1000 },
} as const;
