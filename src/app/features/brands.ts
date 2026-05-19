import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BrandService } from '../core/services/brand.services';
import { Brand, Model } from '../core/interfaces/cars.interface';
import { NavbarComponent } from '../shared/navbar';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './brands.html',
  styleUrls: ['./brands.css'],
})
export class BrandsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private brandService = inject(BrandService);

  brands = signal<Brand[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  models = signal<Model[]>([]);
  loadingModels = signal(false);
  selectedBrand = signal<Brand | null>(null);
  modelsError = signal<string | null>(null);
  

  ngOnInit(): void {
    this.loadBrands();
  }
    
  private loadBrands() {
    this.loading.set(true);
    this.error.set(null);

    this.brandService.getBrands().subscribe({
    next: (brands) => {
      this.brands.set(brands);
      this.loading.set(false);
    },
    error: () => {
      this.error.set('Error loading brands');
      this.loading.set(false);
    },
  });
  }

  loadModelsForBrand(brand: Brand) {
    this.selectedBrand.set(brand);
    this.loadingModels.set(true);
    this.modelsError.set(null);
    this.models.set([]);

    this.brandService.getBrandModels(brand.id).subscribe({
      next: (models) => {
        this.models.set(models);
        this.loadingModels.set(false);
      },
      error: () => {
        this.modelsError.set('Error loading models');
        this.loadingModels.set(false);
      },
    });
  }
}
  
