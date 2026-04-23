import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TareaService } from '../services/services';
import { Tarea } from '../models/tarea.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.html',
  styleUrl: './board.css'
})
export class BoardComponent implements OnInit, OnDestroy {

  tareas: Tarea[] = [];
  cargando = true;
  private channel: any;

  constructor(private tareaService: TareaService) {}

  async ngOnInit() {
    await this.cargarTareas();
    this.channel = this.tareaService.suscribirCambios(() => {
      this.cargarTareas();
    });
  }

  ngOnDestroy() {
    if (this.channel) this.tareaService.desuscribir(this.channel);
  }

  async cargarTareas() {
    try {
      this.tareas = await this.tareaService.getTareasBoard();
    } catch (e) {
      console.error('Error cargando tareas:', e);
    } finally {
      this.cargando = false;
    }
  }

  get pendientes() {
    return this.tareas.filter(t => t.estado === 'pendiente');
  }

  get completadas() {
    return this.tareas.filter(t => t.estado === 'completada');
  }

  async marcarCompletada(id: string) {
    const confirmado = confirm('¿Seguro que completaste la tarea?');
    if (!confirmado) return;
    try {
      await this.tareaService.marcarCompletada(id);
    } catch (e) {
      console.error('Error marcando tarea:', e);
    }
  }

  fechaHoy(): string {
    return new Date().toLocaleDateString('es-CO', {
      day: 'numeric', month: 'short'
    });
  }
}