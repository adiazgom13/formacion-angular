import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../shared/navbar';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet,NavbarComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {

}
