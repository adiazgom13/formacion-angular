import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Car,
  CarsResponse,
} from '../interfaces/cars.interface';

@Injectable({
  providedIn: 'root',
})
export class CarsService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'api/cars';

  getCars(options: {
    page: number;
    limit: number;
    brandId?: string;
    modelId?: string;
    carId?:string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Observable<CarsResponse> {
    let params = new HttpParams()
      .set('page', options.page)
      .set('limit', options.limit);

    if (options.brandId) {
      params = params.set('brandId', options.brandId);
    }

    if (options.modelId) {
      params = params.set('modelId', options.modelId);
    }

    if (options.sortBy) {
      params = params.set('sortBy', options.sortBy);
    }

    if (options.sortOrder) {
      params = params.set('sortOrder', options.sortOrder);
    }

    return this.http.get<CarsResponse>(this.baseUrl, { params });
  }

  getCarById(id: string): Observable<Car> {
    return this.http.get<Car>(`${this.baseUrl}/${id}`);
  }
}