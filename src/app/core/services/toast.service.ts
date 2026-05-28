import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'info' | 'success' | 'error';

export interface ToastEvent {
  message: string;
  type: ToastType;
  durationMs: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastSubject = new Subject<ToastEvent>();
  readonly toast$ = this.toastSubject.asObservable();

  show(message: string, type: ToastType = 'info', durationMs = 3000): void {
    this.toastSubject.next({ message, type, durationMs });
  }
}
