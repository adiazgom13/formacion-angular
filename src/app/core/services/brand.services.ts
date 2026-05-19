import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Brand, Model } from '../interfaces/cars.interface';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'api/brands';

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(this.baseUrl);
  }

  getBrandById(id: string): Observable<Brand> {
    return this.http.get<Brand>(`${this.baseUrl}/${id}`);
  }

  getBrandModels(brandId: string): Observable<Model[]> {
  return this.http.get<Model[]>(`${this.baseUrl}/${brandId}/models`);
  }
}