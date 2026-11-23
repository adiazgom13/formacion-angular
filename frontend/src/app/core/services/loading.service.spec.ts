import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [LoadingService],
    });

    service = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    service.reset();
    vi.useRealTimers();
  });

  it('muestra el overlay solo después del retardo configurado', () => {
    service.start();

    expect(service.loading()).toBe(false);

    vi.advanceTimersByTime(service.showDelayMs - 1);
    expect(service.loading()).toBe(false);

    vi.advanceTimersByTime(1);
    expect(service.loading()).toBe(true);
  });

  it('no muestra el overlay si la operación acaba rápidamente', () => {
    service.start();

    vi.advanceTimersByTime(service.showDelayMs - 1);
    service.stop();

    vi.advanceTimersByTime(service.showDelayMs);
    expect(service.loading()).toBe(false);
  });

  it('mantiene el estado activo mientras haya operaciones pendientes', () => {
    service.start();
    service.start();

    vi.advanceTimersByTime(service.showDelayMs);
    expect(service.loading()).toBe(true);

    service.stop();
    expect(service.loading()).toBe(true);

    service.stop();
    vi.advanceTimersByTime(service.minVisibleMs);

    expect(service.loading()).toBe(false);
  });

  it('mantiene visible el overlay durante el mínimo configurado', () => {
    service.start();
    vi.advanceTimersByTime(service.showDelayMs);

    expect(service.loading()).toBe(true);

    service.stop();

    vi.advanceTimersByTime(service.minVisibleMs - 1);
    expect(service.loading()).toBe(true);

    vi.advanceTimersByTime(1);
    expect(service.loading()).toBe(false);
  });

  it('reset oculta el overlay y cancela su aparición pendiente', () => {
    service.start();
    service.reset();

    vi.advanceTimersByTime(service.showDelayMs);
    expect(service.loading()).toBe(false);
  });

  it('reset oculta inmediatamente un overlay que ya estaba visible', () => {
    service.start();
    vi.advanceTimersByTime(service.showDelayMs);

    expect(service.loading()).toBe(true);

    service.reset();

    expect(service.loading()).toBe(false);
  });

  it('evita que stop sin start haga negativo el contador interno', () => {
    service.stop();

    service.start();
    vi.advanceTimersByTime(service.showDelayMs);

    expect(service.loading()).toBe(true);

    service.stop();
    vi.advanceTimersByTime(service.minVisibleMs);

    expect(service.loading()).toBe(false);
  });
});
