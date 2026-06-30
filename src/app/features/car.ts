import { CommonModule } from '@angular/common';
//import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CarsService } from '../core/services/car.service';
import { Car, CarDetails, CarDocument } from '../core/interfaces/cars.interface';
import { ToastService } from '../core/services/toast.service';
import { NavbarComponent } from '../shared/navbar';
import { AppError } from '../core/errors/app-error.model';
import { AuthService } from '../core/services/auth.service';



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
  private toastService = inject(ToastService);
  private router = inject(Router);
  private auth = inject(AuthService);

  car = signal<Car | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  isEditModalOpen = signal(false);
  editLoading = signal(false);
  editError = signal<string | null>(null);

  isDeleteModalOpen = signal(false);

  newCarRegistrationDate = signal<string>('');
  newCarMileage = signal<number | null>(null);
  newCarPrice = signal<number | null>(null);
  newCarManufactureYear = signal<number | null>(null);
  newCarCurrency = signal<string>('EUR');
  newCarAvailability = signal<boolean>(true);
  newCarColor = signal<string>('');
  newCarDescription = signal<string>('');
  newCarLicensePlate = signal<string>('');

  isViewDocumentPanelOpen = signal(false);
  viewDocumentLoading = signal(false);
  viewDocument = signal<CarDocument | null>(null);

  isAttachDocumentPanelOpen = signal(false);
  attachTitle = signal('');
  attachDocumentType = signal('');
  attachDescription = signal('');
  attachFile = signal<File | null>(null);

  attachUploadLoading = signal(false);
  attachUploadError = signal<string | null>(null);
  attachValidationError = signal<string | null>(null);

  carDocument = signal<CarDocument | null>(null);

  docTitle = signal<string>('');
  docDocumentType = signal<string>('');
  docDescription = signal<string>('');
  docFile = signal<File | null>(null);

  docUploadLoading = signal(false);
  docUploadError = signal<string | null>(null);
  docValidationError = signal<string | null>(null);

  readonly allowedMimeTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
  ];
  readonly maxFileSizeBytes = 5 * 1024 * 1024; // 5MB error 413


  readonly isAdmin = computed(() => this.auth.user()?.role === 'ADMIN');

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
      error: (e: AppError) => {
        console.error('Error cargando información del coche', this.car()?.id,e);
        this.error.set(e.userMessage);
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

  openDeleteModal(): void {
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
  }
  

  editCar(): void {
    this.editLoading.set(true);
    this.editError.set(null);

    const carid=this.car()?.id ?? '';

    if (!carid) {
    this.editError.set('No se ha encontrado el coche a editar.');
    return;
  }

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
      error: (e: AppError) => {
        console.error('Error editando el coche',this.car()?.id ,e);
        this.editLoading.set(false);
        this.editError.set('Error creando el coche');
        this.error.set(e.userMessage);
      },
    });
    this.ngOnInit();
  }

  delete(): void {
    const carId = this.car()?.id ?? '';
    if (!carId) {
      this.toastService.show('No se pudo determinar el id del coche.', 'error');
      return;
    }
    
    this.carsService.DeleteCar(carId).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.toastService.show('Coche eliminado correctamente', 'success');
          this.router.navigate(['/catalogue']);
        },
        error: (e: AppError) => {
          console.error(e);
          this.error.set(e.userMessage);
          this.toastService.show('Error eliminando el coche', 'error');
        },
      });
  }


  resetViewPanel(): void {
    this.viewDocumentLoading.set(false);
    this.viewDocument.set(null);
  }

  closeViewDocumentPanel(): void {
    this.isViewDocumentPanelOpen.set(false);
    this.resetViewPanel();
  }

  openViewDocumentPanel(): void {
    const carId = this.car()?.id ?? '';
    if (!carId) {
      this.toastService.show('No se pudo determinar el id del coche.', 'error');
      return;
    }
    this.closeAttachDocumentPanel();
    this.viewDocumentLoading.set(true);
    this.carsService.getCarDocument(carId).subscribe({
      next: (doc) => {
        this.viewDocument.set(doc);
        this.isViewDocumentPanelOpen.set(true);
        this.viewDocumentLoading.set(false);
      },
      //Manejo previo al interceptor y tratamiento de app error
      //error: (err: HttpErrorResponse) => {
      //  this.viewDocumentLoading.set(false);

      //  if (err?.status === 404) {
      //    this.toastService.show('Este coche no tiene documento adjunto.', 'info');
      //    return;
      //  }
      //  console.error(err);
      //  this.toastService.show('Error cargando documento.', 'error');
      //},

      error: (e: AppError) => {
      this.viewDocumentLoading.set(false);

      if (e.code === 'NOT_FOUND' || e.httpStatus === 404) {
        this.toastService.show('Este coche no tiene documento adjunto.', 'info');
        return;
      }

      console.error('Error cargando documento', e.details ?? e);
      this.toastService.show(e.userMessage || 'Error cargando documento.', 'error');
    },
    });
  }

  resetAttachForm(): void {
    this.attachTitle.set('');
    this.attachDocumentType.set('');
    this.attachDescription.set('');
    this.attachFile.set(null);

    this.attachUploadLoading.set(false);
    this.attachUploadError.set(null);
    this.attachValidationError.set(null);
  }

  closeAttachDocumentPanel(): void {
    this.isAttachDocumentPanelOpen.set(false);
    this.resetAttachForm();
  }

  openAttachDocumentPanel(): void {
    const carId = this.car()?.id ?? '';
    if (!carId) {
      this.toastService.show('No se pudo determinar el id del coche.', 'error');
      return;
    }

    // Aislamiento: cerrar + reset del panel de view
    this.closeViewDocumentPanel();

    this.resetAttachForm();
    this.isAttachDocumentPanelOpen.set(true);
  }

 

  onDocumentFileSelected(file: File | null): void {
    this.docValidationError.set(null);
    this.docUploadError.set(null);

    if (!file) {
      this.docFile.set(null);
      return;
    }

    if (file.size > this.maxFileSizeBytes) {
      const maxMb = Math.round(this.maxFileSizeBytes / (1024 * 1024));
      this.docValidationError.set(`El archivo supera el tamaño máximo (${maxMb}MB).`);
      this.docFile.set(null);
      return;
    }

    if (this.allowedMimeTypes.length > 0 && !this.allowedMimeTypes.includes(file.type)) {
      this.docValidationError.set(
        `Tipo de archivo no permitido (${file.type || 'desconocido'}). Permitidos: PDF, TXT, DOC, PNG, JPG.`
      );
      this.docFile.set(null);
      return;
    }

    this.docFile.set(file);
  }

  uploadDocument(): void {
    const carId = this.car()?.id ?? '';
    if (!carId) {
      this.docUploadError.set('No se pudo determinar el id del coche.');
      return;
    }

    const file = this.docFile();
    if (!file) {
      this.docValidationError.set('Selecciona un archivo.');
      return;
    }

    if (!this.docTitle().trim()) {
      this.docValidationError.set('El título es obligatorio.');
      return;
    }

    if (!this.docDocumentType().trim()) {
      this.docValidationError.set('El tipo de documento es obligatorio.');
      return;
    }

    this.docUploadLoading.set(true);
    this.docUploadError.set(null);

    const formData = new FormData();
    formData.append('title', this.docTitle().trim());
    formData.append('documentType', this.docDocumentType().trim());
    formData.append('description', this.docDescription().trim());
    formData.append('file', file, file.name);

    console.log("doc:", formData)
    this.carsService.PostCarDocument(carId, formData).subscribe({
      next: (createdDoc) => {
        this.docUploadLoading.set(false);

        // keep panel open and refresh shown doc
        this.carDocument.set(createdDoc);

        // reset
        this.docTitle.set('');
        this.docDocumentType.set('');
        this.docDescription.set('');
        this.docFile.set(null);
        this.docValidationError.set(null);

        this.toastService.show('Documento subido correctamente.', 'success');
      },
      error: (e: AppError) => {
        console.error('Error subiendo el documento', e.details ?? e);
        this.docUploadLoading.set(false);

        // inline para el panel
        this.docUploadError.set(e.userMessage);

        // opcional: también toast
        this.toastService.show(e.userMessage, 'error');
      },
    });
  }
}
