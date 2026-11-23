import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CarComponent } from './car';
import { Car } from '../core/interfaces/cars.interface';
import { AuthService } from '../core/services/auth.service';
import { CarsService } from '../core/services/car.service';
import { ToastService } from '../core/services/toast.service';
import { NavbarComponent } from '../shared/navbar/navbar';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: '',
})
class NavbarStub {}

describe('CarComponent', () => {
  let response: Subject<Car>;
  let carsService: { getCarById: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    response = new Subject<Car>();
    carsService = {
      getCarById: vi.fn(() => response.asObservable()),
    };

    await TestBed.configureTestingModule({
      imports: [CarComponent],
      providers: [
        provideRouter([{ path: 'car/:id', component: CarComponent }]),
        { provide: CarsService, useValue: carsService },
        { provide: AuthService, useValue: { user: signal(null) } },
        { provide: ToastService, useValue: { show: vi.fn() } },
      ],
    })
      .overrideComponent(CarComponent, {
        remove: { imports: [NavbarComponent] },
        add: { imports: [NavbarStub] },
      })
      .compileComponents();
  });

  it('shows loading, then displays the requested car', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/car/car-1', CarComponent);

    expect(carsService.getCarById).toHaveBeenCalledWith('car-1');
    expect(harness.routeNativeElement?.textContent)
      .toContain('Cargando vehículo...');

    response.next({
      id: 'car-1',
      brand: { id: 'brand-1', name: 'Toyota' },
      model: { id: 'model-1', name: 'Corolla' },
      total: 0,
      carDetails: [],
    });
    response.complete();
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('Toyota Corolla');
    expect(harness.routeNativeElement?.textContent)
      .not.toContain('Cargando vehículo...');
  });

  it('displays the error returned by the service', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/car/car-1', CarComponent);

    response.error({ code: 'NOT_FOUND', userMessage: 'Coche no encontrado' });
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent)
      .toContain('Coche no encontrado');
    expect(harness.routeNativeElement?.textContent)
      .not.toContain('Cargando vehículo...');
  });
});
