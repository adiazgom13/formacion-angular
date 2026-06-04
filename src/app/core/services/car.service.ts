import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Car,
  CarDocument,
  CarsResponse,
  CarDetails,
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
  
  postCar(payload: {
    brandId: string;
    modelId: string;
    carDetails: CarDetails[];
  }): Observable<Car> {
    return this.http.post<Car>(this.baseUrl, payload);
  }

  ExportCarTable(options: {
    page: number;
    limit: number;
    brandId?: string;
    modelId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Observable<Blob> {
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

    return this.http.get(`${this.baseUrl}/export/excel`, {
      params,
      responseType: 'blob',
    });
  
  }
  getCarById(id: string): Observable<Car> {
    return this.http.get<Car>(`${this.baseUrl}/${id}`);
  }

  updateCar(
    id: string,
    payload: {
      brandId: string;
      modelId: string;
      carDetails: CarDetails[];
    }
  ): Observable<Car> {
    return this.http.put<Car>(`${this.baseUrl}/${id}`, payload);
  }

  DeleteCar(id: string): Observable<Car> {
    return this.http.delete<Car>(`${this.baseUrl}/${id}`);
  }

 
  getCarDocument(id: string): Observable<CarDocument> {
    return this.http.get<CarDocument>(`${this.baseUrl}/${id}/document`);
  }

  DeleteCarDocument(id: string): Observable<CarDocument> {
    return this.http.delete<CarDocument>(`${this.baseUrl}/${id}/document`);
  }

  PostCarDocument(id: string, formData: FormData): Observable<CarDocument> {
  return this.http.post<CarDocument>(`${this.baseUrl}/${id}/document`, formData);
}

  DownloadCarDocument(id: string): Observable<CarDocument> {
    return this.http.get<CarDocument>(`${this.baseUrl}/${id}/document/download`);
  }

}
