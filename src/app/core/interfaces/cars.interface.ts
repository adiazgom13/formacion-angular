export interface Brand {
  id: string;
  name: string;
}

export interface Model {
  id: string;
  name: string;
}

export interface CarDetail{
  availability: boolean;
  currency: string;
  licensePlate: string;
  manufactureYear: number;
  mileage: number;
  price: number;
  registrationDate: string;
  color: string;
  description: string;
  imageUrl: string;
}

export interface Car {
  id: string;
  brand: Brand;
  model: Model;
  total: number;
  imageUrl?: string;
  carDetails?: CarDetail[];
}

export interface CarsMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CarsResponse {
  items: Car[];
  meta: CarsMeta;
}