import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../shared/navbar';
import { CarsService } from '../core/services/car.services';
import { Car, Brand,Model, CarDetails, CarsResponse, CarsMeta } from '../core/interfaces/cars.interface';
import { Router } from '@angular/router';
import { BrandService } from '../core/services/brand.services';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './catalogue.html',
  styleUrls: ['./catalogue.css'],
})
export class CatalogueComponent implements OnInit {
  private carsService = inject(CarsService);
  private brandService = inject(BrandService);
  private router = inject(Router)

  cars = signal<Car[]>([]);
  meta = signal<CarsMeta | null>(null);
  brands = signal<Brand[]>([]);
  models = signal<Model[]>([]);

  // filtros
  brandId = signal<string | undefined>(undefined);
  modelId = signal<string | undefined>(undefined);
  sortBy = signal<string>('brand');
  sortOrder = signal<'asc' | 'desc' | undefined>('asc');
  //selección temporal antes de aplicar filtro
  uiBrandId = signal<string | undefined>(undefined);
  uiModelId = signal<string | undefined>(undefined);
  uiSortBy = signal<string>('brand');
  uiSortOrder = signal<'asc' | 'desc' | undefined>('asc');

  loading = signal(false);
  error = signal<string | null>(null);

  createModalOpen = signal(false);
  createLoading = signal(false);
  createError = signal<string | null>(null);

  totalItems = computed(() => this.meta()?.totalItems ?? 0);
  currentPage = computed(() => this.meta()?.currentPage ?? 1);
  itemsPerPage = computed(() => this.meta()?.itemsPerPage ?? 0);
  totalPages = computed(() => this.meta()?.totalPages ?? 0);
  hasNextPage = computed(() => this.meta()?.hasNextPage ?? false);
  hasPreviousPage = computed(() => this.meta()?.hasPreviousPage ?? false);

  newCarBrandId = signal<string>('');
  newCarModelId = signal<string>('');
  newCarRegistrationDate = signal<string>('');
  newCarMileage = signal<number | null>(null);
  newCarPrice = signal<number | null>(null);
  newCarManufactureYear = signal<number | null>(null);
  newCarCurrency = signal<string>('EUR');
  newCarAvailability = signal<boolean>(true);
  newCarColor = signal<string>('');
  newCarDescription = signal<string>('');
  newCarLicensePlate = signal<string>('');

  
  ngOnInit(): void {
    this.uiBrandId.set(this.brandId());
    this.uiModelId.set(this.modelId());
    this.uiSortBy.set(this.sortBy());
    this.uiSortOrder.set(this.sortOrder());

    this.loadBrands();
    this.loadCars(1);
  }

  clearFilters(): void {
    this.uiBrandId.set(undefined);
    this.uiModelId.set(undefined);
    this.uiSortBy.set('brand');
    this.uiSortOrder.set('asc');

    this.applyFilters();
  }

  applyFilters(): void {
    this.brandId.set(this.uiBrandId());
    this.modelId.set(this.uiModelId());
    this.sortBy.set(this.uiSortBy());
    this.sortOrder.set(this.uiSortOrder());

    // when filters change, reset to first page
    this.loadCars(1);
  }

  private loadBrands(): void {
    this.brandService.getBrands().subscribe({
      next: (brands) => this.brands.set(brands),
      error: (err) => {
        console.error('Error loading brands', err);
      },
    });
  }

  loadCars(page: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.carsService
      .getCars({
        page,
        limit: this.itemsPerPage() || 10, 
        brandId: this.brandId(),
        modelId: this.modelId(),
        sortBy: this.sortBy(),
        sortOrder: this.sortOrder(),
      })
      .subscribe({
        next: (res: CarsResponse) => {
          this.cars.set(res.items);
          this.meta.set(res.meta); 
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.error.set('Error cargando coches');
          this.loading.set(false);
        },
      });
  }

  // paginación usando meta del backend
  nextPage(): void {
    if (this.hasNextPage()) {
      this.loadCars(this.currentPage() + 1);
    }
  }

  prevPage(): void {
    if (this.hasPreviousPage()) {
      this.loadCars(this.currentPage() - 1);
    }
  }

  onNewCarBrandChange(brandId: string): void {
    this.newCarBrandId.set(brandId);
    this.newCarModelId.set('');    
    this.models.set([]);          

    if (!brandId) {
      return;
    }

    this.brandService.getBrandModels(brandId).subscribe({
      next: (models) => 
        this.models.set(models),
      error: (err) => {
        console.error('Error loading models for brand', brandId, err);
      },
    });
    console.log("brand models:",this.models)
  }

  openCreateModal(): void {
    this.newCarBrandId.set('');
    this.newCarModelId.set('');
    this.newCarRegistrationDate.set('');
    this.newCarMileage.set(null);
    this.newCarPrice.set(null);
    this.newCarManufactureYear.set(null);
    this.newCarCurrency.set('EUR');
    this.newCarAvailability.set(true);
    this.newCarColor.set('');
    this.newCarDescription.set('');
    this.newCarLicensePlate.set('');

    this.createError.set(null);
    this.createLoading.set(false);

    this.createModalOpen.set(true);
  }
  closeCreateModal(): void {
    this.createModalOpen.set(false);
  }


  createCar(): void {

    this.createLoading.set(true);
    this.createError.set(null);

    const registrationDate =new Date(this.newCarRegistrationDate()).toISOString()

    const payload = {
      brandId: this.newCarBrandId(),
      modelId: this.newCarModelId(),
      carDetails: [
        {
          availability: this.newCarAvailability(),
          currency: this.newCarCurrency(),
          licensePlate: this.newCarLicensePlate(),
          manufactureYear: this.newCarManufactureYear() ?? 0,
          mileage: this.newCarMileage() ?? 0,
          price: this.newCarPrice() ?? 0,
          registrationDate: registrationDate,
          color: this.newCarColor(),
          description: this.newCarDescription(),
        },
      ],
    };

    this.carsService.postCar(payload).subscribe({
      next: () => {
        this.createLoading.set(false);
        this.closeCreateModal();
        this.loadCars(1);
      },
      error: (err) => {
        console.error(err);
        this.createLoading.set(false);
        this.createError.set('Error creando el coche');
      },
    });
  }
  

  goToCar(carId: string): void {
    if (!carId) {
      console.warn('No car id provided');
      return;
    }
    this.router.navigate(['/car', carId]);
  }

}
