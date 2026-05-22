import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CarsService } from '../core/services/car.services';
import { Car, CarDetails} from '../core/interfaces/cars.interface';
import { NavbarComponent } from '../shared/navbar';

@Component({
  selector: 'app-car',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './car.html',
  styleUrls: ['./car.css'],
})
export class CarComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private carsService = inject(CarsService);

  car = signal<Car | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // convenience: first element of carDetails (if present)
  detail = computed<CarDetails | null>(() => {
    const c = this.car();
    if (!c || !c.carDetails || c.carDetails.length === 0) {
      return null;
    }
    return c.carDetails[0];
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No car id provided in route');
      return;
    }
    this.loadCar(id);
  }

  private loadCar(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.carsService.getCarById(id).subscribe({
      next: (car) => {
        this.car.set(car);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error loading car details');
        this.loading.set(false);
      },
    });
  }

  // actions (no-op for now; you can wire them later)
  reserve(): void {
    console.log('reserve', this.car());
    
  }

  delete(): void {
    console.log('delete', this.car());
  }
  
}