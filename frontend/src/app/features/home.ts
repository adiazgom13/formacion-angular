import { Component, inject} from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar';
import { CarsService } from '../core/services/car.service';
import { Car } from '../core/interfaces/cars.interface';
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

  readonly loading = this.loadingService.loading;

  ngOnInit(): void {
    this.loadError = null;
    this.loadingService.start();

    this.carsService.getCars({ page: 1, limit: 5 }).subscribe({
      next: (res) => {
        this.cars = res.items;
        this.loadingService.stop();
      },
      error: (e: AppError) => {
        this.loadError = e;
        console.error('Error cargando la lista de coches', e);
        this.loadingService.stop();
      },
    });
  }

  goToCar(carId: string): void {
    this.router.navigate(['/car', carId]);
  }


}
