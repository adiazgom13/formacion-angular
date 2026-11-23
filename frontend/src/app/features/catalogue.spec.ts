import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CatalogueComponent } from './catalogue';
import { CarsResponse } from '../core/interfaces/cars.interface';
import { AuthService } from '../core/services/auth.service';
import { BrandService } from '../core/services/brand.service';
import { CarsService } from '../core/services/car.service';
import { LoadingService } from '../core/services/loading.service';
import { NavbarComponent } from '../shared/navbar/navbar';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: '',
})
class NavbarStub {}

describe('CatalogueComponent', () => {
  let response: Subject<CarsResponse>;
  let carsService: { getCars: ReturnType<typeof vi.fn> };
  let loading: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    response = new Subject<CarsResponse>();
    loading = signal(false);

    carsService = {
      getCars: vi.fn(() => response.asObservable()),
    };

    await TestBed.configureTestingModule({
      imports: [CatalogueComponent],
      providers: [
        provideRouter([
          { path: 'catalogue', component: CatalogueComponent },
        ]),
        { provide: CarsService, useValue: carsService },
        {
          provide: BrandService,
          useValue: {
            getBrands: vi.fn(() => of([])),
            getBrandModels: vi.fn(() => of([])),
          },
        },
        { provide: AuthService, useValue: { user: signal(null) } },
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
      .overrideComponent(CatalogueComponent, {
        remove: { imports: [NavbarComponent] },
        add: { imports: [NavbarStub] },
      })
      .compileComponents();
  });

  it('loads and displays the catalogue', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/catalogue', CatalogueComponent);

    expect(carsService.getCars).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      brandId: undefined,
      modelId: undefined,
      sortBy: 'brand',
      sortOrder: 'asc',
    });
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
        itemsPerPage: 10,
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

  it('displays a loading error', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/catalogue', CatalogueComponent);

    response.error({
      code: 'SERVER_ERROR',
      userMessage: 'No se pudo cargar el catálogo.',
    });
    harness.detectChanges();

    const text = harness.routeNativeElement?.textContent ?? '';
    expect(text).toContain('No se pudo cargar el catálogo.');
    expect(text).not.toContain('Cargando coches...');
  });
});
