import { toast } from "sonner";

interface ToastRateLimiterOptions {
  cooldown?: number;
  maxToasts?: number;
}

class ToastRateLimiter {
  private toastCache = new Map<string, number[]>();
  private defaultCooldown = 2000;

  private createKey(type: string, message: string): string {
    return `${type}:${message}`;
  }

  private shouldShow(
    key: string,
    cooldown: number,
    maxToasts: number,
  ): boolean {
    const now = Date.now();
    const timestamps = this.toastCache.get(key) || [];

    // Remove timestamps outside the cooldown window
    const validTimestamps = timestamps.filter((t) => now - t < cooldown);

    // Check if we've reached the maximum number of toasts
    if (validTimestamps.length >= maxToasts) {
      return false;
    }

    // Add current timestamp and update cache
    validTimestamps.push(now);
    this.toastCache.set(key, validTimestamps);

    return true;
  }

  private cleanup(cooldown: number): void {
    const now = Date.now();
    for (const [key, timestamps] of this.toastCache.entries()) {
      const validTimestamps = timestamps.filter((t) => now - t < cooldown);
      if (validTimestamps.length === 0) {
        this.toastCache.delete(key);
      } else {
        this.toastCache.set(key, validTimestamps);
      }
    }
  }

  success(
    message: string,
    options?: ToastRateLimiterOptions & Parameters<typeof toast.success>[1],
  ): void {
    const {
      cooldown = this.defaultCooldown,
      maxToasts = 1,
      ...toastOptions
    } = options || {};
    const key = this.createKey("success", message);

    if (this.shouldShow(key, cooldown, maxToasts)) {
      toast.success(message, toastOptions);
      this.cleanup(cooldown);
    }
  }

  error(
    message: string,
    options?: ToastRateLimiterOptions & Parameters<typeof toast.error>[1],
  ): void {
    const {
      cooldown = this.defaultCooldown,
      maxToasts = 1,
      ...toastOptions
    } = options || {};
    const key = this.createKey("error", message);

    if (this.shouldShow(key, cooldown, maxToasts)) {
      toast.error(message, toastOptions);
      this.cleanup(cooldown);
    }
  }

  warning(
    message: string,
    options?: ToastRateLimiterOptions & Parameters<typeof toast.warning>[1],
  ): void {
    const {
      cooldown = this.defaultCooldown,
      maxToasts = 1,
      ...toastOptions
    } = options || {};
    const key = this.createKey("warning", message);

    if (this.shouldShow(key, cooldown, maxToasts)) {
      toast.warning(message, toastOptions);
      this.cleanup(cooldown);
    }
  }

  info(
    message: string,
    options?: ToastRateLimiterOptions & Parameters<typeof toast.info>[1],
  ): void {
    const {
      cooldown = this.defaultCooldown,
      maxToasts = 1,
      ...toastOptions
    } = options || {};
    const key = this.createKey("info", message);

    if (this.shouldShow(key, cooldown, maxToasts)) {
      toast.info(message, toastOptions);
      this.cleanup(cooldown);
    }
  }

  message(
    message: string,
    options?: ToastRateLimiterOptions & Parameters<typeof toast>[1],
  ): void {
    const {
      cooldown = this.defaultCooldown,
      maxToasts = 1,
      ...toastOptions
    } = options || {};
    const key = this.createKey("message", message);

    if (this.shouldShow(key, cooldown, maxToasts)) {
      toast(message, toastOptions);
      this.cleanup(cooldown);
    }
  }

  clear(): void {
    this.toastCache.clear();
  }
}

export const rateLimitedToast = new ToastRateLimiter();

export const rToast = rateLimitedToast;
