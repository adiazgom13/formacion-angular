import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastEvent, ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.html',
  styleUrls: ['./toast-container.css'],
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toast = signal<ToastEvent | null>(null);

  private sub?: Subscription;
  private timeoutId: number | undefined;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.toast$.subscribe((evt) => {
      this.toast.set(evt);

      if (this.timeoutId) {
        window.clearTimeout(this.timeoutId);
      }

      this.timeoutId = window.setTimeout(() => {
        this.toast.set(null);
        this.timeoutId = undefined;
      }, evt.durationMs);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
  }

  close(): void {
    this.toast.set(null);
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}
