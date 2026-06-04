import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../shared/navbar';
import { CarsService } from '../core/services/car.service';
import { Car, Brand,Model, CarDetails, CarsResponse, CarsMeta } from '../core/interfaces/cars.interface';
import { Router } from '@angular/router';
import { BrandService } from '../core/services/brand.service';
import { FormsModule } from '@angular/forms';
import { AppError } from '../core/errors/app-error.model';
import { ToastService } from '../core/services/toast.service';


@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './catalogue.html',
  styleUrls: ['./catalogue.css'],
})
export class CatalogueComponent implements OnInit {
  private carsService = inject(CarsService);
  private brandService = inject(BrandService);
  private router = inject(Router)
  private toast = inject(ToastService);


  cars = signal<Car[]>([]);
  car = signal<Car | null>(null);
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

  detail = computed<CarDetails | null>(() => {
    const c = this.car();
    if (!c || !c.carDetails || c.carDetails.length === 0) {
      return null;
    }
    return c.carDetails[0];
  });

  modalMode = signal<'create' | 'edit'>('create');
  editingCarId = signal<string | null>(null);

  
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
      error: (e: AppError) => {
        console.error('Error cargando las marcas de coches', e);
        this.error.set(e.userMessage);
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
        error: (e: AppError) => {
          console.error('error cargando lista de coches', e);
          this.error.set(e.userMessage);
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
      error: (e: AppError)  => {
        console.error('Error cargando los modelos de la marca ', brandId, e);
        this.error.set(e.userMessage);
      },
    });
    console.log("brand models:",this.models)
  }

  openCreateModal(): void {

    this.modalMode.set('create');
    this.editingCarId.set(null);
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

    openEditModal(car: Car): void {

    this.modalMode.set('edit');
    this.editingCarId.set(car.id);
    this.createError.set(null);
    this.createLoading.set(true);

    this.carsService.getCarById(car.id).subscribe({
    next: (fullCar: Car) => {
      // Brand / model
      this.newCarBrandId.set(fullCar.brand?.id ?? '');
      this.newCarModelId.set(fullCar.model?.id ?? '');

      // Load models for brand, then set selected model
      const brandId = fullCar.brand?.id;
      if (brandId) {
        this.brandService.getBrandModels(brandId).subscribe({
          next: (models) => {
            this.models.set(models);
            this.newCarModelId.set(fullCar.model?.id ?? '');
          },
          error: (e: AppError) => {
            console.error('Error loading models for brand', brandId, e);
            this.error.set(e.userMessage);
            this.models.set([]);
          },
        });
      } else {
        this.models.set([]);
      }

      const d = fullCar.carDetails?.[0];

      this.newCarRegistrationDate.set(
        d?.registrationDate ? new Date(d.registrationDate).toISOString().slice(0, 10) : ''
      );
      this.newCarMileage.set(d?.mileage ?? null);
      this.newCarPrice.set(d?.price ?? null);
      this.newCarManufactureYear.set(d?.manufactureYear ?? null);
      this.newCarCurrency.set(d?.currency ?? 'EUR');
      this.newCarAvailability.set(d?.availability ?? false);
      this.newCarColor.set(d?.color ?? '');
      this.newCarDescription.set(d?.description ?? '');
      this.newCarLicensePlate.set(d?.licensePlate ?? '');

      this.createLoading.set(false);
      this.createModalOpen.set(true);
    },
    error: (e: AppError) => {
      console.error('Error editando coche con el id ', car.id, e);
      this.error.set(e.userMessage);
      this.createLoading.set(false);
      this.createError.set('Error editando coche');
      this.createModalOpen.set(true);
    },
  });
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
      error: (e: AppError) => {
        console.error('Error creando coche', e);
        this.error.set(e.userMessage);
        this.createLoading.set(false);
        this.createError.set('Error creando el coche');
      },
    });
  }
  updateCar(): void {
    const id = this.editingCarId();
    if (!id) {
      console.warn('No car id provided for update');
      return;
    }

    this.createLoading.set(true);
    this.createError.set(null);

    const registrationDate = new Date(this.newCarRegistrationDate()).toISOString();

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
          registrationDate,
          color: this.newCarColor(),
          description: this.newCarDescription(),
        },
      ],
    };

    this.carsService.updateCar(id, payload).subscribe({
      next: () => {
        this.createLoading.set(false);
        this.closeCreateModal();
        // recargar lista (puede ser currentPage o 1)
        this.loadCars(this.currentPage());
      },
      error: (e: AppError) => {
        console.error('Error actualizando el coche', this.car()?.id, e);
        this.error.set(e.userMessage);
        this.createLoading.set(false);
        this.createError.set('Error actualizando el coche');
      },
    });
  }
  
  submitCar(): void {
    if (this.modalMode() === 'create') {
      this.createCar();
      return;
    }
    else{
      console.log('edit car id:', this.editingCarId());
      this.updateCar()
    }
  }

  goToCar(carId: string): void {
    if (!carId) {
      console.warn('No car id provided');
      return;
    }
    this.router.navigate(['/car', carId]);
  }

}
