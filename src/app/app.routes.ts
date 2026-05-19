import { Routes } from '@angular/router';
import { HomeComponent } from './features/home'; // adjust path if different
import { CatalogueComponent } from './features/catalogue';
import { CarComponent } from './features/car';
import { BrandsComponent } from './features/brands';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'catalogue', component: CatalogueComponent},
  { path: 'catalogue/brands', component: BrandsComponent},
  { path: 'car/:id', component: CarComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // optional: make / go to /home
  { path: '**', redirectTo: 'home' },                  // optional: wildcard to /home
];