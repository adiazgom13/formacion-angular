import { Injectable, computed, signal } from '@angular/core';

/**
 * Global loading state using a reference counter (Angular v20-friendly).
 *
 * Anti-flicker behavior:
 * - showDelayMs: the overlay won't show if the operation finishes quickly
 * - minVisibleMs: once visible, keep it visible for a minimum time
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly counter = signal(0);

  private readonly visible = signal(false);
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private minVisibleTimer: ReturnType<typeof setTimeout> | null = null;
  private minVisibleUntil = 0;

  readonly showDelayMs = 200;
  readonly minVisibleMs = 400;

  private readonly hasPending = computed(() => this.counter() > 0);
  readonly loading = computed(() => this.visible());

  start(): void {
    this.counter.update((n) => n + 1);
    this.syncVisibility();
  }

  stop(): void {
    this.counter.update((n) => Math.max(0, n - 1));
    this.syncVisibility();
  }

  /** Safety valve: resets the counter to 0 and hides the overlay. */
  reset(): void {
    this.counter.set(0);
    this.clearTimers();
    this.visible.set(false);
  }

  private syncVisibility(): void {
    if (this.hasPending()) {
      if (this.visible()) {
        this.extendMinVisibleWindow();
        return;
      }
      if (this.showTimer) return;

      this.showTimer = setTimeout(() => {
        this.showTimer = null;

        if (this.hasPending()) {
          this.visible.set(true);
          this.extendMinVisibleWindow();
        }
      }, this.showDelayMs);

      return;
    }

    // no pending requests: hide (respect minVisible window if currently visible)
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }

    if (!this.visible()) return;

    const now = Date.now();
    const remaining = this.minVisibleUntil - now;

    if (remaining <= 0) {
      this.clearMinVisibleTimer();
      this.visible.set(false);
      return;
    }

    // delay hiding until minimum visibility time is satisfied
    if (!this.minVisibleTimer) {
      this.minVisibleTimer = setTimeout(() => {
        this.minVisibleTimer = null;
        // only hide if nothing pending
        if (!this.hasPending()) {
          this.visible.set(false);
        }
      }, remaining);
    }
  }

  private extendMinVisibleWindow(): void {
    this.minVisibleUntil = Date.now() + this.minVisibleMs;
    this.clearMinVisibleTimer();
  }

  private clearMinVisibleTimer(): void {
    if (this.minVisibleTimer) {
      clearTimeout(this.minVisibleTimer);
      this.minVisibleTimer = null;
    }
  }

  private clearTimers(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    this.clearMinVisibleTimer();
    this.minVisibleUntil = 0;
  }
}
