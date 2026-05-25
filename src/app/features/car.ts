import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CarsService } from '../core/services/car.services';
import { Car, CarDetails} from '../core/interfaces/cars.interface';
import { NavbarComponent } from '../shared/navbar';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';



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

  isEditModalOpen = signal(false);
  editLoading = signal(false);
  editError = signal<string | null>(null);

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

  openEditModal(): void {
    const d = this.detail();
      this.newCarRegistrationDate.set(
        d?.registrationDate ? new Date(d.registrationDate).toISOString().slice(0, 10) : ''
      );
    this.newCarMileage.set(d?.mileage ?? null);
    this.newCarPrice.set(d?.price ?? null);
    this.newCarManufactureYear.set(d?.manufactureYear ?? null);
    this.newCarCurrency.set(d?.currency ?? 'EUR');
    this.newCarAvailability.set(d?.availability ?? true);
    this.newCarColor.set(d?.color ?? '');
    this.newCarDescription.set(d?.description ?? '');
    this.newCarLicensePlate.set(d?.licensePlate ?? '');

    this.editError.set(null);
    this.editLoading.set(false);

    this.isEditModalOpen.set(true);
  }
  closeEditModal(): void {
    this.isEditModalOpen.set(false);
  }
  

  editCar(): void {
    this.editLoading.set(true);
    this.editError.set(null);

    const carid=this.car()?.id ?? '';
    const registrationDate =new Date(this.newCarRegistrationDate()).toISOString()

    const payload = {
      brandId: this.car()?.brand.id ?? '',
      modelId: this.car()?.model.id ?? '',
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

    this.carsService.updateCar(carid, payload).subscribe({
      next: () => {
        this.editLoading.set(false);
        this.closeEditModal();
        
      },
      error: (err) => {
        console.error(err);
        this.editLoading.set(false);
        this.editError.set('Error creando el coche');
      },
    });

    console.log('edit', payload);
    this.ngOnInit();
  }

  delete(): void {
    console.log('delete', this.car());
  }

  
}