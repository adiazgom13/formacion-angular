import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HomeComponent } from './home';
import { CarsResponse } from '../core/interfaces/cars.interface';
import { CarsService } from '../core/services/car.service';
import { LoadingService } from '../core/services/loading.service';
import { NavbarComponent } from '../shared/navbar/navbar';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: '',
})
class NavbarStub {}

describe('HomeComponent', () => {
  let response: Subject<CarsResponse>;
  let getCars: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    response = new Subject<CarsResponse>();
    getCars = vi.fn(() => response.asObservable());

    const loading = signal(false);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([{ path: 'home', component: HomeComponent }]),
        { provide: CarsService, useValue: { getCars } },
        {
          provide: LoadingService,
          useValue: {
            loading,
            start: vi.fn(() => loading.set(true)),
            stop: vi.fn(() => loading.set(false)),
          },
        },
      ],
    })
      .overrideComponent(HomeComponent, {
        remove: { imports: [NavbarComponent] },
        add: { imports: [NavbarStub] },
      })
      .compileComponents();
  });

  it('loads and displays cars', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/home', HomeComponent);

    expect(getCars).toHaveBeenCalledWith({ page: 1, limit: 5 });
    expect(harness.routeNativeElement?.textContent)
      .toContain('Cargando coches...');

    response.next({
      items: [{
        id: 'car-1',
        brand: { id: 'brand-1', name: 'Toyota' },
        model: { id: 'model-1', name: 'Corolla' },
        total: 1,
      }],
      meta: {
        totalItems: 1,
        itemCount: 1,
        itemsPerPage: 5,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
    response.complete();
    harness.detectChanges();

    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Toyota');
    expect(text).toContain('Corolla');
    expect(text).not.toContain('Cargando coches...');
  });

  it('shows the empty state', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/home', HomeComponent);

    response.next({
      items: [],
      meta: {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 5,
        totalPages: 0,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
    response.complete();
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent)
      .toContain('No hay coches para mostrar.');
  });

  it('shows an error when loading fails', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/home', HomeComponent);

    response.error({
      code: 'SERVER_ERROR',
      userMessage: 'Error del servidor.',
    });
    harness.detectChanges();

    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('Error al cargar la lista de coches.');
    expect(text).not.toContain('Cargando coches...');
  });
});
