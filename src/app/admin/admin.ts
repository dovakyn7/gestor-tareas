import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TareaService } from '../services/services';
import { Tarea, NuevaTarea } from '../models/tarea.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit, OnDestroy {

  // ── Estado ────────────────────────────────────────────────
  tareas: Tarea[] = [];
  tareasFiltradas: Tarea[] = [];
  cargando = true;
  modalAbierto = false;
  editandoId: string | null = null;
  private channel: any;

  // ── Filtros ───────────────────────────────────────────────
  busqueda = '';
  filtroEstado = '';
  filtroPrioridad = '';

  // ── Formulario ────────────────────────────────────────────
  form: NuevaTarea = this.formVacio();
  assignMode: 'todos' | 'seleccion' = 'todos';
  inputAsignados = '';

  constructor(private tareaService: TareaService) {}

  // ── Ciclo de vida ─────────────────────────────────────────
  async ngOnInit() {
    await this.cargarTareas();
    this.channel = this.tareaService.suscribirCambios(() => {
      this.cargarTareas();
    });
  }

  ngOnDestroy() {
    if (this.channel) this.tareaService.desuscribir(this.channel);
  }

  // ── Carga y filtros ───────────────────────────────────────
  async cargarTareas() {
    try {
      this.tareas = await this.tareaService.getTareas();
      this.aplicarFiltros();
    } catch (e) {
      console.error('Error cargando tareas:', e);
    } finally {
      this.cargando = false;
    }
  }

  aplicarFiltros() {
    const q = this.busqueda.toLowerCase().trim();
    this.tareasFiltradas = this.tareas.filter(t => {
      const matchQ   = !q || t.titulo.toLowerCase().includes(q)
                          || t.asignados.toLowerCase().includes(q);
      const matchEst = !this.filtroEstado || t.estado === this.filtroEstado;
      const matchPri = !this.filtroPrioridad
                       || (this.filtroPrioridad === 'urgente' ? t.urgente : !t.urgente);
      return matchQ && matchEst && matchPri;
    });
  }

  // ── Stats ─────────────────────────────────────────────────
  get total()      { return this.tareas.length; }
  get pendientes() { return this.tareas.filter(t => t.estado === 'pendiente').length; }
  get completadas() { return this.tareas.filter(t => t.estado === 'completada').length; }

  // ── Modal ─────────────────────────────────────────────────
  abrirNueva() {
    this.editandoId   = null;
    this.form         = this.formVacio();
    this.assignMode   = 'todos';
    this.inputAsignados = '';
    this.modalAbierto = true;
  }

  abrirEditar(t: Tarea) {
    this.editandoId     = t.id;
    this.assignMode     = t.asignados === 'Todos' ? 'todos' : 'seleccion';
    this.inputAsignados = t.asignados === 'Todos' ? '' : t.asignados;
    this.form = {
      titulo:      t.titulo,
      descripcion: t.descripcion,
      asignados:   t.asignados,
      urgente:     t.urgente,
      estado:      t.estado
    };
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.editandoId   = null;
  }

  setAssignMode(mode: 'todos' | 'seleccion') {
    this.assignMode = mode;
    if (mode === 'todos') this.inputAsignados = '';
  }

  // ── CRUD ──────────────────────────────────────────────────
  async guardar() {
    if (!this.form.titulo.trim()) return;

    this.form.asignados = this.assignMode === 'todos'
      ? 'Todos'
      : (this.inputAsignados.trim() || 'Todos');

    try {
      if (this.editandoId) {
        await this.tareaService.actualizarTarea(this.editandoId, this.form);
      } else {
        await this.tareaService.crearTarea(this.form);
      }
      this.cerrarModal();
    } catch (e) {
      console.error('Error guardando tarea:', e);
    }
  }

  async eliminar(id: string) {
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      await this.tareaService.eliminarTarea(id);
    } catch (e) {
      console.error('Error eliminando tarea:', e);
    }
  }

  // ── Helpers ───────────────────────────────────────────────
  private formVacio(): NuevaTarea {
    return {
      titulo: '', descripcion: '', asignados: 'Todos',
      urgente: false, estado: 'pendiente'
    };
  }

  fechaHoy(): string {
    return new Date().toLocaleDateString('es-CO', {
      weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
    });
  }
}