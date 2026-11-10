import { Component, inject, computed, signal } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute  } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar';
import { CarsService } from '../core/services/car.service';
import { Car, CarsMeta } from '../core/interfaces/cars.interface';
import { LoadingService } from '../core/services/loading.service';
import { AppError } from '../core/errors/app-error.model';


@Component({
  selector: 'app-home',
  imports: [RouterOutlet,NavbarComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  cars: Car[] = [];
  loadError: AppError | null = null;

  private readonly carsService = inject(CarsService);
  private readonly router = inject(Router);
  private readonly loadingService = inject(LoadingService);
  private readonly route = inject(ActivatedRoute);

  meta = signal<CarsMeta | null>(null);
  currentPage = computed(() => this.meta()?.currentPage ?? 1)
  totalPages = computed(() => this.meta()?.totalPages ?? 0);
  hasNextPage = computed(() => this.meta()?.hasNextPage ?? false);
  hasPreviousPage = computed(() => this.meta()?.hasPreviousPage ?? false);

  readonly loading = this.loadingService.loading;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const page = Number(params['page'] || 1);
      this.loadCars(page);
  });
  }

  goToCar(carId: string): void {
    this.router.navigate(['/car', carId]);
  }

  loadCars(page: number): void {
    this.loadError = null;
    this.loadingService.start();
    this.carsService.getCars({ page: page, limit: 5 }).subscribe({
      next: (res) => {
        this.cars = res.items;
        this.meta.set(res.meta);
        this.loadingService.stop();
      },
      error: (e: AppError) => {
        this.loadError = e;
        console.error('Error cargando la lista de coches', e);
        this.loadingService.stop();
      },
    });
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.router.navigate([], {
        queryParams: { page: this.currentPage() + 1 },
        queryParamsHandling: 'merge',
      });
    }
  }

  prevPage(): void {
    if (this.hasPreviousPage()) {
      this.router.navigate([], {
        queryParams: { page: this.currentPage() - 1 },
        queryParamsHandling: 'merge',
      });
    }
  }

}
