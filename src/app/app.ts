import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminComponent } from './admin/admin';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AdminComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('gestor-tareas');
}
