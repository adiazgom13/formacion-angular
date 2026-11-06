# Frontend services

## CarsService (`src/app/core/services/car.service.ts`)

Base URL: `api/cars`

### Methods

- `getCars({ page, limit, brandId?, modelId?, sortBy?, sortOrder? })`
  - GET `api/cars`
  - Query params: `page`, `limit`, optional `brandId`, `modelId`, `sortBy`, `sortOrder`
  - Returns: `Observable<CarsResponse>`

- `postCar({ brandId, modelId, carDetails })`
  - POST `api/cars`
  - Returns: `Observable<Car>`

- `ExportCarTable({ page, limit, brandId?, modelId?, sortBy?, sortOrder? })`
  - GET `api/cars/export/excel`
  - `responseType: 'blob'`
  - Returns: `Observable<Blob>`

- `getCarById(id)`
  - GET `api/cars/:id`
  - Returns: `Observable<Car>`

- `updateCar(id, { brandId, modelId, carDetails })`
  - PUT `api/cars/:id`
  - Returns: `Observable<Car>`

- `DeleteCar(id)`
  - DELETE `api/cars/:id`
  - Returns: `Observable<Car>`

- `getCarDocument(id)`
  - GET `api/cars/:id/document`
  - Returns: `Observable<CarDocument>`

- `DeleteCarDocument(id)`
  - DELETE `api/cars/:id/document`
  - Returns: `Observable<CarDocument>`

- `PostCarDocument(id, formData)`
  - POST `api/cars/:id/document`
  - Returns: `Observable<CarDocument>`

- `DownloadCarDocument(id)`
  - GET `api/cars/:id/document/download`
  - Returns: `Observable<CarDocument>`

## Other core services

- `AuthService` (`src/app/core/services/auth.service.ts`)
- `BrandService` (`src/app/core/services/brand.service.ts`)
- `LoadingService` (`src/app/core/services/loading.service.ts`)
- `ToastService` (`src/app/core/services/toast.service.ts`)

