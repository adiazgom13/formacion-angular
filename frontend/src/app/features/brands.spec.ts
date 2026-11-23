import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BrandsComponent } from './brands';
import { BrandService } from '../core/services/brand.service';
import { Brand } from '../core/interfaces/cars.interface';
import { NavbarComponent } from '../shared/navbar/navbar';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: '',
})
class NavbarStub {}

describe('BrandsComponent', () => {
  let brandsResponse: Subject<Brand[]>;
  let brandService: {
    getBrands: ReturnType<typeof vi.fn>;
    getBrandModels: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    brandsResponse = new Subject<Brand[]>();
    brandService = {
      getBrands: vi.fn(() => brandsResponse.asObservable()),
      getBrandModels: vi.fn(() => of([])),
    };

    await TestBed.configureTestingModule({
      imports: [BrandsComponent],
      providers: [
        provideRouter([]),
        { provide: BrandService, useValue: brandService },
      ],
    })
      .overrideComponent(BrandsComponent, {
        remove: { imports: [NavbarComponent] },
        add: { imports: [NavbarStub] },
      })
      .compileComponents();
  });

  it('shows loading, then renders the returned brands', () => {
    const fixture = TestBed.createComponent(BrandsComponent);
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;

    expect(brandService.getBrands).toHaveBeenCalledOnce();
    expect(page.textContent).toContain('Cargando marcas...');

    brandsResponse.next([{ id: 'brand-1', name: 'Toyota' }]);
    brandsResponse.complete();
    fixture.detectChanges();

    expect(page.textContent).not.toContain('Cargando marcas...');
    expect(page.textContent).toContain('brand-1');
    expect(page.textContent).toContain('Toyota');
  });
});
