import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../shared/navbar';
import { CarsService } from '../core/services/car.services';
import { Car, CarsResponse, CarsMeta } from '../core/interfaces/cars.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './catalogue.html',
  styleUrls: ['./catalogue.css'],
})
export class CatalogueComponent implements OnInit {
  private carsService = inject(CarsService);
  private router = inject(Router)

  cars = signal<Car[]>([]);
  meta = signal<CarsMeta | null>(null);

  // filtros / ordenación que sí controlas desde el cliente
  brandId = signal<string | undefined>(undefined);
  modelId = signal<string | undefined>(undefined);
  sortBy = signal('brand');
  sortOrder = signal<'asc' | 'desc'>('asc');

  loading = signal(false);
  error = signal<string | null>(null);

  // derivados a partir de meta
  totalItems = computed(() => this.meta()?.totalItems ?? 0);
  currentPage = computed(() => this.meta()?.currentPage ?? 1);
  itemsPerPage = computed(() => this.meta()?.itemsPerPage ?? 0);
  totalPages = computed(() => this.meta()?.totalPages ?? 0);
  hasNextPage = computed(() => this.meta()?.hasNextPage ?? false);
  hasPreviousPage = computed(() => this.meta()?.hasPreviousPage ?? false);

  ngOnInit(): void {
    this.loadCars(2);
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

  goToCar(carId: string): void {
    if (!carId) {
      console.warn('No car id provided');
      return;
    }
    this.router.navigate(['/car', carId]);
  }

}