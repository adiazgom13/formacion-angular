import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CarsService } from './car.service';
import { CarsResponse } from '../interfaces/cars.interface';

describe('CarsService', () => {
  let service: CarsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CarsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('obtiene coches con filtros y paginación', () => {
    const response: CarsResponse = {
      items: [],
      meta: {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 10,
        totalPages: 0,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    service.getCars({
      page: 1,
      limit: 10,
      brandId: 'brand-1',
      modelId: 'model-2',
      sortBy: 'brand',
      sortOrder: 'asc',
    }).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne((request) =>
      request.url === 'api/cars' &&
      request.params.get('page') === '1' &&
      request.params.get('limit') === '10' &&
      request.params.get('brandId') === 'brand-1' &&
      request.params.get('modelId') === 'model-2' &&
      request.params.get('sortBy') === 'brand' &&
      request.params.get('sortOrder') === 'asc',
    );

    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('obtiene un coche por ID', () => {
    service.getCarById('car-1').subscribe((car) => {
      expect(car.id).toBe('car-1');
    });

    const req = httpMock.expectOne('api/cars/car-1');
    expect(req.request.method).toBe('GET');
    req.flush({
      id: 'car-1',
      brand: { id: 'brand-1', name: 'Toyota' },
      model: { id: 'model-1', name: 'Corolla' },
      total: 1,
    });
  });

  it('envía una actualización con PUT al endpoint del coche', () => {
    const payload = {
      brandId: 'brand-1',
      modelId: 'model-1',
      carDetails: [],
    };

    service.updateCar('car-1', payload).subscribe();

    const req = httpMock.expectOne('api/cars/car-1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({
      id: 'car-1',
      brand: { id: 'brand-1', name: 'Toyota' },
      model: { id: 'model-1', name: 'Corolla' },
      total: 1,
    });
  });

  it('exporta el listado como Blob con los filtros activos', () => {
    const file = new Blob(['datos de Excel']);

    service.ExportCarTable({
      page: 2,
      limit: 10,
      brandId: 'brand-1',
      sortBy: 'brand',
      sortOrder: 'desc',
    }).subscribe((result) => {
      expect(result).toBe(file);
    });

    const req = httpMock.expectOne((request) =>
      request.url === 'api/cars/export/excel' &&
      request.params.get('page') === '2' &&
      request.params.get('limit') === '10' &&
      request.params.get('brandId') === 'brand-1' &&
      request.params.get('sortBy') === 'brand' &&
      request.params.get('sortOrder') === 'desc',
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(file);
  });
});
